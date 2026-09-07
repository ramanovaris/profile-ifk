# Redesain Modal Master Kategori (Dark Ethereal Elevated) Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Merombak desain visual dan interaksi pada Modal Form Tambah/Edit Kategori dan Dialog Konfirmasi Hapus Kategori di `/admin/kategori` dengan tema Dark Ethereal Elevated, live slug preview, status switcher terintegrasi, dan dependency guard tanpa native alert.

**Architecture:** Memperbarui komponen `AdminKategoriPage` di `src/app/(admin)/admin/kategori/page.tsx` dengan menyematkan state status di modal form, komputasi slug reaktif, dan mengganti native browser `alert()` saat penghapusan dengan Smart Dependency Guard terpadu di dalam dialog konfirmasi.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Lucide React icons, Radix UI Dialog primitives (`@/components/ui/dialog`).

## Global Constraints

- Sesuai instruksi khusus: **DILARANG** menjalankan `npm run build`, `npm run lint`, dan `npx tsc --noEmit` di VPS lokal untuk menghemat memori. Validasi lint, build, dan type check diserahkan sepenuhnya ke GitHub Actions via commit dan push.
- Desain visual: Dark Ethereal (`bg-zinc-950/95`, border `border-white/10`, glow `brand-500/emerald-500` untuk form, glow `red-500/amber-500` untuk dialog hapus).
- Focus ring standard: `focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none`.
- Target viewport review: Desktop mode (`md+`, ~1024px-1280px) dan responsif mobile.

---

### Task 1: Setup Feature Branch

**Files:**
- None (Git command)

- [ ] **Step 1: Pastikan branch develop bersih dan buat branch fitur baru**
  ```bash
  cd /home/ubuntu/projects/profile-ifk
  git checkout develop
  git pull origin develop
  git checkout -b feat/admin-kategori-modals-redesign
  ```

---

### Task 2: Implementasi Redesain Modal Form Tambah/Edit Kategori

**Files:**
- Modify: `src/app/(admin)/admin/kategori/page.tsx`

**Deskripsi Perubahan:**
1. Update interface/type `CategoryInput` agar mencakup status:
   ```ts
   type CategoryInput = {
     name: string;
     status: "ACTIVE" | "INACTIVE";
   };
   ```
2. Update state `formData` di `handleOpenAdd` dan `handleOpenEdit`:
   - `handleOpenAdd`: set `formData({ name: "", status: "ACTIVE" })`
   - `handleOpenEdit`: set `formData({ name: cat.name, status: cat.status })`
3. Update `handleSubmit` agar menyimpan nama, slug, dan status baru.
4. Redesain `DialogContent` untuk Modal Form Tambah/Edit:
   - Header dengan icon badge `<Tag />` (atau `<Pencil />`) beraksen emerald glow.
   - Field nama kategori dengan icon `<Type />` dan token focus ring `focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40`.
   - Live Slug Preview Card dengan icon `<Globe />` dan monospace chip (`/{liveSlug || "..."}`).
   - Status Switcher terintegrasi (switch button Aktif / Non-Aktif dengan keyboard support).
   - Tombol Batal & Simpan dengan gradient emerald dan shadow glow.

- [ ] **Step 1: Terapkan perubahan pada form state dan dialog form tambah/edit**
- [ ] **Step 2: Verifikasi dev server merespons tanpa error kompilasi**
  ```bash
  curl -I http://localhost:3003/profile-ifk/admin/kategori
  ```

---

### Task 3: Implementasi Redesain Dialog Konfirmasi Hapus & Smart Dependency Guard

**Files:**
- Modify: `src/app/(admin)/admin/kategori/page.tsx`

**Deskripsi Perubahan:**
1. Buat helper objek kategori yang sedang ditargetkan:
   ```ts
   const catToDelete = categories.find((c) => c.id === deleteId);
   const catArticleCount = catToDelete ? getArticleCountByCategory(catToDelete.name, dummyArticles) : 0;
   ```
2. Hapus pemanggilan `alert(...)` di `handleDelete`.
3. Redesain `DialogContent` untuk Konfirmasi Hapus:
   - Header dengan icon badge `<AlertTriangle />` ber-ambient glow merah.
   - Category Target Info Card: menampilkan nama kategori dengan icon `<Tags />`, badge slug `/{catToDelete?.slug}`, dan status aktif/non-aktif.
   - Conditional rendering guard:
     - Jika `catArticleCount > 0`: Banner peringatan amber menjelaskan kategori sedang digunakan oleh `catArticleCount` artikel, dan tombol hapus dinonaktifkan (hanya tersedia tombol "Tutup").
     - Jika `catArticleCount === 0`: Pesan konfirmasi bahwa kategori aman dihapus, dengan tombol Batal dan tombol Hapus Kategori merah menyala ber-icon `<Trash2 />`.

- [ ] **Step 1: Terapkan perubahan pada dialog konfirmasi hapus**
- [ ] **Step 2: Verifikasi dev server merespons HTTP 200**
  ```bash
  curl -I http://localhost:3003/profile-ifk/admin/kategori
  ```

---

### Task 4: Commit, Push, dan Buka Pull Request

**Files:**
- None (Git commands)

- [ ] **Step 1: Commit perubahan ke branch fitur**
  ```bash
  git add src/app/\(admin\)/admin/kategori/page.tsx
  git commit -m "feat(admin): redesain modal master kategori dark ethereal dengan live slug dan guard hapus"
  ```
- [ ] **Step 2: Push ke remote repository**
  ```bash
  git push -u origin feat/admin-kategori-modals-redesign
  ```
- [ ] **Step 3: Buka Pull Request ke branch develop**
  ```bash
  gh pr create --base develop --head feat/admin-kategori-modals-redesign --title "feat(admin): redesain modal master kategori dark ethereal dengan live slug dan dependency guard" --body "..."
  ```
- [ ] **Step 4: Pantau CI GitHub Actions hingga status PASS**
  ```bash
  gh pr checks
  ```
