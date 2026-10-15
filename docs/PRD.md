# IDROK AI — Product Requirements

Status: proposed; awaiting owner approval. Date: 2026-10-15.

## Product and problem

IDROK AI is a multi-company business automation SaaS. Businesses need a shared place for customer records, follow-up work, internal knowledge, and AI-assisted answers without exposing one company's information to another. The long-term product serves clinics, education centers, shops, hotels, and other organizations through optional industry modules.

The MVP proves a common operational core before implementing complete industry systems. It does not claim to replace medical records, school administration, inventory accounting, or hotel property-management software.

## Users and access

| Role | MVP capabilities |
| --- | --- |
| Owner | All company operations; membership, company settings, usage, audit history |
| Admin | Manage operational records, knowledge, and staff; cannot grant or revoke ownership |
| Staff | Work with company contacts, tasks, conversations, and approved knowledge |

A global user can belong to multiple companies with different roles. Every request checks active membership in the selected company. MVP records are company-visible; private teams and per-document permissions are deferred. A company must retain at least one active owner. Platform operations access is separate, restricted, and audited; no implicit support access to customer content.

## MVP scope and acceptance criteria

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| M1 | Identity and onboarding | User registers, signs in/out, creates a company, and lists their memberships. Company creation atomically creates its owner membership. |
| M2 | Company administration | Owner/admin can invite a verified email and change/remove memberships within role limits. Invitation is single-use, expires, and must match the authenticated verified email. |
| M3 | Contact management | Staff can create, list, filter, update, and archive contacts. Archived contacts are excluded by default. |
| M4 | Follow-up tasks | Staff can assign a task to an active company member, set a due date and status, and filter pending tasks. Completion is recorded. |
| M5 | Knowledge ingestion | Admin/owner uploads PDF, TXT, or Markdown up to 10 MiB. Upload becomes searchable only after validation and successful ingestion. Image-only PDFs and OCR are outside MVP. |
| M6 | Internal AI assistant | Staff submits a message and polls its run. Successful answers cite accessible source chunks; insufficient evidence produces an explicit limitation. Provider failures are visible and retryable. No autonomous business mutations. |
| M7 | Operations and accountability | Owners/admins see audit events and usage. Upload, ingestion, AI, and task changes have traceable actor/company IDs. Secrets and full prompts are excluded from standard logs. |
| M8 | Isolation | Cross-company list, detail, write, attachment, search, citation, cache, and background-job tests deny access or return no foreign data. Knowledge removal prevents subsequent retrieval. |

MVP automation consists of persisted task state, asynchronous document ingestion, and asynchronous assistant runs. A configurable workflow builder, scheduled customer messaging, and external actions are deferred. UI uses an industry label and optional contact category; it does not add unvalidated medical, student, inventory, or reservation fields.

## Primary journeys

1. Register → verify email → create company → invite colleagues → accept invitation.
2. Select company → add contact → create assigned follow-up → complete task.
3. Admin uploads knowledge → watches ingestion status → staff asks a question → reads cited answer or clear insufficient-evidence response.
4. Owner reviews usage and audit history → removes a member or retires a document.

## Explicit exclusions

Payments and subscription checkout, public chatbot, WhatsApp/Telegram/email campaigns, clinical decisions, sensitive clinical records, accounting, ecommerce orders, inventory, bookings, attendance, custom workflow scripting, voice, OCR, autonomous tools, and cross-company analytics are post-MVP. Invitation delivery is the sole transactional email integration in MVP. Plans and limits are internally configured; no billing integration is required.

## Quality targets and release gates

Proposed pilot envelope: 20 companies, 50 members/company, 10,000 contacts/company, 100 documents/company, and 50 concurrent authenticated users. Validate with representative data before release. Target ordinary CRUD p95 under 500 ms server time; AI acceptance under 1 second excluding provider calls; AI run deadline 120 seconds. Pilot availability target is 99.5% monthly; recovery targets are RPO 24 hours and RTO 4 hours, demonstrated by restore rehearsal. These are targets, not existing guarantees.

Release requires contract validation, role/isolation tests, upload and prompt-injection tests, durable job recovery, quota enforcement, backup restoration, and a pilot RAG evaluation. Proposed RAG gate: at least 90% correct citation grounding and at least 90% abstention on unanswerable questions in an owner-approved 50-question pilot set. Record provider, model, corpus version, latency, and cost with the evaluation.

## Rollout sequence

1. Approve requirements, contract, security boundaries, and pilot assumptions.
2. Implement identity, tenancy enforcement, permissions, API foundation, and isolation tests.
3. Deliver contacts, tasks, memberships, and the company dashboard.
4. Add ingestion, RAG, quotas, audit/usage views, and failure recovery.
5. Validate pilot gates; separately authorize deployment and industry expansion.

## Decisions awaiting owner approval

Choose the first pilot industry; confirm Uzbek/Russian/English UI priorities (proposed first UI: Uzbek, with translation-ready strings); select hosting region, retention policy, email service, AI provider/models, and monthly AI budget. Proposed content retention lasts until company deletion; deletion removes operational content within 30 days and encrypted backup copies expire within 35 days. Legal/compliance requirements require separate assessment before regulated workloads. No legal compliance certification is implied.

## Assumptions and discovery limitation

The requested stack is authoritative. Existing repository contents could not be inspected because the local process runner failed before execution. This proposal must be reconciled with existing code and configuration before implementation. The architecture and API contract describe intended behavior, not implemented functionality.
