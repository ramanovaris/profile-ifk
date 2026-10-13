# Implementation Plan: Fitur Alih Kepemilikan Penulis (Reassign Author) Artikel Berita (Issue #50)

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengimplementasikan kemampuan alih kepemilikan penulis artikel berita di modul admin UPTD Instalasi Farmasi Kotabaru, mencakup pemilih penulis pada form artikel bagi Super Admin, alih kepemilikan interaktif saat penghapusan akun staf di modul pengguna, serta pengamanan transaksi basis data atomik di PostgreSQL.

**Architecture:** Memanfaatkan Prisma Client `db.$transaction` untuk atomic reassign-and-delete, memperluas Server Actions di `src/actions/article.ts` dan `src/actions/user.ts` dengan validasi RBAC (`SUPER_ADMIN`), serta mengintegrasikan antarmuka *Dark Ethereal* pada `ArticleForm` dan `UserTable`.

**Tech Stack:** Next.js 15 App Router, React 19, Prisma ORM, PostgreSQL, Tailwind CSS, Lucide Icons, TypeScript.

## Global Constraints
- Jangan jalankan `npm run build`, `npm run lint`, atau `npx tsc` di VPS guna menghemat resource RAM/CPU (serahkan ke GitHub Actions CI).
- Verifikasi logika backend melalui skrip mandiri `npx tsx scripts/verify-article-reassign.ts`.
- Desain UI Dark Ethereal konsisten dengan standar admin (`zinc-900/950`, border `white/10`, aksen `brand-500/emerald`).
- Anti-pattern: Jangan mendefinisikan komponen React di dalam komponen lain (*never define a component inside another component*).

---

### Task 1: Ekstensi Server Actions Artikel dengan Dukungan `authorId` & RBAC Guard

**Files:**
- Modify: `src/actions/article.ts`
- Target functions: `createArticleAction`, `updateArticleAction`, `bulkReassignArticlesAction`

**Interfaces:**
- Consumes: `getCurrentSession()`, `db.article`, `db.user`
- Produces: 
  - `ArticleInput.authorId?: string`
  - `bulkReassignArticlesAction(sourceUserId: string, targetUserId: string)`

- [ ] **Step 1: Perbarui tipe `ArticleInput` & helper `parseArticlePayload`**
  - Tambahkan `authorId?: string` pada `ArticleInput`.
  - Ekstrak `authorId` dari FormData di `parseArticlePayload`.
- [ ] **Step 2: Tambahkan logika RBAC pada `createArticleAction`**
  - Jika pengguna adalah `SUPER_ADMIN` dan memilih `authorId`, validasi keberadaan user tersebut di database (`status: 'ACTIVE'`).
  - Jika valid, gunakan `authorId` tersebut. Jika staf biasa (`STAFF`), abaikan dan selalu gunakan `auth.user.id`.
- [ ] **Step 3: Tambahkan logika RBAC pada `updateArticleAction`**
  - Jika pengguna adalah `SUPER_ADMIN` dan mengirimkan `authorId`, perbarui relasi `authorId` pada artikel.
- [ ] **Step 4: Buat Server Action `bulkReassignArticlesAction`**
  - Hanya dapat diakses oleh `SUPER_ADMIN`.
  - Mengalihkan seluruh artikel dari `sourceUserId` ke `targetUserId` via `db.article.updateMany`.
  - Melakukan revalidasi path `/admin/berita`, `/berita`, `/`.
- [ ] **Step 5: Commit**
  - `git add src/actions/article.ts && git commit -m "feat(actions): tambah dukungan authorId dan bulkReassignArticlesAction di article.ts"`

---

### Task 2: Penyempurnaan Server Action `deleteUserAction` dengan Transaksi Atomik

**Files:**
- Modify: `src/actions/user.ts`
- Target function: `deleteUserAction`

**Interfaces:**
- Consumes: `db.$transaction`, `db.article`, `db.session`, `db.user`
- Produces: `deleteUserAction(id: string, reassignToUserId?: string)`

- [ ] **Step 1: Modifikasi signature `deleteUserAction`**
  - Terima parameter kedua opsional: `reassignToUserId?: string`.
- [ ] **Step 2: Implementasi validasi & transaksi atomik**
  - Cek jumlah artikel target (`targetUser._count.articles`).
  - Jika `_count.articles > 0`:
    - Wajib menyertakan `reassignToUserId`.
    - Pastikan `reassignToUserId !== id`.
    - Pastikan akun penerima berstatus `ACTIVE`.
  - Jalankan `db.$transaction`:
    1. Update semua artikel `authorId: id` menjadi `authorId: reassignToUserId`.
    2. Hapus semua sesi milik user `id`.
    3. Hapus user `id`.
  - Revalidasi path `/admin/pengguna`, `/admin/berita`, dan `/berita`.
- [ ] **Step 3: Commit**
  - `git add src/actions/user.ts && git commit -m "feat(actions): perbarui deleteUserAction dengan dukungan alih kepemilikan atomik"`

---

### Task 3: Pembuatan Skrip Pengujian Otomatis Verifikasi Backend

**Files:**
- Create: `scripts/verify-article-reassign.ts`

- [ ] **Step 1: Tulis skrip verifikasi komprehensif**
  - Test 1: Pembuatan artikel oleh Super Admin dengan penugasan ke staf lain.
  - Test 2: Pembaruan kepemilikan artikel oleh Super Admin.
  - Test 3: Pengalihan massal artikel melalui `bulkReassignArticlesAction`.
  - Test 4: Eksekusi `deleteUserAction` dengan transfer artikel atomik (verifikasi artikel berpindah & user terhapus).
  - Test 5: Proteksi integritas relasional (tidak ada artikel dengan foreign key invalid).
- [ ] **Step 2: Jalankan pengujian**
  - `npx tsx scripts/verify-article-reassign.ts` → pastikan semua skenario PASS.
- [ ] **Step 3: Commit**
  - `git add scripts/verify-article-reassign.ts && git commit -m "test: tambah skrip verifikasi otomatis alih kepemilikan penulis artikel"`

---

### Task 4: Integrasi Data Pengguna pada Server Component Halaman Berita Admin

**Files:**
- Modify: `src/app/(admin)/admin/berita/baru/page.tsx`
- Modify: `src/app/(admin)/admin/berita/[id]/edit/page.tsx`

- [ ] **Step 1: Query pengguna aktif dan sesi pada `baru/page.tsx`**
  - Ambil sesi login via `getCurrentSession()`.
  - Ambil daftar staf & admin aktif (`db.user.findMany({ where: { status: 'ACTIVE' } })`).
  - Teruskan props `currentUserRole`, `currentUserId`, dan `availableAuthors` ke `ArticleForm`.
- [ ] **Step 2: Query penulis artikel, pengguna aktif, dan sesi pada `[id]/edit/page.tsx`**
  - Sertakan `authorId` dan relasi `author` pada query `db.article.findUnique`.
  - Teruskan props `currentUserRole`, `currentUserId`, `currentAuthorId`, dan `availableAuthors` ke `ArticleForm`.
- [ ] **Step 3: Commit**
  - `git add src/app/(admin)/admin/berita/ && git commit -m "feat(admin-berita): teruskan data pengguna dan hak akses ke ArticleForm"`

---

### Task 5: Integrasi UI Author Selector pada `ArticleForm`

**Files:**
- Modify: `src/components/admin/article-form.tsx`

- [ ] **Step 1: Tambahkan interface props & author state**
  - Definisikan tipe `FormAuthorOption = { id: string; name: string; username: string; role: Role }`.
  - Tambahkan props: `currentUserRole?: Role`, `currentUserId?: string`, `currentAuthorId?: string`, `availableAuthors?: FormAuthorOption[]`.
  - State: `selectedAuthorId` (diinisialisasi dari `currentAuthorId` atau `currentUserId`).
- [ ] **Step 2: Implementasikan Komponen UI Author Selector**
  - Jika `currentUserRole === 'SUPER_ADMIN'`:
    - Render dropdown pemilihan penulis dengan pencarian cepat nama/username staf.
    - Desain Dark Ethereal: bingkai kaca `border-white/10 bg-zinc-900/80`, ikon `Users`/`UserCheck`, avatar inisial, dan lencana peran.
  - Jika `currentUserRole !== 'SUPER_ADMIN'`:
    - Render kartu read-only berisi nama penulis, avatar inisial, dan ikon gembok `Lock` dengan keterangan ramah.
- [ ] **Step 3: Teruskan `selectedAuthorId` ke form payload**
  - Sertakan `selectedAuthorId` dalam pemanggilan Server Action.
- [ ] **Step 4: Commit**
  - `git add src/components/admin/article-form.tsx && git commit -m "feat(admin-berita): integrasi pemilih penulis naskah pada ArticleForm"`

---

### Task 6: Integrasi UI Dialog Alih Kepemilikan pada `UserTable`

**Files:**
- Modify: `src/app/(admin)/admin/pengguna/user-table.tsx`

- [ ] **Step 1: Tambahkan state alih kepemilikan pada modal hapus**
  - State: `reassignTargetUserId: string`.
  - Saring daftar penerima yang valid: `users.filter(u => u.status === 'ACTIVE' && u.id !== deleteId)`.
- [ ] **Step 2: Rancang ulang dialog hapus saat `hasArticles === true`**
  - Ganti pesan blokir pasif dengan antarmuka interaktif pemindahan artikel.
  - Tambahkan dropdown pemilih akun penerima berdesain rapi (*avatar*, nama lengkap, username, dan peran).
  - Validasi: Tombol konfirmasi hanya aktif jika target penerima telah dipilih.
  - Tombol aksi: *"Alihkan [N] Artikel & Hapus Akun"*.
- [ ] **Step 3: Panggil `deleteUserAction(deleteId, reassignTargetUserId)`**
  - Tangani feedback visual (*loading spinner*, toast success/error).
  - Perbarui state pengguna di tabel secara reaktif.
- [ ] **Step 4: Commit**
  - `git add src/app/(admin)/admin/pengguna/user-table.tsx && git commit -m "feat(admin-pengguna): sediakan opsi alih kepemilikan artikel pada modal hapus pengguna"`

---

### Task 7: Verifikasi Menyeluruh, Dev Server Check, & Pull Request

**Files:**
- Run test: `scripts/verify-article-reassign.ts`
- Verify endpoints: `/admin/berita`, `/admin/pengguna`

- [ ] **Step 1: Jalankan skrip verifikasi otomatis**
  - `npx tsx scripts/verify-article-reassign.ts`
  - Pastikan semua skenario pengujian 100% lulus.
- [ ] **Step 2: Verifikasi responsivitas server lokal**
  - Jalankan `curl -sI http://127.0.0.1:3003/profile-ifk/admin/berita/`
  - Pastikan dev server mengembalikan HTTP 200/307 tanpa crash.
- [ ] **Step 3: Buat Pull Request ke branch `develop`**
  - Push branch `feat/50-reassign-author-berita` ke remote.
  - Buat PR menggunakan `gh pr create` yang terhubung ke Issue #50.
  - Pantau GitHub Actions CI hingga status Green (lulus).
