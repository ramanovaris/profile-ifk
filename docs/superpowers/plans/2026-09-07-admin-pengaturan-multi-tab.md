# Modul Pengaturan Website Multi-Tab Admin Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Membangun modul Pengaturan Website Multi-Tab (`/admin/pengaturan`) dan mengintegrasikannya ke Admin Shell dengan tema Dark Ethereal untuk mengelola identitas lembaga, kontak/lokasi, konten profil UPTD, dan tautan layanan eksternal.

**Architecture:** Menggunakan komponen halaman Client Component (`"use client"`) di `src/app/(admin)/admin/pengaturan/page.tsx` dengan segmented tab bar horizontal untuk navigasi antar 3 domain pengaturan (`identitas`, `profil`, `tautan`). Data diinisialisasi dari `siteConfig` dan data profil dummy, dikelola via React state modular dengan in-page alert banner feedback, serta ditambahkan rute navigasi baru di `src/components/admin/admin-shell.tsx`.

**Tech Stack:** Next.js (App Router), React 19, Tailwind CSS v4, Lucide React icons, Base UI / custom dark components.

## Global Constraints
- **Larangan Eksekusi Build/Lint di VPS Lokal**: Dilarang menjalankan `npm run build`, `npm run lint`, dan `npx tsc --noEmit` di VPS lokal. Semua pengujian build & lint didelegasikan ke runner GitHub Actions melalui commit → push PR.
- **Dark Ethereal Styling**: Latar kartu `bg-zinc-900/60 backdrop-blur-xl border border-white/5`, input focus `border-brand-500/60 ring-2 ring-brand-500/40`.
- **Mobile Touch Safety**: Semua interaksi tombol menggunakan `[@media(hover:hover)]` untuk mencegah sticky hover di layar sentuh, dipadu `active:scale-[0.98]`.
- **Branch Target**: Fitur dikembangkan di branch ephemeral `feat/admin-settings-multi-tab` berbasis `develop`, kemudian diajukan via PR untuk ditinjau dan di-squash merge.

---

### Task 1: Integrasi Menu Navigasi Pengaturan di Admin Shell

**Files:**
- Modify: `src/components/admin/admin-shell.tsx`

**Interfaces:**
- Menambahkan import ikon `Settings` dari `lucide-react`.
- Menambahkan `{ href: "/admin/pengaturan", label: "Pengaturan", icon: Settings }` ke array `sidebarLinks`.

**Steps:**
- [ ] **Step 1: Edit `src/components/admin/admin-shell.tsx`** — Tambahkan `Settings` ke import dan array navigasi.
- [ ] **Step 2: Verifikasi Perubahan** — Periksa diff perubahan dengan `git diff src/components/admin/admin-shell.tsx`.

---

### Task 2: Implementasi Halaman Multi-Tab Pengaturan (`/admin/pengaturan/page.tsx`)

**Files:**
- Create: `src/app/(admin)/admin/pengaturan/page.tsx`

**Interfaces:**
- Tab IDs: `"identitas" | "profil" | "tautan"`
- State Management:
  - `activeTab`: mengontrol tab yang aktif
  - `identityForm`: nama instansi, inisial, tagline, motto, alamat, jam operasional, telepon, WhatsApp, email, link iframe Google Maps.
  - `profileForm`: nama kepala UPTD, jabatan, foto pimpinan (URL/mock), naskah sambutan, visi, butir-butir misi, dan tupoksi.
  - `linksForm`: URL SP4N LAPOR!, portal Dinkes, akun Instagram, Facebook, YouTube, status toggle banner darurat, dan teks pengumuman.
  - `feedback`: state notifikasi in-page (sukses/info) setelah simpan form.

**Sub-Components / Section Modules:**
1. **Header & Segmented Tab Navigation Bar**:
   - Breadcrumb navigasi, judul "Pengaturan Website", badge `System Config`.
   - 3 tombol tab dengan ikon (`Building2`, `FileText`, `Link2`) dengan class hover responsif.
2. **Tab 1: Identitas & Kontak**:
   - Kartu Informasi Lembaga (Nama, Nama Pendek, Tagline, Motto).
   - Kartu Kontak & Lokasi (Alamat, Jam Buka, No Telp, WhatsApp, Email, Maps URL + live mini iframe preview).
3. **Tab 2: Konten Profil UPTD**:
   - Kartu Pimpinan & Sambutan (Avatar 3:4 preview + mock change button, Nama & Gelar, Jabatan, Naskah Sambutan).
   - Kartu Visi, Misi & Tupoksi (Textarea visi, butir misi, teks tupoksi).
4. **Tab 3: Tautan & Layanan**:
   - Kartu Portal Eksternal & Media Sosial (SP4N LAPOR!, Dinkes Kotabaru, Instagram, Facebook, YouTube).
   - Kartu Banner Pengumuman Darurat (Switch toggle aktif/nonaktif, Tipe badge pengumuman, Pesan banner).
5. **Action Bar & Feedback Banner**:
   - Tombol "Simpan Perubahan" (`Save`) dan "Reset Form" (`RotateCcw`).
   - In-page notification banner berwarna hijau ambient saat tersimpan.

**Steps:**
- [ ] **Step 1: Buat file `src/app/(admin)/admin/pengaturan/page.tsx`** dengan seluruh spesifikasi di atas.
- [ ] **Step 2: Verifikasi live preview** di dev server port 3003 (`http://localhost:3003/profile-ifk/admin/pengaturan`).

---

### Task 3: Git Branch, Commit, Push, dan Pull Request

**Files:**
- New Branch: `feat/admin-settings-multi-tab`
- Committed Files:
  - `docs/superpowers/specs/2026-09-07-admin-pengaturan-multi-tab-design.md`
  - `docs/superpowers/plans/2026-09-07-admin-pengaturan-multi-tab.md`
  - `src/components/admin/admin-shell.tsx`
  - `src/app/(admin)/admin/pengaturan/page.tsx`

**Steps:**
- [ ] **Step 1: Buat branch baru dari `develop`**: `git checkout -b feat/admin-settings-multi-tab`.
- [ ] **Step 2: Stage & Commit**: `git add . && git commit -m "feat(admin): buat halaman pengaturan website multi-tab tema dark ethereal"`.
- [ ] **Step 3: Push ke remote**: `git push -u origin feat/admin-settings-multi-tab`.
- [ ] **Step 4: Buat Pull Request** ke `develop` menggunakan GitHub CLI (`gh pr create`).
- [ ] **Step 5: Verifikasi CI GitHub Actions**: Pantau pipeline CI (`gh run watch` / `gh pr checks`) hingga seluruh job (*Type Check*, *ESLint*, *Build*) PASS.

---

### Task 4: Review Pengguna & Penggabungan (Merge)

- [ ] **Step 1: Kirimkan URL live preview** ke pengguna untuk dievaluasi di HP Android Chrome (mode desktop & mobile).
- [ ] **Step 2: Tunggu persetujuan pengguna**.
- [ ] **Step 3: Squash merge PR ke `develop`** dan hapus branch ephemeral.
