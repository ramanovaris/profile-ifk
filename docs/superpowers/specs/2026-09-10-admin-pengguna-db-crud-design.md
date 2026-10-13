# Spesifikasi Desain: Integrasi Basis Data PostgreSQL & Server Actions Kelola Pengguna (#48)

## 1. Ringkasan Eksekutif
* **Modul:** Panel Admin - Kelola Pengguna (`/admin/pengguna`)
* **Tujuan:** Mengintegrasikan pengelolaan akun administrator & staf UPTD IFK Kotabaru ke basis data relasional PostgreSQL menggunakan Prisma ORM, Server Actions, dan pengamanan sandi `bcryptjs`.
* **Arsitektur:** Pola standar Next.js App Router: *Server Component* untuk data fetching awal (`page.tsx`) + *Client Component* untuk interaktivitas UI & dialog modal (`user-table.tsx`) + *Server Actions* untuk mutasi data (`src/actions/user.ts`).
* **Target Bukti e-Kinerja PNS:** 1 GitHub Issue (#48) dan 1 Pull Request terfokus ke branch `develop`.

---

## 2. Latar Belakang & Skema Data Eksis
Tabel `users` telah terdefinisi pada skema Prisma:
```prisma
enum Role {
  SUPER_ADMIN
  STAFF
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

model User {
  id        String      @id @default(cuid())
  username  String      @unique
  password  String      // bcrypt hash
  name      String
  role      Role        @default(STAFF)
  status    UserStatus  @default(ACTIVE)
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt

  sessions  Session[]
  articles  Article[]

  @@map("users")
}
```

---

## 3. Rencana Komponen & Struktur File

### 3.1. `src/actions/user.ts` (Server Actions Baru)
* **`createUserAction(data: { name: string; username: string; password: string; role: Role; status?: UserStatus })`**:
  * Validasi input wajib: nama (min 3 kar), username (alphanumeric/underscore, min 3 kar), password (min 6 kar).
  * Cek keunikan `username` (case-insensitive) di PostgreSQL.
  * Hashing password dengan `bcryptjs` (salt rounds 10).
  * Simpan record ke tabel `users`.
  * `revalidatePath('/admin/pengguna')`.
* **`updateUserAction(id: string, data: { name: string; username: string; role: Role; status: UserStatus })`**:
  * Validasi eksistensi pengguna.
  * Proteksi akun `admin` utama: peran dan status tidak boleh diturunkan/dinonaktifkan.
  * Cek keunikan username terhadap user lain.
  * Update record via `db.user.update()`.
  * `revalidatePath('/admin/pengguna')`.
* **`toggleUserStatusAction(id: string)`**:
  * Proteksi: tidak dapat menonaktifkan akun sendiri atau akun `admin` utama.
  * Balik status (`ACTIVE` <-> `INACTIVE`).
  * Jika dinonaktifkan, hapus seluruh sesi aktif pengguna di tabel `sessions`.
  * `revalidatePath('/admin/pengguna')`.
* **`resetUserPasswordAction(id: string, newPassword: string)`**:
  * Validasi panjang sandi (min 6 karakter).
  * Hashing password baru dengan `bcryptjs`.
  * Perbarui password di DB & hapus sesi lama pengguna agar wajib login ulang.
  * `revalidatePath('/admin/pengguna')`.
* **`deleteUserAction(id: string)`**:
  * Proteksi akun `admin` utama & akun sesi yang sedang login: dilarang menghapus akun sendiri/utama.
  * Proteksi relasional artikel: tolak hapus jika `_count.articles > 0` (tampilkan pesan edukatif agar artikel dialihkan atau dihapus terlebih dahulu).
  * Hapus sesi dan hapus record dari database.
  * `revalidatePath('/admin/pengguna')`.

### 3.2. `src/app/(admin)/admin/pengguna/page.tsx` (Server Component)
* Mengubah `page.tsx` menjadi async Server Component.
* Membaca daftar pengguna dari PostgreSQL via singleton `db.user.findMany`:
  ```ts
  const users = await db.user.findMany({
    select: {
      id: true,
      username: true,
      name: true,
      role: true,
      status: true,
      createdAt: true,
      _count: {
        select: { articles: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  ```
  *(Catatan keamanan: kolom `password` tidak diseleksi ke client).*
* Menghitung metrik ringkasan (Total, Super Admin, Staf Aktif, Nonaktif).
* Meneruskan data ke `<UserTable />` di dalam `<AdminShell>`.

### 3.3. `src/app/(admin)/admin/pengguna/user-table.tsx` (Client Component)
* Pemisahan komponen interaktif dari `page.tsx`.
* Mempertahankan desain Dark Ethereal, pagination, search, role filter pill bar.
* Mempertahankan standarisasi tombol modal dialog 50/50 simetris yang sudah dibuat pada Issue #44.
* Menghubungkan form tambah, edit, reset sandi, toggle status, dan hapus ke Server Actions dengan `useTransition` dan feedback notifikasi `toast`.

### 3.4. `prisma/seed.ts` (Pembaruan Seeder)
* Menambahkan seeder idempoten untuk akun staf awal (`staff1` dan `staff2`) agar database terisi lengkap sesuai data operasional awal.

---

## 4. Keamanan & Integritas Data
1. **Penyembunyian Hash Sandi:** `select` pada Server Component dan kembalian Server Actions tidak pernah mengekspos hash sandi ke client browser.
2. **Kunci Akun Super Admin Utama:** Username `admin` dilindungi secara ketat dari penghapusan, penggantian username, maupun penonaktifan.
3. **Pembersihan Sesi (*Session Invalidation*):** Saat sandi di-reset atau status akun diubah menjadi `INACTIVE`, seluruh data pada tabel `sessions` untuk user terkait otomatis dihapus.
4. **Relational Guard:** Mencegah *orphan articles* dengan melarang penghapusan pengguna yang memiliki artikel publikasi.

---

## 5. Rencana Verifikasi & Uji
1. Uji tambah akun baru staf dan verifikasi keunikan username.
2. Uji toggle status aktif/nonaktif dan verifikasi update ke DB.
3. Uji reset sandi dan coba login menggunakan sandi baru.
4. Uji proteksi hapus pada akun `admin` utama dan akun dengan artikel.
5. Uji build & linting lokal / CI GitHub Actions.
