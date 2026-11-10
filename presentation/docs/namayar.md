# نمایار — راهنمای مبتنی بر دادهٔ نما

## Active behavior

Namayar is an original animated SVG/CSS character and a Persian RTL floating assistant, available on all main portal pages. Idle/hover/thinking states and panel entry/exit use transform/opacity; reduced-motion disables animations. The first-visit greeting is a single local boolean preference, auto-dismisses and does not intercept underlying page clicks. Conversations remain in memory, clear on reload/account-role change, and have a clear action. Enter sends, Shift+Enter inserts a line, Escape closes and returns focus. The panel is non-modal so users can select a chart or architecture entity while asking questions.

The active engine is deterministic local retrieval and product guidance. It uses the same already-authorized app data, not DOM scraping and not a second database. Supported responses include current process goals/ownership/roles/inputs/outputs/events, actual process relationships and KPIs, the current KPI's formula/source/unit/frequency/target, unit/position associations, architecture levels/classifications/draft status, recorded document links, product navigation and tours. Missing data stays explicitly missing. Formula definitions do not imply calculation; registered model PDFs do not imply editable BPMN XML or execution.

The November 10 revision supersedes the earlier blanket off-topic refusal. Greetings and general management concepts (including efficiency/effectiveness and why processes need KPIs) are supported. Unsupported general questions explicitly disclose the missing language-model connection; they are not presented as generated expertise. Confidentiality and instruction-override protection remain independent of topic vocabulary.

`conversation.ts` maintains an in-memory session focus and requested document type. Explicit names/codes override previous focus; page or selected-entity changes reset it. Followups can request an educational diagram, then BPMN, then “send it” without losing the subject. Ambiguous diagram requests ask for the type; ambiguous subjects ask for the process. Educational documents are matched only by `EDUCATIONAL_PDF`, BPMN models only by `BPMN2_PDF`. Missing requested types are stated explicitly; other recorded documents are clearly labelled as different alternatives. No semantic embeddings or generative model is active: this is an improved deterministic intent/retrieval pipeline, not a general conversational LLM.

The panel is 378 × at most 560 px on desktop, responsive on mobile, navy/light-blue, and displays natural inline blue links without a separate source list. Provenance and safe-link validation remain in the engine. SVG state includes idle, hover hearts, typing/listening, thinking, response and successful internal link selection; reduced-motion remains supported. Artificial response delay was removed.

## Source modules

- `portal/namayar/Namayar.tsx`, `NamayarAvatar.tsx`, `style.css`: launcher, original vector identity, panel, suggestions, inline links, input, clear/close and overlay lifecycle.
- `PageContextProvider.tsx`, `context.ts`, `types.ts`: independent page/entity context and strict allowed-knowledge projection. Chart and architecture publish their actual selected IDs; route changes and data refresh resolve context again. Entity facts, approval status, actual related links and suggestions travel with context.
- `router.ts`: actual route registry, record-ID validation and safe recorded HTTPS documents. Internal links use the portal's normal router; only explicit navigation requests move automatically. Requests for chart units/roles or architecture groups select the actual target through a consumed context request.
- `knowledge.ts`, `retrieval.ts`, `scope.ts`, `engine.ts`: product knowledge, Persian search, scope control and sourced replies.
- `LLMAdapter.ts`: disabled-by-default optional gateway interface and validated same-origin client contract.

Personnel/contact tables, assignments, account emails, auth/session data, logos and raw source metadata are not included in assistant knowledge, even for admin. Free-form private notes are excluded. Stored business text is displayed as text, never HTML or executable instructions; URLs are only offered from recorded documents. Provenance retains existing records or the product guidance route internally. Snapshot mode is visibly labelled.

## LLM/RAG status and future gateway

No configured secure model endpoint or usable model-provider API key was present. No LLM or RAG service is activated, no provider call is made, and no secret is added to GitHub Pages. `DisabledLLMAdapter` is the active implementation. Local functionality works without an AI API.

The optional `BackendLLMAdapter` expects a same-origin `POST /api/namayar` gateway; this is a contract for a future server, not a fake endpoint. GitHub Pages cannot execute it. Before enabling an implementation, provide a real secure backend/proxy (or an explicitly reviewed cross-origin transport), keep provider keys in server secrets, authenticate/authorize requests, rate-limit and validate input, retrieve records server-side in the authorized organization scope, treat retrieved text as untrusted data, apply the same scope rule server-side, and return plain-text paragraphs with actual validated citations/links. Do not trust browser entity IDs or scope as authorization. The client sends only question and page/entity references, not the whole corpus, contact data or keys. Backend links and navigation are revalidated; automatic navigation still requires an explicit navigation request. No Render deployment was used.

## Tours and retained feedback

The assistant can start the current page's existing tour. Tour start hides the launcher, greeting and panel and cancels an in-flight answer; tour end makes the assistant available again. Z-index, safe-area spacing and keyboard focus were tested. The standalone question-mark control remains available when the assistant panel is closed.

Public Rassan feedback is disabled with `feedbackEnabled: false` in `pages-config.json`. `feedback/Feedback.tsx`, its tests, export format and existing stored notes were retained. To restore it, set this flag to true and rebuild/publish. The assistant has alternate spacing when feedback is enabled, and is hidden during feedback selection/dialogs. Feedback regression tests explicitly enable the flag only inside isolated test pages.

## Validation

`npm run typecheck`, `npm run build:pages`, and `npm test` cover context resolution, actual route/record links, retrieval, formula/owner/document facts, A/B entity switching, draft/reference distinction, public allowlist, missing data, updated policy, technical-limit disclosure and instruction-override rejection, safe links and disabled gateway behavior. Browser coverage includes all routes, mobile/desktop, reduced motion, once-only greeting, actual Persian questions, internal navigation, chart/architecture selection, native document links, tours/focus/clear, literal untrusted text and no production feedback controls. Existing charts, architecture, filters, auth/profile/video, feedback restoration, offline snapshot, private Worker and favicon scenarios were also exercised. Tests only use isolated in-memory fixtures, not production business writes.

Release verification: typecheck and Pages/Worker artifact build passed. 39 unit/security/context/retrieval tests passed. Across the full browser run and targeted reruns after fixing greeting click-through and a scoped status assertion, 52 browser scenarios passed; the optional legacy private-import scenario was skipped because no explicit test payload was supplied. One isolated mock API refresh timed out and passed on immediate focused rerun. Live process metadata was read-only verified: all 30 groups and 44 process records currently have top-level DRAFT status. No production records were created or updated.

## November 10 validation

The updated tests cover exact document types, multi-turn entity/type focus, explicit-name precedence, page reset, missing-type alternatives, general management explanations, unsupported-question disclosure, confidentiality, inline blue links, compact dimensions, hover hearts, mobile, navigation and tours. Tests use existing fixtures only; no product data was added.

Revision checks: TypeScript passed; Pages and Worker artifacts built and validated; 41 unit/security/retrieval tests passed; 9 Playwright assistant scenarios passed (desktop/mobile, all routes, tours, navigation, type-specific documents, policy disclosure, inline links and avatar hover). No model-provider credentials were configured or shipped.
