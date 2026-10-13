# Spec: Navbar Login Button ("Masuk") Design

- **Date:** 2026-09-04
- **Branch target:** `develop`
- **Scope:** Public Navigation Bar (`src/components/public/navbar.tsx`)

## Background & Motivation
Currently, there is no direct link or button in public-facing pages leading to the administrative panel (`/admin/login`). Administrators or internal users have to manually type the URL in the browser bar. Adding an explicit, high-contrast call-to-action ("Masuk") on the floating navbar increases accessibility for users while maintaining the clean, modern aesthetic of the public website.

## Requirements & Design Decisions

### 1. Desktop Layout (`md:flex`)
- **Placement:** Placed at the right end of the floating glass pill container, visually separated or styled as a prominent call-to-action following navigation links (`Beranda`, `Profil`, `Layanan`, `Berita`, `Kontak`).
- **Visual Style:**
  - Solid accent button (`bg-emerald-700 hover:bg-emerald-800 text-white` or brand color token `bg-brand-600 hover:bg-brand-700`).
  - Rounded capsule shape (`rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300 ease-luxe shadow-sm active:scale-95`).
  - Label: `"Masuk"`.
  - Target: `/admin/login`.

### 2. Mobile Pill Bar (Top Header)
- **Placement:** Directly to the left of the mobile hamburger toggle button within the top floating header pill.
- **Visual Style:**
  - Compact capsule button (`px-3 py-1 text-xs rounded-full bg-brand-600 text-white font-medium active:scale-95`).
  - Ensures clean hierarchy without crowding the logo or overflowing on 360px-wide devices.

### 3. Mobile Fullscreen Overlay Menu
- **Placement:** In the mobile fullscreen menu overlay, rendered below the navigational links list (after `Kontak`) with staggered entrance transition matching the menu items.
- **Visual Style:**
  - Prominent full-width button / card-styled action (`w-full py-3 text-center rounded-xl bg-brand-600 text-white font-semibold text-base shadow-lg transition-all duration-700 ease-luxe active:scale-98`).
  - Closes overlay (`setOpen(false)`) upon navigation.

## Component & Architecture Impact
- Only modifies `src/components/public/navbar.tsx`.
- Preserves existing Next.js base path routing and client navigation.
- No changes to existing server-side routes or admin layout.
