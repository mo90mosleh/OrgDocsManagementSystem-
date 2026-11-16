# Visual consistency review — 2026-11-16

Reviewed the current source revision after synchronizing main, including the approved Nama/Rassan branding, animated Namayar, streaming responses, KPI relationships and floating chart detail. The interrupted older mobile-header draft was archived separately before synchronization; obsolete layout rules were not reapplied over the current implementation.

## Scope and findings

| Area | Before | Correction |
| --- | --- | --- |
| Page hierarchy | Desktop page titles ranged from 16 to 27px; mobile ranged from 21 to 23px | 24px desktop / 22px mobile across all main routes |
| Actions | Secondary actions ranged from 34 to 44.8px, with different typography/radii | Shared 44px desktop / 48px mobile action size, 10px corners, consistent primary/secondary/text/destructive hierarchy |
| Dashboard actions | Approved soft navigation style differed from normal primary buttons without an explicit variant | Explicit `.primary.soft` variant retains the approved quieter dashboard style |
| Surfaces | Old green-tinted forms/facts mixed with newer gray mobile cards | Shared neutral surfaces, 16px panel corners, common borders and padding |
| Text | Pale descriptions, empty states, ownership labels and codes had inconsistent contrast | Shared text/secondary/muted tokens; tested secondary text and solid primary actions against WCAG AA 4.5:1 in the current theme |
| Forms and filters | Different heights/radii, including inner select borders and wrapped mobile filters | Shared field geometry; same-sized organizational filters and native selects, 16px mobile input font, neutral keyboard focus |
| States | Offline/live-fallback warning inherited green success styling | Explicit warning/error/success/information colors; actual saved mutations receive `.success`, connection fallback receives `.warning` |
| Guidance | Tour launcher unavailable on mobile after the standalone character change | Tour uses existing mobile header space, alongside a compact responsive two-logo header; no bottom utility bar added |
| Documents | External links repeated an arrow glyph and an SVG arrow | One consistent SVG indicator; document types retain distinct educational/model styles |
| Preview | Local test server returned HTML for new fingerprinted JavaScript/CSS/font URLs | Preview serves real built assets with correct MIME types and rejects unknown files, enabling faithful Pages/route-chunk testing |

## Implementation

`portal/design-system.css` owns shared visual tokens and common component rules and is imported after legacy component styles. It intentionally preserves geometry-sensitive graph nodes/edges, classification colors, role/department KPI coloring, native table/card layouts, safe areas, approved wordmarks and the original Namayar character/animation. Page spacing, title size, panels, buttons, fields, semantic states, segmented controls, modal surfaces and focus are specified together rather than changed independently page by page.

A compact architecture breadcrumb/header exception keeps mobile content above the fold without reducing type or touch targets. Header icon controls retain their compact 40/44px targets; dense graph geometry is not normalized into generic button dimensions. No footer or reserved bottom utility row was introduced.

No database/schema/business-data writes, model configuration changes, workflow imports or new demo data were performed. Admin mutation tests use only isolated mock fixtures.

## Review and validation

Captured before/after screenshots for dashboard, process catalog/profile, KPI catalog/profile, architecture, chart, documents, login, admin and settings at 1366px and 390px. The automated cross-route review additionally covers 320, 390, 768, 1024 and 1440px (55 route/viewport combinations), asserting page-title typography, visible guidance, panel radius and absence of page-level horizontal overflow. Further checks cover action/field dimensions, contrast, filter alignment, error/success states, modal forms, navigation and existing route-specific behavior.

Local screenshots and computed metrics are in `/workspace/shared/visual-audit/`; these are review artifacts, not business data or application fixtures.

Validation results: TypeScript and both build artifacts passed; all 63 code/security/retrieval/performance checks passed on the integrated revision. Across the regression run and focused rerun, all 35 selected browser scenarios passed after the integrated chart checks. The broader run caught and corrected a crowded mobile architecture header; the legacy mobile chart test was updated to open the existing Processes tab instead of assuming processes were the default. The focused final run passed all 13 architecture-tree/mobile/visual-system scenarios. No unrelated model/backend settings or organizational relationships were modified.

The chart context/history/deep-link feature added concurrently on main was preserved. Its navigation strip uses the same border/surface/action tokens; its path semantics, history behavior and reporting-path highlights are unchanged.

The integrated chart-history checks exposed a real layer-order bug: an open detail popover intercepted clicks on the next search result. The search control/menu now stacks above that popover, without changing graph layout or selection behavior.

The integrated chart history test also exposed a floating detail panel blocking subsequent search results. The search control is now layered above that panel while its results are open; both chart history/deep-link cases passed after the correction. Native clear-filter controls follow the same field-height token as adjacent dropdowns.

Chart-header follow-up: Back and tour now share a non-wrapping action group. Viewer header controls wrap internally when needed instead of sending tour to its own row. Verified alignment at 1280/1366/1440px, header height <=80px at 1366/1440px, no page overflow and working tour open/close. Mobile retains its existing header guidance location.
