# Spesifikasi Desain: Pondasi Database PostgreSQL, Prisma ORM & Autentikasi Sesi Admin (Tahap 1)

**Tanggal:** 2026-09-08  
**Proyek:** Website Profil Resmi & Portal Berita UPTD Instalasi Farmasi Kab. Kotabaru (`profile-ifk`)  
**Status:** Disetujui (Approved)  
**Dokumen Referensi:** `docs/PRD Website Profil Resmi & Portal Berita UPTD Instalasi Farmasi Kab. Kotabaru.md`

---

## 1. Latar Belakang & Tujuan
Aplikasi web `profile-ifk` sebelumnya telah menyelesaikan seluruh implementasi antarmuka pengguna (UI/UX) di sisi publik maupun admin (login, dashboard, berita, kategori, pengguna, profil, pengaturan, dan stok obat). Saat ini, seluruh data dan autentikasi masih bersifat statis atau in-memory (`dummy-data.ts`).

Tujuan Tahap 1 dari inisiatif Backend & Database ini adalah:
1. Menyediakan database relasional mandiri (*self-hosted*) menggunakan PostgreSQL lokal di VPS tanpa ketergantungan pihak ketiga.
2. Mengintegrasikan Prisma ORM dengan skema data lengkap dan terstruktur yang siap mendukung seluruh modul ke depan tanpa migrasi destruktif.
3. Mengimplementasikan sistem autentikasi sesi berbasis **Native HTTP-Only Session Cookie** dan hashing kata sandi **bcrypt** yang aman terhadap serangan XSS dan CSRF.
4. Membangun *instant session revocation* berbasis database (sesi staf otomatis terputus seketika saat dinonaktifkan atau saat kata sandi diubah).
5. Mengamankan seluruh rute `/admin/*` menggunakan Next.js Middleware dan otorisasi berlapis berbasis peran (`SUPER_ADMIN` vs `STAFF`).
6. Menyediakan seeder otomatis akun Super Admin pertama yang dikonfigurasi melalui *environment variables*.

---

## 2. Arsitektur Teknis & Stack

* **Database Engine:** PostgreSQL 16+ (Lokal di VPS Linux Ubuntu, port default 5432).
* **Database Name & User:** `profile_ifk` dengan user PostgreSQL terisolasi.
* **ORM:** Prisma ORM (`prisma`, `@prisma/client`).
* **Framework:** Next.js 16 (App Router, React 19, TypeScript).
* **Hashing Pustaka:** `bcryptjs` (salt rounds 10, murni JavaScript/Node.js, kompatibel penuh tanpa kompilasi native build).
* **Manajemen Sesi:** Stateful Database Session + Crypto Token terenkripsi pada HTTP-Only Cookie.
* **Akses Data:** Next.js Server Actions (`"use server"`) dan Server Components.
* **Proteksi Akses:** Next.js Middleware (`src/middleware.ts`) + validasi server-side di level Server Actions.

---

## 3. Skema Database (Prisma Schema)

Berkas: `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  SUPER_ADMIN
  STAFF
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

enum CategoryStatus {
  ACTIVE
  INACTIVE
}

enum StockStatus {
  AVAILABLE
  LOW
  EMPTY
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

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expiresAt    DateTime
  createdAt    DateTime @default(now())

  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([sessionToken])
  @@map("sessions")
}

model Category {
  id        String         @id @default(cuid())
  name      String         @unique
  slug      String         @unique
  status    CategoryStatus @default(ACTIVE)
  createdAt DateTime       @default(now())
  updatedAt DateTime       @updatedAt

  articles  Article[]

  @@map("categories")
}

model Article {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  coverImage  String?
  isPublished Boolean  @default(true)
  publishedAt DateTime @default(now())
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id])

  authorId    String
  author      User     @relation(fields: [authorId], references: [id])

  @@index([slug])
  @@index([categoryId])
  @@map("articles")
}

model MedicineStock {
  id        String      @id @default(cuid())
  code      String      @unique
  name      String
  category  String
  unit      String
  quantity  Int         @default(0)
  status    StockStatus @default(AVAILABLE)
  updatedAt DateTime    @updatedAt
  createdAt DateTime    @default(now())

  @@index([category])
  @@index([status])
  @@map("medicine_stocks")
}

model SiteSetting {
  id                  String   @id @default("default")
  name                String
  shortName           String
  address             String
  phone               String
  email               String
  whatsappLink        String
  googleMapsEmbedUrl  String   @db.Text
  operationalHours    String   @db.Text
  sp4nLaporUrl        String
  motto               String
  tagline             String
  updatedAt           DateTime @updatedAt

  @@map("site_settings")
}
```

---

## 4. Alur & Spesifikasi Komponen Autentikasi

### A. Singleton Database Client (`src/lib/db.ts`)
Mencegah pembuatan instance Prisma Client baru di setiap *hot reload* mode development:
```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

### B. Modul Autentikasi & Sesi (`src/lib/auth.ts`)
Menangani pembuatan token acak kriptografi, kalkulasi masa berlaku sesi, verifikasi sesi aktif, dan manipulasi cookie:
* **Nama Cookie:** `ifk_session`
* **Cookie Flags:**
  * `httpOnly: true` (skrip klien tidak dapat mengakses token sesi).
  * `secure: process.env.NODE_ENV === "production"`
  * `sameSite: "lax"` (perlindungan bawaan terhadap Cross-Site Request Forgery).
  * `path: "/"`
  * `maxAge: 7 * 24 * 60 * 60` (7 hari dalam detik).
* **Fungsi Inti:**
  * `hashPassword(password: string): Promise<string>`
  * `verifyPassword(password: string, hash: string): Promise<boolean>`
  * `createSession(userId: string): Promise<string>` (menghasilkan token via `crypto.randomBytes(32).toString("hex")` dan menyimpan record di tabel `sessions`).
  * `getCurrentUser(): Promise<{ user: User; session: Session } | null>` (membaca cookie, mengambil data session & user dari DB; jika user berstatus `INACTIVE` atau sesi kadaluarsa, sesi langsung dihapus dan mengembalikan `null`).
  * `invalidateSession(sessionToken: string): Promise<void>`
  * `setSessionCookie(token: string, expiresAt: Date): Promise<void>`
  * `deleteSessionCookie(): Promise<void>`

### C. Server Actions Autentikasi (`src/actions/auth.ts`)
* `loginAction(prevState: unknown, formData: FormData)`:
  1. Validasi string username dan password tidak boleh kosong.
  2. Cari user berdasarkan username di PostgreSQL via Prisma.
  3. Verifikasi status akun: jika `status === "INACTIVE"`, gagalkan login dengan notifikasi error *"Akun dinonaktifkan. Silakan hubungi Administrator"*.
  4. Bandingkan password via `bcryptjs.compare`.
  5. Jika gagal, kembalikan respon error *"Username atau kata sandi tidak sesuai"*.
  6. Jika berhasil: buat sesi baru di DB, set HTTP-Only cookie, dan lakukan `redirect("/admin/dashboard")`.
* `logoutAction()`:
  1. Ambil session token dari cookie `ifk_session`.
  2. Hapus record sesi dari tabel `sessions` di database.
  3. Hapus cookie `ifk_session` dari browser.
  4. Lakukan `redirect("/admin/login")`.

### D. Intersepsi Middleware (`src/middleware.ts`)
* Berjalan sebelum request mencapai route handler atau page component.
* Memeriksa keberadaan cookie `ifk_session`.
* **Aturan Redirect:**
  * Akses rute `/admin/*` (kecuali `/admin/login`) tanpa cookie sesi valid: redirect ke `/admin/login`.
  * Akses rute `/admin/login` dengan cookie sesi aktif: redirect ke `/admin/dashboard`.
  * Rute publik (`/`, `/stok`, `/berita`, `/layanan`, `/profil`, `/kontak`, berkas aset statis, dan `_next`) bebas dilewati tanpa proteksi.

### E. Seeder Super Admin Pertama (`prisma/seed.ts`)
Membaca parameter dari `.env`:
* `INITIAL_ADMIN_USERNAME` (default jika kosong: `admin`)
* `INITIAL_ADMIN_PASSWORD` (default jika kosong: `AdminIFK2026!`)
* `INITIAL_ADMIN_NAME` (default: `Administrator IFK Kotabaru`)

Seeder akan:
1. Memeriksa apakah user dengan username tersebut sudah ada di tabel `users`.
2. Jika belum ada, lakukan hash password dan simpan akun dengan `role: "SUPER_ADMIN"` dan `status: "ACTIVE"`.
3. Mengisi data awal tabel `categories` (Kegiatan, Informasi, Sosialisasi) dan data `site_settings` default jika tabel masih kosong.

---

## 5. Rencana Pengujian & Verifikasi

1. **Database Readiness:**
   * Memastikan service PostgreSQL aktif di VPS.
   * Database `profile_ifk` dan user siap menerima migrasi Prisma.
2. **Schema & Client Generation:**
   * Menjalankan migrasi `npx prisma db push` atau `npx prisma migrate dev`.
   * Memastikan `@prisma/client` ter-generate tanpa kendala tipe TypeScript.
3. **Seeding Validation:**
   * Menjalankan `npx prisma db seed` dan memverifikasi data Super Admin perdana masuk ke PostgreSQL dengan password ter-hash bcrypt.
4. **End-to-End Auth Flow:**
   * Login dengan kredensial salah -> muncul pesan error validasi.
   * Login dengan kredensial benar -> berhasil redirect ke `/admin/dashboard` dan cookie `ifk_session` terpasang (HTTP-Only).
   * Coba akses langsung `/admin/stok` atau `/admin/dashboard` via browser private/incognito tanpa login -> wajib otomatis terlempar ke `/admin/login`.
   * Logout dari sidebar/header admin -> sesi terhapus dari DB & cookie hilang, diarahkan kembali ke `/admin/login`.
5. **CI / CD Pipeline:**
   * Pastikan `npm run build` dan typecheck lulus tanpa error di linting Next.js 16.
