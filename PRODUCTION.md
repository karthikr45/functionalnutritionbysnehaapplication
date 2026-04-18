# Production Deployment Guide

## Why your local DB keeps getting wiped

You've been using `npx prisma migrate reset --force` or `npx prisma db push --accept-data-loss` which **erase all data** every time. These are **development-only commands**. In production, you use different commands that never touch data.

---

## Production DB Strategy

### 1. Choose a hosted PostgreSQL (free tiers available)

| Provider | Free Tier | Best For |
|---|---|---|
| **Supabase** | 500 MB, 2 projects | Easiest, recommended |
| **Neon** | 3 GB, auto-scaling | Serverless |
| **Railway** | $5/mo credit free | Simple |
| **Render** | 1 GB, sleeps after 90 days | Budget |

**Recommended: Supabase**
1. Sign up at https://supabase.com
2. Create new project → note the `Database URL` from Settings → Database
3. Format: `postgresql://postgres:<password>@db.xxxxx.supabase.co:5432/postgres`

### 2. Set production env variables

In your hosting platform (Vercel / Railway / Render), set:

```env
DATABASE_URL=postgresql://postgres:xxx@db.xxxxx.supabase.co:5432/postgres
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Razorpay (LIVE keys, not test)
RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=xxx
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxx

# Cloudinary
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=xxx

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=xxx
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=xxx

# SMTP (Gmail with App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your.email@gmail.com
SMTP_PASSWORD=xxxxxxxxxxxxxxxx   # 16-char Gmail App Password
SMTP_FROM=your.email@gmail.com
SMTP_FROM_NAME=Functional Nutrition by Sneha
CONTACT_EMAIL=sneha@functionalnutritionbysneha.com

# AI
GEMINI_API_KEY=xxx
```

### 3. First-time DB setup (production) — run ONCE

```bash
# Applies migrations WITHOUT wiping data
npx prisma migrate deploy

# Seeds super admin account only (optional)
npx prisma db seed
```

**Important:** After the first deploy, NEVER run:
- ❌ `prisma migrate reset` (wipes everything)
- ❌ `prisma db push --accept-data-loss` (may lose data)
- ❌ `prisma db seed` repeatedly (use upserts so it's safe, but avoid)

**Only run:**
- ✅ `prisma migrate deploy` (applies new migrations non-destructively)
- ✅ `prisma generate` (rebuilds client after schema change)

### 4. When you change the schema

In development:
```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_feature_name
# 3. Commit the new migration folder to git
```

In production (after deploying the new code):
```bash
npx prisma migrate deploy   # Applies the new migration only
```

Data is preserved. Only new tables/columns are added.

### 5. Remove seed test users from production

Edit `prisma/seed.ts` to ONLY create the super admin:
- Remove doctor test user
- Remove patient test user
- Remove admin test user
- Keep only: super admin + default packages/categories

Real users sign up via `/signup`. The doctor account should be created by the super admin through impersonation or by direct DB insert.

---

## Gmail SMTP Setup (for password reset & contact form)

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (required for App Passwords)
3. Go to https://myaccount.google.com/apppasswords
4. Create an app password named "FunctionalNutrition"
5. Copy the 16-character password
6. Set in your env:
   ```
   SMTP_USER=your.email@gmail.com
   SMTP_PASSWORD=abcd efgh ijkl mnop   # (without spaces: abcdefghijklmnop)
   ```

Gmail free tier allows **500 emails/day** — more than enough for most use cases.

---

## Deployment Options

### Option 1: Vercel (recommended for Next.js)

1. Push code to GitHub
2. Import project in https://vercel.com
3. Add env variables (Settings → Environment Variables)
4. Deploy — Vercel auto-runs `prisma generate` via postinstall
5. In Vercel: add a build command override:
   ```
   prisma migrate deploy && next build
   ```
   This applies migrations on every deploy safely.

**Free tier:** Hobby plan — unlimited bandwidth for personal use.

### Option 2: Railway

1. https://railway.app → new project → deploy from GitHub
2. Add PostgreSQL plugin (or use external DB)
3. Add env variables
4. Configure start command: `npm start`
5. Custom domain: free subdomain or bring your own

**Cost:** $5/mo free credit covers small apps.

---

## Backup Strategy

### Supabase (automatic)
- Daily backups included in free tier (7 days retention)
- Point-in-time recovery on paid plans
- Manual export: Supabase Dashboard → Database → Backups

### Manual backup
```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

---

## Pre-Production Checklist

- [ ] Database on hosted Supabase/Neon (not localhost)
- [ ] `NEXTAUTH_SECRET` regenerated for production
- [ ] Razorpay **LIVE** keys (not test)
- [ ] Gmail SMTP configured + tested
- [ ] Custom domain with HTTPS
- [ ] Remove test users from seed.ts (keep only super admin)
- [ ] Update super admin password from default `Maruthi@2013`
- [ ] Remove `/api/test-auth` debug endpoint if present
- [ ] Enable Cloudinary PDF delivery setting
- [ ] Sanity Studio content populated (services, videos, logo, settings)
- [ ] Error monitoring (optional: Sentry free tier)
- [ ] Terms of Service & Privacy Policy pages reviewed
- [ ] robots.txt and sitemap.xml

---

## Common Issues

**"Table X does not exist"**
- Run `npx prisma migrate deploy` (NOT reset)

**"Can't reach database server"**
- Check `DATABASE_URL` in production env
- Supabase requires SSL: add `?sslmode=require` to URL

**Password with `@` in URL**
- URL-encode as `%40`: `Maruthi@2013` → `Maruthi%402013`

**Seed failing in production**
- Use `upsert` not `create` in seed.ts so re-runs are safe
- Or run it only once manually via `npx prisma db seed`
