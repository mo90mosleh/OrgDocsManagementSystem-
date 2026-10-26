# پرامپت اصلی برای Codex — ساخت MVP مستقل و خالی از داده

## پیام آماده ارسال به Codex

You are the lead engineer implementing a real, self-hostable web application: a **generic organization & process architecture management platform**. The initial deployment will later be used by Rassan, but the product must have **zero Rassan-specific hardcoding and ZERO BUSINESS SEED DATA**.

### Read these documents before changing code

1. `START_HERE.md`
2. `PRD_v0.5.md`
3. `IA_SITEMAP.md`
4. `DATA_MODEL.md`
5. `WIREFRAME_SPEC.md`
6. `ACCEPTANCE_CRITERIA.md`
7. `SOURCES_AND_DECISIONS.md`
8. `CODEX_PHASE_PROMPTS.md`

Inspect the current repository, then describe your intended stack briefly and implement **PHASE 1 ONLY** as specified in `CODEX_PHASE_PROMPTS.md`. Do not begin later phases until explicitly asked. If the repository is empty, use a maintainable TypeScript full-stack app (prefer Next.js App Router + React + PostgreSQL + Prisma, with Docker Compose) and document any deviation.

### Critical product boundaries

- This is NOT a BPMS/workflow engine, ERP, dashboard builder or employee HRIS.
- Essential MVP modules ultimately include organization chart, L0/L1/L2+ process architecture, process catalog and detail, optional profiles/BPMN/relations/attachments/RACI/authority tables, and **KPI Management** as a first-class module.
- Future features (NOT implemented now): OKR management with links to KPI, AD/SSO, external data integration, Power BI reporting, multi-tenant billing. Keep stable IDs and clean domain boundaries for future evolution.
- Never implement a proprietary diagram editor or BPMN runtime; use React Flow and bpmn-js in the relevant later phases. RACI and authority are basic optional tables, not rules engines.

### NON-NEGOTIABLE EMPTY-START CONTRACT

1. Migrations create schema ONLY. **No automatic seed, fixtures, demo users, mock counts, sample organizations, sample people, sample processes, sample architecture, sample BPMN or sample KPIs.**
2. Specifically do NOT import or embed the Rassan 47 workflow entries or treat them as approved processes. Do NOT access `Rassan BMPS.xlsx` to auto-populate anything.
3. A secure, single-use first-admin bootstrap flow must explicitly collect the organization name and first-admin credentials in ONE user-submitted transaction, creating both records atomically (no orphaned organization_id). Logo/color may be set now or later. This is user onboarding, not a seed. Do not ship default accounts, credentials or organizations.
4. A clean dashboard shows factual zero counts and helpful empty states. No statically embedded business records in React components, API responses or client stores.
5. Test-only temporary records are acceptable in an **isolated test database**; never run test fixtures on the app's normal or production database.
6. No data persistence via localStorage or pretend save. All persistent actions must write to PostgreSQL and survive browser reload.

### Security and quality

- Use server-side authentication and authorization, password hashing, secure cookies, protected routes, input validation, upload protections as relevant.
- Enforce organization scope on data access. In MVP, one organization per deployment but retain `organization_id` in domain models.
- Prefer existing open-source dependencies; document their licenses; preserve bpmn.io watermark if bpmn-js is used.
- Full Persian RTL UI, accessibility basics, desktop-first responsive design, empty/error/loading states.
- Use small components, strict TypeScript, schema migrations and tests of critical backend behaviors.

### Deliverables for each phase

- Working code with actual persistence; **not** screenshots/mock-only UI.
- Setup and deploy README, `.env.example` without secrets, migration scripts, Docker Compose.
- A concise changelog and list of completed acceptance tests, plus known gaps.
- A screenshot or preview is useful, but cannot substitute a working application.
- Stop and report after the current phase, with explicit next phase recommendation.

### Begin now

Start **PHASE 1: foundation, authentication, first-admin onboarding, empty app shell, organization branding and zero-seed checks**. Do not attempt all MVP modules in this first change. See `CODEX_PHASE_PROMPTS.md` for detailed acceptance criteria.