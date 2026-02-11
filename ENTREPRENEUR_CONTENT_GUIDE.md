# Entrepreneur Content Guide
## Complete Guide for Creating Classes and Activities

**Document Version:** 1.0  
**Last Updated:** January 24, 2026  
**Target Audience:** Entrepreneurs, Instructors, Venue Owners, Content Creators, Web Designers

---

## Table of Contents

1. [Introduction](#introduction)
2. [Creating a Class - Complete Guide](#creating-a-class---complete-guide)
3. [Creating an Activity - Complete Guide](#creating-an-activity---complete-guide)
4. [Payment System Details](#payment-system-details)
5. [QR Code System](#qr-code-system)
6. [Follow System](#follow-system)
7. [Sponsored Ads](#sponsored-ads)
8. [Content Examples for Web Designers](#content-examples-for-web-designers)

---

## Introduction

### Who is This Guide For?

This guide is designed for:
- **Entrepreneurs** - Business owners who want to share knowledge
- **Instructors** - Teachers, coaches, mentors offering classes
- **Venue Owners** - Restaurants, cafes, parks hosting activities
- **Content Creators** - Influencers building communities
- **Web Designers** - Understanding content requirements for UI design

### What You Can Create

1. **Classes** - Structured learning experiences (free or paid)
2. **Activities** - Small gatherings (≤10 people, intimate, flexible)
3. **Events** - Large gatherings (>10 people, with ticketing and agenda)

---

## Creating a Class - Complete Guide

### Overview

A **Class** is a structured learning experience where you teach a specific skill or topic. Classes can be:
- **Free** - Build your audience, may show ads
- **Paid** - Monetize your expertise, no ads, 4% processing fee

### Step-by-Step Content Requirements

#### Step 1: Page Header

**Page Title:**
- Text: "Create an Expert-Led Class"
- Style: Large, bold heading
- Position: Top of page

**Subtitle/Description:**
- Text: "Share real experience, not theory. Teach what you've actually built and achieved. Entrepreneurs learn from real results."
- Style: Medium text, muted color
- Position: Below title

**Close Button:**
- Icon: X icon
- Position: Top-left corner
- Action: Navigate back

---

#### Step 2: Class Image Upload

**Section Label:**
- Text: "Class Image" (optional, can be implicit)

**Upload Area:**
- **Visual:** Dashed border box with camera icon
- **Placeholder Text:** "Add class photo (optional)"
- **Instructions:** "Tap to upload image"
- **Accepted Formats:** JPG, PNG, WebP
- **Recommended Size:** 1200x800px
- **Aspect Ratio:** 3:2

**After Upload:**
- **Display:** Preview of uploaded image
- **Change Option:** "Change image" or "Remove"

**Help Text:**
- "High-quality images attract more students"
- "Use images that represent what students will learn"

---

#### Step 3: Basic Information Section

**Section Header:**
- Text: "Basic Information"
- Style: Section divider or heading

**Class Title Field:**

**Label:**
- Text: "Class Title"
- Style: Form label, medium weight

**Input Field:**
- **Placeholder:** "e.g., Introduction to Web Development"
- **Type:** Text input
- **Max Length:** 60 characters
- **Required:** Yes
- **Validation:** Cannot be empty, min 5 characters

**Help Text:**
- "Choose a clear, descriptive title"
- "Include the skill or topic you're teaching"
- "5-60 characters"

**Good Examples:**
- ✅ "Shopify Store Setup & Brand Building"
- ✅ "Real Estate Investing Masterclass"
- ✅ "Yoga for Beginners: 8-Week Course"
- ✅ "Spanish Conversation Practice"

**Bad Examples:**
- ❌ "Class" (too vague)
- ❌ "Learn stuff" (not descriptive)
- ❌ "The best class ever that will change your life completely" (too long)

---

**Description Field:**

**Label:**
- Text: "Description"
- Style: Form label

**Textarea:**
- **Placeholder:** "Tell students what they'll learn..."
- **Rows:** 4-6 rows
- **Max Length:** 1000 characters
- **Required:** Yes
- **Character Counter:** Show remaining characters

**Help Text:**
- "Explain what students will learn"
- "Mention prerequisites (if any)"
- "Include what makes your class unique"
- "50-1000 characters"

**Example Description:**
```
Learn the fundamentals of web development including HTML, CSS, and JavaScript. 
Perfect for beginners! In this 8-week course, you'll build a real website 
from scratch and learn industry best practices. 

What you'll learn:
- HTML structure and semantics
- CSS styling and layouts
- JavaScript basics and interactivity
- Responsive design principles
- Deployment and hosting

No prior experience required. Bring your laptop and enthusiasm!
```

---

**Skill/Category Field:**

**Label:**
- Text: "What skill are you teaching?"
- Style: Form label

**Dropdown/Select:**
- **Placeholder:** "Select category"
- **Options:**
  - E-commerce & Digital 🛒
  - Real Estate & Investing 🏠
  - Marketing & Growth 📈
  - Mentality & Lifestyle 🧠
  - Business 💼
  - Tech 💻
  - Sports ⚽
  - Tennis 🎾
  - Yoga 🧘
  - Cooking 👨‍🍳
  - Dance 💃
  - Art 🎨
  - Language 🗣️
  - Diction & Speech 🎤
  - Acting & Audition 🎭
  - Music 🎵
  - Mentorship 👔
  - Fitness 💪

**Required:** Yes

**Help Text:**
- "Select the main category for your class"
- "This helps students find your class"

---

**Category (Secondary) Field:**

**Label:**
- Text: "Category" (optional)
- Style: Form label

**Input:**
- **Placeholder:** "Additional category (optional)"
- **Type:** Text input
- **Required:** No

---

#### Step 4: Class Type & Location Section

**Section Header:**
- Text: "Class Type & Location"
- Style: Section divider

**Class Type Selection:**

**Label:**
- Text: "How will you teach?"
- Style: Form label

**Options (Radio Buttons or Tabs):**

**Option 1: Online**
- **Icon:** Monitor/Video icon
- **Label:** "Online"
- **Description:** "Virtual class via video call"
- **Selected State:** Highlighted, checkmark

**Option 2: Onsite**
- **Icon:** Building icon
- **Label:** "Onsite"
- **Description:** "Physical location"
- **Selected State:** Highlighted, checkmark

**Option 3: Hybrid**
- **Icon:** Both icons
- **Label:** "Hybrid"
- **Description:** "Both online and onsite options"
- **Selected State:** Highlighted, checkmark

**Required:** Yes

---

**For Online Classes:**

**Meeting Platform Field:**

**Label:**
- Text: "Meeting Platform"
- Style: Form label

**Dropdown:**
- **Placeholder:** "Select platform"
- **Options:**
  - Zoom
  - Microsoft Teams
  - Google Meet
  - Webex
  - Custom

**Required:** Yes (if Online selected)

**Help Text:**
- "Select the platform you'll use for the class"

---

**Meeting Link Field:**

**Label:**
- Text: "Meeting Link"
- Style: Form label

**Input:**
- **Placeholder:** "https://zoom.us/j/..."
- **Type:** URL input
- **Required:** Yes (if Online selected)
- **Validation:** Must be valid URL

**Help Text:**
- "Link will be shared with enrolled students"
- "Use a recurring meeting link for multiple sessions"

**Example:**
- "https://zoom.us/j/123456789?pwd=abc123"

---

**For Onsite Classes:**

**Venue Selection:**

**Label:**
- Text: "Where will the class be held?"
- Style: Form label

**Search Input:**
- **Placeholder:** "Search venues..."
- **Type:** Search input with search icon
- **Functionality:** Real-time venue search

**Venue Results:**
- **Display:** List of venue cards
- **Card Content:**
  - Venue name
  - Address
  - Distance
  - Rating
  - Category
- **Action:** Tap to select

**Custom Address Option:**

**Toggle/Link:**
- Text: "Or enter custom address"

**Address Input:**
- **Label:** "Address"
- **Placeholder:** "Enter full address"
- **Type:** Text input or address autocomplete
- **Required:** Yes (if Onsite selected)

---

**For Hybrid Classes:**

**Both Fields Required:**
- Meeting Platform + Link
- Physical Location Address

---

#### Step 5: Schedule & Duration Section

**Section Header:**
- Text: "Schedule & Duration"
- Style: Section divider

**Start Date & Time:**

**Date Field:**
- **Label:** "When does the class start?"
- **Type:** Date picker
- **Placeholder:** "Select start date"
- **Required:** Yes
- **Validation:** Cannot be in the past
- **Help Text:** "First class session date"

**Time Field:**
- **Label:** "Start Time"
- **Type:** Time picker
- **Placeholder:** "Select time"
- **Format:** 12-hour (2:00 PM) or 24-hour (14:00)
- **Required:** Yes

---

**End Date & Time (Optional):**

**Date Field:**
- **Label:** "When does the class end?" (optional)
- **Type:** Date picker
- **Placeholder:** "Select end date"
- **Required:** No
- **Help Text:** "Last class session (for multi-session classes)"

**Time Field:**
- **Label:** "End Time" (optional)
- **Type:** Time picker
- **Placeholder:** "Select end time"
- **Required:** No

---

**Frequency Selection:**

**Label:**
- Text: "How often?"
- Style: Form label

**Options:**

**Option 1: Once**
- **Label:** "Once"
- **Description:** "Single session class"
- **Selected:** Shows only start date/time

**Option 2: Weekly**
- **Label:** "Weekly"
- **Description:** "Repeats weekly"
- **Selected:** Shows start date/time + "Repeats every week"

**Option 3: Custom**
- **Label:** "Custom"
- **Description:** "Select specific days"
- **Selected:** Shows day selection interface

---

**For Custom Frequency:**

**Day Selection:**

**Label:**
- Text: "Select Days"
- Style: Form label

**Day Buttons:**
- **Options:** Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- **Style:** Toggle buttons or checkboxes
- **Multiple Selection:** Yes
- **Visual:** Selected days highlighted

**Add Lessons Button:**

**Button Text:**
- "Add Lessons"

**Functionality:**
- Creates lesson entries for each selected day
- Uses start time for all lessons
- Generates lesson titles: "[Day] - [Class Title]"

**Help Text:**
- "Add lessons for selected days"
- "Each day will have a separate lesson"

**Lesson List:**

**Display:**
- List of created lessons
- Each lesson shows:
  - Day name
  - Time
  - Title
  - Remove button

**Lesson Item:**
- **Day:** "Monday"
- **Time:** "7:00 PM"
- **Title:** "Monday - Introduction to Web Development"
- **Remove:** X button

---

**Schedule Description (Optional):**

**Label:**
- Text: "Schedule" (optional)
- Style: Form label

**Input:**
- **Placeholder:** "e.g., Every Monday, Wednesday, Friday at 7 PM"
- **Type:** Text input
- **Required:** No
- **Help Text:** "Additional schedule information"

---

#### Step 6: Capacity & Pricing Section

**Section Header:**
- Text: "Capacity & Pricing"
- Style: Section divider

**Max Students Field:**

**Label:**
- Text: "Max Students"
- Style: Form label

**Input:**
- **Placeholder:** "e.g., 20"
- **Type:** Number input
- **Required:** No
- **Min Value:** 1
- **Help Text:**
  - "Maximum number of students"
  - "Leave empty for unlimited"
  - "Recommended: 10-30 for optimal engagement"

---

**Pricing Selection:**

**Label:**
- Text: "Pricing"
- Style: Form label

**Options (Radio Buttons):**

**Option 1: Free**
- **Label:** "Free"
- **Description:** "No cost to attend"
- **Icon:** Gift icon or dollar sign with slash
- **Features Listed:**
  - "Build your audience"
  - "Ads may be shown (can be disabled)"
  - "No payment processing"

**Option 2: Paid**
- **Label:** "Paid"
- **Description:** "Set a price per student"
- **Icon:** Dollar sign
- **Features Listed:**
  - "Monetize your expertise"
  - "No ads shown"
  - "4% processing fee applies"

**Required:** Yes

---

**Price Input (if Paid selected):**

**Label:**
- Text: "Price"
- Style: Form label

**Input:**
- **Placeholder:** "e.g., 50 (0 for free)"
- **Type:** Number input
- **Prefix:** "$" symbol
- **Required:** Yes (if Paid selected)
- **Min Value:** 1
- **Max Value:** 10000
- **Step:** 1

**Help Text:**
- "+4% processing fee applies"
- "Students will see the total price"

**Payment Breakdown Display:**

**Card/Box:**
- **Title:** "Example Payment Breakdown"
- **Content:**
  - **Gross Payment:** "$X.00"
  - **Processing Fee (4%):** "-$Y.00" (orange/red color)
  - **You Receive:** "$Z.00" (green/primary color, larger font)
- **Calculation:** Automatically updates as price changes
- **Style:** Muted background, border, padding

**Example:**
```
Example Payment Breakdown
Gross Payment:        $100.00
Processing Fee (4%):  -$4.00
You Receive:          $96.00
```

---

**Ads Toggle (if Free selected):**

**Label:**
- Text: "Show Ads"
- Style: Toggle switch label

**Toggle Switch:**
- **Default:** Enabled (for free classes)
- **Disabled State:** "Ads disabled"
- **Enabled State:** "Ads enabled"

**Description:**
- "Free classes can show ads (can be disabled)"
- "Paid classes never show ads"

**Info Box (if Ads enabled):**
- **Background:** Orange/yellow tint
- **Icon:** Alert icon
- **Text:** "Ads will be displayed in this free class. Users can close ads."

---

**Info Box (if Paid selected):**
- **Background:** Green tint
- **Icon:** Check icon
- **Text:** "Paid classes never show ads"

---

#### Step 7: Premium & Exclusive Options Section

**Section Header:**
- Text: "Premium Options" (optional section)
- Style: Section divider

**Premium Class Toggle:**

**Label:**
- Text: "Premium Class"
- **Subtitle:** "Highlight your expertise"
- Style: Toggle switch with description

**Toggle Switch:**
- **Off State:** Gray/unselected
- **On State:** Yellow/gold color

**Features Listed (when enabled):**
- "Enhanced visibility"
- "Premium badge display"
- "Higher placement in search results"
- "May have additional fee"

**Icon:** Crown icon

---

**Exclusive Class Toggle:**

**Label:**
- Text: "Exclusive Class"
- **Subtitle:** "Limited access, invite-only"
- Style: Toggle switch with description

**Toggle Switch:**
- **Off State:** Gray/unselected
- **On State:** Purple/primary color

**Features Listed (when enabled):**
- "Only invited users can enroll"
- "Creates sense of exclusivity"
- "Higher perceived value"

**Icon:** Lock icon

---

#### Step 8: Review & Create

**Review Section:**

**Title:**
- Text: "Review Your Class"
- Style: Section header

**Review Cards:**
- Display all entered information
- Editable (tap to edit)
- Organized by section

**Create Button:**

**Button Text:**
- "Create Class"
- Style: Primary button, large, full width

**Loading State:**
- **Text:** "Creating..."
- **Spinner:** Loading indicator
- **Disabled:** Button disabled during creation

**Success Message:**
- **Toast/Modal:** "Class created successfully!"
- **Action:** Navigate to class detail page or classes list

**Error Handling:**
- **Validation Errors:** Show inline errors
- **Network Errors:** "Failed to create class. Please try again."

---

## Creating an Activity - Complete Guide

### Overview

An **Activity** (also called "Vibe") is a casual gathering for small groups (≤10 people). Activities are:
- **Intimate** - Small group size
- **Flexible** - Less formal than events
- **Social** - Focus on connection

### Step-by-Step Content Requirements

#### Step 1: Page Header

**Page Title:**
- Text: "Create Activity"
- Style: Large, bold heading
- Position: Top of page

**Progress Indicator:**
- **Steps:** 5 steps total
- **Current Step:** Highlighted
- **Completed Steps:** Checkmarks
- **Format:** "Step 1 of 5" or progress bar

**Steps:**
1. Category
2. Details
3. Location
4. Date & Time
5. Settings

**Close Button:**
- Icon: X icon
- Position: Top-left corner
- Action: Navigate back (with confirmation if data entered)

---

#### Step 2: Category Selection

**Step Indicator:**
- Text: "Step 1: Category"
- Style: Step label

**Title:**
- Text: "What type of activity?"
- Style: Large heading

**Category Grid:**

**Categories (with icons and emojis):**

1. **Coffee ☕**
   - **Icon:** Coffee icon
   - **Label:** "Coffee"
   - **Description:** "Coffee meetups, cafe gatherings"

2. **Dining 🍽️**
   - **Icon:** Utensils icon
   - **Label:** "Dining"
   - **Description:** "Restaurant meetups, food experiences"

3. **Sports 🎾**
   - **Icon:** Dumbbell icon
   - **Label:** "Sports"
   - **Description:** "Sports activities, workouts"

4. **Cinema 🎬**
   - **Icon:** Film icon
   - **Label:** "Cinema"
   - **Description:** "Movie watching, film discussions"

5. **Wellness 🧘**
   - **Icon:** Heart icon
   - **Label:** "Wellness"
   - **Description:** "Yoga, meditation, wellness activities"

6. **Activities 🎨**
   - **Icon:** Palette icon
   - **Label:** "Activities"
   - **Description:** "Art, crafts, creative activities"

7. **Events 🎉**
   - **Icon:** Party icon
   - **Label:** "Events"
   - **Description:** "Parties, celebrations"

8. **Networking 💼**
   - **Icon:** Briefcase icon
   - **Label:** "Networking"
   - **Description:** "Professional networking, business meetups"

9. **Custom ✨**
   - **Icon:** Sparkles icon
   - **Label:** "Custom"
   - **Description:** "Other activities"

**Selection:**
- **Visual:** Card with icon, emoji, label
- **Selected State:** Border highlight, background tint
- **Action:** Tap to select

**Help Text:**
- "Select a category that best describes your activity"

**Next Button:**
- **Text:** "Next"
- **Disabled:** Until category selected
- **Action:** Go to Step 2

---

#### Step 3: Activity Details

**Step Indicator:**
- Text: "Step 2: Details"
- Style: Step label

**Back Button:**
- Icon: Arrow left
- Action: Go to previous step

**Title Field:**

**Label:**
- Text: "Activity Title"
- Style: Form label

**Input:**
- **Placeholder:** "e.g., Coffee Meetup at Central Park"
- **Type:** Text input
- **Max Length:** 60 characters
- **Required:** Yes
- **Validation:** Cannot be empty, min 5 characters

**Help Text:**
- "Choose a clear, specific title"
- "Include location or activity type"
- "5-60 characters"

**Good Examples:**
- ✅ "Coffee Meetup at Central Park"
- ✅ "Tennis Match at Flamingo Park"
- ✅ "Yoga Session at Bayfront Park"
- ✅ "Networking Happy Hour Downtown"

**Bad Examples:**
- ❌ "Meetup" (too vague)
- ❌ "Fun time" (not descriptive)
- ❌ "The best coffee meetup ever in the whole world" (too long)

---

**Description Field:**

**Label:**
- Text: "Description"
- Style: Form label

**Textarea:**
- **Placeholder:** "Tell people what this activity is about..."
- **Rows:** 4-6 rows
- **Max Length:** 500 characters
- **Required:** Yes
- **Character Counter:** Show remaining characters

**Help Text:**
- "Explain what will happen"
- "Mention what to bring (if applicable)"
- "Set expectations"
- "20-500 characters"

**Example Description:**
```
Join us for a casual coffee meetup in Central Park! Great way to meet 
new people and enjoy the outdoors. We'll meet at the main entrance 
near the fountain and find a nice spot to chat. 

Bring your own coffee or buy from nearby cafes. All are welcome - 
whether you're new to the city or a longtime resident looking to 
expand your social circle. See you there!
```

**Next Button:**
- **Text:** "Next"
- **Disabled:** Until title and description filled
- **Action:** Go to Step 3

---

#### Step 4: Location Selection

**Step Indicator:**
- Text: "Step 3: Location"
- Style: Step label

**Back Button:**
- Icon: Arrow left
- Action: Go to previous step

**Title:**
- Text: "Where will this happen?"
- Style: Section heading

**Option 1: Select Venue**

**Search Input:**
- **Placeholder:** "Search venues..."
- **Icon:** Search icon
- **Type:** Search input
- **Functionality:** Real-time venue search

**Search Results:**

**Venue Cards:**
- **Layout:** List of venue cards
- **Card Content:**
  - Venue image (thumbnail)
  - Venue name (bold)
  - Address (small text)
  - City (small text)
  - Rating (stars + number)
  - Review count
  - Distance (if location enabled)
  - Category badge
  - Price range (for restaurants)

**Venue Card Actions:**
- **Tap Card:** Select venue
- **View Details:** Opens venue detail modal

**Venue Detail Modal:**

**Content:**
- Large venue image
- Venue name
- Full address
- Rating and reviews
- Phone number (if available)
- Website link (if available)
- Menu items (for restaurants)
- Images gallery
- "Select This Venue" button

**For Restaurants:**
- **Menu Section:**
  - Menu items with:
    - Name
    - Description
    - Price
    - Image (if available)
    - Ingredients
    - Calories

---

**Option 2: Custom Address**

**Toggle/Link:**
- Text: "Or enter custom address"
- Style: Link or toggle button

**Address Input:**
- **Label:** "Address"
- **Placeholder:** "Enter address"
- **Type:** Text input or address autocomplete
- **Required:** Yes (if custom selected)
- **Help Text:** "Enter the full address where the activity will take place"

**Location Features:**
- Address autocomplete
- Map preview (if available)
- Location validation

**Selected State:**
- **Visual:** Selected venue/address highlighted
- **Display:** Shows selected location name/address

**Next Button:**
- **Text:** "Next"
- **Disabled:** Until location selected
- **Action:** Go to Step 4

---

#### Step 5: Date & Time Selection

**Step Indicator:**
- Text: "Step 4: Date & Time"
- Style: Step label

**Back Button:**
- Icon: Arrow left
- Action: Go to previous step

**Date Field:**

**Label:**
- Text: "When?"
- Style: Form label

**Date Picker:**
- **Placeholder:** "Select date"
- **Type:** Date picker
- **Required:** Yes
- **Validation:** Cannot be in the past
- **Min Date:** Today
- **Help Text:** "Select the date for your activity"

**Calendar Display:**
- Shows calendar
- Highlights selected date
- Shows available dates

---

**Time Field:**

**Label:**
- Text: "What time?"
- Style: Form label

**Time Picker:**
- **Placeholder:** "Select time"
- **Type:** Time picker
- **Format:** 12-hour (2:00 PM) or 24-hour (14:00)
- **Required:** Yes
- **Help Text:** "Select the start time"

**Time Picker Options:**
- Scroll wheel
- Or time input field
- AM/PM selector (if 12-hour format)

**Duration (Optional):**
- Can be mentioned in description
- Or left open-ended

**Next Button:**
- **Text:** "Next"
- **Disabled:** Until date and time selected
- **Action:** Go to Step 5

---

#### Step 6: Settings

**Step Indicator:**
- Text: "Step 5: Settings"
- Style: Step label

**Back Button:**
- Icon: Arrow left
- Action: Go to previous step

**Group Size Selection:**

**Label:**
- Text: "How many people?"
- Style: Form label

**Options (Cards or Buttons):**

**Option 1: 1-on-1 👥**
- **Label:** "1-on-1"
- **Value:** 2 people total
- **Description:** "Just you and one other person"
- **Icon:** Single person icon

**Option 2: 2-4 people 👥👥**
- **Label:** "2-4 people"
- **Value:** 2-4 people total
- **Description:** "Small intimate group"
- **Icon:** Two people icon

**Option 3: 4+ people 👥👥👥**
- **Label:** "4+ people"
- **Value:** 4-10 people (recommended for Activity)
- **Description:** "Larger group"
- **Icon:** Multiple people icon

**Option 4: Custom ✏️**
- **Label:** "Custom"
- **Value:** User-defined
- **Description:** "Enter specific number"
- **Icon:** Edit icon

**Custom Group Size Input (if Custom selected):**

**Input:**
- **Placeholder:** "Enter number"
- **Type:** Number input
- **Min:** 2
- **Max:** 10 (for Activity mode)
- **Help Text:** "Maximum number of attendees"

**Important Note:**
- **Warning Text:** "If you select more than 10 people, Event mode will be recommended"
- **Style:** Info box with info icon

---

**Visibility Selection:**

**Label:**
- Text: "Who can see this?"
- Style: Form label

**Options (Radio Buttons or Cards):**

**Option 1: Public 🌐**
- **Label:** "Public"
- **Description:** "Anyone can see and join"
- **Icon:** Globe icon
- **Features:**
  - Appears in discovery feed
  - Visible to all users
  - Can be shared

**Option 2: Private 🔒**
- **Label:** "Private"
- **Description:** "Invite only event"
- **Icon:** Lock icon
- **Features:**
  - Only invited users can see
  - Not in discovery feed
  - Requires invitations

**Required:** Yes

---

**Pricing Selection:**

**Label:**
- Text: "Pricing"
- Style: Form label

**Options (Radio Buttons):**

**Option 1: Free 💰**
- **Label:** "Free"
- **Description:** "No cost to attend"
- **Icon:** Gift icon or dollar sign with slash
- **Features:**
  - No payment required
  - Anyone can join

**Option 2: Paid 💵**
- **Label:** "Paid"
- **Description:** "Set a price per person"
- **Icon:** Dollar sign
- **Features:**
  - Payment processing required
  - Ticket generation

**Required:** Yes

---

**Price Input (if Paid selected):**

**Label:**
- Text: "Price per person"
- Style: Form label

**Input:**
- **Placeholder:** "e.g., 25"
- **Type:** Number input
- **Prefix:** "$" symbol
- **Required:** Yes (if Paid selected)
- **Min Value:** 1
- **Max Value:** 1000
- **Help Text:** "Amount each attendee pays"

**Payment Breakdown Display (if Paid):**
- Same as class payment breakdown
- Shows processing fee (4%)
- Shows net amount host receives

---

**Blind Meetup Toggle (Optional):**

**Label:**
- Text: "Blind Meetup"
- **Subtitle:** "Details hidden until 2 hours before"
- Style: Toggle switch with description

**Toggle Switch:**
- **Off State:** Unselected
- **On State:** Selected

**Description:**
- "Activity details are hidden until 2 hours before start time"
- "Creates mystery and excitement"
- "Only date/time/category visible initially"

**Info Box (if enabled):**
- **Background:** Purple/mystery color
- **Icon:** Eye with slash icon
- **Text:** "Details will be revealed 2 hours before the activity starts"

---

**Create Button:**

**Button Text:**
- "Create Activity"
- Style: Primary button, large, full width

**Loading State:**
- **Text:** "Creating..."
- **Spinner:** Loading indicator

**Success Message:**
- **Toast/Modal:** "Activity created successfully!"
- **Action:** Navigate to activity detail page or home

---

#### Step 7: Activity/Event Recommendation Modal

**Trigger:**
- Appears automatically when group size >10 is selected
- Or when custom group size >10 is entered

**Modal Content:**

**For Event Recommendation (>10 people):**

**Header:**
- **Icon:** Ticket icon (large, centered)
- **Icon Background:** Primary color tint
- **Title:** "Event Recommended"
- **Style:** Large, bold, centered

**Description:**
- Text: "Event mode is recommended for this attendance size. Ticket, check-in, and visibility features will be enabled."
- Style: Centered, medium text

**Features List:**
- ✅ "Ticket management"
- ✅ "Agenda/schedule"
- ✅ "Enhanced visibility"
- ✅ "Check-in system"
- ✅ "QR code tickets"

**Buttons:**

**Button 1: Keep as Activity**
- **Text:** "Keep as Activity"
- **Style:** Outline button
- **Action:** Dismiss modal, keep as activity

**Button 2: Use Event Mode**
- **Text:** "Use Event Mode"
- **Icon:** Arrow right icon
- **Style:** Primary button
- **Action:** Convert to event, enable event features

---

**For Activity Recommendation (≤10 people):**

**Header:**
- **Icon:** Users icon (large, centered)
- **Icon Background:** Secondary color tint
- **Title:** "Activity Recommended"
- **Style:** Large, bold, centered

**Description:**
- Text: "Activity mode is recommended for this attendance size. A more intimate and flexible gathering."
- Style: Centered, medium text

**Button:**
- **Text:** "OK"
- **Style:** Primary button
- **Action:** Dismiss modal, proceed with activity

---

## Payment System Details

### Payment Flow Content

#### Step 1: Payment Trigger

**When User Clicks "Join" or "Enroll":**

**For Paid Classes:**
- **Button Text:** "Join the Class - $X"
- **Action:** Opens payment dialog

**For Paid Activities:**
- **Button Text:** "Join Activity - $X"
- **Action:** Opens payment dialog

**For Free:**
- **Button Text:** "Join" or "Join (Free)"
- **Action:** Direct enrollment (no payment)

---

#### Step 2: Payment Dialog

**Dialog Header:**

**Title:**
- Text: "Complete Payment"
- Style: Dialog title

**Description:**
- Text: "Pay $X to enroll in [Class/Activity Name]"
- Style: Dialog description

---

**Payment Method Selection:**

**Label:**
- Text: "Payment Method"
- Style: Form label

**Options (Grid of 2):**

**Option 1: Card**
- **Icon:** Credit card icon
- **Label:** "Card"
- **Style:** Card button
- **Selected:** Border highlight, background tint

**Option 2: Cash**
- **Icon:** Dollar sign icon
- **Label:** "Cash"
- **Style:** Card button
- **Selected:** Border highlight, background tint

**Note:** Cash option only available for onsite classes/activities

---

**Card Payment Form (if Card selected):**

**Card Number Field:**

**Label:**
- Text: "Card Number"
- Style: Form label

**Input:**
- **Placeholder:** "1234 5678 9012 3456"
- **Type:** Text input with formatting
- **Format:** Auto-formats as user types (XXXX XXXX XXXX XXXX)
- **Max Length:** 19 characters (with spaces)
- **Validation:** Valid card number format
- **Required:** Yes (if Card selected)

**Card Type Indicators:**
- **Label:** "Accepted cards:"
- **Icons:** Visa, Mastercard, Amex, Discover logos
- **Active State:** Highlights detected card type

---

**Expiry Field:**

**Label:**
- Text: "Expiry"
- Style: Form label

**Input:**
- **Placeholder:** "MM/YY"
- **Type:** Text input with formatting
- **Format:** Auto-formats as MM/YY
- **Max Length:** 5 characters
- **Validation:** Valid expiry date (not expired)
- **Required:** Yes (if Card selected)

---

**CVC Field:**

**Label:**
- Text: "CVC"
- Style: Form label

**Input:**
- **Placeholder:** "123"
- **Type:** Password input (masked)
- **Max Length:** 3-4 characters (depending on card type)
- **Validation:** Numeric only
- **Required:** Yes (if Card selected)

**Help Text:**
- "3 digits on the back of your card"

---

**Cash Payment Info (if Cash selected):**

**Info Box:**
- **Background:** Muted background with border
- **Icon:** Info icon
- **Title:** "Cash Payment Available"
- **Description:**
  - "You can pay in cash before the first lesson on [Date]."
  - "Your enrollment will be confirmed after payment."
- **Style:** Informational, friendly tone

---

#### Step 3: Payment Breakdown Display

**Section Title:**
- Text: "Example Payment Breakdown"
- Style: Section heading, bold

**Breakdown Card:**

**Background:** Muted background with border
**Padding:** Comfortable padding

**Content:**

**Row 1: Gross Payment**
- **Label:** "Gross Payment"
- **Value:** "$X.00"
- **Style:** Regular text

**Row 2: Processing Fee**
- **Label:** "Processing Fee (4%)"
- **Value:** "-$Y.00"
- **Style:** Orange/red color, negative value

**Divider:** Horizontal line

**Row 3: You Receive (for creators) / Total (for users)**
- **Label:** "You Receive" (creator) / "Total" (user)
- **Value:** "$Z.00"
- **Style:** Large, bold, primary/green color

**Calculation:**
- Updates automatically as price changes
- Shows real-time calculation

**Example Display:**
```
Example Payment Breakdown
─────────────────────────
Gross Payment:        $100.00
Processing Fee (4%):  -$4.00
─────────────────────────
You Receive:          $96.00
```

---

#### Step 4: Total Display

**Total Row:**

**Label:**
- Text: "Total"
- Style: Bold, medium size

**Value:**
- Text: "$X.00"
- Style: Large, bold, primary color

**Position:** Below payment breakdown, above buttons

---

#### Step 5: Payment Actions

**Cancel Button:**
- **Text:** "Cancel"
- **Style:** Outline button
- **Action:** Closes dialog, returns to detail page

**Pay Button:**
- **Text:** "Pay $X"
- **Style:** Primary button
- **Loading State:** "Processing..."
- **Disabled:** Until all required fields filled
- **Action:** Processes payment

---

#### Step 6: Payment Processing

**Loading State:**

**Dialog Content:**
- **Spinner:** Large loading spinner
- **Text:** "Processing payment..."
- **Subtext:** "Please wait"

---

#### Step 7: Payment Success

**Success Dialog:**

**Icon:**
- Check circle icon (large, green)
- Animated: Scale in animation

**Title:**
- Text: "Payment Successful!"
- Style: Large, bold, centered

**Message:**
- Text: "Your enrollment is confirmed"
- Style: Medium text, centered

**Class/Activity Info Card:**
- Shows class/activity name
- Shows date and time
- Shows location
- "Payment Completed" badge

**Payment Details:**
- Amount charged
- Payment method
- Invoice number
- Transaction date

**Actions:**

**View Ticket Button (if QR code generated):**
- **Text:** "View QR Code Ticket"
- **Icon:** QR code icon
- **Style:** Outline button
- **Action:** Shows ticket with QR code

**Done Button:**
- **Text:** "Done" or "Back to Details"
- **Style:** Primary button
- **Action:** Closes dialog, returns to detail page

---

### Revenue Display (For Creators)

**Revenue Dashboard:**

**Page Title:**
- Text: "Revenue Split"
- Style: Page heading

**Description:**
- Text: "See how your revenue is distributed. When a user pays $100 for a class/event:"
- Style: Description text

---

**Payment Breakdown Card:**

**Title:**
- Text: "Payment Breakdown"
- Style: Card title

**Content:**
- **User Pays:** "$100.00"
- **Processing Fee (4%):** "-$4.00"
- **You Receive:** "$96.00"

**Visual:**
- Color-coded (green for receive, orange for fee)
- Clear typography hierarchy

---

**Total Revenue Card:**

**Title:**
- Text: "Total Revenue"
- **Icon:** Dollar sign icon
- Style: Card header

**Amount:**
- Text: "$X,XXX"
- Style: Large, bold number

**Subtitle:**
- Text: "This month"
- Style: Small, muted text

---

**Processing Fee Card:**

**Title:**
- Text: "Processing Fee"
- **Icon:** Percent icon
- Style: Card header

**Percentage:**
- Text: "4%"
- Style: Large, bold number

**Subtitle:**
- Text: "Total processing fee"
- Style: Small, muted text

---

**Example Payment Breakdown Card:**

**Title:**
- Text: "Example Payment Breakdown"
- Style: Card title

**Description:**
- Text: "How a $100 payment is distributed"
- Style: Card description

**Content:**

**Gross Payment Section:**
- **Background:** Blue/purple gradient tint
- **Label:** "Gross Payment (User pays)"
- **Amount:** "$100.00"
- **Style:** Large, bold, blue color

**Processing Fee Section:**
- **Background:** Orange/red tint
- **Label:** "Processing Fee"
- **Subtext:** "4% of gross amount"
- **Amount:** "-$4.00"
- **Style:** Medium, orange/red color

**You Receive Section:**
- **Background:** Primary color tint
- **Border:** Thick border, primary color
- **Label:** "Your Payout"
- **Subtext:** "Amount you receive"
- **Amount:** "$96.00"
- **Style:** Extra large, bold, primary color

---

## QR Code System

### QR Code Generation

**When QR Code is Created:**

**Triggers:**
- User enrolls in class with physical location (onsite or hybrid)
- User joins activity with physical location
- User purchases ticket for event with physical location

**Automatic Generation:**
- QR code generated immediately after enrollment/payment
- Unique QR code per enrollment/ticket
- Contains: Ticket ID, User ID, Event/Class ID, Timestamp, Validation hash

---

### QR Code Display

**Location:** Ticket detail page, Class detail page (if enrolled), Activity detail page (if joined)

**QR Code Card:**

**Card Layout:**
- **Background:** White/light background
- **Border:** Border around QR code
- **Padding:** Comfortable padding

**Title:**
- Text: "Your Entry QR Code"
- Style: Card title, centered

**QR Code Image:**
- **Size:** Large (200x200px minimum)
- **Format:** Square QR code
- **Background:** White
- **Foreground:** Black/dark
- **Padding:** White space around code
- **Position:** Centered

**Ticket Number:**
- **Label:** "Ticket Number"
- **Value:** "ABC123XYZ" (alphanumeric code)
- **Style:** Monospace font, medium size
- **Position:** Below QR code

**Instructions:**
- Text: "Show this QR code at the entrance"
- Style: Small text, muted color
- Position: Below ticket number

**Event/Class Info:**
- **Name:** Class/Activity/Event name
- **Date:** Formatted date
- **Time:** Formatted time
- **Location:** Venue name and address
- **Style:** Small text, organized layout

**Status Badge:**
- **Not Checked In:** "Not Checked In" (gray badge)
- **Checked In:** "Checked In at [time]" (green badge)

---

### Check-In Process

**For Users:**

**Check-In Status Display:**

**On Ticket/Class Detail Page:**
- **Status:** "Not Checked In" / "Checked In"
- **Check-In Time:** Display when checked in
- **Location:** "Checked in at [venue name]"

**Instructions:**
- Text: "Present your QR code at check-in"
- Style: Info text

---

**For Venues/Instructors:**

**Check-In Page:**

**Page Title:**
- Text: "Check-In"
- Style: Page heading

**Scanner Interface:**

**Camera View:**
- **Display:** Live camera feed
- **Scanning Frame:** Square frame in center
- **Instructions:** "Position QR code within frame"
- **Style:** Full screen or large modal

**Scan Button:**
- **Text:** "Scan QR Code"
- **Icon:** QR code scanner icon
- **Style:** Primary button, large
- **Action:** Activates scanner

**Manual Entry Option:**
- **Link:** "Enter ticket number manually"
- **Input:** Ticket number input field
- **Action:** Validates and checks in

**Success Feedback:**
- **Message:** "Check-in successful!"
- **Sound:** Success sound (optional)
- **Visual:** Green checkmark animation

**Attendee List:**

**Title:**
- Text: "Checked-In Attendees"
- Style: Section heading

**List Display:**
- **Columns:** Name, Check-in Time, Ticket Number
- **Search:** Search by name or ticket number
- **Filter:** Filter by check-in status

**Stats:**
- **Text:** "X / Y checked in"
- **Style:** Stats display

---

**QR Code Content:**

**QR Code Contains (encoded):**
- Ticket ID (unique identifier)
- User ID
- Event/Class ID
- Enrollment ID
- Timestamp
- Validation hash (security)

**QR Code Display Text:**
- "Scan this code at the entrance"
- "Valid for [Event Name]"
- "Do not share this code"
- "One-time use only"

---

**Error Messages:**

**QR Code Expired:**
- **Message:** "QR code expired"
- **Subtext:** "This code is no longer valid"
- **Action:** Contact support

**QR Code Already Used:**
- **Message:** "QR code already used"
- **Subtext:** "This code was scanned at [time]"
- **Action:** Check attendee list

**Invalid QR Code:**
- **Message:** "Invalid QR code"
- **Subtext:** "Please check your ticket"
- **Action:** View ticket details

**Event Not Found:**
- **Message:** "Event not found"
- **Subtext:** "This QR code is not associated with any event"
- **Action:** Contact support

---

## Follow System

### Who Can Be Followed

**User Types That Can Be Followed:**

1. **Entrepreneur** 👔
   - **Badge:** "Entrepreneur"
   - **Description:** Business owners, startup founders
   - **Followable:** Yes

2. **Instructor** 🎓
   - **Badge:** "Instructor"
   - **Description:** Teachers, coaches, mentors
   - **Followable:** Yes

3. **Teacher** 📚
   - **Badge:** "Teacher"
   - **Description:** Educators, trainers
   - **Followable:** Yes

4. **Influencer** ⭐
   - **Badge:** "Influencer"
   - **Description:** Content creators, social media influencers
   - **Followable:** Yes

5. **Venue** 🏢
   - **Badge:** "Venue"
   - **Description:** Venue accounts
   - **Followable:** Yes

6. **Regular Users** 👤
   - **Badge:** None (or "Member")
   - **Description:** All users
   - **Followable:** Yes

---

### Follow Button States

**Not Following State:**

**Button:**
- **Text:** "Follow"
- **Icon:** Plus icon or user-plus icon
- **Style:** Primary button or outline button
- **Action:** Follows the user
- **Color:** Primary color

**After Click:**
- **Text:** "Following"
- **Icon:** Check icon
- **Style:** Secondary/outline button
- **Action:** Unfollows the user
- **Color:** Muted/secondary color

---

**Following State:**

**Button:**
- **Text:** "Following"
- **Icon:** Check icon
- **Style:** Secondary button
- **Hover State:** "Unfollow" (red/destructive)
- **Action:** Unfollows the user

---

**Mutual Follow:**

**Badge:**
- **Text:** "Mutual"
- **Style:** Small badge, primary color
- **Position:** Near follow button or profile

**Tooltip:**
- "You follow each other"

---

### Follow Status Display

**On Profile Page:**

**Stats Display:**
- **Followers:** "X Followers"
- **Following:** "X Following"
- **Style:** Large numbers, clickable
- **Action:** Opens followers/following list

**Follow Button:**
- **Position:** Prominent, below profile info
- **Size:** Large button
- **States:** Follow / Following / Mutual

---

**On User Cards:**

**User Card Content:**
- User avatar
- User name
- User type badge (if applicable)
- Follow status badge or button
- Mutual connections count (if any)

**Follow Status:**
- **Following:** "Following" badge (green/primary)
- **Not Following:** "Follow" button
- **Mutual:** "Mutual" badge

---

### Follow Notifications

**When Someone Follows You:**

**Notification:**
- **Title:** "[User Name] started following you"
- **Avatar:** User's profile picture
- **Time:** "2 minutes ago"
- **Action Button:** "View Profile"
- **Dismiss:** X button

**Notification Settings:**
- Can enable/disable follow notifications
- Can set notification frequency

---

**When You Follow Someone:**

**Confirmation Toast:**
- **Message:** "You're now following [User Name]"
- **Subtext:** "You'll see their activities in your feed"
- **Duration:** 3 seconds
- **Action:** "Undo" (unfollows immediately)

---

### Following Feed

**Feed Title:**
- Text: "Following"
- Style: Page/section heading

**Content Shown:**
- Activities created by people you follow
- Classes created by instructors you follow
- Posts from venues you follow
- Updates from influencers you follow
- Stories from people you follow

**Empty State:**
- **Icon:** User-plus icon
- **Title:** "Follow people to see their activities"
- **Description:** "When you follow someone, their activities will appear here"
- **CTA Button:** "Discover People to Follow"

**Loading State:**
- **Text:** "Loading activities from people you follow..."

---

### Follow Suggestions

**Section Title:**
- Text: "People You May Know"
- Style: Section heading

**Suggestion Criteria:**
- Mutual connections
- Similar interests
- Same location
- Activities attended together
- Classes enrolled together

**Suggested User Card:**

**Card Content:**
- User avatar (large)
- User name (bold)
- User type badge (if applicable)
- Mutual connections count: "X mutual connections"
- Common interests: "Interested in: [interests]"
- **Follow Button:** "Follow"

**Card Actions:**
- **Follow:** Follows the user
- **Dismiss:** "Not interested" (removes from suggestions)
- **View Profile:** Opens user profile

**Refresh Button:**
- **Text:** "Refresh Suggestions"
- **Style:** Link or small button
- **Action:** Loads new suggestions

---

## Sponsored Ads

### Ad Display Rules

**Ad Frequency:**
- Maximum 1 ad per 5 organic posts
- Can be adjusted in user settings
- Premium users see fewer ads (or no ads)

**Ad Placement:**
- Between organic content in feeds
- Not as first item
- Not as last item
- Distributed evenly throughout feed

---

### Ad Types

#### Reel Ad (Vertical Video)

**Format:**
- **Aspect Ratio:** 9:16 (vertical)
- **Duration:** 15-60 seconds
- **Type:** Video ad

**Content Elements:**

**Sponsored Badge:**
- **Text:** "Sponsored"
- **Position:** Top-right corner
- **Style:** Small badge, distinct color (orange/yellow)
- **Size:** Small, non-intrusive

**Video Content:**
- Vertical video
- Auto-plays (muted initially)
- User can unmute
- User can skip after 5 seconds

**Title/Headline:**
- **Position:** Overlay on video or below
- **Style:** Bold, readable
- **Max Length:** 50 characters

**Call-to-Action Button:**
- **Text:** "Learn More" / "Sign Up" / "Download"
- **Style:** Prominent button, primary color
- **Position:** Bottom of video or overlay

**Advertiser Name:**
- **Position:** Below video or in corner
- **Style:** Small text, muted color
- **Format:** "Ad by [Brand Name]"

---

#### Post Ad (Image/Video)

**Format:**
- **Aspect Ratio:** 1:1 (square) or 4:5 (vertical)
- **Type:** Image or video post

**Content Elements:**

**Sponsored Badge:**
- **Text:** "Sponsored"
- **Position:** Top-right corner
- **Style:** Small badge, distinct color

**Image/Video:**
- High-quality visual
- Same format as regular posts
- Engaging content

**Caption:**
- **Style:** Post caption format
- **Length:** Similar to regular posts
- **Content:** Promotional message

**Call-to-Action Button:**
- **Text:** "Learn More" / "Shop Now" / "Sign Up"
- **Style:** Button below post
- **Action:** Opens advertiser page or website

**Advertiser Name:**
- **Position:** Below post or in caption
- **Style:** "Ad by [Brand Name]"

---

### Ad Interaction

**Ad Dismissal:**

**Hide Ad Button:**
- **Text:** "Hide Ad" or "Not Interested"
- **Icon:** X icon or thumbs down
- **Position:** Top-right corner or menu
- **Action:** Hides ad, shows fewer similar ads

**Dismissal Confirmation:**
- **Message:** "Ad hidden. We'll show you fewer ads like this."
- **Duration:** 3 seconds
- **Undo Option:** "Undo" (shows ad again)

---

**Ad Settings:**

**Settings Page:**

**Section Title:**
- Text: "Ad Preferences"
- Style: Section heading

**Options:**

**Ad Frequency:**
- **Label:** "Ad Frequency"
- **Options:**
  - "Normal" (1 ad per 5 posts)
  - "Fewer" (1 ad per 10 posts)
  - "Minimal" (1 ad per 20 posts)
- **Note:** "Premium users see no ads"

**Ad Topics:**
- **Label:** "Hide ads about:"
- **Options:** Select topics to hide
- **Help:** "We'll show you fewer ads about these topics"

**Reset Preferences:**
- **Button:** "Reset Ad Preferences"
- **Action:** Resets all ad settings

---

### Ad Content Guidelines

**For Advertisers:**

**Ad Requirements:**
- Clear, honest messaging
- No misleading claims
- Complies with advertising standards
- Appropriate content for all ages
- No spam or scams

**Ad Approval:**
- Ads reviewed before publication
- May be rejected if doesn't meet standards
- Advertiser notified of approval/rejection

---

## Content Examples for Web Designers

### Class Creation Page - Complete Content

**Page Structure:**

```
┌─────────────────────────────────────┐
│ [X]  Create an Expert-Led Class     │ ← Header
├─────────────────────────────────────┤
│                                     │
│ Share real experience, not theory. │ ← Subtitle
│ Teach what you've actually built... │
│                                     │
│ ┌───────────────────────────────┐  │
│ │  [Camera Icon]                │  │ ← Image Upload
│ │  Add class photo (optional)   │  │
│ └───────────────────────────────┘  │
│                                     │
│ Basic Information                   │ ← Section Header
│ ──────────────────────             │
│                                     │
│ Class Title *                       │ ← Label
│ [e.g., Introduction to...]         │ ← Input
│ Choose a clear, descriptive title   │ ← Help Text
│                                     │
│ Description *                       │
│ [Tell students what...]            │
│ [50-1000 characters]              │ ← Character Counter
│                                     │
│ What skill are you teaching? *      │
│ [Select category ▼]                │ ← Dropdown
│                                     │
│ ────────────────────────────────── │
│                                     │
│ Class Type & Location              │ ← Section
│ ──────────────────────            │
│                                     │
│ How will you teach? *              │
│ ( ) Online  ( ) Onsite  ( ) Hybrid │ ← Radio Buttons
│                                     │
│ [If Online:]                        │
│ Meeting Platform *                  │
│ [Select platform ▼]                │
│                                     │
│ Meeting Link *                      │
│ [https://zoom.us/j/...]            │
│ Link will be shared with students  │ ← Help Text
│                                     │
│ ────────────────────────────────── │
│                                     │
│ Schedule & Duration                 │ ← Section
│ ──────────────────────             │
│                                     │
│ When does the class start? *        │
│ [Select date] [Select time]         │ ← Date/Time Pickers
│                                     │
│ How often? *                        │
│ ( ) Once  ( ) Weekly  ( ) Custom   │
│                                     │
│ [If Custom:]                        │
│ Select Days:                        │
│ [Mon] [Tue] [Wed] [Thu] [Fri]      │ ← Day Buttons
│ [Sat] [Sun]                         │
│                                     │
│ [Add Lessons]                       │ ← Button
│                                     │
│ ────────────────────────────────── │
│                                     │
│ Capacity & Pricing                  │ ← Section
│ ──────────────────────             │
│                                     │
│ Max Students                        │
│ [e.g., 20]                          │
│ Leave empty for unlimited           │ ← Help Text
│                                     │
│ Pricing *                           │
│ ( ) Free  ( ) Paid                  │ ← Radio Buttons
│                                     │
│ [If Paid:]                          │
│ Price *                             │
│ $ [50]                              │ ← Number Input
│ +4% processing fee applies           │ ← Help Text
│                                     │
│ ┌───────────────────────────────┐ │
│ │ Example Payment Breakdown      │ │ ← Breakdown Card
│ │ Gross Payment:      $50.00     │ │
│ │ Processing Fee (4%): -$2.00   │ │
│ │ You Receive:        $48.00     │ │
│ └───────────────────────────────┘ │
│                                     │
│ ────────────────────────────────── │
│                                     │
│ Premium Options                     │ ← Section
│ ──────────────────────             │
│                                     │
│ [Toggle] Premium Class             │ ← Toggle Switch
│ Highlight your expertise            │
│                                     │
│ [Toggle] Exclusive Class            │
│ Limited access, invite-only         │
│                                     │
│ ────────────────────────────────── │
│                                     │
│ [Cancel]  [Create Class]            │ ← Action Buttons
└─────────────────────────────────────┘
```

---

### Activity Creation Page - Complete Content

**Page Structure:**

```
┌─────────────────────────────────────┐
│ [X]  Create Activity        Step 1/5 │ ← Header + Progress
├─────────────────────────────────────┤
│                                     │
│ Step 1: Category                    │ ← Step Label
│                                     │
│ What type of activity?               │ ← Title
│                                     │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │ ☕   │ │ 🍽️   │ │ 🎾   │         │ ← Category Cards
│ │Coffee│ │Dining│ │Sports│         │
│ └──────┘ └──────┘ └──────┘         │
│                                     │
│ ┌──────┐ ┌──────┐ ┌──────┐         │
│ │ 🎬   │ │ 🧘   │ │ 🎨   │         │
│ │Cinema│ │Wellness│Activities│      │
│ └──────┘ └──────┘ └──────┘         │
│                                     │
│ [Back]  [Next]                      │ ← Navigation
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [←]  Create Activity        Step 2/5 │
├─────────────────────────────────────┤
│                                     │
│ Step 2: Details                      │
│                                     │
│ Activity Title *                    │
│ [e.g., Coffee Meetup at...]         │
│ Choose a clear, specific title      │ ← Help Text
│                                     │
│ Description *                        │
│ [Tell people what...]               │
│ [20-500 characters]                 │ ← Character Counter
│                                     │
│ [Back]  [Next]                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [←]  Create Activity        Step 3/5 │
├─────────────────────────────────────┤
│                                     │
│ Step 3: Location                    │
│                                     │
│ Where will this happen?             │
│                                     │
│ [Search venues...]                  │ ← Search Input
│                                     │
│ ┌───────────────────────────────┐  │
│ │ [Venue Image]                  │  │ ← Venue Cards
│ │ Panther Coffee, Wynwood        │  │
│ │ 2390 NW 2nd Ave, Miami         │  │
│ │ ⭐ 4.8 (342 reviews)          │  │
│ │ [Select] [View Details]        │  │
│ └───────────────────────────────┘  │
│                                     │
│ Or enter custom address             │ ← Link
│ [Enter address]                     │ ← Input (if custom)
│                                     │
│ [Back]  [Next]                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [←]  Create Activity        Step 4/5 │
├─────────────────────────────────────┤
│                                     │
│ Step 4: Date & Time                 │
│                                     │
│ When? *                             │
│ [Select date]                       │ ← Date Picker
│ Select the date for your activity   │ ← Help Text
│                                     │
│ What time? *                        │
│ [Select time]                       │ ← Time Picker
│ Select the start time               │ ← Help Text
│                                     │
│ [Back]  [Next]                      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ [←]  Create Activity        Step 5/5 │
├─────────────────────────────────────┤
│                                     │
│ Step 5: Settings                    │
│                                     │
│ How many people? *                  │
│ ┌──────┐ ┌──────┐ ┌──────┐        │
│ │ 👥   │ │ 👥👥 │ │ 👥👥👥│        │ ← Group Size
│ │1-on-1│ │2-4   │ │4+    │        │
│ └──────┘ └──────┘ └──────┘        │
│                                     │
│ ⚠️ If >10, Event mode recommended   │ ← Warning
│                                     │
│ Who can see this? *                 │
│ ( ) 🌐 Public                       │
│     Anyone can see and join         │
│                                     │
│ ( ) 🔒 Private                      │
│     Invite only event               │
│                                     │
│ Pricing *                           │
│ ( ) 💰 Free                         │
│     No cost to attend               │
│                                     │
│ ( ) 💵 Paid                         │
│     Set a price per person          │
│                                     │
│ [If Paid:]                          │
│ Price per person *                  │
│ $ [25]                              │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ Example Payment Breakdown      │  │ ← Breakdown
│ │ Gross Payment:      $25.00     │  │
│ │ Processing Fee (4%): -$1.00   │  │
│ │ You Receive:        $24.00     │  │
│ └───────────────────────────────┘  │
│                                     │
│ [Toggle] Blind Meetup                │ ← Toggle
│ Details hidden until 2 hours before│
│                                     │
│ [Back]  [Create Activity]           │
└─────────────────────────────────────┘
```

---

### Activity/Event Recommendation Modal Content

**Modal Structure:**

```
┌─────────────────────────────────────┐
│                                     │
│        [Ticket Icon]                │ ← Large Icon
│                                     │
│     Event Recommended               │ ← Title
│                                     │
│ Event mode is recommended for       │ ← Description
│ this attendance size. Ticket,       │
│ check-in, and visibility features   │
│ will be enabled.                    │
│                                     │
│ ✅ Ticket management                 │ ← Features List
│ ✅ Agenda/schedule                  │
│ ✅ Enhanced visibility              │
│ ✅ Check-in system                  │
│ ✅ QR code tickets                  │
│                                     │
│ ┌───────────────────────────────┐  │
│ │  [Keep as Activity]            │  │ ← Button 1
│ └───────────────────────────────┘  │
│                                     │
│ ┌───────────────────────────────┐  │
│ │  [Use Event Mode →]            │  │ ← Button 2
│ └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

### Payment Dialog Content

**Dialog Structure:**

```
┌─────────────────────────────────────┐
│ Complete Payment              [X]    │ ← Dialog Header
├─────────────────────────────────────┤
│ Pay $100 to enroll in Web Dev Class │ ← Description
│                                     │
│ Payment Method *                    │
│ ┌──────────┐ ┌──────────┐          │
│ │ [Card]   │ │ [Cash]   │          │ ← Method Selection
│ │ 💳 Card  │ │ 💵 Cash  │          │
│ └──────────┘ └──────────┘          │
│                                     │
│ [If Card selected:]                 │
│ Card Number *                       │
│ [1234 5678 9012 3456]              │ ← Card Input
│ Accepted: Visa Mastercard Amex      │ ← Card Types
│                                     │
│ Expiry *        CVC *               │
│ [MM/YY]         [123]              │ ← Expiry & CVC
│                                     │
│ [If Cash selected:]                 │
│ ┌───────────────────────────────┐  │
│ │ ℹ️ Cash Payment Available      │  │ ← Info Box
│ │ You can pay in cash before     │  │
│ │ the first lesson on [Date].    │  │
│ └───────────────────────────────┘  │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ Example Payment Breakdown      │  │ ← Breakdown Card
│ │ Gross Payment:      $100.00    │  │
│ │ Processing Fee (4%): -$4.00   │  │
│ │ You Receive:        $96.00      │  │
│ └───────────────────────────────┘  │
│                                     │
│ Total:                    $100.00   │ ← Total
│                                     │
│ [Cancel]  [Pay $100]                │ ← Buttons
└─────────────────────────────────────┘
```

---

### QR Code Display Content

**QR Code Card Structure:**

```
┌─────────────────────────────────────┐
│                                     │
│     Your Entry QR Code              │ ← Title
│                                     │
│     ┌───────────────┐               │
│     │               │               │
│     │   [QR CODE]   │               │ ← QR Code Image
│     │               │               │
│     └───────────────┘               │
│                                     │
│     Ticket #ABC123XYZ                │ ← Ticket Number
│                                     │
│ Show this QR code at the entrance   │ ← Instructions
│                                     │
│ ─────────────────────────────────── │
│                                     │
│ Web Development Class               │ ← Event Info
│ Saturday, Feb 1, 2026               │
│ 2:00 PM                             │
│ Tech Hub, San Francisco             │
│                                     │
│ Status: Not Checked In               │ ← Status Badge
│                                     │
│ [View Full Ticket]                  │ ← Button
└─────────────────────────────────────┘
```

---

### Follow System Content

**Follow Button States:**

```
Not Following:
┌──────────────┐
│ + Follow     │ ← Primary button, plus icon
└──────────────┘

Following:
┌──────────────┐
│ ✓ Following  │ ← Secondary button, check icon
└──────────────┘
   (hover: "Unfollow" in red)

Mutual:
┌──────────────┐
│ ✓ Following  │ ← Button + "Mutual" badge
│ [Mutual]     │
└──────────────┘
```

**Profile Follow Stats:**

```
┌─────────────────────────────────────┐
│ [User Avatar]                        │
│ John Doe                             │
│ Entrepreneur                         │
│                                     │
│ ┌──────────┐  ┌──────────┐         │
│ │  1,234   │  │    567   │         │ ← Stats
│ │Followers │  │ Following│         │
│ └──────────┘  └──────────┘         │
│                                     │
│ [Follow] or [Following]             │ ← Follow Button
└─────────────────────────────────────┘
```

---

### Sponsored Ad Content

**Reel Ad Structure:**

```
┌─────────────────────────────────────┐
│                    [Sponsored]        │ ← Badge
│                                     │
│                                     │
│        [Vertical Video]             │ ← Video Content
│                                     │
│                                     │
│     Discover Amazing Classes        │ ← Title/Headline
│                                     │
│     [Learn More]                    │ ← CTA Button
│                                     │
│ Ad by Ulikme Premium                │ ← Advertiser
└─────────────────────────────────────┘
```

**Post Ad Structure:**

```
┌─────────────────────────────────────┐
│                    [Sponsored]        │ ← Badge
│                                     │
│ ┌─────────────────────────────────┐  │
│ │                                 │  │
│ │      [Ad Image/Video]           │  │ ← Visual
│ │                                 │  │
│ └─────────────────────────────────┘  │
│                                     │
│ Special offer: 20% off first class  │ ← Caption
│ Join thousands learning new skills  │
│                                     │
│ [Learn More]                        │ ← CTA Button
│                                     │
│ Ad by Partner Brand                 │ ← Advertiser
│                                     │
│ [Hide Ad] [Not Interested]          │ ← Dismiss Options
└─────────────────────────────────────┘
```

---

## Summary

### Key Content Requirements

1. **Clear Labels** - All form fields have descriptive labels
2. **Help Text** - Guidance for each input field
3. **Placeholders** - Example values in input fields
4. **Validation Messages** - Clear error messages
5. **Success Messages** - Confirmation of actions
6. **Empty States** - Messages when no content
7. **Loading States** - Progress indicators
8. **Payment Breakdown** - Transparent fee display (4%)
9. **QR Code Instructions** - Clear usage instructions
10. **Follow System** - Intuitive follow/unfollow states

### Content Consistency

- **Terminology:** Use consistent terms (Activity, Event, Class)
- **Tone:** Friendly, professional, helpful
- **Length:** Concise but complete
- **Format:** Clear hierarchy, readable fonts
- **Accessibility:** Screen reader friendly, proper labels

---

**Document Owner:** Content Team  
**Last Review:** January 24, 2026  
**Next Review:** Weekly during development
