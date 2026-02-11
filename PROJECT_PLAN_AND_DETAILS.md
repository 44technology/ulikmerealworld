# Ulikme Platform - Project Plan & Details

## Executive Summary

Ulikme is a comprehensive social connection platform that enables users to discover and join activities, events, classes, and meetups. The platform consists of three main applications:

1. **Mobile App** - User-facing mobile application for discovering and participating in activities
2. **Admin Portal** - Web-based administrative dashboard for platform management
3. **Backend Server** - RESTful API server with PostgreSQL database

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Technology Stack](#technology-stack)
3. [Application Structure](#application-structure)
4. [Core Features](#core-features)
5. [Deployment Strategy](#deployment-strategy)
6. [Development Workflow](#development-workflow)
7. [API & Database](#api--database)
8. [Security & Authentication](#security--authentication)
9. [Future Roadmap](#future-roadmap)

---

## Architecture Overview

### System Architecture

```
┌─────────────────┐
│   Mobile App    │  (React + Vite)
│  ulikme1.netlify│
│      .app       │
└────────┬────────┘
         │
         │ HTTPS/REST API
         │
┌────────▼────────┐
│  Backend Server │  (Node.js + Express + Prisma)
│   (Render.com)  │
└────────┬────────┘
         │
         │ PostgreSQL
         │
┌────────▼────────┐
│   PostgreSQL    │
│    Database     │
└─────────────────┘

┌─────────────────┐
│  Admin Portal   │  (React + Vite)
│  (Netlify Site) │
└────────┬────────┘
         │
         │ HTTPS/REST API
         │
         └───────────┐
                     │
              ┌──────▼──────┐
              │ Backend API │
              └─────────────┘
```

### Application Components

1. **Mobile App** (`/src`)
   - React + TypeScript + Vite
   - Mobile-first responsive design
   - React Router for navigation
   - Context API for state management
   - Real-time features with WebSocket support

2. **Admin Portal** (`/admin-portal`)
   - React + TypeScript + Vite
   - Desktop-optimized web interface
   - Role-based access control (Admin, Venue, Instructor)
   - Comprehensive dashboard and analytics

3. **Backend Server** (`/server`)
   - Node.js + Express + TypeScript
   - Prisma ORM for database management
   - RESTful API endpoints
   - Authentication & authorization middleware
   - File upload handling

---

## Technology Stack

### Frontend (Mobile App & Admin Portal)

- **Framework:** React 18+ with TypeScript
- **Build Tool:** Vite
- **UI Components:** Radix UI (shadcn/ui)
- **Styling:** Tailwind CSS
- **State Management:** React Context API, React Query (TanStack Query)
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications:** Sonner (Toast notifications)
- **Date Handling:** date-fns

### Backend

- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Authentication:** JWT tokens, OAuth (Google, Apple)
- **File Storage:** Local filesystem / Cloud storage ready
- **Validation:** Zod schemas

### Infrastructure

- **Mobile App Hosting:** Netlify (`https://ulikme1.netlify.app/`)
- **Admin Portal Hosting:** Netlify (separate site)
- **Backend Hosting:** Render.com (or similar)
- **Database:** PostgreSQL (managed service)
- **Version Control:** GitHub
- **CI/CD:** Netlify automatic deployments

---

## Application Structure

### Mobile App Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout/         # Layout components
│   └── cards/          # Card components
├── contexts/            # React Context providers
│   ├── AuthContext.tsx
│   └── LanguageContext.tsx
├── hooks/              # Custom React hooks
│   ├── useAuth.ts
│   ├── useClasses.ts
│   ├── useMeetups.ts
│   └── useUsers.ts
├── lib/                # Utility functions
│   ├── api.ts          # API client
│   └── utils.ts
├── pages/              # Page components
│   ├── HomePage.tsx
│   ├── CreateVibePage.tsx
│   ├── ClassesPage.tsx
│   ├── EventsPage.tsx
│   └── ...
└── App.tsx             # Main app component
```

### Admin Portal Structure

```
admin-portal/
├── src/
│   ├── components/     # UI components
│   ├── contexts/       # Auth context
│   ├── layouts/        # Layout components
│   │   ├── AdminLayout.tsx
│   │   ├── VenueLayout.tsx
│   │   └── InstructorLayout.tsx
│   ├── pages/          # Page components
│   │   ├── admin/     # Admin pages
│   │   ├── venue/     # Venue pages
│   │   └── instructor/ # Instructor pages
│   └── App.tsx
```

### Backend Structure

```
server/
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── src/
│   ├── controllers/    # Route controllers
│   ├── services/       # Business logic
│   ├── middleware/     # Express middleware
│   ├── validations/    # Request validation
│   ├── utils/          # Utility functions
│   └── server.ts       # Express app setup
```

---

## Core Features

### Mobile App Features

#### 1. Authentication & Onboarding
- Multi-step onboarding flow (12 steps)
- Phone number verification with OTP
- Google & Apple Sign-In
- Profile setup (interests, photos, bio)
- Selfie verification

#### 2. Home & Discovery
- Personalized activity feed
- Trending activities
- Nearby venues
- Expert-led classes (limited to 3 cards)
- Stories and reels
- Search functionality
- Category filtering (Vibes, Venues)

#### 3. Activities & Events
- Create activities/vibes (≤10 people)
- Create events (>10 people) with:
  - Ticket management
  - Agenda
  - Enhanced visibility
- Activity/Event recommendation modal
- Event detail pages
- RSVP and ticket purchase

#### 4. Classes & Learning
- Browse classes by category
- Class detail pages with:
  - Syllabus
  - Q&A sections
  - Digital products
  - Course materials
- Enrollment system
- Payment processing (4% processing fee)
- 24-hour refund policy

#### 5. Social Features
- User profiles
- Connections/friends
- Chat functionality
- Stories and reels
- Comments and interactions

#### 6. Venues
- Venue discovery
- Venue detail pages
- Menu viewing (for restaurants)
- Reviews and ratings

### Admin Portal Features

#### 1. Admin Role
- User management
- Venue management
- Instructor management
- Refund processing
- Content moderation
- Platform analytics

#### 2. Venue Role
- Dashboard with analytics
- Content management (stories, reels)
- Class management
- Vibe/Event management
- Ticket management (integrated in detail pages)
- Campaign management
- Discount management
- Ads management
- Monetization (pricing, revenue, payouts)
- Visibility management

#### 3. Instructor Role
- Dashboard with analytics
- Class management
- Content creation
- Live streaming
- Schedule & capacity management
- Ticket pricing
- QR check-in
- Access rules
- Monetization features
- Visibility boosts

---

## Deployment Strategy

### Mobile App Deployment

**Platform:** Netlify  
**URL:** `https://ulikme1.netlify.app/`

**Configuration:**
- Base directory: Root (empty)
- Build command: `npm install --legacy-peer-deps && npm run build`
- Publish directory: `dist`
- Node version: 18
- Automatic deployments on Git push

**Netlify Configuration (`netlify.toml`):**
```toml
[build]
  base = "."
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Admin Portal Deployment

**Platform:** Netlify (separate site)

**Configuration:**
- Base directory: `admin-portal`
- Build command: `npm install --legacy-peer-deps && npm run build`
- Publish directory: `dist` (Netlify auto-prepends base directory)
- Node version: 18

**Netlify Context Configuration:**
```toml
[context.admin-portal]
  base = "admin-portal"
  command = "npm install --legacy-peer-deps && npm run build"
  publish = "dist"
```

### Backend Deployment

**Platform:** Render.com (or similar)

**Configuration:**
- Runtime: Node.js 18
- Build command: `cd server && npm install && npm run build`
- Start command: `cd server && npm start`
- Environment variables required
- PostgreSQL database connection

---

## Development Workflow

### Local Development Setup

1. **Clone Repository**
   ```bash
   git clone https://github.com/44technology/vibe-connect.git
   cd vibe-connect-main
   ```

2. **Install Dependencies**
   ```bash
   # Mobile app
   npm install --legacy-peer-deps
   
   # Admin portal
   cd admin-portal
   npm install --legacy-peer-deps
   cd ..
   
   # Backend server
   cd server
   npm install
   cd ..
   ```

3. **Environment Variables**
   - Create `.env` files for each application
   - Configure database URLs
   - Add API keys and secrets

4. **Database Setup**
   ```bash
   cd server
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run Development Servers**
   ```bash
   # Mobile app (port 8080)
   npm run dev
   
   # Admin portal (port 3001)
   cd admin-portal && npm run dev
   
   # Backend server (port 3000)
   cd server && npm run dev
   ```

### Git Workflow

- **Main Branch:** `main`
- **Deployment:** Automatic on push to `main`
- **Commit Convention:** Conventional commits
- **Pull Requests:** Required for major changes

### Build Commands

**Mobile App:**
```bash
npm run build          # Production build
npm run build:dev      # Development build
npm run preview        # Preview production build
```

**Admin Portal:**
```bash
cd admin-portal
npm run build          # Production build
npm run preview        # Preview production build
```

**Backend:**
```bash
cd server
npm run build          # TypeScript compilation
npm start              # Start production server
```

---

## API & Database

### API Endpoints Structure

**Base URL:** `https://your-backend-url.com/api`

**Main Endpoints:**
- `/auth/*` - Authentication endpoints
- `/users/*` - User management
- `/meetups/*` - Activities and events
- `/classes/*` - Class management
- `/venues/*` - Venue management
- `/instructors/*` - Instructor management
- `/tickets/*` - Ticket management
- `/payments/*` - Payment processing
- `/refunds/*` - Refund management

### Database Schema (Prisma)

**Main Models:**
- `User` - User accounts
- `Meetup` - Activities and events
- `Class` - Classes and courses
- `Venue` - Venue information
- `Instructor` - Instructor profiles
- `Enrollment` - Class enrollments
- `Ticket` - Event tickets
- `Payment` - Payment records
- `Refund` - Refund records

### Database Migrations

```bash
cd server
npx prisma migrate dev    # Create migration
npx prisma migrate deploy # Apply migrations (production)
npx prisma studio        # Database GUI
```

---

## Security & Authentication

### Authentication Methods

1. **Phone Number + OTP**
   - SMS-based verification
   - Automatic OTP generation

2. **OAuth Providers**
   - Google Sign-In
   - Apple Sign-In

3. **JWT Tokens**
   - Access tokens for API authentication
   - Refresh tokens for session management

### Authorization

- **Role-Based Access Control (RBAC)**
  - Admin
  - Venue
  - Instructor
  - User

- **Route Protection**
  - Protected routes require authentication
  - Role-based route access

### Security Features

- Password hashing (bcrypt)
- JWT token expiration
- CORS configuration
- Input validation (Zod schemas)
- SQL injection prevention (Prisma ORM)
- XSS protection
- HTTPS enforcement

---

## Payment Processing

### Payment Flow

1. User selects paid class/event
2. Payment dialog shows breakdown:
   - Gross payment
   - Processing fee (4%)
   - Net amount received
3. Payment processing (Stripe integration ready)
4. Ticket generation with QR code
5. Invoice generation

### Refund Policy

- **24-Hour Refund Window**
  - Users can cancel within 24 hours
  - Full refund processed
  - Admin portal manages refunds

### Processing Fee

- **4% Processing Fee**
  - Applied to all transactions
  - Shown in payment breakdown
  - Transparent to users

---

## Future Roadmap

### Phase 1 (Current)
- ✅ Mobile app core features
- ✅ Admin portal basic functionality
- ✅ Backend API structure
- ✅ Authentication system
- ✅ Payment processing

### Phase 2 (Planned)
- [ ] Real-time notifications
- [ ] Push notifications
- [ ] Advanced analytics
- [ ] Social features enhancement
- [ ] Mobile app native features

### Phase 3 (Future)
- [ ] Mobile app (iOS/Android native)
- [ ] Advanced AI features
- [ ] Live streaming integration
- [ ] Marketplace features
- [ ] International expansion

---

## Technical Specifications

### Performance Requirements

- **Mobile App:**
  - First Contentful Paint: < 1.5s
  - Time to Interactive: < 3s
  - Lighthouse Score: > 90

- **Admin Portal:**
  - Page Load: < 2s
  - API Response: < 500ms

### Browser Support

- **Mobile App:**
  - Chrome (latest)
  - Safari (latest)
  - Firefox (latest)
  - Edge (latest)

- **Admin Portal:**
  - Chrome (latest)
  - Firefox (latest)
  - Safari (latest)
  - Edge (latest)

### Responsive Design

- **Mobile App:** Mobile-first (320px+)
- **Admin Portal:** Desktop-first (1024px+)

---

## Environment Variables

### Mobile App (.env)

```env
VITE_API_URL=https://your-backend-url.com/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-client-id
```

### Admin Portal (.env)

```env
VITE_API_URL=https://your-backend-url.com/api
```

### Backend Server (.env)

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

---

## Support & Documentation

### Documentation Files

- `APPLICATION_FEATURES.md` - Mobile app features
- `ADMIN_PORTAL_FEATURES.md` - Admin portal features
- `VENUE_INSTRUCTOR_PORTAL_FEATURES.md` - Portal features
- `DEPLOYMENT.md` - Deployment guide
- `MOBILE_APP_NETLIFY_DEPLOY.md` - Mobile app deployment
- `NETLIFY_ADMIN_PORTAL_DOGRU_YOL.md` - Admin portal deployment

### Contact & Support

- **Repository:** https://github.com/44technology/vibe-connect
- **Mobile App:** https://ulikme1.netlify.app/
- **Admin Portal:** (Separate Netlify site)

---

## Conclusion

The Ulikme platform is a comprehensive social connection platform with a modern tech stack, scalable architecture, and robust features. The platform supports multiple user roles, payment processing, and comprehensive administrative tools. With proper deployment configuration and continuous development, the platform is ready for production use and future enhancements.
