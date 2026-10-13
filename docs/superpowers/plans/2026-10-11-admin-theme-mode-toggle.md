# Fitur Pemilih Tema Admin (Light, Dark, Sistem) Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Menambahkan fitur pengalihan tema tampilan (Light Mode, Dark Mode, dan Deteksi Tema Sistem) dengan dropdown menu pada header Admin IFK Kotabaru, serta menyelaraskan tema visual Batch 1 (Admin Shell & Dashboard).

**Architecture:** Menggunakan scoped CSS semantic tokens pada `.admin-root[data-admin-theme="light"|"dark"]`, state management tema lokal berbasis `localStorage` dan sinkronisasi real-time `window.matchMedia("(prefers-color-scheme: dark)")` tanpa dependensi eksternal tambahan.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, `@base-ui/react/menu`, Lucide Icons.

## Global Constraints

- **Hemat RAM VPS:** DILARANG menjalankan `next build` atau `npx tsc` secara manual di VPS (2GB RAM). Kompilasi dan typecheck diserahkan ke GitHub Actions CI.
- **Verifikasi Mandiri:** Gunakan skrip validasi mandiri berbasis `tsx` (`scripts/verify-admin-theme-toggle.ts`) dan pengujian browser.
- **Protokol GitFlow & e-Kinerja:** Buat GitHub Issue terdaftar pada GitHub Projects #1 (PNS), buat feature branch bertaut nomor issue, buat PR ke `develop`, dan DILARANG auto-merge tanpa persetujuan eksplisit pengguna.
- **Aturan Visual & Review HP:** Kerjakan perubahan per batch (Batch 1: Shell + Dashboard), lalu sajikan skenario pengujian untuk review pengguna di HP/Desktop.

---

### Task 1: Registrasi GitHub Issue, Tautkan ke Project PNS, dan Buat Feature Branch

**Files:**
- N/A (GitHub API & Git CLI)

**Interfaces:**
- Produces: Nomor Issue GitHub baru, kartu Projects V2, dan branch aktif `feat/<issue-number>-admin-theme-mode-toggle`

- [ ] **Step 1: Draf narasi e-Kinerja birokrasi & buat GitHub Issue**
  - Judul: `feat(admin-theme): penambahan fitur pemilih tema terang, gelap, dan sistem pada menu pengelola`
  - Redaksi e-Kinerja: `"Melaksanakan pengembangan fitur penyesuaian mode tampilan (tema terang, gelap, dan otomatis sistem) pada menu pengelola website Profile IFK guna meningkatkan kenyamanan visual dan efektivitas operasional staf dalam pengelolaan sistem informasi kefarmasian."`
- [ ] **Step 2: Daftarkan ke GitHub Projects V2 (PNS)**
  - Tautkan Issue URL ke Project #1.
  - Set Status ke `Todo`, Priority ke `P1`, Sudah masuk ekin ke `belum masuk`, dan isi `redaksi e-kinerja simpeg`.
- [ ] **Step 3: Buat dan beralih ke feature branch**
  - Command: `git checkout -b feat/<issue-number>-admin-theme-mode-toggle`

---

### Task 2: Definisi Token CSS Tema Admin di `src/app/globals.css`

**Files:**
- Modify: `src/app/globals.css`

**Interfaces:**
- Consumes: Tailwind v4 inline theme & custom properties
- Produces: Variabel CSS `.admin-root[data-admin-theme="light"]` dan `.admin-root[data-admin-theme="dark"]` (`--admin-bg`, `--admin-surface`, `--admin-border`, `--admin-text`, `--admin-muted`, dll.)

- [ ] **Step 1: Tambahkan blok token CSS semantik admin**
  - Definisikan warna kontras bersih untuk tema `light` (latar putih/slate-50, teks zinc-900, border zinc-200, kartu putih bersinar halus).
  - Definisikan warna *Dark Ethereal* untuk tema `dark` (latar zinc-950, kartu zinc-900/60, border white/5, teks zinc-100).
- [ ] **Step 2: Commit konfigurasi CSS**
  - Command: `git add src/app/globals.css && git commit -m "style(admin): tambahkan token css variabel light dan dark mode admin"`

---

### Task 3: Implementasi Komponen `ThemeDropdown` dan Update `AdminShell`

**Files:**
- Create/Extract: `src/components/admin/theme-dropdown.tsx`
- Modify: `src/components/admin/admin-shell.tsx`

**Interfaces:**
- Produces: Komponen pemilih tema dengan 3 opsi (Terang, Gelap, Sistem) menggunakan `@base-ui/react/menu`
- Consumes: `localStorage`, `window.matchMedia`, `DropdownMenu` primitive

- [ ] **Step 1: Buat komponen `ThemeDropdown`**
  - Opsi: `"light"` (Terang - Sun), `"dark"` (Gelap - Moon), `"system"` (Sistem - Monitor/Laptop).
  - Indikator centang (`CheckIcon`) pada opsi yang sedang aktif.
  - Trigger icon adaptif sesuai preferensi pengguna.
- [ ] **Step 2: Integrasikan state tema dan listener di `AdminShell`**
  - State: `themeSetting: 'light' | 'dark' | 'system'` (default `'light'`).
  - Efek baca `localStorage` saat mount di client.
  - Listener `change` pada `matchMedia("(prefers-color-scheme: dark)")` jika `themeSetting === "system"`.
  - Pasang atribut `data-admin-theme={resolvedTheme}` dan class `admin-root` pada root kontainer.
  - Letakkan `ThemeDropdown` di top header bar sebelum avatar profil.
  - Update styling sidebar, header, sheet drawer, dan background ambient glow agar mendukung mode Terang dan Gelap.
- [ ] **Step 3: Commit komponen `AdminShell`**
  - Command: `git add src/components/admin/theme-dropdown.tsx src/components/admin/admin-shell.tsx && git commit -m "feat(admin): integrasi theme dropdown dan dynamic system detection di admin shell"`

---

### Task 4: Penyelarasan Tema Halaman Dashboard (`/admin/dashboard/`)

**Files:**
- Modify: `src/app/(admin)/admin/dashboard/page.tsx`

**Interfaces:**
- Consumes: Token semantik admin dan utility classes adaptif
- Produces: Tampilan kartu metrik KPI, header sapaan, dan tabel pratinjau yang tajam dan nyaman dibaca pada Light Mode maupun Dark Mode

- [ ] **Step 1: Sesuaikan class kartu KPI stat dan tabel artikel**
  - Ganti warna hardcoded latar belakang dan teks kartu KPI menjadi adaptif (`bg-[var(--admin-card-bg)]`, border `border-[var(--admin-card-border)]`, teks `text-[var(--admin-text-main)]`).
  - Pastikan badge status artikel terbit/draf dan role pengguna tetap kontras dan beraksen khas IFK.
- [ ] **Step 2: Commit pembaruan dashboard**
  - Command: `git add "src/app/(admin)/admin/dashboard/page.tsx" && git commit -m "style(admin-dashboard): selaraskan komponen dashboard dengan light dan dark mode"`

---

### Task 5: Skrip Uji Verifikasi Mandiri & Validasi Responsif

**Files:**
- Create: `scripts/verify-admin-theme-toggle.ts`

**Interfaces:**
- Produces: Skrip validasi parsing file, sintaks token CSS, dan keberadaan fungsi tema

- [ ] **Step 1: Tulis skrip verifikasi `scripts/verify-admin-theme-toggle.ts`**
  - Cek keberadaan token CSS semantik di `src/app/globals.css`.
  - Cek ekspor dan integrasi `ThemeDropdown` di `admin-shell.tsx`.
  - Validasi bahwa default tema adalah `'light'`.
  - Validasi bahwa logika `prefers-color-scheme` dan `localStorage` diterapkan.
- [ ] **Step 2: Jalankan skrip verifikasi**
  - Command: `npx tsx scripts/verify-admin-theme-toggle.ts`
- [ ] **Step 3: Verifikasi HTTP pada dev server**
  - Command: `curl -s -L http://localhost:3003/profile-ifk/admin/dashboard/ | head -n 30`

---

### Task 6: Push Branch, Buka Pull Request & Sajikan Skenario Uji

**Files:**
- N/A (Git CLI & GitHub CLI)

**Interfaces:**
- Produces: PR baru di GitHub tertaut ke Issue, status Projects V2 terupdate

- [ ] **Step 1: Push branch fitur ke remote**
  - Command: `git push -u origin feat/<issue-number>-admin-theme-mode-toggle`
- [ ] **Step 2: Buka Pull Request via GitHub CLI**
  - Command: `gh pr create --base develop --title "feat(admin-theme): fitur pemilih tema light, dark, dan deteksi sistem" --body-file /tmp/pr_body.md`
  - Tautkan PR ke Project PNS (#1).
- [ ] **Step 3: Pantau CI GitHub Actions**
  - Command: `gh pr checks <PR-number> --watch`
- [ ] **Step 4: Sajikan skenario pengujian terstruktur kepada pengguna dan BERHENTI untuk review (DILARANG auto-merge).**
