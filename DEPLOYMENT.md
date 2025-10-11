# SME Ad Builder - Deployment Guide

## 🚀 Vercel Deployment Setup

### Prerequisites
1. GitHub account with repository pushed
2. Vercel account (sign up at vercel.com)
3. Clerk account configured (already done ✅)

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `sme-ad-builder`
4. Vercel will auto-detect Next.js

### Step 2: Configure Environment Variables

In Vercel project settings, add these environment variables:

#### Required for All Environments (Development, Preview, Production)

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bm9ibGUtZ3JpZmZvbi02Mi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_2HuvYecAySfdBGQXPdjZs3OOREps8zuHeH9qvl9fGe

# Database (see database section below)
DATABASE_URL=<your-database-url>

# OpenAI (for AI features)
OPENAI_API_KEY=<your-openai-key>
```

### Step 3: Update Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to your application
3. Add production domains:
   - `https://your-app.vercel.app` (Preview)
   - `https://your-custom-domain.com` (Production)

### Step 4: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete (~2-3 minutes)
3. Visit your deployment URL
4. Test sign-in/sign-up flow

---

## 🗄️ Database Recommendations

### Option 1: Vercel Postgres (Recommended for MVP) ⭐
**Best for:** Quick setup, serverless, integrated with Vercel

**Pros:**
- Seamless Vercel integration
- Automatic connection pooling
- Free tier: 256 MB storage, 60 hours compute/month
- Built-in backups

**Setup:**
1. In Vercel project → Storage tab
2. Create Postgres Database
3. Copy `DATABASE_URL` automatically to environment variables

**Pricing:**
- Hobby: Free (256 MB)
- Pro: $20/month (starts at 256 MB)

---

### Option 2: Supabase (Recommended for Scale) ⭐⭐
**Best for:** Scalability, real-time features, auth alternatives

**Pros:**
- Generous free tier (500 MB database, 2 GB bandwidth)
- Built-in auth, storage, real-time subscriptions
- PostgreSQL with PostGIS
- Automatic backups
- Great for future features

**Setup:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create new project
3. Copy connection string from Settings → Database
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`
5. Add to Vercel environment variables

**Pricing:**
- Free: $0 (500 MB database, 2 GB bandwidth)
- Pro: $25/month (8 GB database, 50 GB bandwidth)

---

### Option 3: Neon (Good Alternative)
**Best for:** Serverless PostgreSQL, auto-scaling

**Pros:**
- Serverless PostgreSQL
- Generous free tier (3 GB storage)
- Auto-scales to zero
- Branch database for development

**Setup:**
1. Sign up at [neon.tech](https://neon.tech)
2. Create project
3. Copy connection string
4. Add to Vercel environment variables

**Pricing:**
- Free: $0 (3 GB, 100 hours compute/month)
- Scale: $19/month (unlimited compute)

---

### Option 4: PlanetScale (MySQL Alternative)
**Best for:** MySQL compatibility, horizontal scaling

**Pros:**
- Serverless MySQL
- Database branching
- Non-blocking schema changes
- 5 GB free storage

**Setup:**
1. Sign up at [planetscale.com](https://planetscale.com)
2. Create database
3. Generate connection string
4. Update Prisma schema to use MySQL
5. Add to Vercel environment variables

**Pricing:**
- Hobby: Free (5 GB storage, 1 billion row reads/month)
- Scaler: $29/month (10 GB storage)

---

## 🌐 Domain & CDN Setup

### Option 1: Vercel Domains (Simplest)
**What you get:**
- Free SSL certificate
- Global CDN (300+ edge locations)
- DDoS protection
- Automatic image optimization

**Setup:**
1. In Vercel → Project Settings → Domains
2. Add your custom domain
3. Update DNS records (A/CNAME) at your registrar
4. SSL certificate auto-provisioned

**No additional Cloudflare needed** - Vercel includes:
- Global CDN
- DDoS protection
- Edge caching
- Automatic image optimization

---

### Option 2: Cloudflare + Vercel (Advanced)
**Only needed if you want:**
- Advanced bot protection
- Cloudflare Workers for edge computing
- Cloudflare R2 for cheap object storage
- More granular firewall rules

**Setup:**
1. Add domain to Cloudflare
2. Point DNS to Vercel
3. Set SSL to "Full" (not Flexible)
4. Enable proxy (orange cloud) for CDN

**Cost:** Free tier covers most needs

---

## 📊 Monitoring & Analytics (Optional but Recommended)

### Vercel Analytics (Built-in)
- **Cost:** $10/month (or included in Pro)
- **Features:** Web Vitals, real user monitoring
- **Setup:** Enable in project settings

### Sentry (Error Tracking)
- **Cost:** Free tier (5K errors/month)
- **Setup:**
```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

### PostHog (Product Analytics)
- **Cost:** Free tier (1M events/month)
- **Features:** Funnels, session replay, feature flags
- **Setup:** Add tracking script

---

## 🔒 Security Checklist

- [x] Clerk authentication configured
- [ ] Environment variables set in Vercel
- [ ] Database connection secured (SSL)
- [ ] CORS configured properly
- [ ] Rate limiting (consider Upstash Rate Limiting)
- [ ] Content Security Policy headers

---

## 📝 Recommended Infrastructure Stack

### For MVP (Minimum Viable Product):
```
✅ Hosting: Vercel (Free tier)
✅ Auth: Clerk (Free tier, 5K MAU)
✅ Database: Vercel Postgres or Supabase (Free tier)
✅ CDN: Vercel built-in
✅ Domain: Your registrar → Vercel
✅ Monitoring: Vercel Analytics (when ready)

Total Cost: $0-20/month
```

### For Production (Scaling):
```
✅ Hosting: Vercel Pro ($20/month)
✅ Auth: Clerk Pro ($25/month for 10K MAU)
✅ Database: Supabase Pro ($25/month)
✅ CDN: Vercel built-in
✅ Domain: Your registrar → Vercel
✅ Monitoring: Vercel Analytics (included in Pro)
✅ Error Tracking: Sentry ($26/month)

Total Cost: ~$96/month
```

---

## 🚦 Deployment Workflow

### Development
```bash
git checkout develop
# Make changes
npm run dev
# Test locally
git commit -m "feature: new feature"
git push origin develop
```
→ Vercel auto-deploys to preview URL

### Staging
```bash
git checkout staging
git merge develop
git push origin staging
```
→ Vercel deploys to staging URL (e.g., staging.your-app.com)

### Production
```bash
git checkout main
git merge staging
git push origin main
```
→ Vercel deploys to production URL

---

## 🎯 Next Steps After Deployment

1. **Test Authentication:**
   - Sign up with test account
   - Sign in
   - Test protected routes

2. **Set up Database:**
   - Choose database provider
   - Run Prisma migrations
   - Seed initial data

3. **Configure Monitoring:**
   - Enable Vercel Analytics
   - Set up Sentry (optional)

4. **Custom Domain:**
   - Purchase domain
   - Configure in Vercel
   - Update Clerk allowed domains

5. **Set up CI/CD:**
   - GitHub Actions for tests
   - Automated deployments

---

## ⚡ Quick Deploy Commands

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

---

## 🆘 Troubleshooting

### Issue: Build fails on Vercel
**Solution:** Check build logs, ensure all dependencies in package.json

### Issue: Environment variables not working
**Solution:** Redeploy after adding env vars, check variable names match exactly

### Issue: Clerk authentication fails
**Solution:** Verify domains in Clerk dashboard match deployment URLs

### Issue: Database connection timeout
**Solution:** Check DATABASE_URL format, ensure SSL mode is correct

---

## 📚 Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Clerk Deployment Guide](https://clerk.com/docs/deployments/overview)
- [Supabase Vercel Integration](https://supabase.com/docs/guides/integrations/vercel)
