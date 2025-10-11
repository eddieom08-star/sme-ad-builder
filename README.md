# SME Ad Builder

A Next.js 14 marketing campaign builder platform for small businesses, similar to Relate.ads.

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui (Mobile-First Design)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth v5
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Mobile**: PWA + Capacitor (iOS/Android Native Apps)
- **Animations**: Framer Motion

## Project Structure

```
sme-ad-builder/
├── app/                          # Next.js App Router
│   ├── (dashboard)/              # Dashboard layout group
│   │   ├── dashboard/            # Main dashboard
│   │   ├── campaigns/            # Campaign management
│   │   ├── ads/                  # Ad management
│   │   ├── leads/                # Lead management
│   │   ├── analytics/            # Analytics dashboard
│   │   └── settings/             # User settings
│   ├── api/                      # API routes
│   │   └── auth/                 # NextAuth API routes
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (redirects)
│   └── globals.css               # Global styles
├── components/                   # React components
│   ├── dashboard/                # Dashboard-specific components
│   ├── ui/                       # shadcn/ui components
│   └── providers.tsx             # App providers
├── lib/                          # Utilities and configurations
│   ├── actions/                  # Server actions
│   ├── auth/                     # NextAuth configuration
│   ├── db/                       # Database setup and schema
│   ├── store/                    # Zustand stores
│   └── utils.ts                  # Utility functions
├── types/                        # TypeScript type definitions
│   ├── index.ts                  # Main type definitions
│   └── next-auth.d.ts            # NextAuth type extensions
├── drizzle/                      # Database migrations (auto-generated)
├── middleware.ts                 # Next.js middleware
├── .env.example                  # Environment variables template
└── package.json                  # Dependencies and scripts
```

## Database Schema

### Core Tables

1. **users** - User accounts with authentication
2. **businesses** - Business profiles (1:many with users)
3. **campaigns** - Marketing campaigns
4. **ads** - Individual advertisements
5. **leads** - Customer leads from campaigns
6. **campaign_metrics** - Historical performance tracking
7. **activities** - Audit log of user actions

### Relationships

- Users belong to a Business
- Businesses have many Users, Campaigns, and Leads
- Campaigns have many Ads and belong to a Business
- Ads belong to a Campaign
- Leads can be associated with Campaigns and Ads

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sme-ad-builder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your values:
   - `DATABASE_URL`: PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your app URL (http://localhost:3000 for dev)
   - `OPENAI_API_KEY`: Optional, for AI-powered features

4. **Set up the database**
   ```bash
   npm run db:push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Available Scripts

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Database
- `npm run db:generate` - Generate database migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

### Mobile Apps (iOS/Android)
- `npm run build:mobile` - Build for mobile and sync with Capacitor
- `npm run ios` - Build and open iOS project in Xcode
- `npm run android` - Build and open Android project in Android Studio
- `npm run cap:sync` - Sync web code with native projects
- `npm run cap:init` - Initialize Capacitor (first time only)

## Key Features

### Authentication
- Email/password authentication via NextAuth
- Protected routes with middleware
- Role-based access (owner, admin, member)

### Campaign Management
- Create and manage multi-platform campaigns
- Budget tracking and spend monitoring
- Campaign status management (draft, active, paused, etc.)

### Ad Builder
- Multiple ad formats (image, video, carousel, story)
- Platform-specific ad creation
- Real-time preview
- A/B testing capabilities

### Lead Management
- Lead capture from campaigns
- Lead scoring and status tracking
- Assignment to team members
- Custom metadata support

### Analytics
- Campaign performance metrics
- Historical trend tracking
- ROI and ROAS calculations
- Interactive charts with Recharts

### State Management

#### Zustand Stores
- **UI Store**: Global UI state (sidebar, theme)
- **Campaign Store**: Campaign filters and selection
- **Ad Builder Store**: Ad creation workflow state
- **Analytics Store**: Analytics dashboard preferences

## Type Safety

The project uses TypeScript with strict mode enabled. All database entities have corresponding TypeScript types generated from the Drizzle schema.

Key type locations:
- `/types/index.ts` - Application types, schemas, constants
- `/lib/db/schema.ts` - Database schema with inferred types
- `/types/next-auth.d.ts` - NextAuth session extensions

## API Routes

API routes are located in `/app/api/`:
- `/api/auth/[...nextauth]` - NextAuth handlers

Future API routes will be added for:
- Campaign CRUD operations
- Ad management
- Lead handling
- Analytics data fetching

## Mobile Optimization

This app is **fully optimized for mobile** with three deployment options:

### 1. Mobile Web (PWA)
- Progressive Web App installable on any device
- Responsive design from 320px to 4K
- Offline support (when service worker added)
- Bottom navigation on mobile
- Touch-optimized interactions

### 2. Native iOS App
```bash
npm run ios
```
Builds a native iOS app using Capacitor. Requires:
- macOS with Xcode
- iOS Simulator or device

### 3. Native Android App
```bash
npm run android
```
Builds a native Android app using Capacitor. Requires:
- Android Studio
- Android Emulator or device

See [MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md) for detailed mobile development guide.

## Mobile Features

- 📱 **Mobile-First Design** - Built for mobile, enhanced for desktop
- 👆 **Touch Interactions** - Swipe, pull-to-refresh, action sheets
- 🎨 **Responsive UI** - Adapts to any screen size
- ⚡ **Fast & Lightweight** - Optimized performance
- 📲 **Installable** - Add to home screen (PWA)
- 🔔 **Push Notifications** - Native notifications (when enabled)
- 📴 **Offline Support** - Works without internet (coming soon)

## Documentation

- [README.md](./README.md) - Project overview (this file)
- [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) - Migration from old structure
- [STRUCTURE.md](./STRUCTURE.md) - Detailed project structure
- [MOBILE_OPTIMIZATION.md](./MOBILE_OPTIMIZATION.md) - Mobile development guide

## Contributing

1. Create a feature branch
2. Make your changes
3. Run `npm run type-check` and `npm run lint`
4. Test on mobile (Chrome DevTools or real device)
5. Submit a pull request

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT
# Build: Sat 11 Oct 2025 15:32:45 BST
