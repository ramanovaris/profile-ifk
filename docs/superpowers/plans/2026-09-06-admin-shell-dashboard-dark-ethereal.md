# Admin Shell & Dashboard Redesign (Dark Ethereal) Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengubah tampilan Admin Shell (Sidebar, Header, Drawer) dan halaman Dashboard utama (`/admin/dashboard`) menjadi tema Dark Ethereal yang selaras dengan halaman login.

**Architecture:** Menerapkan container Dark Ethereal (`zinc-950`, ambient glow overlay, glassmorphism `zinc-900/60`, border `white/5`) pada layout shell dan komponen dashboard, mempertahankan breakpoint `md+` untuk kemudahan review desktop/HP desktop site.

**Tech Stack:** Next.js 16 (App Router), Tailwind CSS, Lucide React, Radix UI / Sheet primitive.

## Global Constraints
- Target breakpoint review: `md+` (≥768px hingga 1024px-1280px).
- Tidak merusak fungsionalitas navigasi dan routing admin yang sudah ada.
- Tidak membocorkan horizontal scroll global pada viewport.

---

### Task 1: Redesain Admin Shell (`src/components/admin/admin-shell.tsx`)

**Files:**
- Modify: `src/components/admin/admin-shell.tsx`

**Interfaces:**
- Consumes: `sidebarLinks`, `siteConfig`, Lucide icons (`LayoutDashboard`, `Newspaper`, `Users`, `UserCog`, `LogOut`, `Menu`).
- Produces: `AdminShell({ children }: { children: React.ReactNode })` dengan wrapper Dark Ethereal, Sidebar glassmorphism, Mobile Sheet drawer dark theme, dan Header bar glassmorphism.

- [ ] **Step 1: Update AdminShell component**
  - Ubah styling container utama menjadi `bg-zinc-950 text-zinc-100 min-h-dvh h-dvh flex overflow-hidden relative`.
  - Tambahkan ambient glow background aksen emerald & cyan (pointer-events-none).
  - Update `SidebarContent`:
    - Header sidebar: Logo dengan `ring-1 ring-white/15`, teks "Admin Panel IFK" putih tebal.
    - `SidebarLink`: Normal `text-zinc-400 hover:text-white hover:bg-white/5`, Active `bg-brand-500/10 text-brand-400 border border-brand-500/20 shadow-sm shadow-brand-500/10`.
    - Logout button: `text-zinc-400 hover:text-red-400 hover:bg-red-500/10`.
  - Update Desktop Sidebar: `hidden md:flex md:flex-col w-64 shrink-0 bg-zinc-900/60 backdrop-blur-xl border-r border-white/5`.
  - Update Mobile Sheet: `SheetContent` dengan `bg-zinc-950/95 border-r border-white/10 text-white backdrop-blur-2xl`.
  - Update Header bar: `h-14 border-b border-white/5 bg-zinc-900/60 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between`.
  - Update Main container: `flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8`.

- [ ] **Step 2: TypeScript & Build Check**
  - Jalankan `npx tsc --noEmit` untuk memastikan tidak ada kesalahan tipe.

- [ ] **Step 3: Commit Task 1**
  - Jalankan `git add src/components/admin/admin-shell.tsx && git commit -m "feat(admin): redesain admin shell dengan tema dark ethereal"`

---

### Task 2: Redesain Halaman Dashboard (`src/app/(admin)/admin/dashboard/page.tsx`)

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

**Interfaces:**
- Consumes: `AdminShell`, `dummyArticles`, `dummyUsers`, `dummyStats`, `statCards`, Lucide icons.
- Produces: Render halaman `/admin/dashboard` dengan KPI stat cards dark glow, tabel artikel terakhir dark glass, dan grid pengguna aktif.

- [ ] **Step 1: Update Dashboard Page Component**
  - Header Dashboard: Judul `text-2xl font-bold text-white tracking-tight`, deskripsi ringkas, dan Action Button "Tulis Berita Baru" link ke `/admin/berita/baru`.
  - Stat Cards Grid:
    - 4 kartu stat dengan background `bg-zinc-900/60 backdrop-blur-xl border border-white/5 hover:border-white/10`.
    - Ikon box dengan ambient glow halus sesuai warna (cyan, emerald, amber, purple).
    - Metrik angka `text-3xl font-bold text-white` dan label `text-xs text-zinc-400`.
  - Tabel Artikel Terakhir:
    - Card wrapper glassmorphism dengan header judul & link "Lihat Semua".
    - `overflow-x-auto` table.
    - Table header `bg-white/[0.02] text-zinc-400 border-b border-white/5`.
    - Table rows dengan hover `hover:bg-white/[0.03] border-b border-white/5`.
    - Status badge: Terbit (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/20`), Draft (`bg-amber-500/10 text-amber-400 border border-amber-500/20`).
  - Grid Pengguna Aktif:
    - Card glass `bg-zinc-900/50 border border-white/5`.
    - Avatar initial dengan glowing ring dan badge role.

- [ ] **Step 2: TypeScript & Lint/Build Check**
  - Jalankan `npx tsc --noEmit`.
  - Jalankan `npm run build` untuk memverifikasi kompilasi clean.

- [ ] **Step 3: Commit Task 2**
  - Jalankan `git add src/app/\(admin\)/admin/dashboard/page.tsx && git commit -m "feat(admin): redesain dashboard dengan tema dark ethereal"`

---

### Task 3: Verifikasi Live & Uji Endpoint

**Files:**
- None (Verifikasi)

- [ ] **Step 1: Verifikasi HTTP 200**
  - Jalankan `curl -I http://127.0.0.1:3003/profile-ifk/admin/dashboard`.
  - Pastikan status 200 OK tanpa error SSR.

- [ ] **Step 2: Push ke Remote & Siapkan Review**
  - Jalankan `git push -u origin feat/admin-shell-dashboard-dark-ethereal`.
  - Berikan URL preview kepada user untuk direview di HP.
