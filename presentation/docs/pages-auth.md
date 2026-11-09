# Pages email/password administration

Public entry point: https://mo90mosleh.github.io/OrgDocsManagementSystem-/#/login . GitHub Pages hosts the browser app; Supabase Auth verifies credentials, PostgreSQL RLS authorizes each write. No Render gateway or shared access key is required.

## Owner onboarding

Choose «ساخت حساب مدیر», use mo90mosleh@gmail.com and choose your own password (at least12 characters). Submit the form to send a confirmation email. No default account/password is shipped or inserted. Only confirmation of the allowlisted owner's actual mailbox enrolls ADMIN. Other confirmed accounts receive public viewing access, with no write grants.

Open the confirmation email link, return to the portal and sign in. Alternatively, copy the original confirmation link from the email into «تأیید لینک ایمیل» in the portal; the app verifies its exact Supabase origin/path and redeems the token over HTTPS. This also supports recovery links without requiring redirect configuration. Never share email links, passwords, or session tokens in feedback/chat.

For recovery, request an email with «فراموشی رمز», paste the fresh recovery link into «تأیید لینک ایمیل», then set a new password. A link already consumed by clicking it may require a new recovery request.

Optional for seamless email redirects: in [Supabase Auth URL configuration](https://supabase.com/dashboard/project/oozwypufxjkpamkdygjm/auth/url-configuration), set Site URL and allowlisted Redirect URL to https://mo90mosleh.github.io/OrgDocsManagementSystem-/ . Current hosted Auth confirms emails (mailer_autoconfirm=false); keep email confirmation enabled. The manual confirmation-link flow works without changing these settings.

## Real persistence and authorization

Admin can manage organizational units, positions, persons/assignments, process-profile text, organization branding and training-video references. Existing PostgreSQL foreign keys and cycle guards remain active. Server constraints enforce field lengths, email format, brand and profile limits. Creation/editing of process architecture and KPI definitions is outside this change.

Public business data and document references are readable under the owner's explicit public-release instruction. Contact/person/assignment tables remain admin-only. The UI reads live data first, so public viewers see saved changes after reload. In an outage it explicitly marks a versioned snapshot and disables management; it never reports a successful offline write.

Membership is in public.portal_memberships with SELECT limited to the current user; clients have no INSERT/UPDATE/DELETE grants. Configuration of owner email and role authorization functions is in non-exposed portal_auth. The auth.users trigger grants membership only after server-controlled email_confirmed_at is populated, ignoring user_metadata. Both initial enrollment and existing verified-user enrollment are idempotent. Authorization checks the membership and current auth.sessions row on every privileged statement; removed/expired sessions and revoked memberships cannot write even if an access JWT has not yet expired.

The SECURITY DEFINER helpers are intentionally limited to this internal cross-schema authorization: fixed empty search_path, fully qualified objects, no caller-supplied user ID, no public RPC endpoint, restricted EXECUTE, and current auth.uid()/session checks. Public clients use only the publishable API key plus Supabase-issued user JWT. No service-role key, Render capability, default password or mail token is bundled. Browser sessions are managed by pinned supabase-js2.119.0, refreshed through Supabase and removed on sign-out. Logout is scoped to the current session.

## Deployment and tests

Auth schema/policies: portal/pages-auth.sql, applied by native migration pages_verified_owner_auth_and_persistence. This configures the approved owner email but creates no Auth account or business rows. The generic empty-start application remains separate.

`npm run typecheck`, `npm run build:pages`, `npm test`.

Isolated PostgreSQL test: `node scripts/test-pages-auth.mjs /private/path/payload.json` in the explicitly named rassan-import-test Docker container / pages_auth_test database. Tests verified-owner enrollment, forged metadata, membership escalation denial, persisted admin CRUD, foreign-organization denial, validation, private contacts, and revoked sessions. Test records never touch the live database.

Browser auth tests use intercepted test Auth/REST responses for invalid login, login/reload/save/logout, registration and confirmation, recovery, and honest read-only outage fallback. These exercise client integration; isolated PostgreSQL separately proves authorization/persistence. Live checks verify public counts and anonymous denial. Real owner mailbox confirmation/password choice remains a user onboarding action, not an automated test.

Security advisor contains informational [RLS Enabled No Policy](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy) notices for intentionally inaccessible internal owner/audit tables: RLS is enabled and schema/table grants revoked, so default deny is intended. No new public administrative RPC is exposed.

Training-video persistence uses portal/pages-training-videos.sql and its own public-read/admin-write RLS policy; it creates no video records automatically.

The public reporting-position structure (job titles and seat hierarchy only) uses pages-public-positions.sql. Job-title groups match the existing public chart (41 groups / 74 seats in the current versioned dataset). Employee names, contact records and assignments remain excluded from the public snapshot and admin-only in live reads. No existing organizational data is replaced by this release.
