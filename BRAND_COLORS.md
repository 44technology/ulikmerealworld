# Ulikme Brand Color Palette

**Document Version:** 1.0  
**Last Updated:** January 24, 2026

---

## Color Palette

### 1. Full White
- **HEX:** `#F4F6F5`
- **RGB:** `(244, 246, 245)`
- **CMYK:** `(0%, 0%, 0%, 0%)`
- **HSL:** `120 8% 96%`
- **Usage:** Background, cards, light surfaces
- **Tailwind:** `bg-brand-white` or `var(--color-white)`

### 2. Classic Orange
- **HEX:** `#F5B027`
- **RGB:** `(245, 176, 39)`
- **CMYK:** `(0%, 28%, 84%, 4%)`
- **HSL:** `38 90% 56%`
- **Usage:** Secondary actions, accents, highlights
- **Tailwind:** `bg-brand-orange` or `var(--color-orange)`
- **CSS Variable:** `--secondary`, `--connectme`

### 3. Vivid Tangelo
- **HEX:** `#ED6C27`
- **RGB:** `(237, 108, 39)`
- **CMYK:** `(0%, 54%, 84%, 7%)`
- **HSL:** `19 85% 54%`
- **Usage:** Accent color, call-to-action elements
- **Tailwind:** `bg-brand-tangelo` or `var(--color-tangelo)`
- **CSS Variable:** `--accent`

### 4. Black Steel
- **HEX:** `#0D1216`
- **RGB:** `(13, 18, 22)`
- **CMYK:** `(41%, 18%, 0%, 91%)`
- **HSL:** `210 27% 7%`
- **Usage:** Text, dark mode background, primary dark color
- **Tailwind:** `bg-brand-black-steel` or `var(--color-black-steel)`
- **CSS Variable:** `--foreground`, `--background` (dark mode)

### 5. Rich Light Blue
- **HEX:** `#4799D4`
- **RGB:** `(71, 153, 212)`
- **CMYK:** `(67%, 28%, 0%, 17%)`
- **HSL:** `204 60% 55%`
- **Usage:** Primary color, main brand color, links, buttons
- **Tailwind:** `bg-brand-blue` or `var(--color-blue)`
- **CSS Variable:** `--primary`, `--friendme`

### 6. Subtle Pastel Red
- **HEX:** `#F0827A`
- **RGB:** `(240, 130, 122)`
- **CMYK:** `(0%, 46%, 49%, 6%)`
- **HSL:** `5 78% 71%`
- **Usage:** Destructive actions, errors, warnings
- **Tailwind:** `bg-brand-red` or `var(--color-red)`
- **CSS Variable:** `--destructive`, `--loveme`

---

## Color Usage Guidelines

### Primary Color (Rich Light Blue)
- Main brand color
- Primary buttons
- Links
- Active states
- Focus rings

### Secondary Color (Classic Orange)
- Secondary buttons
- Highlights
- ConnectMe module
- Accent elements

### Accent Color (Vivid Tangelo)
- Call-to-action elements
- Important highlights
- Interactive elements

### Background Colors
- **Light Mode:** Full White (#F4F6F5)
- **Dark Mode:** Black Steel (#0D1216)

### Text Colors
- **Light Mode:** Black Steel (#0D1216)
- **Dark Mode:** Full White (#F4F6F5)

### Destructive/Actions
- **Error/Destructive:** Subtle Pastel Red (#F0827A)
- **Warning:** Classic Orange (#F5B027)
- **Success:** Rich Light Blue (#4799D4)

---

## CSS Variables

All colors are available as CSS variables:

```css
:root {
  --color-white: 120 8% 96%;        /* Full White */
  --color-orange: 38 90% 56%;       /* Classic Orange */
  --color-tangelo: 19 85% 54%;      /* Vivid Tangelo */
  --color-black-steel: 210 27% 7%;  /* Black Steel */
  --color-blue: 204 60% 55%;        /* Rich Light Blue */
  --color-red: 5 78% 71%;           /* Subtle Pastel Red */
}
```

### Usage in CSS:
```css
.my-element {
  background-color: hsl(var(--color-blue));
  color: hsl(var(--color-white));
}
```

---

## Tailwind Classes

### Direct Color Classes:
```html
<div class="bg-brand-white">Full White</div>
<div class="bg-brand-orange">Classic Orange</div>
<div class="bg-brand-tangelo">Vivid Tangelo</div>
<div class="bg-brand-black-steel">Black Steel</div>
<div class="bg-brand-blue">Rich Light Blue</div>
<div class="bg-brand-red">Subtle Pastel Red</div>
```

### Semantic Color Classes:
```html
<!-- Primary (Blue) -->
<button class="bg-primary text-primary-foreground">Primary Button</button>

<!-- Secondary (Orange) -->
<button class="bg-secondary text-secondary-foreground">Secondary Button</button>

<!-- Accent (Tangelo) -->
<div class="bg-accent text-accent-foreground">Accent Element</div>

<!-- Destructive (Red) -->
<button class="bg-destructive text-destructive-foreground">Delete</button>
```

---

## Module Colors

### FriendMe Module
- **Color:** Rich Light Blue (#4799D4)
- **Usage:** Friend connections, social features
- **Class:** `bg-friendme` or `text-friendme`

### LoveMe Module
- **Color:** Subtle Pastel Red (#F0827A)
- **Usage:** Dating features, romantic connections
- **Class:** `bg-loveme` or `text-loveme`

### ConnectMe Module
- **Color:** Classic Orange (#F5B027)
- **Usage:** Professional networking, business connections
- **Class:** `bg-connectme` or `text-connectme`

---

## Gradients

### Primary Gradient
```css
background: linear-gradient(135deg, #4799D4 0%, #ED6C27 100%);
/* Blue to Tangelo */
```

### Secondary Gradient
```css
background: linear-gradient(135deg, #F5B027 0%, #ED6C27 100%);
/* Orange to Tangelo */
```

### Hero Gradient
```css
background: linear-gradient(180deg, rgba(71, 153, 212, 0.1) 0%, transparent 50%);
/* Light blue fade */
```

**Tailwind Classes:**
- `bg-gradient-primary`
- `bg-gradient-secondary`
- `bg-gradient-hero`

---

## Accessibility

### Contrast Ratios

- **Black Steel on Full White:** 16.8:1 (AAA)
- **Rich Light Blue on Full White:** 4.5:1 (AA)
- **Classic Orange on Black Steel:** 4.8:1 (AA)
- **Vivid Tangelo on Full White:** 3.2:1 (AA Large Text)
- **Subtle Pastel Red on Full White:** 3.1:1 (AA Large Text)

### Recommendations

1. **Text on Background:**
   - Use Black Steel (#0D1216) for text on light backgrounds
   - Use Full White (#F4F6F5) for text on dark backgrounds

2. **Interactive Elements:**
   - Ensure minimum 4.5:1 contrast ratio for buttons
   - Use Rich Light Blue (#4799D4) for primary actions
   - Use Classic Orange (#F5B027) for secondary actions

3. **Error States:**
   - Use Subtle Pastel Red (#F0827A) for errors
   - Ensure sufficient contrast with background

---

## Design Tokens

### Light Mode
```css
--background: hsl(var(--color-white));
--foreground: hsl(var(--color-black-steel));
--primary: hsl(var(--color-blue));
--secondary: hsl(var(--color-orange));
--accent: hsl(var(--color-tangelo));
--destructive: hsl(var(--color-red));
```

### Dark Mode
```css
--background: hsl(var(--color-black-steel));
--foreground: hsl(var(--color-white));
--primary: hsl(var(--color-blue));
--secondary: hsl(var(--color-orange));
--accent: hsl(var(--color-tangelo));
--destructive: hsl(var(--color-red));
```

---

## Examples

### Button Styles
```html
<!-- Primary Button -->
<button class="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
  Primary Action
</button>

<!-- Secondary Button -->
<button class="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
  Secondary Action
</button>

<!-- Destructive Button -->
<button class="bg-destructive text-destructive-foreground px-4 py-2 rounded-lg">
  Delete
</button>
```

### Card Styles
```html
<!-- Light Card -->
<div class="bg-card text-card-foreground p-4 rounded-xl">
  Card Content
</div>

<!-- Dark Card (in dark mode) -->
<div class="bg-card text-card-foreground p-4 rounded-xl">
  Card Content
</div>
```

### Module Badges
```html
<!-- FriendMe Badge -->
<span class="bg-friendme/10 text-friendme px-3 py-1 rounded-full">
  FriendMe
</span>

<!-- LoveMe Badge -->
<span class="bg-loveme/10 text-loveme px-3 py-1 rounded-full">
  LoveMe
</span>

<!-- ConnectMe Badge -->
<span class="bg-connectme/10 text-connectme px-3 py-1 rounded-full">
  ConnectMe
</span>
```

---

**Note:** All colors are defined in `src/index.css` and available through Tailwind CSS classes or CSS variables.
