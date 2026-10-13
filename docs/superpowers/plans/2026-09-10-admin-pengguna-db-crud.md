# Implementasi Integrasi Basis Data PostgreSQL & Server Actions Kelola Pengguna (#48)

> **Untuk agen/developer:** Ikuti rencana tugas terinci di bawah ini secara bertahap.

**Goal:** Mengintegrasikan pengelolaan pengguna admin (`/admin/pengguna`) ke basis data PostgreSQL menggunakan Prisma ORM, Server Actions dengan enkripsi `bcryptjs`, proteksi akun utama, dan mempertahankan dialog modal simetris 50/50.

**Arsitektur:** Next.js Server Component (`page.tsx`) untuk fetching data dan metrik + Client Component (`user-table.tsx`) untuk interaktivitas tabel dan modal + Server Actions (`src/actions/user.ts`) untuk mutasi database relasional.

**Tech Stack:** Next.js 16 (App Router), Prisma ORM, PostgreSQL, bcryptjs, Tailwind CSS, Lucide Icons, Custom Toast.

## Global Constraints
- Tetap gunakan standard layout tombol modal 50/50 (`grid grid-cols-2 gap-3 h-10 rounded-xl`).
- Lindungi akun utama `admin` dari penonaktifan atau penghapusan.
- Tolak penghapusan user yang masih memiliki relasi artikel berita (`_count.articles > 0`).
- Hash sandi menggunakan `bcryptjs` (salt rounds 10).
- Jangan ekspos hash password ke client.

---

### Task 1: Persiapan Branch & Seeder Pengguna Awal
**Files:**
- Create/Checkout branch: `feat/48-admin-pengguna-db-crud`
- Modify: `prisma/seed.ts`

**Langkah:**
1. Checkout branch baru dari `develop`: `git checkout -b feat/48-admin-pengguna-db-crud`.
2. Tambahkan akun staf awal (`staff1` dan `staff2`) secara idempoten di `prisma/seed.ts` dengan hashing `bcryptjs`.
3. Jalankan `npx prisma db seed` untuk menyinkronkan data pengguna awal ke PostgreSQL VPS.

---

### Task 2: Implementasi Server Actions Pengguna (`src/actions/user.ts`)
**Files:**
- Create: `src/actions/user.ts`

**Fungsi:**
- `createUserAction`: Input nama, username, password, role, status. Validasi username unik case-insensitive, hash sandi, create ke DB, revalidate.
- `updateUserAction`: Update nama, role, status pengguna. Lindungi akun utama `admin` agar tidak diturunkan perannya atau dinonaktifkan.
- `toggleUserStatusAction`: Toggle status user. Tolak jika menonaktifkan akun sendiri atau `admin` utama. Bersihkan `sessions` jika user dinonaktifkan.
- `resetUserPasswordAction`: Update sandi baru ber-hash `bcryptjs`, bersihkan sesi lama di `sessions`.
- `deleteUserAction`: Tolak jika akun `admin` utama, akun sesi sendiri, atau `_count.articles > 0`. Hapus sessions lalu hapus user.

---

### Task 3: Refaktor Halaman Pengguna (`page.tsx` & `user-table.tsx`)
**Files:**
- Modify: `src/app/(admin)/admin/pengguna/page.tsx`
- Create: `src/app/(admin)/admin/pengguna/user-table.tsx`

**Langkah:**
1. Buat `user-table.tsx` sebagai Client Component yang menampung seluruh logika interaktif, tabel, pencarian, filter peran, paginasi, dan modal-modal simetris 50/50.
2. Hubungkan form tambah, edit, reset sandi, toggle status, dan hapus ke Server Actions di `src/actions/user.ts` dengan transisi `useTransition` dan feedback `toast`.
3. Ubah `page.tsx` menjadi Server Component async yang mengambil data users dari `db.user.findMany` (termasuk count artikel) dan merender `UserTable`.

---

### Task 4: Verifikasi Fungsional & Integritas
**Langkah:**
1. Jalankan script verifikasi atau lakukan pengujian mutasi:
   - Verifikasi data pengguna tampil di tabel dari PostgreSQL.
   - Verifikasi tambah staf baru berhasil.
   - Verifikasi toggle status berhasil.
   - Verifikasi reset sandi berhasil dan hash tersimpan di DB.
   - Verifikasi proteksi hapus akun `admin` utama berfungsi (tombol modal "Tutup / Mengerti").
2. Pastikan tidak ada error runtime di terminal atau dev server.

---

### Task 5: Git Commit, Push, dan Pull Request
**Langkah:**
1. Review `git diff` dan `git status`.
2. Commit dengan pesan konvensional: `feat(pengguna): implementasi server actions dan integrasi database postgresql (#48)`.
3. Push branch ke GitHub dan buat Pull Request ke `develop` mengaitkan Issue #48.
4. Pantau CI GitHub Actions hingga status PASS.
