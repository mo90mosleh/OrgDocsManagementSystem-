# OKR Management — نسخهٔ یکپارچه در نما

## Scope & coordination with Visual Consistency

The OKR module is isolated under presentation/portal/okr/. All styling is scoped to .okr-workspace and consumes shared design tokens from presentation/portal/design-system.css. Do not create a nested navigation sidebar. The only shared-file changes are route/lazy loading in App.tsx, a single navigation item in Shell.tsx, one link in the mobile More menu, and the internal route registry for the assistant.

This was built while Codex worked on the parallel Visual Consistency task. The integration uses the f8cb57b visual design-system changes; the latter should remain the authority for global typography, spacing, controls, and states. If continuing visual consistency, adjust shared tokens and avoid overriding locally scoped OKR layout geometry.

## Demo scope

- UI entry: /okr.
- Main menu has one item مدیریت OKR (no submenu).
- Internal horizontal tabs: نقشه استراتژی, اهداف و نتایج کلیدی, پایش و عملکرد.
- Cycle picker/header, Objective and Key Result forms, check-in, confidence, weighted progress, objective detail drawer, linked KPI and process records.
- Sample data for پاییز ۱۴۰۵ is intentionally hypothetical and lives in okr/sample.ts only. KR measurements are not copied to actual KPI records.
- In the public demo, changes persist to browser localStorage only. Clicking بازنشانی نمونه restores the initial dataset.
- In a private installation, the module starts with empty OKR data. Until real persistence is implemented, draft changes in this pilot are browser-local. They are not production or multi-user persistence.
- No OKR seed is added to the Supabase database or existing process/KPI seed/snapshot, preventing pollution of actual corporate data.

## Intended production data architecture

Future server-side storage requires tenant-scoped:
- okr_cycles (organization_id, title, period boundaries, state and lifecycle audit)
- okr_objectives (cycle_id, parent_id, owner_org_unit_id, optional responsible position, pillar, state, confidence)
- okr_key_results (objective_id, measurement unit, direction, baseline/current/target, weight, optional external KPI id)
- okr_checkins (key_result_id, actor, timestamp, actual, confidence, blockers, note)
- okr_process_links and optional okr_dependencies
- RLS, role permissions, immutable check-in history, approvals and cycle closure workflow.

KPI records and OkrKeyResult are distinct: the KR has period-specific baseline/target/current and may reference an existing KPI definition, but registering a KR's sample measurement does not change the KPI catalog. An Objective is not a BPMS workflow.

Test with npm run typecheck, npm run build:pages, and npm test from the presentation directory.

## Cycle directory and page navigation (November 2026)

- The main-workspace "مدیریت دوره‌ها" action opens a single cycle-directory dialog, listing every defined cycle regardless of the one currently selected, including lifecycle state, Persian-formatted dates when available, number of Objectives and KRs, and a "مشاهده دوره" action.
- "دوره جدید" lives inside this directory, opens a focused creation form, and returns to the directory with the newly created period selected.
- The sample-reset control lives only in the cycle-directory footer (for the public demo). The former sample-information banner is no longer shown in the workspace.
- The global breadcrumb is intentionally omitted for /architecture, /kpis and /kpis/:id, and /okr to maximize working area. Other pages retain normal breadcrumbs.

## Persian dates for OKR cycles

- Creating a cycle named بهار ۱۴۰۶, تابستان ۱۴۰۶, پاییز ۱۴۰۶, or زمستان ۱۴۰۶ automatically proposes the full Jalali season; سالانه ۱۴۰۶ and سال ۱۴۰۶ propose a full year.
- Start/end fields are editable Jalali dates (۱۴۰۶/۰۱/۰۱ format); explicit edits are never automatically overwritten by subsequently editing the title. A "بازگردانی تاریخ پیشنهادی" button restores the default for a recognizable name.
- The existing cycle list offers "ویرایش تاریخ‌ها" for editing name and dates, including repairing older records created with blank dates.
- Dates are validated for real Persian-calendar days and range order, including leap-year Esfand. Internally they are stored as Gregorian YYYY-MM-DD ISO date-only strings to preserve the existing model and display correctly in Jalali.
- The demo still stores edits only in the browser; no Supabase migration is involved.
