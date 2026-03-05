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
