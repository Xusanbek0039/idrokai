# IDROK AI — Shared Backend and Education Architecture

Status: Proposed; architecture approval and separate implementation authorization pending.
Date: 2026-10-15. This change is documentation-only.

## 1. Repository inspection and compatibility

The repository contains Django identity, tenancy, operations, debts, work, CRM, knowledge and assistant apps, migrations, a SQLite database, Django admin registrations, and a retail Next.js application under frontend/src. config/urls.py mounts auth, tenancy, debts and work. This inventory does not prove that all proposed APIs work.

Company is the persisted tenant model; Organization = Company is an existing alias. CompanyMember is the membership model; Membership is its alias. Reuse these models and the existing identity.User, sessions, password flow and CSRF protection. Do not create another backend, user table, tenant table or authentication service. Education app models use company_id, consistently with existing code and /api/v1/companies/{company_id} routes. “Organization” and “center” mean that same Company.

Observed gaps: Module currently has one nullable depends_on FK; has_module checks only a boolean entitlement; tenant permissions grant platform users a bypass; admin inline/bulk actions update entitlement flags directly. Proposed dependency validation, eligibility, audit and education permissions below are requirements for later implementation, not claims about existing safeguards. Existing retail permissions, serialization and proposed legacy OpenAPI also differ; preserve retail behavior and resolve those separately through reviewed compatibility tests. Do not silently rename legacy role codes or URLs.

Existing uncommitted backend changes were present during inspection, including tenancy seed/dashboard files, URL configuration and SQLite data. They are outside this change and must remain untouched.

## 2. One backend, separate frontends

Target layout (no directories moved or created by this review):

~~~text
backend/                    One Django + DRF deployment, shared identity and database
  apps/identity/            Existing users, sessions, authentication
  apps/tenancy/             Existing Company, CompanyMember, registry and entitlements
  apps/operations/          Shared audit, idempotency, durable jobs and outbox
  apps/debts/               Existing retail functionality stays in place
  apps/education/           Proposed domain package and application services
    registry/              Student/teacher profiles, groups and enrollment
    attendance/ scheduling/ classrooms/ tuition/
    homework/ exams/ video/ gamification/ reports/
frontend/shop/              Independent retail Next.js application
frontend/education/         Independent Next.js + TypeScript + Tailwind application
 docs/                      Shared architecture and OpenAPI contracts
~~~

The existing frontend remains at frontend/ until a separately approved move to frontend/shop/. The education frontend is a separate application, not a conditionally themed copy inside the retail application. Both consume the same /api/v1 backend. Django Super Admin stays at /admin/ in that backend. No Next.js application accesses the database or decides domain permissions.

Reuse existing login and session endpoints. Each frontend deployment proxies /api to the shared backend and deliberately forwards only its authenticated session and CSRF headers. Use HTTPS, secure HttpOnly session cookies, SameSite=Lax and CSRF on every unsafe request, including login and admin forms. Cross-origin hosting, if selected later, requires an explicit reviewed CORS/cookie/CSRF design; do not broadly share cookies across subdomains.

## 3. Domain boundaries

Tenancy owns membership, business type eligibility and effective capabilities. Only platform administrators manage entitlements through a common application service. Education registry owns profiles/groups/enrollments. Optional education services own their respective records and rules. Tuition reuses shared audit/idempotency infrastructure, but never writes retail debt tables. No education assumptions enter retail, generic CRM/work, or identity models beyond registered business-type role validation.

edu_students and edu_groups are mandatory education foundation capabilities. Teacher profiles live in that foundation. Separate optional classroom, scheduling, attendance, tuition, homework, exams, video (edu_lms), gamification and reporting gates are defined in module-system.md. Foundation does not imply any optional capability. Attendance can create an ad hoc dated LessonSession without enabling recurring scheduling; tests can target a group directly. Monthly tuition uses enrollment-specific fee agreements without requiring a timetable or classroom.

Application services validate company scope on every referenced row, then permissions and entitlements, and execute transactional invariants. Views, admin, jobs and imports use the same services. Published assessments are versioned; answer keys never enter student responses. Files remain private and use authorized streaming rather than reusable public download URLs. Reporting, cached aggregates, search, exports and AI retrieval must enforce the originating module gate and record scope, including on later retrieval.

## 4. Authorization and feature lifecycle

Every operational endpoint requires authentication, active user, active tenant membership, active organization, eligible business type, globally active module, enabled entitlement with enabled transitive prerequisites, action permission and object scope. No platform-super-admin bypass applies to education operational APIs; platform control-plane views use separate authorization and audited metadata access. An organization ID from a URL/body is never authorization. Student profiles may exist without a login; student portal access requires a linked active membership in the same company.

Missing/foreign tenant membership and inaccessible objects return 404. Within a verified tenant, disabled optional module calls return 403 MODULE_DISABLED; ineligible business type returns 403 MODULE_INELIGIBLE; suspended center returns 403 ORGANIZATION_INACTIVE; role denial returns 403 PERMISSION_DENIED. CSRF failures remain 403. See roles-permissions.md for all five education roles and action scopes.

Module mutations use a reviewed final-state batch, expected organization access_version and mandatory reason. Validate the full DAG and all business type/subscription constraints atomically, write append-only audits in the same transaction, increment access_version and invalidate capability caches on commit. Never silently enable prerequisites or cascade-disable dependents. Registry/dependency/business-type edits must preflight affected tenants and use this same invariant; unsafe direct admin saves and bulk updates must be removed during implementation.

Disablement changes access only. Preserve rows, relationships, files, financial history and learning progress. Re-enable restores access subject to current membership/role/eligibility, not obsolete privileges. No automatic retrospective charges, rewards or reminder flood. Missed periods require an explicit previewed backfill with business uniqueness keys.

## 5. Jobs, races and external effects

Durable jobs carry company_id, module requirements, initiating actor or authorized system identity, business key and observed access_version. Recheck scope, role where actor-driven, organization state and all required modules on enqueue, claim, retry and immediately before committing each business action. A disabled job becomes paused_module with no domain writes or external dispatch; job-state/audit metadata may be recorded. Re-enable does not automatically replay jobs.

For SQLite, make an access_version compare-and-swap write on Company the first write inside a short atomic business transaction; module changes acquire the same write boundary. Re-read guards within that transaction. A conflicting or busy writer rolls back the entire operation and retries with bounded backoff, never from a stale partial calculation. A committed disable prevents subsequent business actions; already committed actions are not undone. This serialization must be implemented and tested; transaction.atomic alone is insufficient.

Use an outbox for external effects; dispatch checks current gates and requires a tenant dispatch lease that the disable workflow drains before confirming completion. UI shows disabling until in-flight dispatch settles, then disabled. An external action already accepted cannot be recalled; record its pre-disable ordering. Future paid gateways require a separately approved design for callbacks/reconciliation during disablement; tuition in this proposal records cash/card/bank receipts only and makes no external charge.

## 6. Financial safety and SQLite limits

All persisted money uses DecimalField(12,2), currency and decimal-string HTTP amounts; use Python Decimal for arithmetic and explicit quantization. SQLite does not provide PostgreSQL fixed-decimal storage guarantees: avoid money arithmetic in SQLite SUM/F expressions as the accounting authority. Recompute and validate canonical ledger values using Decimal, enforce precision/limits in services, and verify round trips. Atomic transactions, unique business keys, scoped idempotency and versioned writes protect posting/allocation/reversal invariants. Records are immutable once posted, including in admin; corrections append linked reversal entries, never edit/delete originals. All financial FKs use PROTECT; archival never cascades payment history. Balanced journal lines, not a balance-before/after log alone, constitute double entry.

SQLite is limited to local development and a low-concurrency initial release. WAL, foreign_keys=ON and bounded busy timeout are configuration targets to verify, not proof of concurrent correctness. No select_for_update, advisory locks, exclusion constraints, RLS or PostgreSQL JSON operators are assumed. Keep write transactions short; busy/serialization exhaustion returns a retryable 503. For durable finance use synchronous=FULL; NORMAL can lose recently committed transactions on power loss. This supersedes the older NORMAL recommendation.

Migrate to PostgreSQL before significant concurrent financial use: reconcile counts/Decimal ledger totals and ownership, test restore/cutover and uniqueness, add row locking while retaining idempotency/version checks. RLS is additional defense, scoped transaction-locally, with runtime roles neither superuser nor BYPASSRLS nor table owners bypassing policies. Migration/deployment requires separate authorization.

## 7. Django Super Admin center view

Show organization details/status/business type/timezone/currency; owner; employee counts separated from students and teacher counts; all eligible modules including missing entitlement rows as disabled; configured and effective enabled/disabled states with reasons; mandatory dependencies; subscription plan/status/dates/module entitlements/quotas; module change history; operational counts and gated statistics with freshness timestamps. Subscription may be absent and must show “not configured”; do not invent billing data. Platform metadata summaries can count preserved records for disabled modules in this audited view; tenant reports cannot bypass gates.

Use a searchable module grid, filters and staged toggles. Toggles prepare changes without mutating on GET. Show prerequisites and dependents, impact on jobs/API/files, preserved-data notice, final changes and reason field before CSRF-protected confirmation. Sensitive actions (disable tuition, dependent batches, business type/subscription changes and suspension) require explicit confirmation naming the center and affected modules. Stale versions require reload and a new preview. Bulk changes preflight each center and report per-center atomic outcomes. No alternate inline/admin/script path may skip the service. Use select_related/prefetch and grouped tenant-filtered aggregates; paginate history and directories rather than querying per cell.

## 8. Approval and verification gates

Before implementation: approve mandatory foundation, five-role policy, optional dependency graph, manual receipt-only payments, immutable finance and staged frontend split. No implementation, migrations, installs, commits or deployments are authorized by this document.

Later acceptance checks must cover every role × module × action; cross-tenant list/detail/nested references; disabled direct URLs/files/exports/RAG/caches/jobs; disable/re-enable preservation; dependency cycles/concurrent edits; membership revocation; student answer-key privacy; concurrent tuition posting/reversal/idempotency; SQLite busy recovery/precision; schedule conflicts; and retail authentication/API regression. Documentation review is not runtime verification.
