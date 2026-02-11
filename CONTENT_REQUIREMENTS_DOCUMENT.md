# Content Requirements Document
## Ulikme Platform

**Document Version:** 1.0  
**Last Updated:** January 24, 2026  
**Target Audience:** Content Writers, Web Designers, Marketing Team

---

## Table of Contents

1. [Content Overview](#content-overview)
2. [Mobile App Content](#mobile-app-content)
3. [Admin Portal Content](#admin-portal-content)
4. [Content Status](#content-status)
5. [Content Templates](#content-templates)
6. [Placeholder Content](#placeholder-content)
7. [Missing Content](#missing-content)

---

## Content Overview

### Content Types Required

1. **Static Text** - Headings, labels, descriptions
2. **Dynamic Content** - User-generated content (activities, classes, events)
3. **System Messages** - Error messages, success messages, notifications
4. **Help Text** - Tooltips, hints, instructions
5. **Marketing Copy** - Landing pages, onboarding, promotional content

### Content Principles

- **Clear & Concise** - Easy to understand
- **Friendly & Approachable** - Matches brand voice
- **Action-Oriented** - Encourages user engagement
- **Accessible** - Plain language, no jargon
- **Consistent** - Same terminology throughout

---

## Mobile App Content

### Welcome Page (`/`)

**Status:** ✅ Has Content

**Required Content:**
- Brand tagline: "One app to find people, places, and plans"
- CTA button: "Get Started"
- Sign in link: "Sign in"
- Welcome message with Lira mascot

**Current Content:**
- ✅ Tagline present
- ✅ CTA buttons present
- ✅ Mascot integration

---

### Onboarding Page (`/onboarding`)

**Status:** ✅ Has Content

**Required Content (12 Steps):**

1. **Welcome Step**
   - Title: "Welcome to Ulikme!"
   - Description: "Let's get you started on your journey to connect with amazing people and experiences."
   - Mascot introduction

2. **Signup Method**
   - Options: Phone Number, Google, Apple ID
   - Instructions for each method

3. **Phone Verification**
   - Instructions: "Enter your phone number"
   - OTP message: "We'll send you a verification code"

4. **Name Entry**
   - Label: "What's your name?"
   - Placeholder: "First Name", "Last Name"

5. **Birthday**
   - Label: "When's your birthday?"
   - Date picker instructions

6. **Gender**
   - Options: Male, Female, Non-binary, Prefer not to say
   - Privacy note

7. **Looking For**
   - Title: "What are you looking for?"
   - Options: Friendship, Dating, Networking, Coffee Chats, Workout Buddies, Music Lovers, Gaming, Book Club, Travel, Foodies, Movies, Shopping, Study Partners, Adventure, Nightlife
   - Instructions: "Select all that apply"

8. **Interests**
   - Title: "What are your interests?"
   - Instructions: "Select up to 10 interests"
   - Categories: Coffee & Drinks, Sports, Latin Music & Dance, Cuisine & Food, Other Interests

9. **Bio**
   - Label: "Tell us about yourself"
   - Placeholder: "Write a short bio..."
   - Character limit: 500

10. **Photos**
    - Title: "Add photos"
    - Instructions: "Upload 2-15 photos or videos"
    - Privacy note

11. **Selfie Verification**
    - Title: "Verify your account"
    - Instructions: "Take a selfie for account verification"
    - Privacy assurance

12. **Complete**
    - Title: "You're all set!"
    - Success message
    - CTA: "Get Started"

**Current Status:** ✅ All steps have content

---

### Home Page (`/home`)

**Status:** ✅ Has Content

**Required Content:**

**Header:**
- Title: "Home"
- Search icon button (no text)
- Plus icon button (no text)

**Your Activities Section:**
- Section title: "Your Activities"
- Empty state: "No activities yet. Create your first activity!"
- Activity cards: Dynamic content

**Discover Section:**
- Tabs: "Vibes", "Venues"
- Tab content: Dynamic activities/venues
- Empty state: "No vibes found." / "No venues found."
- Loading state: "Loading vibes..." / "Loading venues..."

**Expert-Led Classes Section:**
- Section title: "Expert-Led Classes"
- Shows 3 cards (2 Join, 1 Enrolled)
- Empty state: "No classes available"
- Loading state: "Loading classes..."

**Current Status:** ✅ Content present

---

### Create Vibe Page (`/create`)

**Status:** ✅ Has Content

**Required Content:**

**Step 1 - Category:**
- Title: "What type of activity?"
- Options: Coffee, Dining, Sports, Cinema, Wellness, Activities, Events, Networking, Custom
- Instructions: "Select a category"

**Step 2 - Details:**
- Title label: "Activity Title"
- Title placeholder: "e.g., Coffee Meetup at Central Park"
- Description label: "Description"
- Description placeholder: "Tell people what this activity is about..."

**Step 3 - Location:**
- Title: "Where will this happen?"
- Search placeholder: "Search venues..."
- Custom address option: "Or enter custom address"
- Address placeholder: "Enter address"

**Step 4 - Date & Time:**
- Date label: "When?"
- Time label: "What time?"
- Date picker instructions

**Step 5 - Settings:**
- Group size label: "How many people?"
- Options: 1-on-1, 2-4 people, 4+ people, Custom
- Visibility label: "Who can see this?"
- Options: Public, Private
- Pricing label: "Pricing"
- Options: Free, Paid
- Price placeholder: "Price per person"
- Blind meetup toggle: "Blind Meetup (details hidden until 2 hours before)"

**Activity/Event Recommendation Modal:**
- Title (Event): "Event Recommended"
- Title (Activity): "Activity Recommended"
- Description (Event): "Event mode is recommended for this attendance size. Ticket, check-in, and visibility features will be enabled."
- Description (Activity): "Activity mode is recommended for this attendance size. A more intimate and flexible gathering."
- Button (Event): "Keep as Activity" / "Use Event Mode"
- Button (Activity): "OK"

**Current Status:** ✅ Content present

---

### Classes Page (`/classes`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Header:**
- Title: "Classes"
- Search placeholder: "Search classes..."
- Filter options: Category, Price, Location, Instructor

**Categories:**
- All Categories
- Fitness
- Cooking
- Music
- Art
- Technology
- Language
- Business
- Wellness
- Photography
- Other

**Class Cards:**
- Class title (dynamic)
- Instructor name (dynamic)
- Category badge (dynamic)
- Price display: "$X" or "FREE"
- Rating: "4.8 ⭐"
- Enrolled count: "X enrolled"
- Schedule: "Starts [date]"
- Location: "Online" or venue name
- CTA button: "View Details" or "Join"

**Empty States:**
- No classes: "No classes found. Try adjusting your filters."
- No search results: "No classes match your search."

**Loading State:**
- "Loading classes..."

**Current Status:** ⚠️ Basic structure exists, needs content refinement

---

### Class Detail Page (`/class/:id`)

**Status:** ✅ Has Content

**Required Content:**

**Hero Section:**
- Class title (dynamic)
- Category badge (dynamic)
- Image (dynamic)
- Price: "$X" or "FREE"
- Online/Onsite badge

**Quick Stats:**
- Enrolled count: "X Enrolled"
- Available spots: "X Available" or "∞"
- Rating: "4.8 Rating"

**About Section:**
- Title: "About This Class"
- Description (dynamic)

**Course Syllabus:**
- Title: "Course Syllabus"
- Module structure:
  - Module title
  - Module description
  - Lessons:
    - Lesson title
    - Lesson duration
    - Lesson description
- Empty state: "Syllabus will be available soon."

**Course Materials:**
- Title: "Course Materials & Digital Products"
- Digital Products section
- Course Materials section
- Bonus Content section

**Class Details:**
- Title: "Class Details"
- Start Date: "Start Date: [date]"
- Time: "Time: [time]"
- Schedule: "Schedule: [schedule]"
- Price: "Price: $X"
- Enrolled: "Enrolled: X / Y students"

**Enrollment Section:**
- Button (not enrolled): "Join the Class - $X" or "Join the Class (Free)"
- Button (enrolled): "Enrolled (Paid)" or "Enrolled"
- Cancel button: "Cancel Enrollment"
- Refund info (if within 24h): "24-Hour Refund Policy"

**Payment Dialog:**
- Title: "Complete Payment"
- Description: "Pay $X to enroll in this class"
- Payment method selection: "Card" / "Cash"
- Payment breakdown:
  - Title: "Example Payment Breakdown"
  - Gross Payment: "$X.00"
  - Processing Fee (4%): "-$Y.00"
  - You Receive: "$Z.00"
- Total: "Total: $X"

**Current Status:** ✅ Content present

---

### Events Page (`/events`)

**Status:** ✅ Has Content

**Required Content:**

**Header:**
- Title: "Events"
- Search placeholder: "Search events..."
- Create button: "Create Event"

**Tabs:**
- "All"
- "Upcoming"
- "Past"

**Event Cards:**
- Event title (dynamic)
- Event badge: "Event"
- Date and time (dynamic)
- Location (dynamic)
- Attendee count (dynamic)
- Price: "$X" or "FREE"
- CTA: "View Details"

**Empty States:**
- No events: "No events found."
- No upcoming: "No upcoming events."
- No past: "No past events."

**Loading State:**
- "Loading events..."

**Current Status:** ✅ Content present

---

### Profile Page (`/profile`)

**Status:** ✅ Has Content

**Required Content:**

**Header:**
- User name (dynamic)
- Edit button: "Edit"

**Profile Sections:**
- Photos/Media gallery
- Bio (dynamic)
- Interests (dynamic)
- Badges section
- Activities section
- Classes section
- Connections section

**Settings:**
- Privacy settings
- Notification preferences
- Account settings

**Current Status:** ✅ Content present

---

## Admin Portal Content

### Admin Dashboard (`/dashboard`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Dashboard"

**Key Metrics Cards:**
- Total Users: "Total Users" / "X users"
- Active Users: "Active Users" / "X active"
- New Users Today: "New Today" / "X new"
- Total Activities: "Total Activities" / "X activities"
- Total Classes: "Total Classes" / "X classes"
- Total Revenue: "Total Revenue" / "$X"

**Charts:**
- User Growth Chart
- Activity Creation Chart
- Revenue Chart

**Recent Activity:**
- Title: "Recent Activity"
- List of recent actions

**Current Status:** ⚠️ Structure exists, needs content labels and descriptions

---

### Users Page (`/users`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Users"

**Search & Filters:**
- Search placeholder: "Search users..."
- Filter options: Role, Status, Date Joined

**Table Headers:**
- Name
- Email/Phone
- Role
- Status
- Joined Date
- Actions

**Actions:**
- View: "View"
- Edit: "Edit"
- Suspend: "Suspend"
- Delete: "Delete"

**Empty State:**
- "No users found."

**Current Status:** ⚠️ Structure exists, needs content labels

---

### Venues Page (`/venues`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Venues"

**Search & Filters:**
- Search placeholder: "Search venues..."
- Filter options: Category, Status, Location

**Table/Grid Headers:**
- Name
- Category
- Location
- Status
- Events Count
- Actions

**Actions:**
- View: "View"
- Edit: "Edit"
- Approve: "Approve"
- Reject: "Reject"

**Empty State:**
- "No venues found."

**Current Status:** ⚠️ Structure exists, needs content labels

---

### Instructors Page (`/instructors`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Instructors"

**Search & Filters:**
- Search placeholder: "Search instructors..."
- Filter options: Category, Status, Verification

**Table/Grid Headers:**
- Name
- Category/Specialty
- Classes Count
- Students Count
- Revenue
- Status
- Actions

**Actions:**
- View: "View"
- Edit: "Edit"
- Approve: "Approve"
- Reject: "Reject"

**Empty State:**
- "No instructors found."

**Current Status:** ⚠️ Structure exists, needs content labels

---

### Refunds Page (`/refunds`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Refunds"

**Filters:**
- Status: All, Pending, Approved, Rejected, Processed
- Date Range filter

**Table Headers:**
- Refund ID
- User
- Class/Event
- Amount
- Request Date
- Status
- Actions

**Status Badges:**
- Pending: "Pending"
- Approved: "Approved"
- Rejected: "Rejected"
- Processed: "Processed"

**Actions:**
- Approve: "Approve"
- Reject: "Reject"
- View Details: "View Details"

**Empty State:**
- "No refund requests."

**Current Status:** ⚠️ Structure exists, needs content labels

---

### Venue Dashboard (`/venue/dashboard`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Dashboard"

**Key Metrics:**
- Total Events: "Total Events" / "X events"
- Upcoming Events: "Upcoming" / "X upcoming"
- Total Attendees: "Total Attendees" / "X attendees"
- Revenue: "Revenue" / "$X"

**Upcoming Events:**
- Title: "Upcoming Events"
- Event cards/list

**Recent Activity:**
- Title: "Recent Activity"

**Current Status:** ⚠️ Structure exists, needs content labels

---

### Venue Vibes Page (`/venue/vibes`)

**Status:** ✅ Has Content

**Required Content:**

**Page Title:**
- "Vibes"

**Actions:**
- Create button: "Create Vibe"

**Vibe Cards:**
- Vibe title (dynamic)
- Date and time (dynamic)
- Location (dynamic)
- Attendee count (dynamic)
- Status badge
- Actions: "View", "Edit", "Delete"

**Empty State:**
- "No vibes created yet. Create your first vibe!"

**Current Status:** ✅ Content present

---

### Venue Classes Page (`/venue/classes`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Classes"

**Actions:**
- Create button: "Create Class"

**Class Cards:**
- Class title (dynamic)
- Instructor name (dynamic)
- Date and time (dynamic)
- Enrolled count (dynamic)
- Status badge
- Actions: "View", "Edit", "Delete"

**Empty State:**
- "No classes created yet. Create your first class!"

**Current Status:** ⚠️ Structure exists, needs content labels

---

### Venue Events Page (`/venue/events`)

**Status:** ✅ Has Content

**Required Content:**

**Page Title:**
- "Events"

**Actions:**
- Create button: "Create Event"

**Event Cards:**
- Event title (dynamic)
- Date and time (dynamic)
- Location (dynamic)
- Ticket sales (dynamic)
- Status badge
- Actions: "View", "Edit", "Delete"

**Empty State:**
- "No events created yet. Create your first event!"

**Current Status:** ✅ Content present

---

### Instructor Dashboard (`/instructor/dashboard`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Dashboard"

**Key Metrics:**
- Total Classes: "Total Classes" / "X classes"
- Active Classes: "Active" / "X active"
- Total Students: "Total Students" / "X students"
- Revenue: "Revenue" / "$X"

**Upcoming Classes:**
- Title: "Upcoming Classes"
- Class cards/list

**Recent Enrollments:**
- Title: "Recent Enrollments"

**Current Status:** ⚠️ Structure exists, needs content labels

---

### Instructor Classes Page (`/instructor/classes`)

**Status:** ⚠️ NEEDS CONTENT

**Required Content:**

**Page Title:**
- "Classes"

**Actions:**
- Create button: "Create Class"

**Class Cards:**
- Class title (dynamic)
- Category (dynamic)
- Enrolled count (dynamic)
- Revenue (dynamic)
- Status badge
- Actions: "View", "Edit", "Delete"

**Empty State:**
- "No classes created yet. Create your first class!"

**Current Status:** ⚠️ Structure exists, needs content labels

---

### Instructor Monetization Revenue Page (`/instructor/monetization/revenue`)

**Status:** ✅ Has Content

**Required Content:**

**Page Title:**
- "Revenue Split"

**Description:**
- "See how your revenue is distributed. When a user pays $100 for a class/event:"

**Payment Breakdown:**
- User pays: "$100.00"
- Processing fee (4%): "-$4.00"
- You receive: "$96.00"

**Total Revenue Card:**
- Title: "Total Revenue"
- Amount: "$X"
- Subtitle: "This month"

**Processing Fee Card:**
- Title: "Processing Fee"
- Percentage: "4%"
- Subtitle: "Total processing fee"

**Example Payment Breakdown Card:**
- Title: "Example Payment Breakdown"
- Description: "How a $100 payment is distributed"
- Gross Payment: "$100.00"
- Processing Fee (4%): "-$4.00"
- You Receive: "$96.00"

**Current Status:** ✅ Content present

---

## Content Status

### ✅ Complete (Has Content)

**Mobile App:**
- Welcome Page
- Onboarding Page (all 12 steps)
- Home Page
- Create Vibe Page
- Class Detail Page
- Events Page
- Profile Page
- Meetup Detail Page
- Venue Detail Page

**Admin Portal:**
- Venue Vibes Page
- Venue Events Page
- Instructor Monetization Revenue Page

### ⚠️ Partial (Needs Content Refinement)

**Mobile App:**
- Classes Page (basic structure, needs labels)
- Events Page (basic structure, needs refinement)

**Admin Portal:**
- Admin Dashboard (structure exists, needs labels)
- Users Page (structure exists, needs labels)
- Venues Page (structure exists, needs labels)
- Instructors Page (structure exists, needs labels)
- Refunds Page (structure exists, needs labels)
- Venue Dashboard (structure exists, needs labels)
- Venue Classes Page (structure exists, needs labels)
- Instructor Dashboard (structure exists, needs labels)
- Instructor Classes Page (structure exists, needs labels)

### ❌ Missing (No Content)

**None identified** - All pages have at least basic structure

---

## Content Templates

### Empty State Template

```html
<div class="text-center py-12">
  <p class="text-muted-foreground mb-4">[No items found message]</p>
  <button class="mt-4">[Action button text]</button>
</div>
```

**Examples:**
- "No classes found. Try adjusting your filters."
- "No events created yet. Create your first event!"
- "No users found."

### Loading State Template

```html
<div class="text-center py-8">
  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
  <p class="text-muted-foreground">Loading [items]...</p>
</div>
```

**Examples:**
- "Loading classes..."
- "Loading events..."
- "Loading users..."

### Error State Template

```html
<div class="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
  <p class="text-sm text-destructive">[Error message]</p>
</div>
```

**Examples:**
- "Failed to load classes. Please try again."
- "An error occurred. Please refresh the page."

### Success State Template

```html
<div class="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
  <div class="flex items-center gap-2">
    <CheckCircle2 className="w-5 h-5 text-green-600" />
    <p class="text-sm text-green-600">[Success message]</p>
  </div>
</div>
```

**Examples:**
- "Class created successfully!"
- "Refund processed successfully."

---

## Placeholder Content

### Class Placeholder

**Title:** "Introduction to Web Development"  
**Description:** "Learn the fundamentals of web development including HTML, CSS, and JavaScript. Perfect for beginners!"  
**Instructor:** "John Smith"  
**Category:** "Technology"  
**Price:** "$99"  
**Schedule:** "Every Monday, 7:00 PM - 9:00 PM"  
**Duration:** "8 weeks"

### Activity/Vibe Placeholder

**Title:** "Coffee Meetup at Central Park"  
**Description:** "Join us for a casual coffee meetup in Central Park. Great way to meet new people and enjoy the outdoors!"  
**Category:** "Coffee"  
**Date:** "Saturday, February 1, 2026"  
**Time:** "2:00 PM"  
**Location:** "Central Park, New York"  
**Group Size:** "2-4 people"  
**Price:** "Free"

### Event Placeholder

**Title:** "Tech Networking Event"  
**Description:** "Connect with fellow tech professionals at our networking event. Food and drinks provided!"  
**Category:** "Networking"  
**Date:** "Friday, February 5, 2026"  
**Time:** "6:00 PM - 9:00 PM"  
**Location:** "Tech Hub, San Francisco"  
**Tickets:** "Early Bird: $25, Regular: $35"  
**Capacity:** "100 people"

---

## Missing Content

### High Priority

1. **Classes Page Labels** (`/classes`)
   - Filter labels
   - Category names
   - Empty state messages
   - Loading messages

2. **Admin Dashboard Content** (`/dashboard`)
   - Metric card labels
   - Chart titles
   - Section titles
   - Help text

3. **Users Page Content** (`/users`)
   - Table headers
   - Filter labels
   - Action button labels
   - Empty state messages

4. **Venues Page Content** (`/venues`)
   - Table headers
   - Filter labels
   - Action button labels
   - Empty state messages

5. **Instructors Page Content** (`/instructors`)
   - Table headers
   - Filter labels
   - Action button labels
   - Empty state messages

6. **Refunds Page Content** (`/refunds`)
   - Table headers
   - Status labels
   - Action button labels
   - Empty state messages

### Medium Priority

7. **Venue Dashboard Content** (`/venue/dashboard`)
   - Metric labels
   - Section titles
   - Help text

8. **Venue Classes Page Content** (`/venue/classes`)
   - Page title
   - Button labels
   - Empty state messages

9. **Instructor Dashboard Content** (`/instructor/dashboard`)
   - Metric labels
   - Section titles
   - Help text

10. **Instructor Classes Page Content** (`/instructor/classes`)
    - Page title
    - Button labels
    - Empty state messages

### Low Priority

11. **Tooltips & Help Text**
    - Form field help text
    - Button tooltips
    - Feature explanations

12. **Error Messages**
    - Specific error messages for different scenarios
    - Validation error messages

13. **Success Messages**
    - Action confirmation messages
    - Achievement messages

14. **Payment System Content**
    - Payment breakdown displays
    - Revenue dashboard labels
    - Payment status messages
    - Refund messages

15. **QR Code Content**
    - QR code display pages
    - Check-in interface
    - Scanner instructions
    - Ticket validation messages

16. **Follow System Content**
    - Follow/unfollow buttons
    - Followers/following pages
    - Follow suggestions
    - Follow notifications

17. **Sponsored Ads Content**
    - Ad badges and labels
    - Ad dismissal options
    - Ad frequency settings
    - Ad content guidelines

---

## Additional Platform Features Content

### Sponsored Ads in Feed

**Location:** Home feed, Discover feed, Social feed

**Content Type:**
- **Reels Format** - Vertical video ads (9:16 aspect ratio)
- **Post Format** - Image/video posts with sponsored badge

**Display Rules:**
- Ads appear between organic content
- Maximum 1 ad per 5 organic posts
- Clearly labeled as "Sponsored"
- Same format as regular reels/posts

**Required Content Elements:**

**Sponsored Badge:**
- Text: "Sponsored" or "Ad"
- Color: Distinct from regular content
- Position: Top-right corner
- Size: Small, non-intrusive

**Ad Content:**
- Title/Headline (if applicable)
- Visual (image/video)
- Call-to-action button
- Advertiser name/brand

**Placeholder Examples:**

**Reel Ad:**
- Title: "Discover Amazing Classes"
- Description: "Join thousands learning new skills"
- CTA: "Explore Classes"
- Advertiser: "Ulikme Premium"

**Post Ad:**
- Image: Promotional image
- Caption: "Special offer: 20% off first class"
- CTA: "Learn More"
- Advertiser: "Partner Brand"

**Content Guidelines:**
- Ads must be clearly distinguishable
- Cannot be misleading
- Must comply with advertising standards
- User can dismiss/hide ads

---

### Payment System Content

**Payment Processing:**

**Payment Methods:**
- **Debit Card** - "Pay with Debit Card"
- **Credit Card** - "Pay with Credit Card"
- **Cash** - "Pay in Cash" (for onsite classes/activities)

**Payment Breakdown Display:**

**For Users (Paying):**
- **Label:** "Payment Breakdown"
- **Gross Amount:** "Total: $X.00"
- **Processing Fee:** "Processing Fee (4%): $Y.00"
- **Total to Pay:** "You Pay: $X.00"

**For Creators (Receiving):**

**Revenue Breakdown:**
- **Gross Payment:** "User Paid: $X.00"
- **Ulikme Fee (4%):** "Platform Fee (4%): -$Y.00"
- **You Receive:** "You Receive: $Z.00" (96% of payment)

**Payment Distribution:**

**Class Payments:**
- User pays: $100
- Ulikme fee (4%): -$4
- Instructor receives: $96

**Activity/Event Payments:**
- User pays: $50
- Ulikme fee (4%): -$2
- Host receives: $48

**Venue Event Payments:**
- User pays: $75
- Ulikme fee (4%): -$3
- Venue receives: $72

**Payment Status Messages:**

**Success:**
- "Payment successful!"
- "Your enrollment is confirmed"
- "Ticket generated"

**Pending:**
- "Payment processing..."
- "Please wait while we process your payment"

**Failed:**
- "Payment failed. Please try again"
- "Card declined. Please check your card details"

**Refund Messages:**
- "Refund processed: $X.00"
- "Refund will appear in 3-5 business days"

---

### QR Code System Content

**QR Code Generation:**

**When QR Code is Created:**
- User enrolls in class with physical location
- User joins activity with physical location
- User purchases ticket for event with physical location

**QR Code Display:**

**Location:** Ticket detail page, Class detail page (if enrolled), Activity detail page (if joined)

**QR Code Card:**
- **Title:** "Your Entry QR Code"
- **QR Code:** Large QR code image
- **Ticket Number:** "Ticket #: ABC123XYZ"
- **Instructions:** "Show this QR code at the entrance"
- **Valid For:** Class/Activity/Event name
- **Date & Time:** Event date and time
- **Location:** Venue name and address

**Check-In Process:**

**For Users:**
- **Instructions:** "Present your QR code at check-in"
- **Status:** "Not Checked In" / "Checked In"
- **Check-In Time:** Display when checked in

**For Venues/Instructors:**
- **Check-In Button:** "Scan QR Code"
- **Scanner Interface:** Camera view with scanning frame
- **Success Message:** "Check-in successful!"
- **Attendee List:** Shows checked-in attendees

**QR Code Content:**

**QR Code Contains:**
- Ticket ID
- User ID
- Event/Class ID
- Timestamp
- Validation hash

**QR Code Display Text:**
- "Scan this code at the entrance"
- "Valid for [Event Name]"
- "Do not share this code"

**Error Messages:**
- "QR code expired"
- "QR code already used"
- "Invalid QR code"
- "Event not found"

---

### Follow/Following System Content

**Who Can Be Followed:**

**User Types:**
- **Entrepreneur** - Business owners, startup founders
- **Instructor** - Teachers, coaches, mentors
- **Teacher** - Educators, trainers
- **Influencer** - Content creators, social media influencers
- **Venue** - Venue accounts
- **Regular Users** - All users can be followed

**Follow Button:**

**Not Following:**
- **Button Text:** "Follow"
- **Icon:** Plus icon or user-plus icon
- **Action:** Follows the user

**Following:**
- **Button Text:** "Following"
- **Icon:** Check icon
- **Action:** Unfollows the user

**Mutual Follow:**
- **Badge:** "Mutual"
- **Text:** "You follow each other"

**Follow Status Display:**

**Profile Page:**
- **Followers Count:** "X Followers"
- **Following Count:** "X Following"
- **Follow Button:** Prominent follow/unfollow button

**User Card:**
- **Follow Status:** "Following" badge or "Follow" button
- **Mutual Follows:** "X mutual connections"

**Follow Notifications:**

**When Someone Follows You:**
- **Notification:** "[User Name] started following you"
- **Action:** "View Profile" button

**When You Follow Someone:**
- **Confirmation:** "You're now following [User Name]"
- **Updates:** "You'll see their activities in your feed"

**Following Feed:**

**Content Shown:**
- Activities created by people you follow
- Classes created by instructors you follow
- Posts from venues you follow
- Updates from influencers you follow

**Empty State:**
- "Follow people to see their activities here"
- "Discover people to follow"

**Follow Suggestions:**

**Section Title:** "People You May Know"
- Based on mutual connections
- Based on similar interests
- Based on location
- Based on activities attended

**Suggested User Card:**
- User name and avatar
- Mutual connections count
- Common interests
- "Follow" button

---

## Content Guidelines

### Writing Style

- **Tone:** Friendly, approachable, professional
- **Voice:** Second person ("You", "Your")
- **Length:** Concise, clear
- **Formatting:** Use proper capitalization, punctuation

### Terminology

**Consistent Terms:**
- "Activity" - Small gathering (≤10 people)
- "Event" - Large gathering (>10 people)
- "Vibe" - User-created activity or event
- "Class" - Instructor-led learning experience
- "Enroll" - Join a class
- "Join" - Participate in activity/event
- "Host" - Creator of activity/event
- "Instructor" - Teacher/mentor

**Avoid:**
- "Meetup" (use "Activity" or "Event")
- "Course" (use "Class")
- "Sign up" (use "Enroll" or "Join")

### Button Labels

**Primary Actions:**
- "Create Activity"
- "Join Activity"
- "Enroll in Class"
- "Create Event"
- "View Details"

**Secondary Actions:**
- "Edit"
- "Delete"
- "Cancel"
- "Save"
- "Back"

**Destructive Actions:**
- "Delete"
- "Cancel Enrollment"
- "Remove"

---

## Content Checklist

### Before Launch

- [ ] All page titles are present
- [ ] All button labels are clear
- [ ] All empty states have messages
- [ ] All loading states have messages
- [ ] All error messages are user-friendly
- [ ] All success messages are clear
- [ ] All form labels are present
- [ ] All help text is helpful
- [ ] Terminology is consistent
- [ ] Content matches brand voice

---

## Content Delivery

### Format

**For Developers:**
- Provide content in JSON format for easy integration
- Include all variations (singular/plural, empty states, etc.)

**For Designers:**
- Provide content in design files (Figma)
- Include character limits
- Show content in context

### Content File Structure

```
content/
├── mobile-app/
│   ├── pages/
│   ├── components/
│   └── messages/
├── admin-portal/
│   ├── admin/
│   ├── venue/
│   └── instructor/
└── shared/
    ├── errors/
    ├── success/
    └── common/
```

---

**Document Owner:** Content Team  
**Last Review:** January 24, 2026  
**Next Review:** Weekly during development
