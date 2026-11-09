# OrgDocsManagementSystem

A self-hostable, organization-independent platform for organization charts, process architecture, process documentation, and KPI management.

## Current status

**Specification and wireframe only.** No application code has been developed yet.

## Begin with Codex

1. Read [`START_HERE.md`](START_HERE.md) and [`PRD_v0.5.md`](PRD_v0.5.md).
2. Review [`DATA_MODEL.md`](DATA_MODEL.md), [`IA_SITEMAP.md`](IA_SITEMAP.md), [`WIREFRAME_SPEC.md`](WIREFRAME_SPEC.md), and [`ACCEPTANCE_CRITERIA.md`](ACCEPTANCE_CRITERIA.md).
3. Follow [`CODEX_MASTER_PROMPT.md`](CODEX_MASTER_PROMPT.md) and **Phase 1 only** in [`CODEX_PHASE_PROMPTS.md`](CODEX_PHASE_PROMPTS.md).
4. Use [`wireframe/index.html`](wireframe/index.html) only as a visual design reference.

## Essential constraints

- **ZERO BUSINESS DATA AT INITIAL INSTALL:** No sample organizations, process records, people, KPI records, or demo/fixture seed data.
- **Do not import the 47 Rassan workflow entries.** Those are unreviewed workflows, not approved process definitions.
- Create the first administrator and organization only through explicit, secure first-run onboarding.
- Build a generic product. Do not hardcode Rassan branding, organizational structure or integrations.
- KPI management is part of MVP version 1; OKR management comes later.
- Use proven open-source components for chart visualization and BPMN editing; **do not develop a workflow execution engine**.

> Nothing in this repository is a deployed application or an existing set of business records. It is the implementation blueprint.

## ارائهٔ عمومی راسان

[باز کردن ارائه در GitHub Pages](https://mo90mosleh.github.io/OrgDocsManagementSystem-/) — ۴۴ فرآیند، شناسنامه‌ها، شاخص‌ها، ارجاع اسناد و ابزار بازخورد. کد ارائه در `presentation/` و [راهنمای انتشار](presentation/docs/github-pages.md) است. ارائهٔ عمومی از دادهٔ نسخه‌بندی‌شدهٔ بستهٔ مالک استفاده می‌کند و برای نمایش به Render/Supabase وابسته نیست. این انتشار جایگزین مخزن دموی جدا می‌شود.

ورود مدیریتی Pages: [صفحهٔ ورود](https://mo90mosleh.github.io/OrgDocsManagementSystem-/#/login). [راهنمای حساب مالک و دسترسی](presentation/docs/pages-auth.md) و [تغییرات شناسنامهٔ فرآیند](presentation/docs/feedback-2026-11-09.md).
