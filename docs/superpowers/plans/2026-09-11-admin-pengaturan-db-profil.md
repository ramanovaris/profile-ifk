# Rencana Implementasi: Integrasi Database PostgreSQL Konten Profil UPTD (Tab 2: Pengaturan)

Rencana kerja terinci untuk menyelesaikan **Issue #53** (`feat(pengaturan): integrasi database postgresql konten profil uptd (pimpinan, sambutan, visi misi, tupoksi)`).

---

## Task 1: Perluasan Skema Prisma & Sinkronisasi Database
- [ ] Edit `prisma/schema.prisma`:
  - Tambahkan 7 field baru pada model `SiteSetting`: `headName`, `headRole`, `headPhoto`, `greeting`, `vision`, `mission`, `tupoksi`.
- [ ] Jalankan `npx prisma db push` untuk menerapkan perubahan skema ke database PostgreSQL VPS tanpa data loss.
- [ ] Perbarui seeder `prisma/seed.ts` agar idempoten dan menyertakan nilai awal profil instansi.

## Task 2: Implementasi Server Actions & Pengelolaan File Foto
- [ ] Edit `src/actions/setting.ts`:
  - Tambahkan fallback field profil pada `getSiteSettings()`.
  - Buat Server Action `updateSiteProfileAction(formData: FormData)`.
  - Buat helper penyimpanan berkas foto pimpinan di `public/uploads/profile/` dengan validasi mime type (`image/png`, `image/jpeg`, `image/webp`), batas ukuran (5MB), dan pembersihan foto usang.
  - Tambahkan proteksi otorisasi sesi `SUPER_ADMIN` dan revalidasi cache (`revalidatePath`).
- [ ] Buat skrip verifikasi otomatis `scripts/verify-profile-db.ts` untuk memvalidasi operasi pembacaan, penolakan unauthorized, update, dan rollback.

## Task 3: Integrasi Form Tab 2 Halaman Pengaturan Admin
- [ ] Edit `src/app/(admin)/admin/pengaturan/settings-form.tsx`:
  - Hubungkan form state `profileForm` ke `initialSettings` yang diterima dari Server Component.
  - Tangani upload berkas foto pimpinan dengan live preview instan via `URL.createObjectURL` dan fallback gambar.
  - Implementasikan submit form via `updateSiteProfileAction(formData)` dalam `useTransition`.
  - Tambahkan notifikasi toast native (`toast.success`, `toast.error`, `toast.info`).
  - Fungsikan tombol `Reset Form` untuk mengembalikan input ke data asli dari database.

## Task 4: Konsumsi Dinamis Halaman Publik Profil Instansi
- [ ] Edit `src/app/(public)/profil/page.tsx`:
  - Panggil `await getSiteSettings()` di server.
  - Render foto pimpinan, nama & gelar, serta jabatan resmi.
  - Render paragraf naskah sambutan dinamis.
  - Render visi instansi dan butir-butir misi yang diurai otomatis.
  - Render tugas pokok & fungsi (tupoksi).

## Task 5: Pengujian, CI Pipeline & Pembuatan Pull Request
- [ ] Jalankan skrip runnable `scripts/verify-profile-db.ts`.
- [ ] Verifikasi status dev server di port 3003.
- [ ] Commit dan push branch `feat/53-admin-pengaturan-db-profil` ke remote.
- [ ] Buka Pull Request ke branch `develop` dan monitor GitHub Actions CI hingga status PASS.
