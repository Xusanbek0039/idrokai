# IDROK AI — Product Requirements Document (PRD)

Status: Proposed Architecture Update; awaiting owner approval.  
Date: 2026-10-15  
First Business Module: **Shop Debt Management (Nasiya Savdo / Daftari)**  
Database Strategy: **SQLite3 for Local Development and First MVP; PostgreSQL Planned for Multi-User Production**

---

## 1. Product Vision and Problem Statement

Small-to-medium retail shops, neighborhood markets, and commercial merchants frequently sell goods on credit (traditional store debt / "nasiya" / notebook records). These debt ledgers are conventionally kept in physical paper notebooks ("daftar") or unstructured notes, leading to:
- Lost or disputed debt records.
- Inability to calculate real-time customer balances accurately.
- Lack of audit trails for cashier collections and debt issuances.
- Financial risks from exceeding informal credit limits without oversight.
- Operational silos where only the shop owner knows who owes what.

**IDROK AI** is a multi-tenant business automation platform. Its initial MVP business module is **Shop Debt Management**, providing digital, audited, and role-governed debt tracking, repayment recording, and balance management for retail shops. 

The platform is designed with a modular monolith architecture (Django REST Framework + Next.js), allowing the core multi-tenant framework to support future business modules (e.g., clinics, education centers, hospitality, inventory) while keeping the first release hyper-focused on solving shop debt management with zero unnecessary operational overhead.

---

## 2. Target Users and Role Hierarchy

Access is governed by a strict multi-tenant role hierarchy:

| Role | Scope | Key Capabilities in Shop Debt MVP |
| --- | --- | --- |
| **Platform Super Admin** | Global / Multi-Tenant Platform | Platform-wide oversight, tenant (shop) provisioning, system health monitoring, global configuration, cross-tenant audit visibility. |
| **Shop Owner** | Single Shop (Company Tenant) | Full administrative control over the shop: invite and assign roles (Shop Manager, Cashier), manage shop settings, define default debt limits, access full financial summaries, view audit logs, export financial reports. |
| **Shop Manager** | Single Shop (Company Tenant) | Day-to-day operational control: manage customer profiles, set/override customer credit limits, issue debts, record repayments, reconcile balances, manage cashier follow-up tasks, view shop-level debt reports. |
| **Cashier** | Single Shop (Company Tenant) | Frontline counter operations: look up customer current debt balances and history, record new customer debts with itemized notes, record customer repayments, print/issue payment receipts. Cannot change credit limits or delete records. |

A global user account may be associated with memberships across different shops, but all operational requests enforce active membership and role permissions within the explicitly selected shop tenant (`/companies/{company_id}/...`).

---

## 3. Database & Concurrency Strategy (MVP Update)

### 3.1 Initial Database: SQLite3
- **Local Dev & First MVP**: SQLite3 is the default database configured in Django (`django.db.backends.sqlite3`).
- **PostgreSQL Deferred**: PostgreSQL and pgvector are **not** configured or required for the initial MVP.
- **Database-Agnostic Models**: All Django ORM models use standard, database-agnostic fields (`DecimalField`, `UUIDField`, `CharField`, `ForeignKey`, `DateTimeField`, `JSONField`). PostgreSQL-specific extensions (e.g. `django.contrib.postgres.fields`, native JSONB operators, or DB-specific triggers) are prohibited to ensure 100% portability.
- **Monetary Precision**: All financial amounts (debt totals, repayment amounts, remaining balances, credit limits) strictly use `DecimalField(max_digits=12, decimal_places=2)`. Floating-point numbers are prohibited for financial calculations.

### 3.2 Transactional Integrity and Concurrency
- **Atomic Operations**: All debt issuance, repayment processing, and customer balance updates must be wrapped in `transaction.atomic()`.
- **No Reliance on `select_for_update()`**: Because SQLite does not support PostgreSQL-style row-level locking (`SELECT ... FOR UPDATE` locks the entire database file or acts as a no-op depending on configuration), the application **must not** rely on row-level locks for concurrency protection.
- **Safe Balance Validation**: Customer balances are validated server-side within the atomic block. An immutable ledger pattern (`DebtTransaction`, `RepaymentTransaction`) guarantees that the balance can be derived and verified against historical records.
- **Idempotent Payment Processing**: All payment and debt creation endpoints require an `Idempotency-Key` HTTP header. Replayed requests return the original transaction result, preventing duplicate debts or double repayments caused by network retries or multiple cashier button clicks.
- **SQLite Concurrency Limitations**: SQLite permits only a single concurrent writer (file-level lock). To mitigate busy lock contention in local MVP, SQLite Write-Ahead Logging (`PRAGMA journal_mode=WAL;`) and a busy timeout (`PRAGMA busy_timeout=5000;`) are configured.
- **Production Migration Gate**: Migration to PostgreSQL is mandatory prior to multi-user production deployment with significant concurrent financial activity.

---

## 4. MVP Functional Scope and Acceptance Criteria

| ID | Module / Feature | Description & Acceptance Criteria |
| --- | --- | --- |
| **M1** | **Identity & Multi-Tenancy** | User registration, authentication via secure server-side sessions, shop creation, and multi-tenant isolation. Platform Super Admin can monitor shops; Shop Owner creates shop profile and manages invitations. |
| **M2** | **Role-Based Access Control (RBAC)** | Strict enforcement of 4 roles: Platform Super Admin, Shop Owner, Shop Manager, Cashier. Cashiers can only create debts/repayments and view debtor balances. Managers can adjust credit limits. Owners have full financial and staff management. |
| **M3** | **Customer Debtor Management** | CRUD for shop customers: full name, phone number, address, notes, credit limit (`DecimalField`), current balance (`DecimalField`), and status (`active`, `frozen`, `archived`). Customers are strictly tenant-isolated. |
| **M4** | **Shop Debt Issuance** | Cashier/Manager records a new debt against a customer: amount (`DecimalField`), itemized description/notes, optional due date. System validates customer credit limit and atomically records the debt and updates the customer balance inside `transaction.atomic()`. Requires `Idempotency-Key`. |
| **M5** | **Customer Repayment Processing** | Cashier/Manager records a repayment: amount (`DecimalField`), payment method (`cash`, `card`, `bank_transfer`), notes, optional target debt allocation. System validates repayment amount, idempotency key, atomically persists repayment and decrements customer balance inside `transaction.atomic()`. |
| **M6** | **Ledger & Balance Validation** | Every debt and repayment generates an immutable ledger transaction. Safe balance recalculation ensures customer balance matches the sum of unsettled debts minus repayments. Discrepancies block further credit issuance. |
| **M7** | **Debt Reminders & Follow-Up Tasks** | Staff/Manager can create follow-up reminder tasks for overdue debts, assign tasks to staff members, set due dates, and mark follow-ups completed. |
| **M8** | **Financial Reports & Audit Trail** | Shop Owner and Manager can view: total outstanding debt, overdue debts aging, daily collections by cashier, and an immutable audit log of all financial mutations (timestamp, actor, action, previous balance, new balance). Full prompts and credentials excluded from logs. |
| **M9** | **Internal AI Assistant (Optional Knowledge)** | Shop Owner/Manager can ask questions regarding shop debt policies, credit rules, or summarized debtor histories via an AI assistant endpoint. Uses standard local/adapter storage without requiring pgvector in the MVP phase. |
| **M10** | **Cross-Tenant Isolation** | Strict automated verification that no shop can view or mutate another shop's customers, debts, repayments, or staff records under any circumstances. Inaccessible tenant resources return HTTP 404. |

---

## 5. Primary User Journeys

### Journey 1: Customer Debt Issuance (Cashier / Manager)
1. Customer visits shop and purchases goods on credit ("nasiya").
2. Cashier searches customer by phone or name in the Next.js UI.
3. System displays customer profile, active debt balance, and remaining credit limit.
4. Cashier enters debt amount (e.g. `150000.00` UZS), notes (e.g. "Groceries: oil, flour, sugar"), and optional due date.
5. Client sends `POST /api/v1/companies/{shop_id}/debts` with an `Idempotency-Key`.
6. DRF backend executes `transaction.atomic()`: validates credit limit, records `DebtRecord`, records ledger entry, increments customer balance, writes audit log.
7. Cashier receives confirmed debt receipt and updated balance.

### Journey 2: Customer Repayment (Cashier / Manager)
1. Customer returns to repay part or all of their outstanding debt.
2. Cashier pulls up customer profile and enters repayment amount (e.g. `100000.00` UZS) and payment method (`cash`).
3. Client sends `POST /api/v1/companies/{shop_id}/repayments` with an `Idempotency-Key`.
4. DRF backend executes `transaction.atomic()`: checks idempotency key, records `RepaymentRecord`, decrements customer debt balance, updates ledger, logs audit event.
5. Cashier prints/shows repayment receipt and remaining balance.

### Journey 3: Owner Daily Reconciliation & Overdue Audit
1. Shop Owner logs in and opens the Shop Debt Dashboard.
2. Owner reviews:
   - Total outstanding debt across all customers.
   - Total collections today broken down by Cashier and payment method.
   - Overdue debts list with days past due.
3. Owner assigns follow-up tasks to Shop Manager for high-value overdue accounts.

---

## 6. Explicit Exclusions for Initial MVP

- No direct payment gateway integration (Stripe, Payme, Click) — all recorded repayments represent physical or externally verified payments (cash, POS terminal card, manual transfer).
- No automated SMS / WhatsApp gateway campaigns (manual reminder logging only in MVP).
- No inventory/stock management or barcode scanning in the first debt module.
- No PostgreSQL or pgvector infrastructure in the initial MVP environment.
- No autonomous AI business mutations (AI assistant is strictly read-only advisory).

---

## 7. Quality Gates and Release Criteria

1. **Precision Gate**: 100% of financial tests verify `DecimalField` operations with zero rounding or floating-point precision drift.
2. **Concurrency & Idempotency Gate**: Repeated payment submissions with the same `Idempotency-Key` return identical responses without duplicate debit/credit ledger records.
3. **Isolation Gate**: 100% of multi-tenant isolation tests pass; cross-shop foreign key traversal or API probing returns 404.
4. **SQLite Integrity Gate**: Zero database locked errors during single-user / cashier test workflows with WAL mode enabled.
5. **PostgreSQL Migration Readiness Gate**: Schema compatibility test suite confirms all models, migrations, and query patterns run identically on PostgreSQL without schema adjustments.

---

## 8. Rollout Sequence

1. **Architecture & Contract Review**: Finalize PRD, Architecture, and OpenAPI contract reflecting SQLite3 and Shop Debt Management.
2. **Foundation & RBAC**: Implement DRF models, identity, multi-tenant middleware, and roles (Platform Super Admin, Shop Owner, Shop Manager, Cashier).
3. **Shop Debt Module**: Implement customer debtor profiles, debt issuance, repayment processing, ledger validation, and atomic transaction handling with idempotency.
4. **Frontend UI**: Build responsive Next.js cashier POS view, manager debtor management, and owner dashboard.
5. **Audit, Tasks & Reports**: Implement overdue debt tracking, staff reminder tasks, and financial summaries.
6. **Pre-Production PostgreSQL Migration**: Migrate database to PostgreSQL prior to multi-user pilot launch.
