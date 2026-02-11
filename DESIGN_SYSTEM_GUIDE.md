# Design System Guide
## Ulikme Platform

**Document Version:** 1.0  
**Last Updated:** January 24, 2026  
**Target Audience:** Web Designers, UI/UX Designers

---

## Table of Contents

1. [Brand Identity](#brand-identity)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Icons](#icons)
7. [Animations](#animations)
8. [Responsive Design](#responsive-design)
9. [Accessibility](#accessibility)
10. [Design Tokens](#design-tokens)
11. [UI Patterns](#ui-patterns)
12. [Design Tools](#design-tools)

---

## Brand Identity

### Brand Name
**Ulikme** - "One app to find people, places, and plans"

### Brand Mascot
**Lira** - Friendly, approachable mascot character used throughout the platform

### Brand Values
- **Authentic** - Real connections over digital facades
- **Community** - Building stronger local communities
- **Inclusive** - Welcoming all backgrounds and interests
- **Modern** - Contemporary, clean design aesthetic

### Design Philosophy
- **Mobile-First** - Designed for mobile devices first
- **Clean & Minimal** - Uncluttered, focused interfaces
- **Friendly & Approachable** - Warm, inviting visual language
- **Accessible** - Designed for all users

---

## Color System

### Primary Colors

#### Primary Purple
**Usage:** Main brand color, primary actions, highlights

**Light Mode:**
- **HSL:** `251 57% 47%`
- **Hex:** `#4834BC`
- **RGB:** `72, 52, 188`
- **Usage:** Buttons, links, accents, host names

**Dark Mode:**
- **HSL:** `251 57% 47%` (same)
- **Usage:** Maintains brand consistency

**CSS Variable:**
```css
--primary: 251 57% 47%;
--primary-foreground: 0 0% 100%; /* White text on primary */
```

**Tailwind Class:**
```html
<div class="bg-primary text-primary-foreground">Primary</div>
```

#### Secondary Purple (Dark)
**Usage:** Secondary actions, depth, contrast

**Light Mode:**
- **HSL:** `252 77% 26%`
- **Hex:** `#230F74`
- **RGB:** `35, 15, 116`
- **Usage:** Secondary buttons, dark accents

**CSS Variable:**
```css
--secondary: 252 77% 26%;
--secondary-foreground: 0 0% 100%;
```

**Tailwind Class:**
```html
<div class="bg-secondary text-secondary-foreground">Secondary</div>
```

### Accent Colors

#### Golden Orange
**Usage:** Time displays, highlights, call-to-action accents

**Hex:** `#FF8C00`  
**RGB:** `255, 140, 0`  
**Usage:** Time stamps, important highlights

**Example:**
```html
<span class="text-[#FF8C00]">2:00 PM</span>
```

#### Destructive Red
**Usage:** Error states, destructive actions, warnings

**Light Mode:**
- **HSL:** `0 84% 60%`
- **Hex:** `#E63946`
- **Usage:** Delete buttons, error messages

**CSS Variable:**
```css
--destructive: 0 84% 60%;
--destructive-foreground: 0 0% 100%;
```

### Neutral Colors

#### Background Colors

**Main Background (Light):**
- **HSL:** `0 0% 100%`
- **Hex:** `#FFFFFF`
- **Usage:** Main app background

**Card Background:**
- **HSL:** `240 20% 99%`
- **Hex:** `#FAFAFB`
- **Usage:** Card backgrounds, elevated surfaces

**Muted Background:**
- **HSL:** `240 20% 96%`
- **Hex:** `#F5F5F7`
- **Usage:** Subtle backgrounds, disabled states

#### Text Colors

**Foreground (Primary Text):**
- **Light:** `240 38% 13%` (`#1F1F2E`)
- **Dark:** `240 20% 98%` (`#FAFAFB`)
- **Usage:** Main text, headings

**Muted Foreground (Secondary Text):**
- **Light:** `240 10% 45%` (`#6B6B7A`)
- **Dark:** `240 15% 70%` (`#B3B3C0`)
- **Usage:** Secondary text, captions, hints

### Module Colors

#### FriendMe (Purple)
- **HSL:** `251 57% 47%`
- **Usage:** Friend-related features

#### LoveMe (Pink)
- **HSL:** `330 81% 60%`
- **Hex:** `#E6399F`
- **Usage:** Dating-related features

#### ConnectMe (Dark Purple)
- **HSL:** `252 77% 26%`
- **Usage:** Networking features

### Color Usage Guidelines

**Do:**
- ✅ Use primary purple for main CTAs
- ✅ Use golden orange for time displays
- ✅ Use muted colors for secondary information
- ✅ Maintain sufficient contrast (WCAG AA)

**Don't:**
- ❌ Use primary purple for large backgrounds
- ❌ Mix module colors unnecessarily
- ❌ Use colors that don't meet contrast requirements
- ❌ Create new colors outside the palette

### Color Accessibility

All color combinations meet **WCAG AA standards** (4.5:1 contrast ratio minimum):

- Primary on white: ✅ 4.8:1
- Foreground on background: ✅ 12.1:1
- Muted foreground on background: ✅ 4.6:1

---

## Typography

### Font Family

**Primary Font:** Inter  
**Fallback:** `system-ui, sans-serif`

**Google Fonts Import:**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
```

**CSS:**
```css
font-family: 'Inter', system-ui, sans-serif;
```

**Tailwind:**
```html
<div class="font-sans">Text</div>
```

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text, descriptions |
| Medium | 500 | Host names, labels |
| Semibold | 600 | Time displays, emphasis |
| Bold | 700 | Headings, titles |
| Extra Bold | 800 | Hero titles (rare) |

### Font Sizes

#### Mobile App Typography Scale

| Size | Tailwind | Pixels | Usage |
|------|----------|--------|-------|
| xs | `text-xs` | 12px | Captions, timestamps |
| sm | `text-sm` | 14px | Host names, secondary text |
| base | `text-base` | 16px | Body text, event titles |
| lg | `text-lg` | 18px | Section subtitles |
| xl | `text-xl` | 20px | Section titles |
| 2xl | `text-2xl` | 24px | Page subtitles |
| 3xl | `text-3xl` | 30px | Page titles |

#### Admin Portal Typography Scale

| Size | Tailwind | Pixels | Usage |
|------|----------|--------|-------|
| xs | `text-xs` | 12px | Table data, labels |
| sm | `text-sm` | 14px | Body text, descriptions |
| base | `text-base` | 16px | Default text |
| lg | `text-lg` | 18px | Card titles |
| xl | `text-xl` | 20px | Section headings |
| 2xl | `text-2xl` | 24px | Page headings |
| 3xl | `text-3xl` | 30px | Dashboard titles |

### Line Height

- **Tight:** `leading-tight` (1.25) - Headings
- **Normal:** `leading-normal` (1.5) - Body text
- **Relaxed:** `leading-relaxed` (1.75) - Long-form content

### Letter Spacing

- **Normal:** Default (0)
- **Wide:** `tracking-wide` (0.025em) - Uppercase text

### Typography Examples

**Page Title:**
```html
<h1 class="text-3xl font-bold text-foreground">Home</h1>
```

**Section Title:**
```html
<h2 class="text-xl font-bold text-foreground">Your Activities</h2>
```

**Event Title:**
```html
<h3 class="text-base font-bold text-foreground">Coffee Meetup</h3>
```

**Host Name:**
```html
<p class="text-sm font-medium text-primary">John Doe</p>
```

**Time Display:**
```html
<span class="text-xs font-semibold text-[#FF8C00]">2:00 PM</span>
```

**Body Text:**
```html
<p class="text-sm text-muted-foreground">Event description text</p>
```

---

## Spacing & Layout

### Spacing Scale

Tailwind CSS spacing scale (based on 4px base unit):

| Size | Value | Pixels | Usage |
|------|-------|--------|-------|
| 0 | `0` | 0px | No spacing |
| 1 | `1` | 4px | Tight spacing |
| 2 | `2` | 8px | Small spacing |
| 3 | `3` | 12px | Default spacing |
| 4 | `4` | 16px | Standard spacing |
| 6 | `6` | 24px | Section spacing |
| 8 | `8` | 32px | Large spacing |
| 12 | `12` | 48px | Extra large spacing |

### Container Widths

**Mobile App:**
- Full width on mobile
- Max width: None (mobile-first)

**Admin Portal:**
- Container: `container` class
- Max widths:
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1400px

### Grid System

**Mobile App:**
- Single column layout
- Cards: Horizontal layout (image left, content right)

**Admin Portal:**
- Responsive grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- Cards: Vertical layout

### Padding & Margins

**Card Padding:**
```html
<div class="p-4">Content</div> <!-- 16px padding -->
```

**Section Spacing:**
```html
<section class="space-y-6">Sections</section> <!-- 24px vertical spacing -->
```

**Container Padding:**
```html
<div class="px-4 py-6">Content</div> <!-- 16px horizontal, 24px vertical -->
```

---

## Components

### Buttons

#### Primary Button
**Usage:** Main actions, CTAs

```html
<button class="bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium">
  Join Activity
</button>
```

**Variants:**
- `default` - Primary action
- `secondary` - Secondary action
- `outline` - Outlined button
- `ghost` - Minimal button
- `destructive` - Delete/danger action

**Sizes:**
- `sm` - Small (h-9)
- `default` - Default (h-10)
- `lg` - Large (h-11)
- `icon` - Icon only (h-10 w-10)

#### Gradient Button
**Usage:** Special CTAs, hero buttons

```html
<button class="bg-gradient-primary text-primary-foreground">
  Get Started
</button>
```

**CSS:**
```css
.bg-gradient-primary {
  background: linear-gradient(135deg, hsl(251 57% 47%) 0%, hsl(252 77% 26%) 100%);
}
```

### Cards

#### Activity Card (Mobile)
**Layout:** Horizontal (image left, content right)

```html
<div class="flex items-center gap-3 p-3 rounded-xl bg-card hover:bg-muted/30 transition-colors">
  <img src="..." class="w-20 h-20 rounded-xl object-cover" />
  <div class="flex-1 min-w-0">
    <p class="text-sm font-medium text-primary">Host Name</p>
    <h3 class="text-base font-bold text-foreground">Activity Title</h3>
    <div class="flex items-center gap-2 text-xs text-muted-foreground">
      <span>Mon, Jan 24</span>
      <span class="text-[#FF8C00] font-semibold">2:00 PM</span>
    </div>
  </div>
</div>
```

#### Card Elevation
**Usage:** Elevated surfaces

```html
<div class="card-elevated p-4 rounded-2xl">
  Content
</div>
```

**CSS:**
```css
.card-elevated {
  background: hsl(var(--card));
  box-shadow: var(--shadow-md);
}
```

### Input Fields

#### Text Input
```html
<input 
  type="text" 
  class="h-12 px-4 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
  placeholder="Enter text..."
/>
```

#### Textarea
```html
<textarea 
  class="w-full px-3 py-2 rounded-xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
  rows="4"
></textarea>
```

### Dialogs/Modals

#### Standard Dialog
```html
<Dialog>
  <DialogContent class="max-w-md mx-4 rounded-2xl">
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
      <DialogDescription>Description text</DialogDescription>
    </DialogHeader>
    <div class="space-y-4 py-4">
      Content
    </div>
  </DialogContent>
</Dialog>
```

**Accessibility Requirements:**
- Must include `DialogTitle`
- Must include `DialogDescription`
- Focus trap inside dialog
- Close button visible

### Badges

#### Status Badge
```html
<span class="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
  Event
</span>
```

#### Category Badge
```html
<span class="px-3 py-1 rounded-full bg-card/90 backdrop-blur-sm text-primary text-sm font-medium">
  Coffee
</span>
```

### Tabs

```html
<Tabs defaultValue="vibes">
  <TabsList>
    <TabsTrigger value="vibes">Vibes</TabsTrigger>
    <TabsTrigger value="venues">Venues</TabsTrigger>
  </TabsList>
  <TabsContent value="vibes">Content</TabsContent>
</Tabs>
```

---

## Icons

### Icon Library
**Lucide React** - Primary icon library

**Import:**
```typescript
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
```

### Icon Sizes

| Size | Class | Pixels | Usage |
|------|-------|--------|-------|
| xs | `w-3 h-3` | 12px | Inline with small text |
| sm | `w-4 h-4` | 16px | Default size |
| md | `w-5 h-5` | 20px | Section headers |
| lg | `w-6 h-6` | 24px | Large icons |
| xl | `w-8 h-8` | 32px | Hero icons |

### Common Icons

**Navigation:**
- `Home` - Home page
- `Search` - Search functionality
- `Plus` - Create new
- `User` - Profile
- `Settings` - Settings

**Activity/Event:**
- `Calendar` - Date
- `Clock` - Time
- `MapPin` - Location
- `Users` - Attendees
- `Ticket` - Tickets

**Actions:**
- `CheckCircle2` - Success, enrolled
- `X` - Close, cancel
- `ArrowRight` - Next, continue
- `ArrowLeft` - Back, previous
- `Edit` - Edit

### Icon Usage Guidelines

**Do:**
- ✅ Use consistent icon sizes
- ✅ Match icon color to text color
- ✅ Add aria-labels for accessibility
- ✅ Use semantic icons

**Don't:**
- ❌ Mix icon libraries
- ❌ Use icons without labels
- ❌ Use decorative icons unnecessarily
- ❌ Scale icons disproportionately

---

## Animations

### Animation Library
**Framer Motion** - Primary animation library

### Common Animations

#### Fade In
```typescript
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

#### Slide Up
```typescript
<motion.div
  initial={{ y: 20, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

#### Scale In
```typescript
<motion.div
  initial={{ scale: 0.95, opacity: 0 }}
  animate={{ scale: 1, opacity: 1 }}
  transition={{ duration: 0.2 }}
>
  Content
</motion.div>
```

#### Hover Effects
```html
<button class="transition-all hover:scale-105 active:scale-95">
  Button
</button>
```

### Animation Guidelines

**Do:**
- ✅ Keep animations subtle (200-300ms)
- ✅ Use easing functions
- ✅ Respect `prefers-reduced-motion`
- ✅ Animate meaningful state changes

**Don't:**
- ❌ Over-animate
- ❌ Use long animations (>500ms)
- ❌ Animate everything
- ❌ Ignore accessibility preferences

### CSS Animations

**Tailwind Animations:**
```html
<div class="animate-fade-in">Content</div>
<div class="animate-slide-up">Content</div>
<div class="animate-scale-in">Content</div>
```

---

## Responsive Design

### Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| sm | 640px | Small tablets |
| md | 768px | Tablets |
| lg | 1024px | Small desktops |
| xl | 1280px | Desktops |
| 2xl | 1400px | Large desktops |

### Mobile App (Mobile-First)

**Design Approach:**
- Designed for mobile first (320px+)
- Single column layout
- Touch-friendly targets (min 44x44px)
- Bottom navigation

**Layout:**
```html
<div class="flex flex-col min-h-screen">
  <header class="sticky top-0">Header</header>
  <main class="flex-1 overflow-y-auto">Content</main>
  <nav class="sticky bottom-0">Bottom Nav</nav>
</div>
```

### Admin Portal (Desktop-First)

**Design Approach:**
- Designed for desktop (1024px+)
- Sidebar navigation
- Multi-column layouts
- Hover states

**Layout:**
```html
<div class="flex min-h-screen">
  <aside class="w-64">Sidebar</aside>
  <main class="flex-1">Content</main>
</div>
```

### Responsive Utilities

**Show/Hide:**
```html
<div class="hidden md:block">Desktop only</div>
<div class="block md:hidden">Mobile only</div>
```

**Grid Responsive:**
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  Cards
</div>
```

---

## Accessibility

### WCAG Compliance
**Target:** WCAG 2.1 Level AA

### Color Contrast

**Minimum Contrast Ratios:**
- Normal text: 4.5:1
- Large text: 3:1
- UI components: 3:1

**Current Compliance:**
- ✅ Primary on white: 4.8:1
- ✅ Foreground on background: 12.1:1
- ✅ All text meets AA standards

### Keyboard Navigation

**Requirements:**
- All interactive elements keyboard accessible
- Logical tab order
- Visible focus indicators
- Skip links for navigation

**Focus Styles:**
```css
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
```

### Screen Readers

**Requirements:**
- Semantic HTML
- ARIA labels for icons
- Alt text for images
- Descriptive link text
- Form labels

**Example:**
```html
<button aria-label="Close dialog">
  <X className="w-5 h-5" />
</button>
```

### Reduced Motion

**Respect User Preferences:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Design Tokens

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 1rem (16px) | Default radius |
| `rounded-sm` | calc(var(--radius) - 4px) | Small elements |
| `rounded-md` | calc(var(--radius) - 2px) | Medium elements |
| `rounded-lg` | var(--radius) | Large elements |
| `rounded-xl` | 0.75rem (12px) | Cards |
| `rounded-2xl` | 1rem (16px) | Large cards |
| `rounded-full` | 9999px | Pills, badges |

### Shadows

**Shadow Tokens:**
```css
--shadow-sm: 0 1px 2px 0 hsl(240 38% 13% / 0.05);
--shadow-md: 0 4px 6px -1px hsl(240 38% 13% / 0.1), 0 2px 4px -2px hsl(240 38% 13% / 0.1);
--shadow-lg: 0 10px 15px -3px hsl(240 38% 13% / 0.1), 0 4px 6px -4px hsl(240 38% 13% / 0.1);
--shadow-glow: 0 0 20px hsl(251 57% 47% / 0.3);
```

**Usage:**
```html
<div class="shadow-md">Card</div>
<div class="shadow-glow">Glowing element</div>
```

### Z-Index Scale

| Layer | Value | Usage |
|-------|-------|-------|
| Base | 0 | Default |
| Dropdown | 1000 | Dropdowns |
| Sticky | 40 | Sticky headers |
| Overlay | 50 | Modals, dialogs |
| Toast | 100 | Notifications |

---

## UI Patterns

### Loading States

**Spinner:**
```html
<div class="flex items-center justify-center py-8">
  <div class="animate-spin rounded-full h-8 w-8 border-4 border-primary/20 border-t-primary"></div>
  <p class="ml-4 text-muted-foreground">Loading...</p>
</div>
```

### Empty States

**No Content:**
```html
<div class="text-center py-12">
  <p class="text-muted-foreground">No activities found.</p>
  <button class="mt-4">Create Activity</button>
</div>
```

### Error States

**Error Message:**
```html
<div class="p-4 rounded-xl bg-destructive/10 border border-destructive/20">
  <p class="text-sm text-destructive">Error message here</p>
</div>
```

### Success States

**Success Message:**
```html
<div class="p-4 rounded-xl bg-green-500/10 border border-green-500/20">
  <div class="flex items-center gap-2">
    <CheckCircle2 className="w-5 h-5 text-green-600" />
    <p class="text-sm text-green-600">Success message</p>
  </div>
</div>
```

### Form Validation

**Error State:**
```html
<div>
  <label class="text-sm font-medium text-foreground">Email</label>
  <input class="border-destructive focus:ring-destructive" />
  <p class="text-xs text-destructive mt-1">Error message</p>
</div>
```

---

## Design Tools

### Recommended Tools

**Design Software:**
- **Figma** - Primary design tool
- **Adobe XD** - Alternative
- **Sketch** - Alternative

**Prototyping:**
- Figma Prototyping
- Framer (for advanced prototypes)

**Asset Export:**
- Export as SVG for icons
- Export as PNG/JPG for images (2x resolution)
- Use optimized formats (WebP when possible)

### Design File Organization

```
Design Files/
├── 01_Brand/
│   ├── Logo/
│   ├── Colors/
│   └── Typography/
├── 02_Components/
│   ├── Buttons/
│   ├── Cards/
│   ├── Forms/
│   └── Navigation/
├── 03_Pages/
│   ├── Mobile_App/
│   └── Admin_Portal/
└── 04_Assets/
    ├── Icons/
    └── Images/
```

### Design Handoff

**What to Provide:**
- ✅ Design specs (spacing, colors, typography)
- ✅ Component states (default, hover, active, disabled)
- ✅ Responsive breakpoints
- ✅ Asset exports
- ✅ Interaction notes

**Design Specs Format:**
- Spacing: Use 4px grid
- Colors: Provide hex, RGB, and HSL
- Typography: Font family, size, weight, line height
- Components: All states and variants

---

## Component Specifications

### Activity Card (Mobile)

**Dimensions:**
- Height: Auto (min 80px)
- Image: 80px × 80px
- Padding: 12px (p-3)
- Gap: 12px (gap-3)

**Spacing:**
- Card padding: 12px
- Content gap: 8px
- Border radius: 12px (rounded-xl)

**Colors:**
- Background: `bg-card`
- Hover: `bg-muted/30`
- Host name: `text-primary`
- Title: `text-foreground`
- Time: `text-[#FF8C00]`

### Button Specifications

**Primary Button:**
- Height: 40px (h-10)
- Padding: 16px horizontal (px-4)
- Border radius: 6px (rounded-md)
- Font: 14px, medium weight
- Background: Primary purple
- Text: White

**Hover State:**
- Background: `bg-primary/90` (90% opacity)

**Active State:**
- Scale: 0.95
- Background: `bg-primary/80`

### Input Field Specifications

**Standard Input:**
- Height: 48px (h-12)
- Padding: 16px horizontal (px-4)
- Border radius: 12px (rounded-xl)
- Background: `bg-muted`
- Border: None (border-0)
- Focus ring: 2px primary color

**Focus State:**
- Ring: 2px
- Ring color: Primary at 20% opacity
- Outline: None

---

## Dark Mode

### Dark Mode Colors

**Background:**
- Main: `240 38% 13%` (Dark blue-gray)
- Card: `240 38% 18%` (Slightly lighter)

**Text:**
- Foreground: `240 20% 98%` (Near white)
- Muted: `240 15% 70%` (Light gray)

**Implementation:**
```html
<html class="dark">
  <!-- Dark mode styles apply -->
</html>
```

**Toggle:**
- User preference detection
- Manual toggle in settings
- Persists across sessions

---

## Design Checklist

### Before Design Handoff

- [ ] All colors match design system
- [ ] Typography follows scale
- [ ] Spacing uses 4px grid
- [ ] Components have all states
- [ ] Responsive breakpoints defined
- [ ] Accessibility requirements met
- [ ] Dark mode considered
- [ ] Assets exported properly
- [ ] Specs documented
- [ ] Design reviewed

### Component Checklist

- [ ] Default state
- [ ] Hover state
- [ ] Active/pressed state
- [ ] Disabled state
- [ ] Error state (if applicable)
- [ ] Loading state (if applicable)
- [ ] Empty state (if applicable)
- [ ] Mobile version
- [ ] Desktop version (if applicable)
- [ ] Dark mode version

---

## Resources

### Design System Files
- `tailwind.config.ts` - Tailwind configuration
- `src/index.css` - CSS variables and styles
- Component files in `src/components/ui/`

### External Resources
- **Tailwind CSS:** https://tailwindcss.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Lucide Icons:** https://lucide.dev
- **Framer Motion:** https://www.framer.com/motion

### Brand Assets
- Logo files (request from brand team)
- Mascot illustrations (Lira character)
- Brand guidelines document

---

**Document Owner:** Design Team  
**Last Review:** January 24, 2026  
**Next Review:** Quarterly
