# PRIMEPC Website

Next.js ecommerce storefront for PRIMEPC, with product browsing, cart and
wishlist flows, customer checkout, account pages, admin product/category/order
management, and order/contact notifications.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run db:seed:products
npm run db:seed:products:reset
```

## Environment

Copy `.env.example` to `.env.local` and fill in the required values:

```bash
MONGODB_URI=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
```

Optional production integrations:

```bash
RESEND_API_KEY=
RESEND_FROM=
ADMIN_EMAILS=
APP_URL=
SUPPORT_EMAIL=
SUPPORT_PHONE=
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=
EMAIL_UNSUBSCRIBE_SECRET=
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

## Production Checklist

- Configure real production secrets and remove development URLs.
- Run `npm run lint` and `npm run build` before deploy.
- Confirm MongoDB indexes are created in the production database.
- Test the full cart, checkout, order notification, and admin order status flow.
- `EMAIL_UNSUBSCRIBE_SECRET` is optional; unsubscribe links fall back to
  `NEXTAUTH_SECRET` when it is not set.
- Verify legal pages, return policy, shipping policy, analytics, and support links.

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
