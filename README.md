# IDROK AI

IDROK AI is a proposed universal AI-powered business automation SaaS for independent companies across clinics, education, retail, hospitality, and other industries.

**Status: architecture proposal awaiting approval.** This phase defines the MVP and API; it does not implement or deploy the application.

## Project documents

- [Product requirements](docs/PRD.md): users, MVP scope, acceptance criteria, release gates, and open decisions.
- [Architecture](docs/architecture.md): module boundaries, tenancy, security, RAG, asynchronous jobs, and planned repository structure.
- [OpenAPI contract](docs/api-contract.yaml): proposed versioned HTTP API and data schemas.
- [Agent collaboration rules](AGENTS.md): shared rules for Codex and Antigravity CLI.

## Proposed stack and MVP

Django REST Framework provides an API-first modular monolith. Next.js, TypeScript, and Tailwind CSS provide the UI. PostgreSQL with pgvector stores business records and knowledge vectors. Redis and Celery support asynchronous ingestion, AI responses, and invitation delivery. An OpenAI-compatible adapter isolates the AI provider; private file storage holds uploaded knowledge.

The MVP includes identity, company memberships and roles, contacts, follow-up tasks, uploaded knowledge, an internal assistant with citations, and usage/audit visibility. Tenant isolation applies across APIs, database policies, jobs, caches, files, and retrieval. Industry-specific operations, payment checkout, external messaging campaigns, and autonomous AI actions follow later.

## Development status

No installation or startup commands are prescribed yet: dependency versions and environment configuration belong to the approved implementation phase. Repository inspection was blocked by a local command-runner initialization failure; the documents describe the intended design and must be reconciled with any existing implementation. Do not treat them as evidence of implemented behavior.

Next: review the documents, select the pilot industry, confirm language/hosting/retention/provider/budget assumptions, and approve or amend the architecture. Implementation starts only after approval. Dependency installation, deployment, and Git commits were not authorized by this documentation task.
