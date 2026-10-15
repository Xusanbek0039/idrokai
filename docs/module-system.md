# IDROK AI — Module Registry, Dependencies and Route Policies

Status: Proposed extension, awaiting approval. Registry records grant access to shipped code; they never load arbitrary executable plugins.

## 1. Eligibility and effective state

Keep existing immutable module codes. ModuleDependency(module, prerequisite) replaces the single depends_on relation with a DAG; migrate existing edges without renaming modules. Reject self edges/cycles. BusinessTypeModule defines eligibility, mandatory and creation defaults; absence means ineligible. OrganizationModule is unique by company/module; absence means disabled. Globally inactive modules fail closed, including their dependents. Defaults apply only when provisioning; changing a template never silently re-enables modules for existing tenants.

Effective enabled = organization active AND business type eligible AND global catalog active AND configured enabled AND subscription entitlement (where configured) AND all transitive prerequisites effective. Mandatory means cannot be manually disabled, not an exemption from tenant suspension. An absent subscription explicitly uses the initial manually provisioned entitlement policy; a configured expired/suspended plan blocks its optional features. Subscription changes use dependency-aware preview; no hidden invalid state. No subscription code is claimed to exist today.

The authenticated capability response is no-store and contains business type, access_version, effective modules, explicit permissions and scopes, and reasoned disabled states. It is advisory to the UI; the server evaluates current state again on every request. Cache keys include company, membership, role and access_version; revocation cannot wait for TTL. Missing/unknown declarations deny by default.

## 2. Education catalog

All rows below are eligible only for education_center. Core identity, membership, audit and capability discovery are infrastructure, not optional education modules.

| Module | Kind | Required modules | Boundary |
| --- | --- | --- | --- |
| edu_students | Mandatory foundation | none | Student and teacher profiles, minimal roster |
| edu_groups | Mandatory foundation | edu_students | Groups, teacher assignments, enrollment |
| edu_classrooms | Optional | edu_groups | Classroom directory and capacity |
| edu_scheduling | Optional | edu_groups | Recurring rules and scheduled sessions |
| edu_attendance | Optional | edu_groups | Ad hoc session and attendance marking |
| edu_tuition | Optional | edu_groups | Fee agreements, monthly charges, receipts, balances |
| edu_debts | Optional, retained code | edu_tuition | Additional overdue/family debt views; no separate balance ledger |
| edu_homework | Optional | edu_groups | Assignments, submissions, feedback |
| edu_exams | Optional | edu_groups | Tests, versioned questions, attempts, results |
| edu_lms | Optional, retained code | edu_groups | Video lessons and progress |
| edu_gamification | Optional | edu_groups | XP, coins, leaderboard, rewards and redemptions |
| edu_reports | Optional | edu_groups | Per-source gated analytics and exports |

No optional modules default to enabled for a newly provisioned education center. A center choosing only attendance, payments and tests has exactly edu_attendance, edu_tuition and edu_exams as optional enabled modules, plus the two mandatory foundations. Classroom/scheduling/homework/videos/rewards/reports remain inaccessible. This replaces the previous dependency of reports on tuition, and separates timetable/room functions formerly bundled into groups.

Soft integrations require both gates and never add mandatory dependencies: scheduling + classrooms for room allocation; attendance + scheduling for scheduled-session marking; gamification + source module for automatic XP; reports + each source module for a dataset. With classrooms off, schedules can be online/unallocated; existing room details are redacted. With scheduling off, attendance may use its own ad hoc sessions; it cannot read or mutate scheduler-owned sessions. Historic references remain stored.

Retail catalog/dependencies remain: retail_customers → retail_debts; retail_inventory + retail_customers → retail_pos; retail_debts → retail_reports and retail_reminders. Education eligibility never grants retail module access. Existing generic crm/work/knowledge/assistant retain their separate grants and require explicit education role policy before exposure.

## 3. Mutation protocol

Only a platform identity authorized for module administration may change entitlements. Owners, assistant admins, operations managers, teachers and students have no toggle permission. Use one service from Django admin and the platform API, with active platform account, CSRF, reason, expected access_version and exact final-state batch. No tenant route writes entitlements.

Preview every changed flag and dependency impact. Reject unknown/ineligible modules (400 MODULE_INELIGIBLE), mandatory disable (409 MODULE_REQUIRED), inactive catalog enable or missing prerequisites/dependent disable (409 MODULE_DEPENDENCY_CONFLICT), cycles (409 MODULE_DEPENDENCY_CYCLE) and stale version (409 STALE_ACCESS_VERSION). Never implicitly cascade or auto-enable. Allow an explicitly confirmed complete batch that enables prerequisites or disables dependents together. Validate whole graph including unaffected enabled modules; no partial state.

Acquire the organization write boundary, revalidate, write flags and activation/deactivation timestamps, append AuditEvent records and increment access_version in the same atomic transaction. Audits include company, actor, request ID, timestamp, reason, before/after, dependency/catalog version and batch ID. Failed changes do not change flags; separately record safe denied-action metadata. Registry/global/eligibility/subscription edits preflight all impacted tenants, preserve valid configured states and increment affected versions. Missing audit write rolls back the change. Module/catalog deletion is prohibited where referenced.

Disabling preserves all data and files; no signal or job may delete module content. Re-enable preserves identifiers and restores current-authorized access to existing records. No retroactive invoice/reward jobs run automatically.

## 4. Route access registry

Canonical prefix is /api/v1/companies/{company_id}; no new /organizations alias. OpenAPI operation extensions name module, action and scope. The permissions matrix defines actions. All list/detail/create/update/nested/actions/downloads require the same gates. Every related UUID is looked up within the authenticated company and permitted scope; a foreign reference returns 404.

| Route suffix | Module | Action and object policy |
| --- | --- | --- |
| /capabilities, /modules | infrastructure | Active membership; only own effective permissions, no tenant mutation |
| /education/students, /education/teachers | edu_students | Registry read/manage; teacher sees assigned minimal roster, student own profile |
| /education/groups, /education/enrollments | edu_groups | Registry read/manage; teacher assigned, student own active enrollments |
| /education/classrooms | edu_classrooms | Operations manage, teacher assigned read |
| /education/schedules, /education/scheduled-sessions | edu_scheduling | Operations manage, teacher/student assigned read; classroom_id also requires edu_classrooms |
| /education/sessions | edu_attendance | Create/read ad hoc attendance sessions only; scheduled sessions use scheduling route |
| /education/attendance | edu_attendance | Staff manage, assigned teacher mark, student own read |
| /education/fee-agreements, /education/charges | edu_tuition | Billing staff manage/read; student own charge read |
| /education/payments, /education/payments/{id}/reversals | edu_tuition | Billing staff post; owner-only reversal; student own read |
| /education/overdue | edu_debts + edu_tuition | Billing staff only |
| /education/homework, /education/submissions | edu_homework | Staff/assigned teacher author-grade; student assigned read/own submit |
| /education/tests, /education/questions | edu_exams | Staff/assigned teacher author; student published assigned test read with no answers |
| /education/attempts, /education/attempts/{id}/submit, /education/results | edu_exams | Student own attempt; teacher assigned grade; published own results |
| /education/videos, /education/video-progress | edu_lms | Staff/assigned teacher publish; student assigned video/own progress |
| /education/gamification-transactions, /education/rewards, /education/redemptions, /education/leaderboard | edu_gamification | Scoped balances/ranking; grants restricted, students redeem own |
| /education/reports/{dataset} | edu_reports + source gate | Authorized dataset scope; source disable blocks existing cached exports too |

Authoring responses never share schemas containing correct answers with learner responses. Unsupported methods return 405; input extras return 400. Downloads and file APIs inherit the parent module/scope policy, including subsequent range requests. An existing resource reference never creates an access exception when its owning module is disabled.

## 5. Worker and acceptance policy

See architecture.md for transaction serialization and external dispatch drain. Claiming an enabled job is insufficient; recheck before every action/retry. Disabled jobs remain paused_module; administrative status/audit writes are permitted, business writes/notifications/exports are not. Resume/backfill requires preview and unique source-event keys. Automatic rewards require both source and gamification modules at processing time.

Required later checks: direct disabled endpoint calls return 403; data and file hashes unchanged across toggle; stale caches/exports fail; disabling prerequisite blocked; explicit valid batch atomic; cycles rejected; different business type blocked; platform operational bypass absent; queued/running/retried jobs perform no actions after disable completes. These checks are specified, not executed now.

The OpenAPI additionally defines assigned learner question delivery under /education/tests/{id}/questions, author-only answer keys, publication/grading/release actions, and parent-scoped asset upload/streaming. Scheduled-session generation is bounded to 31 days and uses business uniqueness and conflict checks. These subroutes inherit the same parent action/module policy.

Owner-only /education/charges/{id}/adjustments requires edu_tuition and tuition.adjust; append debit/credit correction with balanced journal, preserving the unique original monthly charge.
