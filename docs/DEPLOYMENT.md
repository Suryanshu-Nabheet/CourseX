# Production Deployment Guide

This guide will help you deploy CourseX LMS to production.

## 🚀 Pre-Deployment Checklist

### 1. Environment Variables

Ensure all required environment variables are set:

```env
# Authentication
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://yourdomain.com

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/database

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Stripe Payments (Required for production)
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Service (Optional but recommended)
EMAIL_FROM=noreply@yourdomain.com
EMAIL_SERVICE_API_KEY=your-email-service-key
```

### 2. Database Setup

1. **Set up PostgreSQL database:**
   - Use Supabase, Railway, or your own PostgreSQL instance
   - See [Database Setup Guide](./DATABASE_SETUP.md) for details

2. **Run migrations:**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

3. **Seed initial data (optional):**
   ```bash
   npm run db:seed
   ```

### 3. Build and Test

```bash
# Build the application
npm run build

# Test the production build locally
npm run start
```

## 📦 Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel?**
- Built for Next.js
- Automatic deployments
- Edge network
- Easy environment variable management

**Steps:**

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for production"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure environment variables
   - Deploy!

3. **Configure Custom Domain:**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

### Option 2: Railway

1. **Create Railway account:**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Deploy:**
   - Click "New Project"
   - Select "Deploy from GitHub"
   - Choose your repository
   - Railway will auto-detect Next.js

3. **Add PostgreSQL:**
   - Click "New" → "Database" → "PostgreSQL"
   - Copy the DATABASE_URL
   - Add to environment variables

### Option 3: Docker

**Dockerfile:**
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

**Build and run:**
```bash
docker build -t coursex-lms .
docker run -p 3000:3000 --env-file .env coursex-lms
```

## 🔒 Security Checklist

- [ ] Strong `NEXTAUTH_SECRET` (32+ characters)
- [ ] HTTPS enabled
- [ ] Database credentials secured
- [ ] Stripe keys are production keys
- [ ] Environment variables not exposed
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection protection (using Prisma)
- [ ] XSS protection (React escapes by default)

## 📊 Monitoring & Analytics

### Recommended Tools

1. **Vercel Analytics** (if using Vercel)
   - Automatic performance monitoring
   - Web vitals tracking

2. **Sentry** (Error Tracking)
   ```bash
   npm install @sentry/nextjs
   ```
   - Error tracking
   - Performance monitoring

3. **Google Analytics**
   - User behavior tracking
   - Conversion tracking

## 🔄 Post-Deployment

1. **Verify functionality:**
   - Test user registration
   - Test course creation
   - Test payment flow
   - Test course enrollment

2. **Set up monitoring:**
   - Configure error alerts
   - Set up uptime monitoring
   - Monitor database performance

3. **Backup strategy:**
   - Set up automated database backups
   - Test backup restoration process

4. **Performance optimization:**
   - Enable CDN for static assets
   - Optimize images
   - Enable caching

## 🚨 Troubleshooting

### Common Issues

**Issue: Database connection errors**
- Check DATABASE_URL is correct
- Verify database is accessible
- Check firewall rules

**Issue: Payment not working**
- Verify Stripe keys are production keys
- Check webhook endpoint is configured
- Verify webhook secret matches

**Issue: Authentication not working**
- Check NEXTAUTH_URL matches your domain
- Verify NEXTAUTH_SECRET is set
- Check OAuth redirect URLs

See [Troubleshooting Guide](./TROUBLESHOOTING.md) for more help.

## 📈 Scaling Considerations

### Database
- Use connection pooling (PgBouncer)
- Set up read replicas for high traffic
- Monitor query performance

### Application
- Enable Next.js caching
- Use CDN for static assets
- Consider edge functions for API routes

### Infrastructure
- Set up auto-scaling
- Monitor resource usage
- Plan for traffic spikes

## 🔄 Updates & Maintenance

1. **Regular updates:**
   - Keep dependencies updated
   - Monitor security advisories
   - Test updates in staging first

2. **Database migrations:**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

3. **Backup before major changes:**
   - Always backup database
   - Test in staging environment
   - Have rollback plan ready

## 📞 Support

For deployment issues:
1. Check [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Review [Production Readiness Checklist](./PRODUCTION_READINESS.md)
3. Check application logs
4. Verify environment variables

---

**Ready to deploy?** Follow the steps above and you'll have CourseX LMS running in production! 🚀

