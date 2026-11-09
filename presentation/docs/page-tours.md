# Contextual page tours

The question-mark button near the bottom of every page starts that page's guide. It does not start automatically or submit any form. Each step highlights a specific visible section and darkens the rest of the screen, with Persian explanations, step count, progress, next/back, close and Escape controls.

Covered pages: dashboard, organization chart, architecture, process catalog/detail, KPI catalog/detail, documents, login/confirmation/recovery, admin hub and settings. Unavailable or unauthorized controls are omitted automatically. Process-detail sections open temporarily for a relevant step and return to their previous state when the tour ends. Targets are measured again after resize, scrolling or layout changes.

The overlay traps keyboard focus, makes the app and feedback controls inert while open, restores previous focus/scroll after closing, and closes on route changes. It does not read, copy or export form values, authentication tokens or business content; guide text is static. It makes no business-data writes or network requests.

Tests cover all public routes, authenticated admin/settings, next/back/Escape/focus cleanup, temporary accordion state, mobile bounds and chart controls. The tour and chart are released after the separately verified admin/process-profile release, following the owner's requested priority.
