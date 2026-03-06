# Payment System 4.7 & 4.8

## 4.7 Platform commission and paid mode

### Overview

- **Ulikme commission:** When a class, activity, or community activity is **paid**, Ulikme takes **5%** of the gross payment.
- **Initially:** All activities, classes, and communities are **free**. `paid_activities_enabled = false` (default).
- **When paid mode is enabled:** 5% of the amount paid goes to the platform; the remainder (after Stripe fee) goes to the **venue** or **instructor** who created the class/activity/community.

### Example

- User pays **$50**:
  - **Ulikme:** $50 × 5% = **$2.50**
  - **Creator (venue/instructor):** $50 − Stripe fee − $2.50 = remainder

### Backend

#### Platform settings (`platform_settings`)

| Key | Description | Default |
|-----|-------------|---------|
| `ulikme_commission_percent` | Commission percentage (0–100) | `5` |
| `paid_activities_enabled` | Whether paid activities/classes are allowed | `false` |

- **GET** `/api/settings/platform` → `{ ulikmeCommissionPercent, paidActivitiesEnabled }`
- **PATCH** `/api/settings/platform` (auth) → `{ ulikmeCommissionPercent?: number, paidActivitiesEnabled?: boolean }`

#### Payment flow

1. **Breakdown:** `GET /api/payments/breakdown?grossAmount=50&classId=...` (or `meetupId=...`)  
   → Returns `ulikmeCommissionPercent`, `ulikmeCommission`, `payoutAmount`, etc.
2. **Create payment:** `POST /api/payments`  
   - If `paid_activities_enabled === false` and `grossAmount > 0` → **400** (paid payments not accepted).
3. **Create class / meetup:**  
   - If `price > 0` (class) or paid activity (meetup) and `paid_activities_enabled === false` → **400**.

#### Service

- `server/src/services/paymentService.ts`:
  - `getPaymentSettings(prisma)` → `{ ulikmeCommissionPercent, paidActivitiesEnabled }`
  - `getPaymentBreakdown(prisma, { grossAmount, classId?, meetupId? })` → breakdown using commission % (e.g. 5%)

### Enabling paid mode

From admin:

```http
PATCH /api/settings/platform
Authorization: Bearer <token>
Content-Type: application/json

{ "paidActivitiesEnabled": true }
```

Optionally update `ulikmeCommissionPercent` (e.g. 5) as well.

### Seed / migration

- Seed: adds `ulikme_commission_percent = 5`, `paid_activities_enabled = false`.
- Migration: `20260305000000_paid_activities_enabled` — adds `paid_activities_enabled` key (value: `false`).

---

## 4.8 Discount code and discounted price

### Overview

Creators (instructors or venues) can optionally define a **discount code** and a **discounted price** for paid classes and activities. At payment/checkout, the user enters the code to pay the discounted amount instead of the regular price.

### Where it applies

- **Classes:** Create Class screen and Class detail/payment screen.
- **Activities (vibes/meetups):** Create Vibe/Activity screen and Activity detail/payment screen.
- **Payment/checkout:** User can enter the discount code; if it matches, the charge uses the discounted price and the breakdown (commission, payout) is based on that amount.

### Rules (product and implementation)

1. **Optional:** Both discount code and discounted price are optional. If not set, only the regular price is available.
2. **Create screens (Class / Activity):**
   - **Discount code:** Optional string (e.g. `EARLYBIRD`, `SAVE20`). Stored with the class or meetup.
   - **Discounted price:** Optional; if provided it must be:
     - **Less than** the regular price.
     - **At least** the minimum allowed paid price (e.g. $10) when paid mode is on.
   - If a discounted price is set, a discount code should be set (code is required to get the discount at checkout).
3. **Payment/checkout screens:**
   - Show regular price; if the class/activity has a discount code and discounted price, show an input for “Discount code”.
   - **Validation:** Code comparison is **case-insensitive** (e.g. `earlybird` matches `EARLYBIRD`).
   - If the code matches: use **discounted price** as the amount to charge and for the payment breakdown (Stripe fee, Ulikme commission, payout).
   - If the code does not match or is empty: use **regular price** and show an error when the user claims a discount (e.g. “Invalid discount code”).
4. **Commission and payout:** Ulikme commission (e.g. 5%) and creator payout are calculated on the **actual amount charged** (regular or discounted), not on the list price.
5. **Min price:** Same minimum price rules as for regular paid items apply to the discounted price (e.g. paid activities/classes must be at least $10; discounted price must be ≥ $10 when paid mode is on).

### Data and API (intended)

- **Class:** Optional `discountCode` (string), `discountedPrice` (number).  
  Create/update class payloads may include these when paid mode is enabled.
- **Meetup/Activity:** Optional `discountCode` (string), `discountedPricePerPerson` (number).  
  Create/update meetup payloads may include these when paid mode is enabled.
- **Payment/breakdown:** Request breakdown and create payment using the **chosen** amount (regular or discounted). No separate “discount code” field is required in the payment API if the client already resolves the final amount; otherwise the API can accept an optional `discountCode` and resolve the amount server-side from class/meetup settings.

### Frontend reference

- **Create Class:** `CreateClassPage` — optional “Discount code” and “Discounted price” (discounted &lt; regular, min price respected).
- **Create Activity/Vibe:** `CreateVibePage` — optional “Discount code” and “Discounted price per person” (same rules).
- **Class payment:** `ClassDetailPage` — discount code input; match against `class.discountCode`, use `class.discountedPrice` when valid.
- **Activity payment:** Same pattern on the activity/vibe detail and payment flow where a discounted price is supported.

### Summary

| Item | Rule |
|------|------|
| Discount code | Optional; set by creator on class/activity; case-insensitive at checkout. |
| Discounted price | Optional; must be &lt; regular price and ≥ min paid price (e.g. $10). |
| Create screens | Class and Activity creation support optional discount code + discounted price. |
| Payment screens | User enters code; if valid, charge discounted amount; commission/payout on actual amount. |

---

## 4.9 Digital products (monetization)

### Overview

Venues and instructors can sell **digital products** or promote **affiliate** digital offerings from the Monetization section. This is separate from class/activity payments: it covers PDFs, recordings, e-books, partner app subscriptions, and similar items.

### Where it appears

- **Admin portal:** Under **Monetization → Digital products** (route: `/monetization/marketplace`), for both **venue** and **instructor** roles.
- **Sidebar:** Icon **FileText** (digital/document), label **"Digital products"**.

### Product types

| Type | Description |
|------|-------------|
| **My product** | Creator’s own digital product (e.g. guide PDF, workshop recording). Has optional **price** and a **product/checkout URL**. |
| **Affiliate** | Partner or third-party product. Creator promotes via link and earns **commission %**. Optional **commission %**; **affiliate link** required. |

### Rules (product and UI)

1. **Add product:** One form for both types. User chooses **My product** or **Affiliate** (tabs or toggle).
2. **Fields:**
   - **Title** (required).
   - **Description** (optional).
   - **Product / checkout URL** or **Affiliate link** (required). Must be a valid URL.
   - **My product:** Optional **price** ($). If set, must be ≥ 0.
   - **Affiliate:** Optional **commission %** (0–100).
   - **Image** (optional): cover/thumbnail; used in cards and listing.
3. **Listing:** Tabs or filters: **All**, **My digital products**, **Affiliate**. Each item shown as a card (optional image, title, description, type badge, price if any, commission % if affiliate).
4. **Action:** Each card has a **Get / Buy** or **Get offer** button linking to the product/affiliate URL (open in new tab).
5. **Empty state:** If no items, show message e.g. “No digital products or affiliate links yet. Add your first item to start monetizing.” with FileText icon.

### Frontend reference

- **Page:** `admin-portal/src/pages/instructor/MonetizationMarketplacePage.tsx` (shared for venue and instructor).
- **Route:** `/monetization/marketplace`.
- **Layouts:** Venue and Instructor sidebars include **Digital products** under Monetization with **FileText** icon.

### Summary

| Item | Rule |
|------|------|
| Types | My product (own digital) and Affiliate (promote and earn commission %). |
| Required | Title and product/affiliate URL. |
| My product | Optional price; optional image. |
| Affiliate | Optional commission %; optional image. |
| Listing | Cards with optional image, badge (type), price/commission, link button. |

---

## 4.10 Affiliates (referral program)

### Overview

Venues and instructors can earn **commission** when they refer users to **create or join** classes, activities, or communities on Ulikme. The **Affiliates** page shows referral stats, a unique **affiliate link**, and a list of **referrals**.

### Where it appears

- **Admin portal:** Under **Monetization → Affiliates** (route: `/monetization/affiliates`), for both **venue** and **instructor** roles.
- **Sidebar:** **Link2** icon, label **"Affiliates"**.

### Page structure (UI rules)

1. **Header**
   - Title: **Affiliates**.
   - Description: e.g. “Earn commission when you invite somebody to create or join a class, activity, or community on Ulikme.”

2. **Commission statistics (three cards)**
   - **Last 30 days:** Commission earned in the last 30 days (e.g. $0.00).
   - **Lifetime:** Total commission earned (e.g. $0.00).
   - **Account balance:** Current balance available for payout (e.g. $0.00).
   - Next to **Account balance:** **PAYOUT** button (disabled when balance ≤ 0).
   - Below PAYOUT: text like “$0.00 available soon” (or similar when balance is zero or pending).

3. **Your affiliate links**
   - Section title: **Your affiliate links**.
   - **Platform pill:** e.g. “Ulikme platform” (single option or selector if multiple link types exist).
   - **Commission text:** e.g. “Earn 5% commission when you invite somebody to create a class or join a paid activity on Ulikme.” (Use platform commission % from settings, e.g. 5%.)
   - **Referral URL:** Unique link (e.g. `https://app.ulikme.com/signup?ref=<ref_id>`). Displayed as a clickable link.
   - **COPY** button: Copies the referral URL to clipboard; show success toast.
   - **Status:** e.g. “Active” with dropdown (for future: Active / Paused).

4. **Referrals list**
   - Area for listing referred users/sign-ups (or referral events).
   - **Empty state:** Icon (e.g. CircleDollarSign) and text: “Your referrals will show here” plus short line: “When someone signs up or pays using your link, they’ll appear in this list.”

### Backend (intended)

- **Affiliate ref ID:** Per user (venue/instructor), a unique `ref` (or `affiliate_id`) used in signup/payment URLs.
- **Commission:** Use platform commission % (e.g. 5%) or a separate affiliate commission % from settings.
- **Stats:** Last 30 days, lifetime, and account balance from payments/referrals where the current user is the referrer.
- **Payout:** PAYOUT action triggers payout flow (e.g. same as existing Payouts); minimum balance and “available soon” logic as per business rules.
- **Referrals list:** API returns list of referred users or referral events (sign-up, first payment, etc.) for the current affiliate.

### Frontend reference

- **Page:** `admin-portal/src/pages/instructor/MonetizationAffiliatesPage.tsx` (shared for venue and instructor).
- **Route:** `/monetization/affiliates`.
- **Layouts:** Venue and Instructor sidebars include **Affiliates** under Monetization with **Link2** icon.

### Summary

| Item | Rule |
|------|------|
| Purpose | Earn commission by referring users to create/join classes, activities, or communities. |
| Stats | Last 30 days, Lifetime, Account balance; PAYOUT button + “available soon” when applicable. |
| Link | Unique referral URL; COPY button; commission % stated in copy. |
| Status | Display Active (or Paused) for the affiliate link. |
| Referrals | List (or empty state) where referred users/events will appear. |
