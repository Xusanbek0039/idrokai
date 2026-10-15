# IDROK AI

IDROK AI is a multi-tenant business automation platform built as an API-first modular monolith.

The first business module is **Shop Debt Management (Nasiya Savdo / Daftari)**, designed for neighborhood shops and retail stores to digitize customer debt tracking, manage repayment collections, enforce credit limits, and maintain an immutable financial ledger.

**Status: Architecture Proposal Awaiting Approval.** Work is currently documentation-only. No backend/frontend code implementation, dependency installation, or deployment has been executed.

---

## Project Documentation

- [Product Requirements (PRD)](docs/PRD.md): Problem statement, user roles, Shop Debt Management MVP scope, acceptance criteria, and quality release gates.
- [Architecture Specification](docs/architecture.md): Modular monolith boundaries, SQLite3 configuration & WAL mode, financial transaction integrity, safe concurrency without `select_for_update()`, and PostgreSQL migration roadmap.
- [OpenAPI Contract](docs/api-contract.yaml): Versioned HTTP REST API contract for authentication, tenancy, debtor customer management, debt issuance, and repayment processing.
- [Agent Collaboration Rules](AGENTS.md): Shared workflow and constraints for Codex and Antigravity CLI.

---

## Architecture & Technology Stack

- **Backend**: Django REST Framework (DRF) with Python 3.12+ (domain authority, business logic, RBAC, financial ledger).
- **Frontend**: Next.js 14+ (TypeScript, Tailwind CSS, App Router) consuming `/api/v1` endpoints with secure server-side session management.
- **Initial Database**: **SQLite3** for local development and the first MVP (`django.db.backends.sqlite3` with Write-Ahead Logging `PRAGMA journal_mode=WAL;`).
- **Target Production Database**: **PostgreSQL** (with row-level locking and pgvector), planned for migration prior to multi-user production deployment with significant concurrent financial activity. PostgreSQL is **not** configured yet.
- **Precision & Transaction Safety**:
  - `DecimalField(max_digits=12, decimal_places=2)` for all monetary figures (debts, repayments, balances, credit limits).
  - `transaction.atomic()` wrapping all debt and repayment operations.
  - Safe concurrency and balance validation avoiding `select_for_update()` due to SQLite's lack of row-level locking.
  - Mandatory `Idempotency-Key` headers on payment and debt endpoints to prevent double-charging or duplicate entries.

---

## Multi-Tenant Roles

1. **Platform Super Admin**: Platform-wide administration, tenant onboarding, system health monitoring.
2. **Shop Owner**: Tenant administrator; manages shop profile, invites and configures staff (Shop Managers, Cashiers), accesses complete financial summaries and audit trails.
3. **Shop Manager**: Store manager; manages customer debtor profiles, approves credit limits, records debts/repayments, manages cashier follow-up tasks.
4. **Cashier**: POS/counter operator; checks customer balances, issues new debts with notes/items, records repayments with receipts.

---

## Planned Repository Structure

```text
backend/              Django REST Framework API
frontend/             Next.js, TypeScript, Tailwind CSS
docs/                 Shared project documentation
```

---

## Development Status & Next Steps

1. Review and approve the updated architecture and OpenAPI specification.
2. Upon explicit user approval, proceed to backend foundation setup, SQLite3 database initialization, and DRF Shop Debt Management models.
