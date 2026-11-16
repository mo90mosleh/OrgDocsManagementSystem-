# Integrated process management workspace

The main sidebar has one item **مدیریت فرآیندها**. Its internal horizontal tabs are:

1. **معماری فرآیندها** — the existing staged/tree architecture explorer, using the existing process-node hierarchy and preserving its stored view state.
2. **نقشه فرآیندها** — a separate graph of actual **process-to-process relations** (not the parent/child architecture), with focused relationships, the full network, and an editable registry. Uses the existing `process_relations` table and the documented relation types RELATED, PREREQUISITE, INPUT_FROM, and OUTPUT_TO.
3. **شناسنامه فرآیندها** — the existing catalog and its process detail pages. Individual profile URLs remain `/processes/:id`.

Legacy routes `/architecture`, `/processes`, and `/processes/:id` remain valid; the map uses `/process-map`. Clicking profile links from the architecture/map/catalog always lands in the same module with its catalog tab active. All modules use the existing Nama header/sidebar design tokens and do not introduce a second nested sidebar.

## Relations

The map uses existing Rassan demonstration data: 19 proposed relations across 44 process nodes at the time of development. The data is not synthesized. Connection lines have distinct colors and arrows when directional. The focus view shows a process and its incoming/outgoing relations; the full network shows only connected processes; a searchable selector allows access to isolated processes. The relationship list supports creation, edit and removal.

* The public presentation uses browser-local `localStorage` overrides to avoid altering the shared demo dataset or Supabase. A prominent note explains this boundary.
* Authenticated admins use the live `process_relations` table. Writes validate tenant scope, process kind, IDs, allowed relation types, and notes. The SQL migration `portal/process-relations-editor.sql` enables only authenticated users whom `portal_auth.is_admin(organization_id)` authorizes to write.
* Public visitors cannot call the live write route. Private non-admin roles are read-only.
* Process profiles and architecture preview display related process links from the same stored relationships, including incoming links. This is distinct from the process hierarchy.
* Persisted relationships are not erased when the new UI is deployed.

## Dashboard and OKR menu

The dashboard concept grid remains four cards: organizational chart, integrated process architecture, KPI and OKR. The former standalone process-profile card is removed. The OKR navigation item displays a custom vector target with an arrow embedded in its bullseye, in desktop and mobile navigation.

## Validation

From `presentation`, run `npm run typecheck`, `npm test`, `npm run build:pages`, and `PAGES_BASE_PATH=/OrgDocsManagementSystem-demo/ npm run test:e2e`. Browser tests cover tab navigation, sample relation editor, profile cross-links, dashboard grid and mobile menu.
