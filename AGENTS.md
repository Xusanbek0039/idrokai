# IDROK AI — Codex and Antigravity CLI collaboration

## Current phase and authorization

The project is in architecture review. Work is documentation-only until the user approves implementation. Do not write backend/frontend implementation, install dependencies, deploy, or automatically create Git commits. Approval of the architecture does not itself authorize deployment, destructive changes, paid external actions, or commits. Explicit user instructions govern scope.

## Sources of truth

Read `docs/PRD.md`, `docs/architecture.md`, and `docs/api-contract.yaml` before work. Requirements define scope; architecture defines boundaries; OpenAPI defines HTTP behavior. Resolve contradictions explicitly in the same change. Inspect existing repository instructions and code first; these documents are a proposed target, not proof of implementation.

## Collaboration protocol

Codex and Antigravity CLI follow the same rules. The agent receiving the user task coordinates that task. Do not invoke another CLI or spawn agents unless the user explicitly requests delegation or parallel agent work. When delegation is authorized, agree on file ownership and scope first; avoid simultaneous edits to the same file. Prefer isolated worktrees only when authorized and supported by the workspace. Never overwrite or revert another agent's or the user's uncommitted work.

Each handoff states the objective, assumptions, files changed, contract changes, checks and their results, remaining issues, and next action. Read the latest files before editing after a handoff. The coordinating agent reviews the combined result; a second agent's summary is not verification. Use user-approved commits/branches only. Do not stash, reset, clean, force-push, or resolve conflicts destructively without explicit authorization.

## Engineering rules after implementation approval

- Keep DRF as the domain authority and Next.js as the API consumer. Update the contract before or alongside behavior changes; never silently break v1 clients.
- Use a modular monolith and documented application-service boundaries. Industry modules must not spread industry-specific assumptions through core modules.
- Every tenant-owned access, including background jobs, RAG, cache, file access, and related-object validation, must enforce company scope. Company identifiers supplied by clients do not establish authorization.
- Maintain role checks, CSRF/session protection, RLS defense in depth, idempotency, durable job state, and quota accounting. Never grant runtime DB roles tenant bypass privileges.
- AI context is untrusted; do not introduce autonomous actions or expose provider secrets. Keep personal data and prompt bodies out of ordinary logs.
- No secrets or production data in code, documentation, fixtures, tool output, or commits. Use placeholders in configuration examples.
- Keep changes scoped and reversible. Inspect `git status` and relevant diffs when command tools are available. Do not reformat unrelated files.
- Run meaningful checks appropriate to changes. Report exact checks, failures, and tool limitations honestly. Never claim unrun tests or unverified compatibility.
- Do not install or upgrade dependencies, run migrations against shared environments, or deploy without authorization for that action. Local implementation checks may run when implementation has been authorized and existing tools suffice.

## Completion and review

Summarize the outcome, changed files, verification, and material open decisions. At the end of the current documentation task, wait for the user's architecture approval. If a tool cannot inspect or write files, report the limitation and do not pretend the workspace was verified.
