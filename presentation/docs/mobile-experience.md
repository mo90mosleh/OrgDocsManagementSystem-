# Mobile portal experience

The <=760px layout has five persistent bottom destinations: home, organization, architecture, processes and KPIs. Process/KPI detail routes retain their parent tab highlight. The compact header keeps Back and an accessible native account/more sheet with documents, login, authorized admin/settings and logout. Desktop sidebar/navigation remain intact. Bottom safe areas and content padding keep final items reachable; the assistant and tour controls sit above navigation.

Mobile-specific behaviors:
- Dashboard: two-column stats and concise stacked destination cards.
- Catalogs and admin tables: labelled cards using the same real rows and native table semantics, no horizontal table scrolling. Department/role filters collapse behind a disclosure; active state is indicated and existing persistence/clear/filter logic is retained.
- Organization: default searchable hierarchical list with direct-child drilldown and parent navigation; saved per-organization/role/mode branch and search. Selecting a card reveals the existing true process/KPI associations above the list. Diagram view remains available with touch pan/pinch, larger controls and no minimap clutter.
- Architecture: compact cards/tree, horizontally scrollable ancestry, full-width selected summary before the explorer, touch targets and quick profile links.
- Process profile: sticky horizontal section shortcuts open and scroll to existing sections; single-column facts, forms, documents, videos and vertically ordered steps. Existing admin editing/validation is unchanged.
- KPIs: one-column definition, formula/facts and truthful missing measurements.
- Documents: mobile-only name/process search and exact educational/BPMN document type filter; truthful zero-result state.
- Login/settings/admin: full-width controls, 16px inputs to avoid iOS focus zoom, native entity forms as bottom sheets, keyboard-accessible account sheet with native modal focus handling.

No schema changes, production fixture imports or data writes. All mutations exercised by automated tests use an isolated mocked backend.

Implementation: `portal/mobile.tsx`, `mobile.css`; integration in Shell, Chart, ProcessDetail, References, OrganizationFilters, App and tour-steps. Responsive card labels are added to existing catalog/admin cells.

Validation includes 320/390/430px on every public route, bottom navigation/detail active state, history Back, document/account sheet, filters, section shortcuts, chart drill/search/links/diagram, auth/admin editing/dialog/logout, assistant/nav spacing and tours, plus desktop regressions.

Mobile chart list/diagram choice is also persisted per organization/role. VisualViewport resize/scroll events keep the assistant above a virtual keyboard; bottom navigation and floating launchers are hidden while the keyboard occupies the viewport, then restored. Keyboard behavior is covered with a simulated VisualViewport contraction in Playwright; actual device/browser keyboard behavior can vary.

Release validation: TypeScript and Pages/Worker artifact validation passed; 41 unit/security/retrieval tests passed. The full Playwright run passed 57 scenarios with one optional legacy import skipped and three tests needing updates for the new mobile navigation/default chart view. The final targeted run passed all seven mobile scenarios (including keyboard contraction and persisted diagram mode) and both affected chart scenarios; all five retained-feedback tests then passed after moving its optional launcher above bottom navigation. Across the full run and targeted reruns, all 60 available browser scenarios passed. Feedback remains disabled in production. No production business writes were performed.
