# ارائهٔ عمومی راسان روی GitHub Pages

انتشار عمومی کد، ۴۴ فرآیند و لینک‌های اسناد با دستور صریح مالک در ۲۰۲۶-۱۱-۰۹ انجام می‌شود. این ارائه از بستهٔ واقعی بازنگری ۰٫۱، تاریخ منبع ۲۰۲۶-۱۱-۰۴ استفاده می‌کند؛ متن‌های تحلیلی پیش‌نویس هستند و PDFها ارجاع منبعند.

دادهٔ نسخه‌بندی‌شده: `presentation/data/rassan-presentation.json`، شامل ۱۲ واحد مالک، ۱۷ گروه، ۴۴ فرآیند، ۴۴ شناسنامه، ۴۴ شاخص، ۴۴ اتصال شاخص، ۹۰ ارجاع سند، ۱۹ رابطه و ۱۳۲ نیاز داده. هدف‌ها، اندازه‌گیری‌ها، اشخاص و سمت‌ها خالی‌اند. BPMN XML ساخته نشده است.

این نسخه فقط مشاهده و ثبت/صدور بازخورد دارد؛ ثبت تغییرات در دیتابیس در GitHub Pages ارائه نمی‌شود. بازخورد در مرورگر کاربر ذخیره می‌شود و با خروجی JSON برای توسعه قابل تحویل است. ورود، کلید دسترسی، Render و Supabase برای نمایش لازم نیستند. نصب عمومی برنامهٔ اصلی و migrationهای آن همچنان داده‌ای خودکار ایجاد نمی‌کنند.

ساخت: `cd presentation && npm ci --include=dev && npm run typecheck && npm run build:pages`.
انتشار خروجی: از پوشهٔ presentation فرمان `node scripts/publish-pages.mjs`؛ فقط پوشهٔ pages را به شاخهٔ gh-pages همین مخزن می‌فرستد. فایل‌های داده و HTML/فونت/آیکون همگی در همان سایت سرو می‌شوند.

در Settings → Pages: Source = Deploy from a branch، Branch = gh-pages، Folder = / (root).
نشانی مقصد: https://mo90mosleh.github.io/OrgDocsManagementSystem-/

تست Chromium با دادهٔ واقعی و بدون mock یا تماس با backend: `PAGES_BASE_PATH=/OrgDocsManagementSystem-/ npx playwright test tests/browser/pages-snapshot.spec.mjs`. شمارش ۴۴/۹۰، جزئیات فرآیند، سند، reload مسیر hash، نبود ورود مدیریت و ماندگاری بازخورد بررسی شده‌اند.

مخزن قدیمی OrgDocsManagementSystem-demo پس از انتقال حذف می‌شود. هیچ کلید مدیریت یا نشست در فایل‌های عمومی منتشر نمی‌شود.
