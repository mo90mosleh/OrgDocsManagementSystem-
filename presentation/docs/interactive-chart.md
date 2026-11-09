# Interactive organization chart and navigation

The chart uses React Flow 12.12.1 (`@xyflow/react`, MIT) and Dagre 3.1.3 (`@dagrejs/dagre`, MIT). A right-to-left layered layout positions real unit or grouped-position nodes without overlap; edges connect explicit source/target handles using the stored parent relationship. The chart is read-only as a diagram: moving around never rewrites reporting relationships or node coordinates. React Flow attribution remains visible. Original production dependency license notices are exported into `pages/THIRD_PARTY_LICENSES.txt` with each build.

The initial camera uses a readable 90% zoom rather than fitting the whole organization into tiny text. Wheel/pinch zoom, drag-to-pan, arrow-key panning, +/-/0 shortcuts, zoom controls, a pannable/zoomable minimap, search, center-on-selection and branch focus support exploration. Fit-all is an explicit overview action. Resizing preserves the camera center and zoom. Nodes can expand/collapse without moving the view to an unrelated branch. Search can reach nodes inside a collapsed or offscreen branch.

Viewer presentation shows each distinct role once and omits seat counts, seat lists, employee assignments and mixed seat-reporting details. Admin presentation retains those management details. Existing role grouping and all 74 source seats remain unchanged. Public process and KPI links still use explicit unit ownership and process/KPI associations.

A global back button appears on every app page, including the chart. Internal navigation records depth in the browser's history state; back uses native browser history and direct-entry fallback stays on the portal dashboard. It does not rely on an external referrer. Chart mode, selected ID, collapsed IDs, focused branch and camera are restored within the same tab after opening a process/KPI and returning or refreshing. Only view preferences and IDs are stored in sessionStorage, scoped by organization and user role; no business-data persistence or authorization uses that storage.

Validation: TypeScript/build, 20 unit/security tests (including no-overlap and parent-direction geometry checks), and 23 browser scenarios cover viewer/admin separation, actual wheel zoom and drag, focus/search, exact camera restoration from process and KPI pages, all public back controls, mobile bounds, tours and existing auth/profile/feedback behavior. Test fixtures remain isolated from the production database.

## Direction and toolbar update

The header uses matching, keyboard-accessible segmented radio controls for «سمت‌های سازمانی / دپارتمان‌ها» and «افقی / عمودی». Horizontal layout stays right-to-left; vertical layout is top-to-bottom with top/bottom connection handles. Direction switches preserve the selected ID, collapsed branches and branch focus; each direction retains its own camera in the same tab, including restoration through Back and refresh. Expand/collapse-all controls now live beside zoom controls with distinct chevron icons. The initial horizontal camera remains compatible with the prior release's preference key.

Validation adds geometry checks for both chart contents in both directions, keyboard radio navigation, rendered parent-child direction/handle checks, toolbar placement/icons, mobile bounds and vertical-state/camera restoration after navigation and refresh. Desktop/mobile screenshots were inspected.

The owner's follow-up places Back at the upper-left of every page: the leftmost top-bar action on normal pages and the leftmost chart-header action. On small screens it uses the same labelled arrow icon without visible text to avoid crowding; its accessible label and behavior are unchanged. Browser assertions verify its upper-left bounds across all public routes.
