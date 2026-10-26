# پرامپت‌های مرحله‌ای برای Codex

در هر مرحله متن آن مرحله را همراه با ارجاع به فایل‌های PRD / IA / Data Model بدهید. خروجی هر مرحله باید واقعاً با PostgreSQL ذخیره شود و از ابتدا هیچ داده کسب‌وکار نمونه‌ای نداشته باشد.

---

## PHASE 1 — همین حالا: Foundation + Empty App

**Copy to Codex:**

Implement Phase 1 only. Read all root product-spec markdown files, particularly `PRD_v0.5.md`, `DATA_MODEL.md`, `IA_SITEMAP.md` and `ACCEPTANCE_CRITERIA.md`. Build a runnable self-hostable application with TypeScript, real PostgreSQL persistence, migrations and Docker Compose. Provide a secure single-use first-admin bootstrap flow (no default password/admin user), login/logout, protected routes, a single user-submitted initial setup transaction that creates organization + first admin atomically (logo/brand color optional and editable later), user profile menu, and Persian RTL responsive app shell.

Create page routes for Dashboard, Org Chart, Process Architecture, Process Catalog, KPI Management, and Settings with truthful **zero-data empty states**. Routes for later features must explicitly state "هنوز داده‌ای ثبت نشده است" or "در مرحله بعد فعال می‌شود"; do NOT build pretend CRUD/forms or buttons claiming success. Dashboard zero counts must originate from DB queries. Add minimal auth role data model `ADMIN/EDITOR/VIEWER` and server-side route guard. Use non-seeded enums/constraints, never business seed.

**DO NOT import or insert any Rassan workbook rows (including the 47 workflows), sample processes, organizations, users, units, KPI measurements or examples. DO NOT invent test demo accounts.** Tests can create ephemeral data only in a different test database. Treat first-admin bootstrap as user-controlled initialization, not seed.

Finish with: runnable setup steps, migrations, a smoke test proving all business tables are empty after fresh migration, lint/typecheck/build results, explanation of access-control choices, and list of remaining Phase 2 tasks. STOP after Phase 1.

**Acceptance gate:** `ACCEPTANCE_CRITERIA.md` items in 'اصل صفر' and 'فاز ۱'.

---

## PHASE 2 — Organization Chart

Implement actual CRUD for organizational units, positions, persons and position assignments. Build an interactive hierarchy with React Flow and optional Dagre layout. Persist domain structure to PostgreSQL; node coordinates do not define parent-child truth. Build forms/drawers and empty states. Reject hierarchy cycles and invalid cross-org references server-side. Show associated processes by unit only once those links exist. No example organization/chart data; test on isolated database. STOP after Phase 2.

**Gate:** فاز ۲ معیارهای پذیرش.

---

## PHASE 3 — Process Architecture + Catalog

Implement process groups, process nodes, L0/L1/L2+ hierarchy and classification, process catalog, editing, search, links, and horizontal process relationships. Draw graphs with React Flow; persist true hierarchy/links in DB. At creation require code and name for a process, without requiring profile, diagram, KPIs or documents. Validate DAG-like hierarchy (no ancestor cycles), uniqueness of codes, permissions and safe deletion. All pages start empty until users create records; DO NOT import the Rassan 47 workflow list. STOP after Phase 3.

**Gate:** فاز ۳ معیارهای پذیرش.

---

## PHASE 4 — Process Profile + Model + Optional Tables

Implement real process detail tabs: overview/profile, optional BPMN with bpmn-js import-edit-save/reopen and XML/SVG export, process relations, optional simplified BPMS references, documents/links, tiny editable RACI table and authority table. BPMN editor is model-only, not executable workflow engine; do not build automated RACI permissions or decision rules. Maintain server-side view/edit permission at record and file level; no placeholder processes. STOP after Phase 4.

**Gate:** فاز ۴ معیارهای پذیرش.

---

## PHASE 5 — KPI Management

Implement KPI catalog and structured KPI definitions, optional targets, description/formula numerator/denominator, measurement frequency/owner/data source, data requirements and readiness. Link independent KPI records to zero or more processes using a join table. Allow optional manually entered period measurements; graph only existing data. Formula is documentation text, NOT a calculation engine. Avoid OKR implementation but keep stable KPI identities for later Key Results. No default KPI data. STOP after Phase 5.

**Gate:** فاز ۵ معیارهای پذیرش.

---

## PHASE 6 — Permissions, hardening, On-Prem handoff

Audit and fix access to all entities and file downloads. Ensure Admin/Editor/Viewer and per-process grants are enforced in server-side handlers, including mutation and object-level read. Add isolation/security tests, safe delete behavior, backup/restore guide, error states, logs, responsive UX polish and final empty-install verification. No demo records. STOP after Phase 6.

**Gate:** فاز ۶ معیارهای پذیرش.