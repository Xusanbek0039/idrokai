# IDROK AI — Tenant Permissions Matrix

Status: Proposed education extension; no runtime permissions changed.

## 1. Shared security boundary

Reuse identity.User and CompanyMember (Membership alias). Membership is unique by company/user and has exactly one business-type-valid role in this proposal. Users can have different roles in different centers. A role is never global authority. Platform privileges come from the platform account flag and Django admin authorization, never from a tenant-editable role field.

All education endpoints enforce active user + active membership + active company + eligible/effective module + action + object scope. Platform users need a real tenant membership for operational calls. Django platform metadata/entitlement management uses a separate audited control plane. The existing retail platform bypass is an observed implementation gap; this proposal does not alter retail code and must not copy it into education.

Foreign/missing membership and foreign or out-of-scope object IDs return 404. Same-tenant role denial returns 403 PERMISSION_DENIED. Disabled module returns 403 MODULE_DISABLED after tenant resolution. List filters are applied before pagination/aggregation. Validate nested objects and relation IDs, not only root rows. A client company_id is never trusted. Audit sensitive reads/exports without logging personal data, prompt bodies or answer keys.

## 2. Education roles and explicit action scopes

Codes: edu_owner (Boshliq), edu_assistant_admin (Yordamchi admin), edu_operations_manager (Ish boshqaruvchi), teacher (O‘qituvchi), student (O‘quvchi). New education codes avoid renaming existing retail shop_owner/shop_manager/cashier/accountant values. No legacy org_manager/admin/accountant automatically acquires education privileges. A reviewed migration may map existing education memberships, but must preserve active ownership and audit every change. Existing owner/admin/staff values in the legacy proposed API remain for compatibility; they are not education grants.

A = entire center; G = currently assigned teaching groups; S = own linked student identity and permitted enrollments; — = denied. Every grant additionally needs the relevant module(s). Manage includes read, create, update/archive of mutable domain records; it never includes deletion/edit of immutable financial or published assessment records.

| Action / capability key | Owner | Assistant Admin | Operations Manager | Teacher | Student |
| --- | --- | --- | --- | --- | --- |
| registry.read (students, teachers, groups, enrollment) | A | A | A | G minimal roster | S |
| registry.manage (admit, enroll, staff profiles/groups) | A | A | A | — | — |
| classrooms.read / schedules.read | A | A | A | G | S timetable only |
| classrooms.manage / schedules.manage | A | A | A | — | — |
| attendance.read | A | A | A | G | S |
| attendance.manage | A | A | A | G | — |
| tuition.read / tuition.manage (fee agreements, charges) | A | A | — | — | S read only |
| payments.read / payments.post | A | A | — | — | S read only |
| payments.reverse / tuition.discount | A | — | — | — | — |
| homework.read / homework.manage (author, publish, grade) | A | A | A | G | S read published |
| submissions.read | A | A | A | G | S |
| submissions.submit | — | — | — | — | S |
| exams.read / exams.manage (author, publish, grade) | A | A | A | G | S published learner view |
| attempts.read / results.read | A | A | A | G | S (results only after release) |
| attempts.start / attempts.submit | — | — | — | — | S assigned published tests |
| videos.read / videos.manage | A | A | A | G | S read assigned published |
| progress.read | A | A | A | G | S |
| progress.record | — | — | — | — | S |
| gamification.read | A | A | A | G | S balances; scoped leaderboard |
| gamification.grant / gamification.reverse | A | — | — | — | — |
| rewards.manage | A | — | A | — | — |
| redemptions.read | A | A | A | G | S |
| redemptions.redeem | — | — | — | — | S |
| reports.academic | A | A | A | G | — |
| reports.finance | A | A | — | — | — |
| memberships.manage | A | limited below | — | — | — |
| organization.manage / audit.read | A | — | — | — | — |
| modules.read (capabilities) | own | own | own | own | own |
| modules.change | — | — | — | — | — |

Automatic XP/coin awards run as a registered system action, with validated teacher/student source event, unique rule/source key and both enabled modules; teacher grading is not arbitrary coin minting. Teachers see only group-scoped leaderboard aliases and totals; students see their own group leaderboard using display aliases without billing, contact details or private progress. Students cannot submit financial receipts as confirmed payments or edit grades/XP.

Owner may manage all center memberships, including owner transfer, provided at least one active owner remains. Assistant Admin may invite/deactivate teacher/student memberships only; cannot create/promote owner, assistant admin or operations manager, modify own role, edit peers, grant permissions or change plan/modules. Student profile admission does not create a login automatically. Teacher/student linking requires active membership with corresponding role in same company. Only Owner can access complete tenant audits; platform module history remains visible in the platform console.

Assignment scope is based on current active TeacherGroupAssignment and student GroupEnrollment date interval; enrollment access to older published learning materials is explicitly allowed only while current enrollment is active. Own historical attendance/receipts/results remain readable after leaving a group if the student membership is active and the module enabled. Teacher removal revokes access immediately. Restricted parent contacts/medical notes and finance fields are excluded from teacher/student roster serializers; no public membership directory for learners.

## 3. Generic core and existing retail compatibility

Existing retail roles and URLs stay intact: shop_owner, shop_manager, cashier, accountant and existing legacy contract values are not renamed here. Intended retail policy remains owner/manager/cashier customer/debt/receipt operations; credit-limit changes owner/manager; center-wide reports owner/manager. Platform module changes only, replacing the old optional owner self-service proposal.

Education roles receive no implicit generic CRM/work/knowledge/assistant access merely because old documentation said “all members.” Those routes require an explicit business-type/action mapping before education exposure; until then deny by default. This resolves the conflicting broad legacy contract wording without expanding student authority. Shared auth/company discovery is available to active members; education membership directories use registry scope, not a public task-assignee list. Membership mutation and invitation must validate business type and the limits above, including via legacy endpoint aliases.

## 4. Capability payload and session policy

GET /api/v1/companies/{company_id}/capabilities returns role, effective module codes, access_version, and permission entries {code, scope}, where scope is organization, assigned_groups or self. Split read and write entries: e.g. a student receives tuition.read/self but never tuition.manage. Returned permissions are the role grants intersected with effective module(s). /modules exposes the same effective state plus disabled reasons. Never expose another member’s grants or answer keys.

Session cookies use Secure/HttpOnly/SameSite=Lax in production. Unsafe API/admin requests require CSRF; rotate sessions on login, invalidate on logout. Every request rechecks membership and entitlements; frontend hiding is usability only. Private file access, background work, search/RAG, report polling/download and cached responses use identical gates. Platform admin cannot edit immutable payments through model forms or bulk actions.
