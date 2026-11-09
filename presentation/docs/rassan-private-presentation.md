# Rassan private presentation

This is an explicitly authorized, separate presentation deployment. The original Phase 1 application and its empty-start contract remain separate. No import runs at build/startup. Public GitHub Pages continues reading only its original organization. The handoff JSON and internal document URLs are not bundled, committed, or copied to Pages.

## Imported package

- Source revision: 0.1, source-as-of 2026-11-04; all analytical proposals remain DRAFT.
- Organization scope: 8847c22d-0282-5b07-80b1-d34bc41a4efa (deployment_key: rassan-private-presentation).
- Batch: 0aa8b96c-1a0e-5e4a-bbea-67ba06f46ff9.
- SHA256: db6beaf76fa05b52e0912abbf2e32fc72433065779f468f21c9188deb46cfd2c.
- Inserted business rows: 490: 12 units, 17 groups, 44 processes, 44 profiles, 44 BPMS references, 44 KPI definitions, 44 process/KPI links, 132 data requirements, 90 document references (44 BPMN PDF references), 19 proposed RELATED relations.
- Targets, measurements, BPMN XML, people, positions and assignments remain empty.
- Existing public presentation fingerprints were checked before and after import and were identical.

## Optional, audited import (database operator only)

`imports/schema.sql` creates schema/policies/functions only, without business rows. Restrict schema and function privileges to the database operator; do not expose functions as public RPCs. Capability hashes in policies are deployment configuration, not raw keys.

Prepare explicitly: `python3 imports/prepare_rassan.py /private/path/rassan-processes.json /private/output`.
Load the resulting JSON as a SQL parameter using a database operator connection. Call `rassan_import.dry_run(payload::jsonb)` first. Inspect counts/conflicts, then `rassan_import.apply_package(payload::jsonb)`. Each call is transactional and takes an organization advisory lock. Repeat import leaves managed rows unchanged; reviewer edits produce conflicts and are preserved. No user-supplied SQL is executed. Source/managed values, before/after rows, batch metadata and each run are recorded in the non-exposed `rassan_import` schema.

Rollback only the explicit batch with `rassan_import.rollback_batch(batch_uuid)`. It refuses if rows or counts changed after import. Review reported conflicts rather than overwriting reviewer changes. An already rolled-back package needs a new explicit batch UUID (optional third prepare argument).

## Render web service

Private source branch: feat/rassan-private-presentation in mo90mosleh/OrgDocsManagementSystem-. Presentation app lives in presentation/. Build: `cd presentation && npm ci --include=dev && npm run typecheck && npm run build`. Start: `cd presentation && node render/server.mjs`. Node 24. Binds 0.0.0.0 on PORT (default 10000). /health returns no business data. Stateless service; business data persists in dedicated Supabase project, not Render's ephemeral disk.

Required runtime environment:

- SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY
- PRESENTATION_ORG_ID (scope above)
- DEMO_WRITE_TOKEN: deployment-specific random capability; configure its SHA256 in the private-scope policies.
- PRESENTATION_ADMIN_KEY, PRESENTATION_VIEWER_KEY: independent random 256-bit access keys, generated outside source control.
- SESSION_SECRET: independent random signing secret.
- APP_ORIGIN: exact HTTPS service origin, or Render's RENDER_EXTERNAL_URL.

Runtime secrets belong in Render Environment, never Git, static pages, logs, browser config or URL query strings. Retrieve the VIEWER key privately in Render Dashboard and enter it on /login; use ADMIN only for actual editing. Rotate the relevant key to revoke all its sessions. Cookies are signed, role-bound, HttpOnly, Secure, SameSite=Lax and expire after four hours. Logout clears the browser cookie; a copied cookie remains valid until expiry or key rotation. Shared review keys identify a role, not a named employee; this is a presentation access gateway, not the product's employee/SSO account system. The Node gateway strips untrusted Sites identity headers and supplies a server-only actor. Worker authorization still enforces role, organization and mutation Origin. Login is rate-limited in memory (reset on instance restart).

The Free Render compute plan may take about a minute to wake after 15 minutes idle. No Render database is required.

## Verification

- Strict TypeScript, production artifact build, Worker/API and Render authentication tests.
- Isolated PostgreSQL 17: fresh migration creates no organizations/business records; dry-run leaves zero records; first apply inserts 490; rerun changes none; reviewer edit is preserved/reported; rollback refuses changed rows then safely removes only batch data; anonymous private reads and function execution denied.
- Live Supabase: dry-run before explicit apply; 490 inserts; rerun 490 unchanged / zero conflicts; anonymous private scope reads denied; original public organization fingerprints unchanged.
- Chromium: 44-process dashboard counts, 90 documents; source names/owners and draft markers for RAS-U013, RAS-U027, RAS-U038; original PDF URL links, owner filter, KPI requirements; existing feedback/mobile/admin regressions.

Deployment is complete only after Render reports live and authenticated HTTP checks pass. Source preparation alone does not establish a live URL.

## Render deployment status (2026-11-09)

Workspace explicitly confirmed: Mohammad's workspace (tea-db9lcvfbtjjs73c5onu0). Created Free Node service srv-dbom8ndg1s2s73flbj0g in Frankfurt. URL: https://rassan-orgdocs-preview.onrender.com. First deploy dep-dbom8ntg1s2s73flbksg reached live.

Live HTTP checks: /health200, /login200, anonymous /api/data401, root redirect303; both role-key logins succeed with secure cookies, viewer mutation403, admin invalid form400. Business-data request remains502 because upstream Supabase REST returns503. Full data preview is NOT verified/live yet.

Supabase management says ACTIVE_HEALTHY while pause/log diagnostics report hibernating; SQL fails28P01 postgres password authentication; restore rejects because project is not paused; pause rejects because it is currently hibernating and asks to contact support. No database password was reset, no project was deleted/recreated, and business records were not reimported. A prepared private-scope access update, imports/authorize_render.sql, could not be applied while the provider is unavailable. After Supabase recovery apply this policy-only script (retains Sites capability and authorizes the Render capability), then run scripts/verify-render.mjs with runtime access keys via hidden stdin. It must report44 processes,44 profiles,44KPIs,90documents,44model PDF references.

Private login keys are available only in this service's Render Dashboard Environment: PRESENTATION_VIEWER_KEY for review, PRESENTATION_ADMIN_KEY for management. No keys are included in this document. The verify script prints only response statuses/counts.
