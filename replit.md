# Thirty Twenty - AI Advertising Platform

## Overview

Thirty Twenty is an AI-powered advertising platform designed to help small businesses manage and optimize their digital advertising campaigns. The platform provides campaign management, keyword optimization, audience targeting, ad creative building, and analytics capabilities, all enhanced with AI-driven insights and suggestions powered by OpenAI.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and data fetching
- Tailwind CSS for styling with shadcn/ui component library
- Recharts for data visualization

**Design Patterns:**
- Component-based architecture with clear separation between UI components (`/components/ui`), feature-specific components (`/components/dashboard`, `/components/campaign`, etc.), and page-level components (`/pages`)
- Custom hooks for reusable logic (e.g., `use-toast`, `use-mobile`)
- Form validation using React Hook Form with Zod schemas
- Centralized API communication through custom query functions

**Key Features:**
- Dashboard with performance metrics and activity tracking
- Campaign management (create, update, delete, pause/resume)
- AI-powered keyword optimization suggestions
- Audience targeting with demographic insights
- Ad creative builder with platform-specific previews (Facebook, Instagram, Google)
- Analytics dashboard with interactive charts
- Settings management

### Backend Architecture

**Technology Stack:**
- Express.js server with TypeScript
- Node.js runtime
- ESM (ES Modules) for modern JavaScript syntax

**Design Patterns:**
- RESTful API architecture with route handlers in `/server/routes.ts`
- Middleware for request logging and error handling
- Storage abstraction layer with interface-based design (`IStorage`)
- In-memory storage implementation (`MemStorage`) for development/demo purposes
- Schema validation using Drizzle-Zod integration

**API Structure:**
- `/api/me` - User authentication and profile
- `/api/campaigns` - Campaign CRUD operations
- `/api/keywords` - Keyword management
- `/api/audiences` - Audience targeting data
- `/api/metrics` - Performance metrics
- `/api/activities` - Activity log
- `/api/ai/*` - AI-powered suggestions (keywords, campaigns, optimization)

### Data Storage

**Database:**
- PostgreSQL with Neon serverless driver (`@neondatabase/serverless`)
- Drizzle ORM for type-safe database operations
- Schema defined in `/shared/schema.ts` with tables for:
  - Users (authentication and business info)
  - Campaigns (platform-specific advertising campaigns)
  - Keywords (keyword performance tracking)
  - Audiences (demographic and targeting data)
  - Metrics (performance analytics)
  - Activities (user action logs)

**Storage Strategy:**
- Dual implementation approach: in-memory storage (`MemStorage`) for development and interface (`IStorage`) designed for database implementation
- Drizzle Kit for schema migrations (`/migrations` directory)
- Environment-based database URL configuration

### External Dependencies

**AI Services:**
- OpenAI API integration for:
  - Keyword suggestions based on business description
  - Campaign idea generation
  - Ad copy creation
  - Optimization recommendations
- Client-side wrapper functions in `/client/src/lib/openai.ts`
- Server-side API key management through environment variables

**UI Component Library:**
- Radix UI primitives for accessible, unstyled components (accordion, dialog, dropdown, select, etc.)
- shadcn/ui design system built on top of Radix UI
- Custom theme configuration via `theme.json` with Replit theme plugin

**Session Management:**
- `connect-pg-simple` for PostgreSQL-backed session storage
- Express session middleware (implied by pg session store dependency)

**Development Tools:**
- Vite plugins for development experience:
  - Runtime error modal overlay (`@replit/vite-plugin-runtime-error-modal`)
  - Theme JSON support (`@replit/vite-plugin-shadcn-theme-json`)
  - Cartographer for Replit integration (development only)
- TSX for TypeScript execution in development
- ESBuild for production bundling

**Third-Party Libraries:**
- `date-fns` for date formatting and manipulation
- `nanoid` for unique ID generation
- `cmdk` for command palette functionality
- `class-variance-authority` for component variant management
- `react-day-picker` for calendar/date selection

**Build & Deployment:**
- Separate client and server builds
- Client builds to `/dist/public` via Vite
- Server bundles to `/dist` via ESBuild with external packages
- Production server runs bundled code with `NODE_ENV=production`