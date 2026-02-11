# Developer Implementation Plan
## Ulikme Platform

**Document Version:** 1.0  
**Last Updated:** January 24, 2026  
**Target Audience:** Development Team

---

## Table of Contents

1. [Project Setup](#project-setup)
2. [Architecture Overview](#architecture-overview)
3. [Development Environment](#development-environment)
4. [Sprint Planning](#sprint-planning)
5. [Task Breakdown](#task-breakdown)
6. [API Endpoints](#api-endpoints)
7. [Database Schema](#database-schema)
8. [Component Structure](#component-structure)
9. [State Management](#state-management)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Checklist](#deployment-checklist)
12. [Code Standards](#code-standards)

---

## Project Setup

### Repository Structure

```
vibe-connect-main/
├── src/                    # Mobile App (React + Vite)
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── contexts/
│   ├── lib/
│   └── App.tsx
├── admin-portal/           # Admin Portal (React + Vite)
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       └── App.tsx
├── server/                 # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── middleware/
│   │   └── server.ts
│   └── prisma/
│       ├── schema.prisma
│       └── migrations/
├── netlify.toml           # Netlify config
└── package.json           # Root package.json
```

### Initial Setup Commands

```bash
# Clone repository
git clone https://github.com/44technology/vibe-connect.git
cd vibe-connect-main

# Install dependencies
npm install --legacy-peer-deps

# Setup admin portal
cd admin-portal
npm install --legacy-peer-deps
cd ..

# Setup backend
cd server
npm install
npx prisma generate
npx prisma migrate dev
cd ..

# Run development servers
npm run dev              # Mobile app (port 8080)
cd admin-portal && npm run dev  # Admin portal (port 3001)
cd server && npm run dev  # Backend (port 3000)
```

---

## Architecture Overview

### Tech Stack

**Frontend (Mobile App):**
- React 18+ with TypeScript
- Vite (build tool)
- React Router v6 (routing)
- React Query (data fetching)
- Context API (state management)
- Tailwind CSS (styling)
- shadcn/ui (component library)

**Frontend (Admin Portal):**
- React 18+ with TypeScript
- Vite (build tool)
- React Router v6 (routing)
- React Query (data fetching)
- Tailwind CSS (styling)
- shadcn/ui (component library)

**Backend:**
- Node.js 18+
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (authentication)

### Data Flow

```
User Action (Mobile/Admin)
    ↓
React Component
    ↓
Custom Hook (useClasses, useMeetups, etc.)
    ↓
API Client (lib/api.ts)
    ↓
HTTP Request (fetch/axios)
    ↓
Express Route Handler
    ↓
Controller
    ↓
Service Layer
    ↓
Prisma ORM
    ↓
PostgreSQL Database
```

---

## Development Environment

### Required Tools

- **Node.js:** v18.0.0 or higher
- **npm:** v9.0.0 or higher
- **PostgreSQL:** v14 or higher
- **Git:** Latest version
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - Prisma
  - Tailwind CSS IntelliSense

### Environment Variables

**Mobile App (.env):**
```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_APPLE_CLIENT_ID=your-apple-client-id
```

**Admin Portal (.env):**
```env
VITE_API_URL=http://localhost:3000/api
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://user:password@localhost:5432/ulikme
JWT_SECRET=your-jwt-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
PORT=3000
NODE_ENV=development
```

---

## Sprint Planning

### Sprint 1: Foundation (Weeks 1-2)

**Goals:**
- Project setup
- Authentication system
- Basic routing
- Database schema

**Tasks:**
- [ ] Setup project structure
- [ ] Configure build tools (Vite, TypeScript)
- [ ] Setup Prisma and database
- [ ] Implement authentication (JWT, OAuth)
- [ ] Create base layouts
- [ ] Setup routing
- [ ] Create API client utilities

**Deliverables:**
- Working authentication flow
- Database migrations
- Basic app structure

### Sprint 2: Core Features (Weeks 3-4)

**Goals:**
- User onboarding
- Activity discovery
- Activity creation

**Tasks:**
- [ ] Implement onboarding flow (12 steps)
- [ ] Create HomePage with feed
- [ ] Implement activity discovery
- [ ] Create activity creation flow
- [ ] Implement search and filters
- [ ] Create activity detail page

**Deliverables:**
- Complete onboarding
- Working activity feed
- Activity creation flow

### Sprint 3: Social Features (Weeks 5-6)

**Goals:**
- User profiles
- Connections
- Chat functionality

**Tasks:**
- [ ] Create user profile pages
- [ ] Implement connections system
- [ ] Create chat interface
- [ ] Implement notifications
- [ ] Add social interactions (likes, comments)

**Deliverables:**
- User profiles
- Connections feature
- Basic chat

### Sprint 4: Classes & Payments (Weeks 7-8)

**Goals:**
- Class management
- Payment processing
- Refund system

**Tasks:**
- [ ] Create ClassesPage
- [ ] Implement class detail page
- [ ] Create enrollment flow
- [ ] Integrate payment processing
- [ ] Implement payment breakdown (4% fee)
- [ ] Create refund system (24-hour window)
- [ ] Generate tickets with QR codes

**Deliverables:**
- Class browsing and enrollment
- Payment processing
- Refund system

### Sprint 5: Events & Tickets (Weeks 9-10)

**Goals:**
- Event features (>10 people)
- Ticket management
- Event/Activity recommendation

**Tasks:**
- [ ] Implement Activity/Event recommendation modal
- [ ] Create EventsPage
- [ ] Implement ticket management
- [ ] Create ticket detail pages
- [ ] Add event-specific features (agenda, check-in)

**Deliverables:**
- Event creation and management
- Ticket system
- Recommendation modal

### Sprint 6: Admin Portal (Weeks 11-12)

**Goals:**
- Admin dashboard
- User management
- Content moderation

**Tasks:**
- [ ] Create AdminLayout
- [ ] Build admin dashboard
- [ ] Implement user management
- [ ] Create refund management page
- [ ] Add content moderation tools
- [ ] Implement analytics

**Deliverables:**
- Admin portal MVP
- User management
- Refund processing

### Sprint 7: Venue & Instructor Portals (Weeks 13-14)

**Goals:**
- Venue portal
- Instructor portal
- Monetization features

**Tasks:**
- [ ] Create VenueLayout
- [ ] Build venue dashboard
- [ ] Implement event management for venues
- [ ] Create InstructorLayout
- [ ] Build instructor dashboard
- [ ] Implement class management
- [ ] Add monetization features
- [ ] Create revenue tracking

**Deliverables:**
- Venue portal
- Instructor portal
- Monetization features

### Sprint 8: Testing & Polish (Weeks 15-16)

**Goals:**
- Testing
- Bug fixes
- Performance optimization
- Documentation

**Tasks:**
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Fix bugs
- [ ] Optimize performance
- [ ] Update documentation
- [ ] Prepare for deployment

**Deliverables:**
- Tested application
- Performance optimized
- Ready for production

---

## Task Breakdown

### Task: Implement Activity/Event Recommendation Modal

**Priority:** High  
**Estimated Time:** 4 hours  
**Assignee:** Frontend Developer

**Description:**
When user selects group size >10 in CreateVibePage, show modal recommending Event mode.

**Implementation Steps:**

1. **Add State Management:**
```typescript
// src/pages/CreateVibePage.tsx
const [showTypeRecommendationModal, setShowTypeRecommendationModal] = useState(false);
const [recommendedType, setRecommendedType] = useState<'activity' | 'event' | null>(null);
const [recommendedMaxAttendees, setRecommendedMaxAttendees] = useState<number>(0);
```

2. **Add Logic to Group Size Selection:**
```typescript
const handleGroupSizeChange = (size: number) => {
  if (size > 10) {
    setRecommendedType('event');
    setRecommendedMaxAttendees(size);
    setShowTypeRecommendationModal(true);
  } else {
    setRecommendedType('activity');
    setRecommendedMaxAttendees(size);
    setShowTypeRecommendationModal(true);
  }
};
```

3. **Create Modal Component:**
```typescript
<Dialog open={showTypeRecommendationModal} onOpenChange={setShowTypeRecommendationModal}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>
        {recommendedType === 'event' ? 'Event Recommended' : 'Activity Recommended'}
      </DialogTitle>
      <DialogDescription>
        {recommendedType === 'event'
          ? 'Event mode is recommended for this attendance size. Ticket, check-in, and visibility features will be enabled.'
          : 'Activity mode is recommended for this attendance size. A more intimate and flexible gathering.'}
      </DialogDescription>
    </DialogHeader>
    {/* Modal content */}
  </DialogContent>
</Dialog>
```

4. **Handle User Choice:**
```typescript
const handleUseEventMode = () => {
  setEventType('event');
  setShowTypeRecommendationModal(false);
  // Enable event features
};

const handleKeepAsActivity = () => {
  setEventType('activity');
  setShowTypeRecommendationModal(false);
};
```

**Files to Modify:**
- `src/pages/CreateVibePage.tsx`

**Dependencies:**
- Dialog component from shadcn/ui
- Icons from lucide-react

**Testing:**
- Test modal appears when group size >10
- Test modal appears when group size ≤10
- Test "Use Event Mode" button
- Test "Keep as Activity" button
- Test accessibility (DialogTitle, DialogDescription)

---

### Task: Implement Payment Breakdown in ClassDetailPage

**Priority:** High  
**Estimated Time:** 2 hours  
**Assignee:** Frontend Developer

**Implementation Steps:**

1. **Add Payment Breakdown Section:**
```typescript
// src/pages/ClassDetailPage.tsx
{/* Example Payment Breakdown */}
{classItem?.price && classItem.price > 0 && (
  <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-2">
    <p className="text-sm font-semibold text-foreground mb-2">
      Example Payment Breakdown
    </p>
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Gross Payment</span>
        <span className="text-sm font-semibold text-foreground">
          ${classItem.price.toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          Processing Fee (4%)
        </span>
        <span className="text-sm font-semibold text-orange-600">
          -${(classItem.price * 0.04).toFixed(2)}
        </span>
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-border">
        <span className="font-semibold text-foreground">You Receive</span>
        <span className="text-lg font-bold text-primary">
          ${(classItem.price * 0.96).toFixed(2)}
        </span>
      </div>
    </div>
  </div>
)}
```

2. **Place in Payment Dialog:**
- Add before "Total" section in payment dialog
- Only show if class has a price > 0

**Files to Modify:**
- `src/pages/ClassDetailPage.tsx`

**Testing:**
- Test breakdown displays correctly
- Test calculations are accurate
- Test only shows for paid classes
- Test styling matches design

---

### Task: Add Missing Imports in Admin Portal

**Priority:** Critical  
**Estimated Time:** 15 minutes  
**Assignee:** Frontend Developer

**Implementation Steps:**

1. **Add Missing Imports:**
```typescript
// admin-portal/src/App.tsx
import RefundsPage from './pages/RefundsPage';
import ProductionCreatePage from './pages/instructor/ProductionCreatePage';
import AIContentAssistantPage from './pages/instructor/AIContentAssistantPage';
```

2. **Verify Routes:**
- Ensure routes use these components correctly
- Check for any other missing imports

**Files to Modify:**
- `admin-portal/src/App.tsx`

**Testing:**
- Test admin portal loads without errors
- Test all routes work correctly
- Test navigation between pages

---

### Task: Implement 24-Hour Refund Policy

**Priority:** High  
**Estimated Time:** 6 hours  
**Assignee:** Full Stack Developer

**Backend Implementation:**

1. **Add Refund Eligibility Check:**
```typescript
// server/src/services/enrollmentService.ts
export const checkRefundEligibility = (enrollment: Enrollment): boolean => {
  const enrollmentDate = new Date(enrollment.createdAt);
  const now = new Date();
  const hoursSinceEnrollment = (now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60);
  return hoursSinceEnrollment < 24;
};
```

2. **Create Refund Endpoint:**
```typescript
// server/src/controllers/refundController.ts
export const requestRefund = async (req: Request, res: Response) => {
  const { enrollmentId } = req.params;
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
    include: { class: true }
  });
  
  if (!checkRefundEligibility(enrollment)) {
    return res.status(400).json({ error: 'Refund window has passed' });
  }
  
  // Create refund record
  const refund = await prisma.refund.create({
    data: {
      enrollmentId,
      amount: enrollment.class.price,
      status: 'pending',
      reason: req.body.reason
    }
  });
  
  res.json(refund);
};
```

**Frontend Implementation:**

1. **Add Refund Eligibility Display:**
```typescript
// src/pages/ClassDetailPage.tsx
const enrollmentDate = enrollment?.createdAt ? new Date(enrollment.createdAt) : null;
const now = new Date();
const hoursSinceEnrollment = enrollmentDate 
  ? (now.getTime() - enrollmentDate.getTime()) / (1000 * 60 * 60)
  : null;
const isWithin24Hours = hoursSinceEnrollment !== null && hoursSinceEnrollment < 24;
const canCancelWithRefund = isPaid && isWithin24Hours;
```

2. **Add Refund UI:**
```typescript
{canCancelWithRefund && (
  <div className="w-full p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
    <p className="text-xs font-semibold text-blue-600">24-Hour Refund Policy</p>
    <p className="text-xs text-muted-foreground mt-0.5">
      You can cancel and get a full refund within 24 hours of enrollment.
    </p>
    {hoursSinceEnrollment !== null && (
      <p className="text-xs text-muted-foreground mt-1">
        {Math.floor(24 - hoursSinceEnrollment)} hours remaining
      </p>
    )}
  </div>
)}
```

**Files to Modify:**
- `server/src/services/enrollmentService.ts`
- `server/src/controllers/refundController.ts`
- `server/src/routes/refundRoutes.ts`
- `src/pages/ClassDetailPage.tsx`
- `admin-portal/src/pages/RefundsPage.tsx`

**Database Changes:**
```prisma
// server/prisma/schema.prisma
model Refund {
  id            String    @id @default(cuid())
  enrollmentId String
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])
  amount       Float
  status       String    // pending, approved, rejected, processed
  reason       String?
  processedAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}
```

**Testing:**
- Test refund eligibility calculation
- Test refund request within 24 hours
- Test refund request after 24 hours
- Test admin refund processing
- Test refund UI displays correctly

---

## API Endpoints

### Authentication Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/verify-otp
POST   /api/auth/google
POST   /api/auth/apple
POST   /api/auth/refresh
POST   /api/auth/logout
```

### User Endpoints

```
GET    /api/users/me
GET    /api/users/:id
PUT    /api/users/me
POST   /api/users/me/avatar
GET    /api/users/:id/activities
GET    /api/users/:id/connections
POST   /api/users/:id/connect
DELETE /api/users/:id/connect
```

### Activity/Meetup Endpoints

```
GET    /api/meetups
GET    /api/meetups/:id
POST   /api/meetups
PUT    /api/meetups/:id
DELETE /api/meetups/:id
POST   /api/meetups/:id/join
DELETE /api/meetups/:id/leave
GET    /api/meetups/:id/attendees
```

### Class Endpoints

```
GET    /api/classes
GET    /api/classes/:id
POST   /api/classes
PUT    /api/classes/:id
DELETE /api/classes/:id
POST   /api/classes/:id/enroll
DELETE /api/classes/:id/enroll
GET    /api/classes/:id/enrollments
```

### Payment Endpoints

```
POST   /api/payments/create-intent
POST   /api/payments/confirm
GET    /api/payments/:id
POST   /api/payments/:id/refund
```

### Ticket Endpoints

```
GET    /api/tickets
GET    /api/tickets/:id
POST   /api/tickets
GET    /api/tickets/:id/qr-code
```

### Admin Endpoints

```
GET    /api/admin/users
GET    /api/admin/users/:id
PUT    /api/admin/users/:id
DELETE /api/admin/users/:id
GET    /api/admin/refunds
POST   /api/admin/refunds/:id/approve
POST   /api/admin/refunds/:id/reject
GET    /api/admin/analytics
```

---

## Database Schema

### Core Models

```prisma
model User {
  id            String    @id @default(cuid())
  email         String?   @unique
  phone         String?   @unique
  firstName     String
  lastName      String
  displayName   String?
  avatar        String?
  bio           String?
  birthday      DateTime?
  gender        String?
  interests     String[]  @default([])
  lookingFor    String[]  @default([])
  role          String    @default("user") // user, admin, venue, instructor
  verified      Boolean   @default(false)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  meetups       Meetup[]
  enrollments   Enrollment[]
  connections   Connection[] @relation("UserConnections")
  connectedTo   Connection[] @relation("ConnectedTo")
  tickets       Ticket[]
}

model Meetup {
  id            String    @id @default(cuid())
  title         String
  description   String?
  category      String
  type          String    @default("activity") // activity, event
  image         String?
  startTime     DateTime
  endTime       DateTime?
  location      String?
  latitude      Float?
  longitude     Float?
  maxAttendees  Int?
  price         Float     @default(0)
  visibility    String    @default("public") // public, private
  isBlindMeet   Boolean   @default(false)
  hostId        String
  host          User      @relation(fields: [hostId], references: [id])
  venueId       String?
  venue         Venue?    @relation(fields: [venueId], references: [id])
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  attendees     MeetupAttendee[]
  tickets       Ticket[]
}

model Class {
  id            String    @id @default(cuid())
  title         String
  description   String?
  category      String
  skill         String?
  image         String?
  price         Float     @default(0)
  maxStudents   Int?
  startTime     DateTime
  endTime       DateTime?
  schedule      String?
  syllabus      Json?
  instructorId  String
  instructor    Instructor @relation(fields: [instructorId], references: [id])
  venueId       String?
  venue         Venue?    @relation(fields: [venueId], references: [id])
  latitude      Float?
  longitude     Float?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  enrollments   Enrollment[]
}

model Enrollment {
  id            String    @id @default(cuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  classId       String
  class         Class     @relation(fields: [classId], references: [id])
  status        String    @default("pending") // pending, enrolled, paid, cancelled
  paymentId     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relations
  refunds       Refund[]
  ticket        Ticket?
}

model Refund {
  id            String    @id @default(cuid())
  enrollmentId String
  enrollment   Enrollment @relation(fields: [enrollmentId], references: [id])
  amount       Float
  status       String    @default("pending") // pending, approved, rejected, processed
  reason       String?
  processedAt  DateTime?
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
}

model Ticket {
  id            String    @id @default(cuid())
  ticketNumber  String    @unique
  qrCode        String
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  meetupId      String?
  meetup        Meetup?  @relation(fields: [meetupId], references: [id])
  enrollmentId  String?   @unique
  enrollment    Enrollment? @relation(fields: [enrollmentId], references: [id])
  createdAt     DateTime  @default(now())
}
```

---

## Component Structure

### Mobile App Components

```
src/components/
├── ui/                    # shadcn/ui components
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   └── ...
├── layout/
│   ├── MobileLayout.tsx
│   └── BottomNav.tsx
└── cards/
    ├── MeetupCard.tsx
    ├── ClassCard.tsx
    └── VenueCard.tsx
```

### Page Components

```
src/pages/
├── HomePage.tsx
├── CreateVibePage.tsx
├── MeetupDetailPage.tsx
├── ClassesPage.tsx
├── ClassDetailPage.tsx
├── EventsPage.tsx
├── ProfilePage.tsx
└── ...
```

### Custom Hooks

```
src/hooks/
├── useAuth.ts
├── useMeetups.ts
├── useClasses.ts
├── useUsers.ts
├── useTickets.ts
└── usePersonalization.ts
```

---

## State Management

### Context API Usage

```typescript
// src/contexts/AuthContext.tsx
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Auth methods
  const login = async (credentials) => { /* ... */ };
  const logout = async () => { /* ... */ };
  
  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

### React Query Usage

```typescript
// src/hooks/useMeetups.ts
export const useMeetups = (filters?: MeetupFilters) => {
  return useQuery({
    queryKey: ['meetups', filters],
    queryFn: () => api.getMeetups(filters),
    staleTime: 30000, // 30 seconds
  });
};
```

---

## Testing Strategy

### Unit Tests

```typescript
// src/utils/__tests__/calculateRefund.test.ts
describe('calculateRefund', () => {
  it('should return full refund within 24 hours', () => {
    const enrollment = {
      createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
      class: { price: 100 }
    };
    expect(calculateRefund(enrollment)).toBe(100);
  });
  
  it('should return 0 after 24 hours', () => {
    const enrollment = {
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // 25 hours ago
      class: { price: 100 }
    };
    expect(calculateRefund(enrollment)).toBe(0);
  });
});
```

### Integration Tests

```typescript
// server/src/__tests__/enrollment.test.ts
describe('POST /api/classes/:id/enroll', () => {
  it('should enroll user in free class', async () => {
    const response = await request(app)
      .post('/api/classes/123/enroll')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('enrolled');
  });
});
```

### E2E Tests (Future)

- Use Playwright or Cypress
- Test critical user flows
- Test payment flows
- Test admin workflows

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed and approved
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] Build succeeds locally
- [ ] No console errors
- [ ] Performance tested

### Mobile App Deployment

- [ ] Netlify site configured
- [ ] Base directory: empty
- [ ] Build command: `npm install --legacy-peer-deps && npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables set
- [ ] Custom domain configured (if needed)
- [ ] Redirects configured in netlify.toml

### Admin Portal Deployment

- [ ] Netlify site configured
- [ ] Base directory: `admin-portal`
- [ ] Build command: `npm install --legacy-peer-deps && npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables set

### Backend Deployment

- [ ] Render.com (or similar) configured
- [ ] Database URL set
- [ ] Environment variables set
- [ ] Build command: `cd server && npm install && npm run build`
- [ ] Start command: `cd server && npm start`
- [ ] Database migrations run
- [ ] Health check endpoint working

### Post-Deployment

- [ ] Smoke tests pass
- [ ] Monitoring configured
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Documentation updated

---

## Code Standards

### TypeScript

- Use TypeScript for all new code
- Define interfaces for all data structures
- Avoid `any` type
- Use strict mode

### Naming Conventions

- **Components:** PascalCase (`UserProfile.tsx`)
- **Hooks:** camelCase starting with `use` (`useAuth.ts`)
- **Utils:** camelCase (`formatDate.ts`)
- **Constants:** UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Variables:** camelCase (`userName`)

### File Organization

- One component per file
- Co-locate related files
- Use index files for exports
- Group by feature, not by type

### Code Style

- Use Prettier for formatting
- Use ESLint for linting
- Maximum line length: 100 characters
- Use meaningful variable names
- Add comments for complex logic

### Git Workflow

- Create feature branches from `main`
- Use conventional commits:
  - `feat:` New feature
  - `fix:` Bug fix
  - `docs:` Documentation
  - `refactor:` Code refactoring
  - `test:` Tests
  - `chore:` Maintenance
- Submit PR for review
- Merge after approval

### Example Commit Messages

```
feat: add activity/event recommendation modal
fix: correct payment breakdown calculation
docs: update deployment guide
refactor: extract payment logic to service
test: add unit tests for refund eligibility
```

---

## Quick Reference

### Common Commands

```bash
# Development
npm run dev                    # Start mobile app dev server
cd admin-portal && npm run dev # Start admin portal dev server
cd server && npm run dev       # Start backend dev server

# Building
npm run build                  # Build mobile app
cd admin-portal && npm run build # Build admin portal
cd server && npm run build     # Build backend

# Database
cd server
npx prisma migrate dev         # Create migration
npx prisma migrate deploy      # Apply migrations (production)
npx prisma studio              # Open Prisma Studio
npx prisma generate            # Generate Prisma Client

# Testing
npm test                       # Run tests
npm run test:watch             # Watch mode

# Linting
npm run lint                   # Lint code
npm run lint:fix               # Fix linting issues
```

### Common Patterns

**API Call Pattern:**
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['resource', id],
  queryFn: () => api.getResource(id),
});
```

**Form Handling Pattern:**
```typescript
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema)
});

const onSubmit = async (data) => {
  await api.createResource(data);
};
```

**Error Handling Pattern:**
```typescript
try {
  await api.createResource(data);
  toast.success('Resource created');
} catch (error) {
  toast.error(error.message || 'Failed to create resource');
}
```

---

## Support & Resources

### Documentation
- React: https://react.dev
- React Router: https://reactrouter.com
- React Query: https://tanstack.com/query
- Prisma: https://www.prisma.io/docs
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com

### Internal Docs
- `PROJECT_PLAN_AND_DETAILS.md` - Project overview
- `PRD_PRODUCT_REQUIREMENTS_DOCUMENT.md` - Product requirements
- `APPLICATION_FEATURES.md` - Feature documentation
- `DEPLOYMENT.md` - Deployment guide

### Getting Help
- Check existing documentation
- Review similar implementations
- Ask team members
- Create issue in GitHub

---

**Last Updated:** January 24, 2026  
**Maintained By:** Development Team
