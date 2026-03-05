# Developer Catalog — Ulikme Frontend

This document describes what developers need to do to work on the **Ulikme** frontend: setup, conventions, architecture, and **product/business rules** that must be implemented.

---

## 1. Prerequisites & Setup

- **Node.js** ≥ 18.0.0, **npm** ≥ 9.0.0, Git.
- Clone repo → `npm install` → `npm run dev`. App: http://localhost:8080.
- Backend at `http://localhost:5000`; Vite proxies `/api` to it. With backend: `npm run dev:all` or `npm run dev:all:network`.

---

## 2. Tech Stack

Vite 5, TypeScript, React 18, React Router 6, shadcn/ui, Tailwind CSS, TanStack React Query, React Hook Form + Zod, Context (Auth, Language, Wallet), Socket.io client, Lucide React, Framer Motion.

---

## 3. Project Structure

- **Pages** → `src/pages/`, routes in `src/App.tsx`.
- **API** → `src/lib/api.ts`, hooks in `src/hooks/`.
- **UI** → `src/components/`, primitives in `src/components/ui/`.

---

## 4. Product & Business Rules

These rules define how features must behave. Implement and enforce them in both frontend and backend.

### 4.1 Feature priorities

1. **Create Class** — class creation, editing, management.  
2. **Communities** — discovery, creation, membership.  
3. **Create Activity** — activity/vibe creation and management.

Prioritize these areas first.

---

### 4.2 Dice (Surprise / Roll) flow

When the user taps the **dice** (roll / “Surprise Me”):

1. **Roll** — perform the roll animation / logic.  
2. **Ad** — show a **10-second** ad.  
3. **Result** — after the ad, show **one** random item: either a **random class** or a **random activity** (pick one at random).

Do not show the result before the ad completes.

---

### 4.3 Profile connect & 1:1 messaging limits

After a user **connects** with someone from their **profile**:

- In **1:1 chats**, the initiator can send **only the first 2 messages**.  
- If the **other person does not reply**, the initiator **must not** be able to send any further messages to that person (conversation locked for them).  
- If the other person replies, normal messaging applies.

Track message count per conversation for the initiator; block after 2 messages unless the other user has sent at least one. Enforce on client and backend.

---

### 4.4 Refund policy for classes and activities

- **Start time more than 48 hours away:** user may request a **refund within the first 24 hours** after joining. After 24 hours from join, no refund.  
- **Start time 48 hours or less away:** **no refund**.

Use join timestamp and event/class start time. Refund allowed only if `(startTime - now) > 48h` at join **and** `(now - joinTime) ≤ 24h`. Enforce on backend; frontend shows eligibility and disables refund when not allowed.

---

### 4.5 Social / Reels feed — sponsor and venue ads

On the **social (reels)** feed:

- **Every 10th reel** → **sponsor reel** (sponsored content).  
- **Every 5th reel** → **favorite venue** ad.

Inject at the correct positions; use existing config (e.g. `constants/sponsorAds.ts`). If 5th and 10th coincide, define a single rule (e.g. sponsor on 10, 20, …; venue on 5, 15, …).

---

### 4.6 Ban & remove from communities, classes, and activities

**Purpose:** Allow moderators and creators to ban or remove users when there is inappropriate behavior (e.g. profanity, harassment, rule-breaking).

- **Communities** — admins/moderators can **ban** or **remove** a member from the community. Banned/removed users cannot rejoin unless the ban is lifted (if supported).
- **Classes** — class creator / instructor (and optionally admins) can **remove** or **ban** a participant from the class. Removed/banned users lose access and cannot re-enroll unless allowed by policy.
- **Activities** — activity host (and optionally admins) can **remove** or **ban** a participant from the activity. Same behavior as classes.

**Implementation:**

- Expose **Remove** and **Ban** actions in the UI for the relevant roles (community admins, class instructor, activity host).
- Backend must enforce permissions (only allowed roles can ban/remove) and persist ban/removal state.
- Removed = user is removed from the member/participant list. Banned = user is removed and (if supported) blocked from rejoining until unban.
- Optionally: notify the user that they were removed/banned and log actions for moderation.

Developers must implement these flows for communities, classes, and activities so that inappropriate behavior can be handled without relying only on global admin tools.

---

## 5. What Developers Should Do

- **Before work:** Pull latest, `npm install`, run `npm run dev`, run `npm run lint` and fix issues.  
- **Routing:** Add routes in `src/App.tsx` above the catch-all `*` route.  
- **API:** Use `API_ENDPOINTS` and `apiRequest` from `@/lib/api`; no hardcoded backend URLs.  
- **Data:** Use hooks in `src/hooks/` with React Query; implement mock in `src/lib/mockApi.ts` when `USE_DUMMY_DATA` is on.  
- **Auth:** Use `AuthContext` and token helpers from `@/lib/api`.  
- **UI:** Use `src/components/ui/` and Tailwind; respect theme.  
- **Forms:** React Hook Form + Zod.  
- **i18n:** Use `LanguageContext` for all user-facing text.  
- **Quality:** TypeScript (avoid `any`), ESLint clean, functional components.  
- **Tests:** Vitest; add/update tests when adding logic.  
- **Build:** `npm run build` and `npm run preview` must succeed.

---

## 6. Key Files

| Purpose        | File(s)                    |
|----------------|----------------------------|
| Routes         | `src/App.tsx`              |
| API / request  | `src/lib/api.ts`          |
| Mock API       | `src/lib/mockApi.ts`      |
| Auth           | `src/contexts/AuthContext.tsx` |
| Data hooks     | `src/hooks/*.ts`          |
| Vite           | `vite.config.ts`          |
| Path alias     | `tsconfig.json`           |
| ESLint         | `eslint.config.js`        |

---

## 7. Environment Variables

- `VITE_API_URL` — override API base URL.  
- `VITE_BACKEND_PORT` — backend port when using host-based URL (default `5000`).

Use `import.meta.env.VITE_*`; do not commit secrets.

---

## 8. Checklist for New Features

- [ ] Route in `App.tsx` above `*` (if new page).  
- [ ] API + types in `lib/api.ts` (and mock if needed).  
- [ ] Hook in `src/hooks/` with React Query where appropriate.  
- [ ] Auth via `AuthContext` and API helpers.  
- [ ] UI with `components/ui` and Tailwind.  
- [ ] **Product rules:** If feature touches dice, connect/messaging, refunds, reels ads, or ban/remove — confirm it matches **Section 4**.  
- [ ] `npm run lint` and `npm run build` pass.  
- [ ] Tests added/updated where relevant.

---

## 9. Where to Get Help

- **Lovable:** Project can be edited via Lovable; changes may sync to the repo.  
- **README:** See root `README.md` for clone, run, deploy.  
- **Backend:** See `server/README.md`.

---

*Last updated for the Ulikme frontend. Adjust as the project evolves.*
