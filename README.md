# PRIMEPC Website

Next.js ecommerce storefront for PRIMEPC, with product browsing, cart and
wishlist flows, customer checkout, account pages, admin product/category/order
management, and order/contact notifications.

## Scripts

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run check
npm run build
npm run launch:check
npm run start
npm run db:seed:products
npm run db:seed:products:reset
npm run storage:migrate-cloudinary-to-r2
```

## Environment

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
MONGODB_URI=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_URL=https://primepcdz.com
NEXTAUTH_URL=https://primepcdz.com
```

Optional production integrations:

```bash
RESEND_API_KEY=
RESEND_FROM=
RESEND_WEBHOOK_SECRET=
ADMIN_EMAILS=
APP_URL=https://primepcdz.com
SUPPORT_EMAIL=
SUPPORT_PHONE=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EMAIL_UNSUBSCRIBE_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET=
R2_PUBLIC_URL=
```

Image uploads prefer Cloudflare R2 when all `R2_*` variables are configured.
If R2 is not configured, uploads fall back to Cloudinary while the legacy
Cloudinary variables remain present.

After configuring R2, migrate existing Cloudinary product images with a dry run
first:

```bash
npm run storage:migrate-cloudinary-to-r2
npm run storage:migrate-cloudinary-to-r2 -- --apply
```

## Production Checklist

- Configure real production secrets and remove development URLs.
- Generate a strong `AUTH_SECRET` and configure `AUTH_GOOGLE_ID` and
  `AUTH_GOOGLE_SECRET` in every environment where Google sign-in is enabled.
- Point `primepcdz.com` and `www.primepcdz.com` to the production deployment,
  then redirect `www` to the canonical non-`www` domain.
- Set `APP_URL`, `AUTH_URL`, and `NEXTAUTH_URL` to `https://primepcdz.com` in
  the production environment.
- Add `https://primepcdz.com/api/auth/callback/google` to the authorized Google
  OAuth redirect URIs and `https://primepcdz.com` to the authorized JavaScript
  origins when Google sign-in is enabled.
- Add and verify `primepcdz.com` in Resend, then change `RESEND_FROM` to an
  address such as `PRIMEPC <orders@primepcdz.com>` only after SPF and DKIM are
  verified.
- Add a DMARC TXT record for `_dmarc.primepcdz.com`. Start with monitoring
  (`p=none`) and tighten the policy after reviewing reports.
- Configure a Resend webhook for `https://primepcdz.com/api/webhooks/resend`
  and set its signing secret as `RESEND_WEBHOOK_SECRET`. Delivery, bounce,
  complaint, suppression, and failure events appear under `/admin/email`.
- Submit `https://primepcdz.com/sitemap.xml` to Google Search Console after the
  domain is live.
- Run `npm run check`, `npm run launch:check`, and `npm run build` before
  deploy.
- Confirm MongoDB indexes are created in the production database.
- Test the full cart, checkout, order notification, and admin order status flow.
- Run `npm run db:reconcile-order-stock` as a dry run before deciding whether
  legacy cancelled or failed orders need stock restoration. Use `-- --apply`
  only after reviewing the live inventory.
- Configure Cloudflare R2 for product images before removing Cloudinary. Use a
  public custom domain when possible; the temporary `r2.dev` public URL works
  for testing but Cloudflare marks it as non-production traffic.
- `EMAIL_UNSUBSCRIBE_SECRET` is optional; unsubscribe links fall back to
  `AUTH_SECRET` when it is not set.
- Verify legal pages, return policy, shipping policy, analytics, and support
  links.
- Customer order-status e-mails are intentionally disabled to control sending
  costs. Newsletter and coupon inputs are intentionally visual-only.

TODOS:
First, I’d do:

-Warranty/return/delivery pages. (DONE)
-Product page specs/condition/details upgrade.
-Checkout COD reassurance and phone validation.
-Admin order workflow improvements.
-Analytics/conversion tracking.
-Social proof/reviews/delivered-orders section.

EMAIL NECESSETIES:

1. Domain/DNS Verification (after you buy domain).
