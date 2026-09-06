# Navbar Login Button Implementation Plan

**Goal:** Add a prominent "Masuk" (Login) button leading to `/admin/login` on desktop navbar, mobile top pill bar, and mobile fullscreen overlay menu.

**Architecture:** Update `src/components/public/navbar.tsx` to render the login button in three specific viewports/contexts while maintaining existing design tokens, responsive behavior, and routing conventions.

**Tech Stack:** Next.js (App Router), React, Tailwind CSS, Lucide icons (optional).

## Global Constraints
- Preserve Next.js base path routing support (`/admin/login`).
- Keep navbar clean and prevent overflow/wrapping on small mobile devices (360px width).
- Zero regression on existing desktop and mobile navigation links.

---

### Task 1: Add "Masuk" Button to Navbar Component

**Files:**
- Modify: `src/components/public/navbar.tsx`

**Interfaces:**
- Desktop: Capsule button inside `<div className="mx-auto flex h-14 ...">` or inside desktop `<nav>`.
- Mobile pill: Action button right next to the hamburger menu toggle.
- Mobile overlay: Staggered full-width CTA link inside `<div ... className="... fixed inset-0 ...">`.

- [ ] **Step 1: Update `src/components/public/navbar.tsx`** with desktop, mobile pill, and mobile overlay login buttons.
- [ ] **Step 2: Run TypeScript check** — `npx tsc --noEmit`
- [ ] **Step 3: Verify local dev server response** — `curl -s http://localhost:3003/profile-ifk/ | grep -i "Masuk"`
- [ ] **Step 4: Commit and Push** — Commit implementation and push branch to GitHub.
