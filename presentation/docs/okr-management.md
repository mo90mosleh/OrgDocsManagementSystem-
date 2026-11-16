# OKR Management — نسخهٔ یکپارچه در نما

## Scope & coordination with Visual Consistency

The OKR module is isolated under presentation/portal/okr/. All styling is scoped to .okr-workspace and consumes shared design tokens from presentation/portal/design-system.css. Do not create a nested navigation sidebar. The only shared-file changes are route/lazy loading in App.tsx, a single navigation item in Shell.tsx, one link in the mobile More menu, and the internal route registry for the assistant.

This was built while Codex worked on the parallel Visual Consistency task. The integration uses the f8cb57b visual design-system changes; the latter should remain the authority for global typography, spacing, controls, and states. If continuing visual consistency, adjust shared tokens and avoid overriding locally scoped OKR layout geometry.

## Demo scope

- UI entry: /okr.
- Main menu has one item مدیریت OKR (no submenu).
- Internal horizontal tabs: نقشه استراتژی, اهداف و نتایج کلیدی, پایش و عملکرد.
- Cycle picker/header, Objective and Key Result forms, check-in, confidence, weighted progress, objective detail drawer, linked KPI records at Key Result level.
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
- Optional okr_dependencies; no direct OKR-to-process join table.
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

## Time-based pace status (current pilot rule)

Each Objective badge is **derived** from the selected cycle's start/end dates and each Objective's numeric KR progress, rather than the manually assigned confidence value. The legacy confidence field remains in JSON for compatibility but is not authoritative in current views.

- **Expected** is the linear share of elapsed **calendar days**, clamped to 0% before the period starts and 100% on or after its final day. The first day is 0%, and about one month into a three-month quarter it is 33%.
- **Actual** is the weighted average of KR achievements.
- Actual >= expected: **در مسیر** (ON_TRACK).
- Up to 15 percentage points below expected: **نیازمند توجه** (AT_RISK).
- More than 15 percentage points below expected: **خارج از مسیر** (OFF_TRACK).
- Future cycles are **شروع‌نشده**; missing valid cycle dates or any measurable KRs is **بدون داده**. Neither is counted as in-path or at-risk.
- The comparison is made against each Objective's **own cycle**, so editing that period's start/end dates changes expected progress instantly.
- Strategy Map, the Goal list, the Executive monitoring view, and Objective detail drawers all use the same dynamic status calculation. Current date refreshes after local midnight or when the page becomes visible.
- Check-in now asks for the **actual KR value and commentary only**. The historical confidence field on saved check-ins stores a computed point-in-time snapshot for backward compatibility; current badges always recompute automatically as time passes.
- Progress **bar color** remains independent: <40% red, 40–70% yellow, >70% green. Progress color is not a risk status.
- Escalation at 15 percentage points is an initial product default; it can later become an organization-level setting.

## KPI-only links (November 2026)

- OKR objectives no longer store direct process IDs. The strategy summary and detail drawer show only KR-to-KPI links.
- Existing browser drafts are normalized on load: retired processIds are removed while cycles, objectives, KR values, KPI references and check-in history remain intact.
- KPI-to-process relationships in the KPI module remain unchanged. No database migration is needed for this browser-local pilot.
