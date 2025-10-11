# Database Setup Guide

## Quick Start

### 1. Get Your Neon Database

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string (it looks like: `postgresql://user:pass@host.neon.tech/dbname`)

### 2. Add to Local Environment

```bash
# Add to your .env file
echo "DATABASE_URL=your-neon-connection-string-here" >> .env
```

### 3. Push Schema to Database (Recommended for Development)

The easiest way - no migration files needed:

```bash
npm run db:push
```

This will:
- ✅ Read your schema from `lib/db/schema.ts`
- ✅ Create all tables in your database
- ✅ Add indexes and constraints
- ✅ Ready to use immediately!

### 4. Or Use Migrations (Recommended for Production)

Generate migration files for version control:

```bash
# Generate migration files
npm run db:generate

# Review the generated SQL in ./drizzle folder

# Apply migrations
npm run db:migrate
```

## Available Commands

```bash
# Push schema directly (fastest for dev)
npm run db:push

# Generate migration files
npm run db:generate

# Run migrations
npm run db:migrate

# Open Drizzle Studio (visual database browser)
npm run db:studio
```

## For Vercel/Production

### Option 1: Automatic with Vercel

1. In Vercel dashboard → Storage → Create → Postgres
2. Connect to your project
3. DATABASE_URL is automatically added
4. Deploy your app
5. Run migrations via Vercel CLI:

```bash
vercel env pull .env.local
npm run db:migrate
```

### Option 2: Use Neon for Production

1. Go to Vercel → Settings → Environment Variables
2. Add `DATABASE_URL` with your Neon connection string
3. Redeploy your app
4. SSH into Vercel or run migrations locally against production DB

## Database Schema

Your database includes these tables:
- **users** - User accounts
- **businesses** - Business profiles
- **campaigns** - Marketing campaigns
- **ads** - Individual advertisements
- **leads** - Lead form submissions
- **analytics** - Campaign analytics data

## Troubleshooting

**Error: "DATABASE_URL is not defined"**
- Make sure .env file exists with DATABASE_URL
- Restart your dev server after adding env vars

**Error: "Connection timeout"**
- Check your connection string is correct
- Verify your IP is allowed (Neon allows all by default)
- Check if database is paused (free tier pauses after inactivity)

**Tables not created**
- Run `npm run db:push` to sync schema
- Check console for any errors
- Verify DATABASE_URL points to correct database

## Next Steps

After setting up the database:
1. Test connection by running `npm run db:studio`
2. Your app will automatically use the database at runtime
3. Try creating a user or campaign through your app
