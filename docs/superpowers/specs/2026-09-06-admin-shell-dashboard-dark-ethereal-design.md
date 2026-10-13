# Design Spec: Admin Shell & Dashboard Redesign (Dark Ethereal)

## 1. Overview & Goals
Menyelaraskan tema visual area admin (`/admin/dashboard` dan komponen shell pembungkusnya) dengan estetika **Dark Ethereal** yang telah diterapkan pada halaman Login Admin (`/admin/login`).

Perubahan ini mencakup:
- **Batch 1 Scope:** Redesain `AdminShell` (Desktop Sidebar, Mobile Sheet Drawer, Top Header Bar) dan halaman `Dashboard` utama.
- **Fokus Pengguna & Perangkat:** Optimalisasi breakpoint `md+` (≥768px hingga ~1024-1280px) untuk mendukung review nyaman dari HP Android Chrome mode "Desktop site" maupun laptop/desktop, serta tetap responsif di layar mobile.

---

## 2. Visual Foundation & Palette
- **Canvas Background:** `bg-zinc-950 text-zinc-100 min-h-screen`
- **Ambient Aura/Glow:**
  - Top-Right: radial gradient emerald glow (`bg-emerald-500/10 blur-3xl`)
  - Bottom-Left: radial gradient brand/cyan glow (`bg-brand-600/10 blur-3xl`)
- **Glassmorphism Surfaces:**
  - Container / Card: `bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-xl`
  - Hover highlights: `hover:border-white/10 hover:bg-zinc-900/80 transition-all`
- **Accents & Status Badges:**
  - Active Nav & Primary Button: `bg-brand-500/15 text-brand-400 border border-brand-500/30`
  - Terbit / Published / Super Admin: `bg-emerald-500/15 text-emerald-400 border border-emerald-500/30`
  - Draft / Secondary: `bg-amber-500/15 text-amber-400 border border-amber-500/30`

---

## 3. Architecture & Components

### 3.1 Admin Shell (`src/components/admin/admin-shell.tsx`)
- **Desktop Sidebar (`aside`):**
  - Lebar: `w-64 shrink-0`
  - Background: `bg-zinc-900/60 backdrop-blur-xl border-r border-white/5`
  - Branding: Logo IFK Kotabaru ber-ring (`ring-1 ring-white/15`) + label instansi teks putih tegas.
  - Menu Items:
    - Default state: `text-zinc-400 hover:text-zinc-100 hover:bg-white/5`
    - Active state: `bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm shadow-brand-500/10 font-medium`
  - Logout action: Tombol keluar dengan styling clean dan aksen merah halus pada hover (`hover:bg-red-500/10 hover:text-red-400`).
- **Mobile Sheet Drawer:**
  - Menggunakan sheet dark theme (`bg-zinc-950/95 border-r border-white/10 text-white backdrop-blur-2xl`).
- **Top Header (`header`):**
  - Background: `bg-zinc-900/60 backdrop-blur-xl border-b border-white/5 h-14 px-4 sm:px-6`
  - Kiri: Tombol mobile menu trigger (hidden on `md:` ke atas).
  - Kanan: Profil admin ringkas (Avatar with fallback glow, label nama, dan status badge role).

### 3.2 Halaman Dashboard (`src/app/(admin)/admin/dashboard/page.tsx`)
- **Header Section:**
  - Sapaan admin ("Selamat Datang di Panel Kelola") & deskripsi ringkas status sistem.
  - Action button: Tombol "Tulis Berita Baru" (`Button` dengan gradient brand/emerald dan ikon `Plus` / `Newspaper`).
- **KPI Stat Cards (4 Cards Grid):**
  - Card 1: Total Artikel (`FileText` icon, aksen cyan/brand)
  - Card 2: Terbit (`CheckCircle` icon, aksen emerald)
  - Card 3: Draft (`FilePen` icon, aksen amber)
  - Card 4: Total Pengguna (`Users` icon, aksen purple)
  - Desain kartu: Rounded box glassmorphic, angka metrik besar (`text-3xl font-bold`), subtext penjelasan ringkas.
- **Tabel "Artikel Terakhir":**
  - Glass card wrapper dengan header tabel modern (`bg-white/[0.02] border-b border-white/5`).
  - Baris tabel responsif dengan hover highlight halus.
  - Kolom status dengan badge warna tematik (Terbit vs Draft).
  - Kolom aksi langsung menuju edit/view artikel.
- **Grid "Pengguna Aktif":**
  - Kartu profil ringkas pengguna dengan avatar inisial beraksen glowing ring, nama, email dummy, dan badge role.

---

## 4. Responsive & Viewport Strategy
- Default class Tailwind dirancang untuk desktop/tablet viewport (`md+` ≥768px dan layar 1024-1280px mode Desktop site HP Android Chrome).
- Kontainer tabel dibungkus dengan `overflow-x-auto` horizontal scrollbar tersembunyi/halus agar tidak memicu overflow global pada viewport.
- Struktur flex shell menggunakan `h-dvh` dan `overflow-hidden` di parent layout dengan `overflow-y-auto` di area main content agar navigasi dan header tetap fixed saat konten di-scroll.

---

## 5. Testing & Verification Plan
- **Lint & Build:** Menjalankan `npm run lint` dan `npm run build` untuk memastikan tidak ada error TypeScript atau styling import.
- **Browser/Live Verification:**
  - Akses `http://43.129.57.214/profile-ifk/admin/dashboard` via browser / curl status check.
  - Memverifikasi rendering sidebar active menu, drawer mobile sheet, stat cards, dan tabel data artikel.
