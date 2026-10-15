# IDROK AI — Product Requirements Document (PRD)

**Status:** Proposed Universal SaaS Architecture  
**Date:** 2026-10-15  
**System Architecture:** API-First Modular Monolith (Django REST Framework + Next.js)  
**Database Strategy:** SQLite3 (Local Dev & Initial MVP) → PostgreSQL (High-Concurrency Production)  
**Target Industries:** Retail Stores, Education Centers, and extensible future business domains  

---

## 1. Product Vision & Problem Statement

Independent businesses across different industries—from neighborhood grocery and retail shops to private education centers, language academies, clinics, and hospitality venues—suffer from fragmented, disconnected management tools:
- **Retail businesses** track customer store debt ("nasiya" / notebook accounts) on paper, lose track of customer credit limits, fail to reconcile cashier cash-drawer shifts, and lack unified inventory/POS integration.
- **Education centers** manage student enrollments, cohort study groups, monthly tuition collection, overdue fee debts, and lesson homework across spreadsheets and chat applications.
- **Platform operators** lack a single unified administrative console to provision tenant businesses, assign tailored industry capabilities, toggle feature modules, monitor subscription plans, and review system-wide audit logs.

**IDROK AI** is engineered as a **universal, multi-tenant SaaS platform** that provides industry-specific business management through a database-driven **Modular Feature Management System**. Businesses access only the features relevant to their industry, while the platform maintains a shared, rock-solid operational core (identity, tenancy, RBAC, double-entry financial ledger, and audit tracking).

---

## 2. Core Architectural Principles: Two Separate Admin Experiences

A foundational requirement of IDROK AI is the strict architectural separation between **Platform Management** and **Tenant Business Operations**:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                            IDROK AI ARCHITECTURE                             │
└──────────────────────────────────────────────────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌───────────────────────────────┐             ┌────────────────────────────────┐
│   1. PLATFORM SUPER ADMIN     │             │     2. BUSINESS DASHBOARD      │
│  (Django Backend / Admin)     │             │     (Next.js / TypeScript)     │
├───────────────────────────────┤             ├────────────────────────────────┤
│ • Built directly in Django    │             │ • Built in Next.js + Tailwind  │
│ • Professional customized UX  │             │ • Consumes DRF /api/v1 exclusively│
│ • Platform administrators only│             │ • Business Owners & Employees  │
│ • Organization provisioning   │             │ • Dynamic UI: renders ONLY     │
│ • Business types & modules    │             │   modules enabled for tenant   │
│ • Subscription entitlements   │             │ • Retail POS, Debt Ledger,     │
│ • Global audit & usage logs   │             │   Education LMS, Tuitions, etc.│
│ • NOT part of Next.js frontend│             │ • Strictly isolated tenant data│
└───────────────────────────────┘             └────────────────────────────────┘
```

### 2.1 Experience 1: Platform Super Admin (Django Backend)
- **Deployment:** Directly embedded in the Django REST Framework backend (`/platform-admin/` / Django Admin).
- **Audience:** Internal platform operators, superusers, and billing administrators.
- **Tech Stack:** Django Admin customized with modern administrative templates (e.g. Unfold/custom responsive theme), custom action views, filters, and operational dashboards.
- **Scope:**
  - Provision, activate, suspend, and archive business organizations.
  - Define and manage `BusinessType` catalogs (Retail Store, Education Center, etc.).
  - Register system `Module` definitions with dependency trees.
  - Manage `BusinessTypeModule` defaults and `OrganizationModule` tenant activations.
  - Manage subscription tiers, quotas, and feature entitlements.
  - Review cross-tenant audit trails and system usage statistics.
  - Maintain platform isolation: administrative views must not leak cross-tenant operational data into tenant contexts.

### 2.2 Experience 2: Business Dashboard (Next.js Frontend)
- **Deployment:** Separate retail and education Next.js 14+ applications (TypeScript, Tailwind CSS, App Router).
- **Audience:** Business Owners, Managers, Cashiers, Teachers, and Accountants.
- **Tech Stack:** Next.js App Router, React Server/Client Components, Tailwind CSS, consuming `/api/v1` with server-side session forwarding.
- **Dynamic Module UI:**
  - Each separate frontend queries `/api/v1/companies/{company_id}/capabilities` upon tenant selection.
  - The navigation sidebar, dashboard widgets, and action routes dynamically render **only** the modules activated for that specific organization.
  - Attempting to navigate to or invoke APIs for a disabled module is cleanly blocked by backend middleware and client guards.

---

## 3. Supported Business Types & Module Breakdown

### 3.1 Business Type: Retail Store (`retail_store`)
Tailored for grocery stores, clothing shops, electronics retailers, and wholesale suppliers:

| Module Code | Module Name | Core Capabilities | Dependencies |
| --- | --- | --- | --- |
| `retail_customers` | Customer Management | Customer debtor directory, credit limits, contact history, status. | None (Core) |
| `retail_debts` | Debt Ledger ("Nasiya") | Store debt recording, partial/full repayments, ledger audit trail, balance recalculation. | `retail_customers` |
| `retail_inventory` | Inventory Management | Stock tracking, SKUs, barcode support, cost/sale price, low-stock alerts. | None |
| `retail_pos` | Sales & POS | Cashier counter interface, multi-item checkout, split payments (cash/card/debt). | `retail_inventory`, `retail_customers` |
| `retail_reports` | Financial & Debt Reports | Daily cashier reconciliations, debt aging reports, collection summaries. | `retail_debts` |
| `retail_reminders` | Debt Reminders | Automated customer repayment follow-ups, cashier task reminders. | `retail_debts` |

### 3.2 Business Type: Education Center (education_center)

One existing DRF backend serves separate frontend/shop and frontend/education applications; the education app uses Next.js, TypeScript and Tailwind. Reuse existing User, Company and CompanyMember; no duplicate authentication. The existing retail frontend will move only after implementation approval.

Education roles are Owner (edu_owner), Assistant Admin (edu_assistant_admin), Operations Manager (edu_operations_manager), Teacher (teacher) and Student (student), tenant-scoped as defined in roles-permissions.md. Only Platform Super Admin can toggle center modules.

Mandatory foundation: edu_students (student/teacher profiles) and edu_groups (groups/enrollment). Optional modules are edu_classrooms, edu_scheduling, edu_attendance, edu_tuition, edu_debts, edu_homework, edu_exams, edu_lms (video), edu_gamification and edu_reports. See module-system.md for the exact dependency graph and route gates. No optional modules are enabled by default. A center selecting only attendance/payments/tests has only those three optional modules, in addition to the foundation; recurring scheduling and classrooms are not required.

Acceptance: membership + role/action/object scope + eligible effective module must pass server-side on every endpoint, private download, report, cached response and background action. Disabled modules reject with 403 MODULE_DISABLED; data survives and is available again after re-enable subject to current permissions. Cross-tenant records/references return 404. Capabilities expose current user effective modules and permissions. Frontend hiding is not a security control.

Platform center detail must show organization/owner, separate employee/student summaries, eligible/enabled/disabled modules, subscription, change history and operational statistics. Staged toggles show dependencies, preserve-data impact and a reason/confirmation for sensitive changes. All mutation paths use atomic dependency validation and auditing.

Gamification includes immutable XP/coin transactions, group leaderboard aliases, reward inventory and atomic redemption; no conversion into money. Learning includes versioned homework/submissions, tests/questions/attempts/released results and private videos/progress. Attendance supports ad hoc lessons without scheduling. Tuition covers monthly enrollment fee agreements, charges, manual receipts/allocations and owner-only full reversal; no external payment gateway charge is authorized.

---

## 4. Modular Feature Management Requirements

1. **Unique Immutable Identifiers:** Every module is identified by an immutable slug (`module.code`, e.g., `retail_debts`, `edu_lms`).
2. **Database-Controlled Entitlements:** Feature access is governed by `OrganizationModule` database records, not hardcoded conditionals or unvalidated client requests.
3. **BusinessType Template Assignment:** A `BusinessTypeModule` catalog dictates which modules are mandatory, default-enabled, or optional for each business type.
4. **Zero Data Destruction:** Deactivating a module for an organization strictly disables write and read operations in the API. **Under no circumstances is historical table data deleted or dropped.** Re-enabling the module instantly restores full access to past records.
5. **Dependency Tree Enforcement:**
   - Enabling validates all prerequisites; only an explicitly reviewed batch may enable prerequisites together, never implicitly.
   - Disabling a module required by other active modules is blocked until dependent modules are deactivated first.
6. **Backend-Authoritative Access Control:**
   - Every API request targeting a modular feature verifies `request.organization.has_module(code)` in DRF permission classes.
   - Unauthorized module calls return `403 Forbidden` with a standardized error code `MODULE_DISABLED`.
7. **Scheduled Background Job Safety:**
   - Periodic jobs (e.g., debt collection reminders, tuition invoice generators) query active `OrganizationModule` status before triggering actions. If a module is suspended, all background automated jobs for that module are paused safely.
8. **Comprehensive Audit Logging:**
   - Any module enablement, deactivation, organization status transition, or membership role change is permanently recorded in `AuditLog` with actor ID, timestamp, and previous/new state diffs.

---

## 5. Financial Transaction Safety & Database Architecture

### 5.1 Initial Database: SQLite3 (Local Dev & First MVP)
- SQLite3 is configured with Write-Ahead Logging (`PRAGMA journal_mode=WAL;`), 5-second busy timeout (`PRAGMA busy_timeout=5000;`), and foreign key enforcement (`PRAGMA foreign_keys=ON;`).
- SQLite's single-writer limitation is respected: **the platform never relies on `select_for_update()`**, which does not provide PostgreSQL-style row-level locks.
- Financial safety requires more than atomic boundaries and is subject to implementation verification:
  - All mutating debt, payment, and tuition operations execute inside `transaction.atomic()`.
  - Financial calculations use `DecimalField(max_digits=12, decimal_places=2)`. Floats are strictly prohibited.
  - Education financial arithmetic uses Decimal and versioned serialized writes; SQLite numeric affinity/rounding and busy errors require explicit handling. Do not treat SQL F()/SUM arithmetic as the ledger authority.
  - Education uses balanced immutable tuition journals with protected relations; existing balance logs alone are not double-entry accounting.
  - Mandatory `Idempotency-Key` headers eliminate double-billing from network retries or repeated user clicks.

### 5.2 Target Production Database: PostgreSQL Migration Gate
- The data schema is built strictly database-agnostic using standard Django ORM field types to ensure seamless migration to PostgreSQL 16+.
- Prior to high-volume multi-user production launch, the platform will migrate to PostgreSQL to unlock:
  - Row-level locking via `select_for_update()` on debtor/account balance rows.
  - PostgreSQL Row-Level Security (RLS) as defense-in-depth behind application tenancy.
  - Connection pooling via PgBouncer.

---

## 6. Implementation Priorities & Phased Release Plan

| Phase | Milestone | Scope | Deliverables |
| --- | --- | --- | --- |
| **P1** | **Platform Core & Tenancy** | `BusinessType`, `Organization`, `Membership`, `AuditLog`, custom User model, session auth. | Super Admin core, organization provisioning, multi-tenant isolation. |
| **P2** | **Module Registry & Django Super Admin** | `Module`, `BusinessTypeModule`, `OrganizationModule`, customized Django Admin UI, module dependency graph. | Platform Super Admin console with module toggles, status views, and organization audit history. |
| **P3** | **Module Enforcement & API Foundation** | DRF `HasModuleEnabled` permission class, error schemas, OpenAPI 3.0.3 contract. | Backend-authoritative module blocking, dynamic module list API. |
| **P4** | **Retail Debt Ledger MVP** | Customer debtor management, atomic debt issuance, repayment processing, immutable ledger, POS cashier UI in Next.js. | Low-concurrency Retail Store MVP; monetary and concurrency release checks required. |
| **P5** | **Retail Expansion** | Inventory management, SKUs, barcode support, sale checkout, daily shift reports. | Comprehensive Retail POS suite. |
| **P6** | **Education Center MVP** | Student profiles, cohort groups, tuition billing, fee debt tracking. | Education Center operational release. |
| **P7** | **Education LMS & Grading** | Lesson video streaming, homework submissions, teacher grading, exams. | Complete Education Center management suite. |
| **P8** | **PostgreSQL Migration** | Database cutover, row-level locking, connection pooling, production deployment. | High-concurrency multi-tenant production launch. |

## 7. Education review decisions and release boundaries

The detailed architecture/schema/module/role documents and additive OpenAPI 3.0.3 contract define this extension. The existing contract is 3.0.3, not 3.1; retaining it avoids an unrelated tooling migration. Company routes stay canonical; organization is a domain alias. SQLite remains initial-only and PostgreSQL/RLS is a later authorized migration. All education features, frontend relocation and permission hardening remain unimplemented pending architecture approval and explicit implementation scope.
