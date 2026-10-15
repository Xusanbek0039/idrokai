# IDROK AI — Development Roadmap & Phasing Strategy

**Status:** Proposed Roadmap  
**Role:** Principal Software Architect & Backend Lead  
**Execution Strategy:** Phased Modular Monolith Implementation  

---

## 1. Roadmap Phasing Strategy Overview

The platform development is structured into 7 distinct, verifiable phases. 
Each phase delivers an end-to-end working capability, maintains test coverage, and enforces the separation between the **Platform Super Admin (Django backend)** and the **Business Dashboard (Next.js frontend)**:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                       IDROK AI IMPLEMENTATION PHASES                        │
└─────────────────────────────────────────────────────────────────────────────┘
  Phase 1: Platform Core, Tenancy & Django Super Admin Console
      │
      ▼
  Phase 2: Modular Feature Enforcement & Frontend Dynamic Discovery
      │
      ▼
  Phase 3: Retail Store MVP — Debt Ledger ("Nasiya") & POS Cashier UI
      │
      ▼
  Phase 4: Retail Store Expansion — Inventory & Sales Checkout
      │
      ▼
  Phase 5: Education Center MVP — Students, Study Groups & Tuition Billing
      │
      ▼
  Phase 6: Education Center LMS — Video Lessons, Homework & Exams
      │
      ▼
  Phase 7: PostgreSQL Production Migration, Row-Level Locking & RLS
```

---

## 2. Detailed Phase Breakdown

### Phase 1: Platform Core, Tenancy & Django Super Admin Console
**Objective:** Establish the multi-tenant core, business type catalog, module registry, and professional Django Super Admin console.

- **Backend Deliverables:**
  - Core database models: `BusinessType`, `Organization`, `Module`, `BusinessTypeModule`, `OrganizationModule`, `Membership`, `AuditLog`, `IdempotencyRecord`.
  - Custom User model with `is_platform_super_admin` flag.
  - Organization lifecycle state machine: `active`, `suspended`, `pending_verification`.
- **Platform Super Admin (Django Admin) Deliverables:**
  - Professional, modern styling for Django Admin.
  - Organization change view:
    - Business type selector, owner contacts, active staff list.
    - Interactive **Module Toggles** (Enabled vs. Disabled modules with dependency check safeguards).
    - Inline recent audit trail.
  - Bulk actions: Suspend/reactivate organizations with required confirmation reasons.
- **Verification Gate:**
  - Unit tests verify module dependency graph enforcement and audit trail writes.

### Phase 2: Feature Module Enforcement & Dynamic Frontend Discovery
**Objective:** Wire backend module authorization into DRF and provide dynamic module discovery for the Next.js frontend.

- **Backend Deliverables:**
  - DRF permission class: `RequiresModule('module_code')`.
  - Standardized error payload on disabled module: `403 Forbidden` (`code: MODULE_DISABLED`).
  - Dynamic discovery endpoint: `GET /api/v1/organizations/{id}/modules`.
- **Frontend Deliverables:**
  - `useOrganizationModules` React hook in Next.js.
  - Dynamic navigation sidebar: conditionally renders only the modules present in `enabled_modules`.
  - Next.js client-side route guard preventing access to disabled module routes.
- **Verification Gate:**
  - Automated tests verify that calling an endpoint for a disabled module returns 403, and re-enabling it in Django Admin immediately restores API access.

### Phase 3: Retail Store MVP — Debt Ledger ("Nasiya") & Cashier POS
**Objective:** Deliver production-ready customer store debt tracking and repayment processing for retail merchants.

- **Backend Deliverables:**
  - Retail domain models: `DebtCustomer`, `DebtRecord`, `RepaymentRecord`, `DebtLedger`.
  - Atomic services: `create_debt_service`, `record_repayment_service`, `get_debt_summary_service`.
  - Safe balance recalculation and double-entry ledger audits.
  - Mandatory `Idempotency-Key` headers on mutating financial endpoints.
- **Frontend Deliverables:**
  - Next.js Cashier POS interface: fast customer search, debt issuance modal, repayment collection modal, receipt preview, ledger drawer.
  - Customer directory page with credit limit controls and balance filtering.
  - Store financial report dashboard: total outstanding debt, overdue debts, daily cashier collection breakdown by payment method.
- **Verification Gate:**
  - 100% test pass on monetary precision (`DecimalField`), atomic rollback, idempotency replay, and cross-tenant anti-probing (404).

### Phase 4: Retail Store Expansion — Inventory & Sales Checkout
**Objective:** Expand the Retail vertical to support product catalog, stock tracking, and complete POS sales.

- **Backend Deliverables:**
  - Models: `Product`, `InventoryStock`, `SaleOrder`, `SaleOrderItem`.
  - Gated by modules: `retail_inventory`, `retail_pos`.
  - Multi-item POS sales checkout service with split payments (cash, card, debt).
- **Frontend Deliverables:**
  - Inventory management view: stock adjustments, SKU/barcode lookup, low-stock warnings.
  - POS Cashier checkout screen: product grid, barcode scanner integration, cart management.
- **Verification Gate:**
  - End-to-end checkout test verifying stock deduction and automated debt issuance when paying by store credit.

### Phase 5: Education Center MVP — Students, Study Groups & Tuition Billing
**Objective:** Provide private education centers with student admissions, cohort groups, and monthly tuition fee debt tracking.

- **Backend Deliverables:**
  - Education models: `Student`, `StudyGroup`, `GroupEnrollment`, `TuitionInvoice`, `TuitionPayment`, `TuitionLedger`.
  - Gated by modules: `edu_students`, `edu_groups`, `edu_tuition`, `edu_debts`.
  - Monthly tuition invoice generation service and payment collection service inside `transaction.atomic()`.
- **Frontend Deliverables:**
  - Student directory view with parent contact details and enrollment status.
  - Study group management view: cohort timetables, room assignments, instructor roster.
  - Tuition billing view: monthly fee invoices, payment processing, overdue fee warnings.
- **Verification Gate:**
  - Batch invoice generation test verifying correct student balance updates and tuition ledger trail.

### Phase 6: Education Center LMS — Video Lessons, Homework & Exams
**Objective:** Deliver complete learning management capabilities for education centers.

- **Backend Deliverables:**
  - Models: `CourseLesson`, `HomeworkAssignment`, `HomeworkSubmission`, `Exam`, `ExamResult`.
  - Gated by modules: `edu_lms`, `edu_homework`, `edu_exams`.
- **Frontend Deliverables:**
  - Instructor lesson planner and video resource viewer.
  - Homework distribution and student grading interface.
  - Test/Quiz score tracker with ranking reports.
- **Verification Gate:**
  - Submission, grading, and score publication test workflows.

### Phase 7: PostgreSQL Production Migration & High-Concurrency Hardening
**Objective:** Migrate database from SQLite3 to PostgreSQL 16+ before large-scale multi-user production launch.

- **Infrastructure & Backend Deliverables:**
  - Provision managed PostgreSQL 16+ instance.
  - Run database migration cutover (`dumpdata`/`loaddata` or `pgloader`).
  - Enable `select_for_update()` row-level locking on `DebtCustomer` and `Student` balance rows in application services.
  - Enable PostgreSQL Row-Level Security (RLS) on all tenant-owned tables.
  - Configure PgBouncer connection pooling.
- **Verification Gate:**
  - Concurrent load test simulating 500 simultaneous POS cashier checkouts with zero lock timeouts and zero financial balance discrepancies.
