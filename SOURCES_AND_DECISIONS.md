# تصمیم‌های فنی و مرجع ابزارهای آماده

**معماری ترجیحی:** یک اپلیکیشن TypeScript با React/Next.js، PostgreSQL و Prisma (یا ORM مشابه)، قابل اجرا با Docker Compose در On-Prem. Codex نسخه‌های پایدار و سازگار با زمان اجرا را انتخاب کند؛ از alpha/beta بدون دلیل استفاده نکند. در صورت وجود Repository فعلی، معماری موجود را ابتدا بررسی کند.

| نیاز | ابزار/الگو | منبع | یادداشت |
| --- | --- | --- | --- |
| مدل‌سازی نقشه و چارت | React Flow (`@xyflow/react`) | https://reactflow.dev/ | MIT؛ node/edge UI، نه storage حقیقت سازمان |
| چیدمان خودکار گراف | Dagre | https://github.com/dagrejs/dagre | اختیاری، برای hierarchy ساده |
| BPMN edit/view | bpmn-js | https://bpmn.io/toolkit/bpmn-js/ | نرم‌افزار باید bpmn.io License را رعایت کند؛ watermark حذف/مخفی نشود |
| جدول‌ها | TanStack Table | https://tanstack.com/table/latest | MIT، headless؛ برای کاتالوگ و ماتریس‌ها |
| فرم‌ها و validation | React Hook Form + Zod | https://react-hook-form.com/ / https://zod.dev/ | بررسی مجوز و validation نهایی همیشه سمت سرور |
| پایگاه داده | PostgreSQL | https://www.postgresql.org/ | ارجاع‌ها باید foreign key و tenant scope داشته باشند |

## تمایزهای قطعی

- **Process Architecture** با `ProcessNode` و `ProcessRelation` تعریف می‌شود؛ نمودار فقط نما است.
- **BPMN XML** محتوای واقعی مدل فرآیند است؛ engine اجرای BPMN نداریم.
- **RACI/Authority** صرفاً جدول‌های اختیاری هستند و نقش‌های تصمیم‌گیری را اجرا نمی‌کنند.
- **KPI** مستقل از فرآیند است؛ ارتباط با فرآیند چندبه‌چند. داده KPI و دیتاسورس اجرایی فعلاً دستی/توصیفی.
- **Account, Person, Position, Process Owner** موجودیت‌های جدا هستند.
- **Zero seed** قطعی و بدون استثنای داده کسب‌وکار است.

## مجوزها و آدرس‌ها، بررسی ۲۰۲۶-۱۰-۲۶

- React Flow: https://reactflow.dev/ — MIT.
- TanStack Table: https://github.com/TanStack/table — MIT.
- bpmn-js: https://github.com/bpmn-io/bpmn-js — bpmn.io license.
- الزام نشان bpmn.io: https://bpmn.io/license/ — لوگوی لینک‌دار قابل مشاهده بماند؛ متن اطلاعیه مجوز حفظ شود.

در زمان نصب و توزیع محصول، نسخه دقیق dependencyها و اطلاعیه‌های مجوز آن نسخه باید دوباره بررسی و در مستند محصول ثبت شوند.