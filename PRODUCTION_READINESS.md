# Production Readiness Checklist

Before deploying CourseX to production, ensure the following items are addressed to guarantee security, performance, and stability.

## 1. Environment Variables

- [ ] **Clerk Keys**: Use Production keys regarding your domain.
- [ ] **Stripe Keys**: Switch to Live Mode keys.
- [ ] **App URL**: Set `NEXT_PUBLIC_APP_URL` to your actual domain (e.g., `https://coursex.com`).
- [ ] **Database URL**: If migrating to Postgres (recommended), update `DATABASE_URL`.

## 2. Database

- [ ] **Migration**: SQLite is fine for small scale/dev, but for enterprise, consider migrating to PostgreSQL (e.g., Neon, Supabase, AWS RDS).
  - Update `schema.prisma` provider to `postgresql`.
  - Run `pnpm dlx prisma migrate deploy`.

## 3. Security

- [ ] **Webhooks**: Verify Stripe Webhook Secret is correct to prevent spoofing.
- [ ] **Headers**: Inspect `next.config.js` for security headers if not handled by Vercel/Middleware.

## 4. Performance

- [ ] **Images**: Ensure `next/image` is used throughout (CourseX does this by default).
- [ ] **Caching**: Vercel handles this automatically, but check `Cache-Control` headers if self-hosting.

## 5. Monitoring (Optional but Recommended)

- [ ] **Error Tracking**: Integrate Sentry.
- [ ] **Analytics**: Integrate PostHog or Google Analytics.

## 6. Final Testing

- [ ] **Auth Flow**: Test Sign Up / Sign In on the production domain.
- [ ] **Payments**: Perform a real transaction (or live test) to verify Stripe Webhooks fire correctly.
