# Migration Guide: Vite/Express → Next.js 14

This guide explains the migration from the old Vite + Express + React structure to the new Next.js 14 App Router architecture.

## What Changed

### Architecture

**Before (Vite + Express)**
```
client/          → React SPA with Vite
server/          → Express backend
shared/          → Shared schema
```

**After (Next.js 14)**
```
app/             → Next.js App Router (pages + API routes)
components/      → React components
lib/             → Utilities, actions, database, auth
types/           → TypeScript definitions
```

### Key Migrations

#### 1. Routing

**Before**: React Router (wouter)
```tsx
// client/src/App.tsx
import { Route } from "wouter";

<Route path="/dashboard" component={Dashboard} />
```

**After**: Next.js App Router
```
app/
  (dashboard)/
    dashboard/
      page.tsx    → /dashboard
```

#### 2. Data Fetching

**Before**: Express API routes + React Query
```tsx
// server/routes.ts
app.get("/api/campaigns", async (req, res) => {
  const campaigns = await storage.getCampaigns(1);
  res.json(campaigns);
});

// client/src/pages/campaigns.tsx
const { data } = useQuery({
  queryKey: ["campaigns"],
  queryFn: () => fetch("/api/campaigns").then(r => r.json())
});
```

**After**: Server Actions + React Query (optional)
```tsx
// lib/actions/campaigns.ts
"use server";
export async function getCampaigns(businessId: number) {
  return await db.query.campaigns.findMany({
    where: eq(campaigns.businessId, businessId)
  });
}

// app/(dashboard)/campaigns/page.tsx
const campaigns = await getCampaigns(session.user.businessId);
```

#### 3. Authentication

**Before**: Passport.js with sessions
```tsx
// server/index.ts
passport.use(new LocalStrategy(...));
app.use(session(...));
```

**After**: NextAuth v5
```tsx
// lib/auth/index.ts
export const { auth, signIn, signOut } = NextAuth(authConfig);

// middleware.ts
export default async function middleware(request) {
  const session = await auth();
  // Route protection logic
}
```

#### 4. Database Schema

**Before**: Single `shared/schema.ts`
```tsx
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  businessName: text("business_name").notNull(),
  // ...
});
```

**After**: Enhanced schema with relations in `lib/db/schema.ts`
```tsx
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  businessId: integer("business_id"),
  role: text("role", { enum: ["owner", "admin", "member"] }),
  // ...
});

export const businesses = pgTable("businesses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  ownerId: integer("owner_id").notNull(),
  // ...
});

// Relations
export const usersRelations = relations(users, ({ one }) => ({
  business: one(businesses, {
    fields: [users.businessId],
    references: [businesses.id],
  }),
}));
```

## Migration Steps

### Step 1: Install Dependencies

```bash
npm install
```

The new `package.json` includes:
- `next` - Next.js framework
- `next-auth` - Authentication (v5 beta)
- `next-themes` - Theme management
- `zustand` - State management
- `postgres` - PostgreSQL client for Drizzle
- `bcryptjs` - Password hashing

Removed:
- `express`, `express-session`, `passport` - Replaced by NextAuth
- `vite`, `@vitejs/plugin-react` - Replaced by Next.js
- `wouter` - Replaced by App Router

### Step 2: Set Up Environment Variables

```bash
cp .env.example .env
```

Update with your database credentials and generate a `NEXTAUTH_SECRET`:
```bash
openssl rand -base64 32
```

### Step 3: Push Database Schema

The new schema adds:
- `businesses` table
- Enhanced `users` table with `businessId` and `role`
- `ads` table
- `leads` table
- `campaign_metrics` table
- `activities` audit log

```bash
npm run db:push
```

### Step 4: Migrate Existing Components

Your existing shadcn/ui components in `client/src/components/ui/` should be moved to `components/ui/`.

```bash
# If keeping old structure temporarily, copy manually:
cp -r client/src/components/ui/* components/ui/
```

### Step 5: Start Development Server

```bash
npm run dev
```

## File-by-File Mapping

| Old Location | New Location | Notes |
|-------------|--------------|-------|
| `client/src/pages/dashboard.tsx` | `app/(dashboard)/dashboard/page.tsx` | Server Component |
| `client/src/pages/campaigns.tsx` | `app/(dashboard)/campaigns/page.tsx` | Server Component |
| `client/src/components/ui/*` | `components/ui/*` | No change needed |
| `server/routes.ts` | `lib/actions/*.ts` or `app/api/*/route.ts` | Server Actions or API Routes |
| `server/storage.ts` | `lib/actions/*.ts` | Server Actions |
| `shared/schema.ts` | `lib/db/schema.ts` | Enhanced with relations |
| `client/src/lib/utils.ts` | `lib/utils.ts` | Moved to root lib/ |

## Breaking Changes

### 1. No More Client-Side Routing
- Remove all `wouter` imports
- Use Next.js `Link` component or `useRouter` hook

### 2. Server vs Client Components
- By default, all components in `app/` are Server Components
- Add `"use client"` directive for client-side interactivity
- Event handlers, hooks → Client Components
- Data fetching, direct DB access → Server Components

### 3. API Routes
- Old: `server/routes.ts` with Express
- New: `app/api/*/route.ts` with Next.js Route Handlers
- Or use Server Actions in `lib/actions/`

### 4. Authentication
- Old: `req.user` from Passport
- New: `await auth()` from NextAuth
- Session data structure is different

### 5. State Management
- Added Zustand stores in `lib/store/`
- Replace local state that needs to persist across routes

## Recommended Next Steps

1. **Migrate Existing Pages**
   - Copy page logic from `client/src/pages/`
   - Convert to Server Components where possible
   - Add `"use client"` for interactive components

2. **Create API Routes**
   - Campaigns CRUD
   - Ads management
   - Leads handling
   - Analytics data

3. **Implement Server Actions**
   - Form submissions
   - Data mutations
   - Better type safety than API routes

4. **Add Authentication Pages**
   - Login page at `app/auth/login/page.tsx`
   - Register page at `app/auth/register/page.tsx`

5. **Set Up Database**
   - Run migrations
   - Seed initial data if needed
   - Test relationships

## Common Issues

### Issue: "Module not found" errors
**Solution**: Check `tsconfig.json` paths. Next.js uses `@/*` to map to root.

### Issue: "Hooks can only be used in Client Components"
**Solution**: Add `"use client"` at the top of the file.

### Issue: "Session is null"
**Solution**: Ensure middleware is configured and user is logged in.

### Issue: Database connection errors
**Solution**:
- Check `DATABASE_URL` in `.env`
- Ensure PostgreSQL is running
- Run `npm run db:push`

## Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [App Router Guide](https://nextjs.org/docs/app)
- [NextAuth v5 Docs](https://authjs.dev/)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [shadcn/ui Components](https://ui.shadcn.com/)
