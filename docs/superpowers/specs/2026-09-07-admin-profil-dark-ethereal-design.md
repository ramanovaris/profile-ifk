# Design Spec: Redesain Halaman Profil Pengguna Admin (Dark Ethereal)

**Tanggal:** 2026-09-07  
**Penulis:** Tim Pengembang Profile IFK Kotabaru  
**Status:** In Review  
**Target:** Halaman Profil Admin (`src/app/(admin)/admin/profil/page.tsx`)

---

## 1. Problem Statement & Latar Belakang

Halaman Profil Admin saat ini (`src/app/(admin)/admin/profil/page.tsx`) merupakan modul tersisa yang masih menggunakan desain legacy bertema terang (light mode) dengan sejumlah keterbatasan:
1. **Inkonsistensi Tema Visual**:
   - Masih menggunakan kartu putih (`Card` default), tipografi gelap (`text-slate-900`), input dasar tanpa token Dark Ethereal, dan separator abu-abu terang (`Separator`). Tampilan ini kontras tajam dengan shell admin dan halaman lain (Dashboard, Berita, Kategori, Pengguna) yang telah mengadopsi tema **Dark Ethereal**.
2. **Layout Terlalu Sederhana & Kurang Ergonomis**:
   - Menggunakan satu kolom stacked dengan batasan lebar sempit (`max-w-lg`) yang menyisakan banyak ruang kosong di layar desktop (`md+` / `lg+`).
   - Tidak memiliki visualisasi avatar profil, badge peran pengguna, ringkasan metadata akun, maupun status akun.
3. **Keterbatasan Fitur Form Keamanan & Feedback**:
   - Field password belum dilengkapi fitur toggle intip sandi (*show/hide password* dengan ikon `Eye` / `EyeOff`), menyulitkan pengecekan ketikan kata sandi baru.
   - Menggunakan `alert(...)` bawaan browser untuk pesan keberhasilan/kegagalan, yang mengganggu flow kerja dan terasa kasar secara estetika.

---

## 2. Tujuan (Goals & Non-Goals)

### Goals
1. Mengubah tampilan `/admin/profil` ke tema **Full Dark Ethereal**:
   - Latar belakang ambient gelap `bg-zinc-950` yang menyatu dengan `AdminShell`.
   - Kartu berlatar `bg-zinc-900/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-2xl`.
2. Menerapkan struktur layout **Grid 2-Kolom Asimetris Responsif**:
   - Kolom Kiri (`lg:col-span-4`): Kartu Identitas & Metadata Akun yang sticky di viewport desktop (`lg:sticky lg:top-6`).
   - Kolom Kanan (`lg:col-span-8`): Dua kartu form terpisah untuk *Informasi Pribadi* dan *Keamanan & Kata Sandi*.
3. Menyediakan komponen identitas admin yang komprehensif:
   - Avatar besar dengan inisial `AD`, ambient glow emerald/brand, dan tombol kamera interaktif (mock upload avatar).
   - Nama lengkap, username handle `@admin`, badge pill `Super Admin`, status akun aktif (pulsing dot hijau), dan metadata tanggal bergabung.
4. Menyempurnakan form interaktif:
   - Form Informasi Pribadi: Nama Tampilan, Username (*disabled / read-only* dengan ikon gembok), dan Email Kontak.
   - Form Keamanan: Kata Sandi Lama, Kata Sandi Baru, dan Konfirmasi Sandi dengan toggle intip (`Eye` / `EyeOff`) serta indikator validasi minimal 8 karakter.
   - Standarisasi focus styling: `border-brand-500/60 ring-2 ring-brand-500/40`.
   - Pesan feedback in-page yang elegan (success banner / alert ramah bertema Dark Ethereal) menggantikan `alert(...)` browser.
5. Memastikan kenyamanan aksesibilitas dan responsivitas:
   - Target review layar desktop & HP Android Chrome desktop mode (`md+` / `1024px+`).
   - Mencegah sticky hover pada layar sentuh dengan `[@media(hover:hover)]`.

### Non-Goals
- Menghubungkan ke backend otentikasi / session JWT server nyata (tetap beroperasi dengan state client-side terisolasi).
- Pengunggahan file gambar fisik ke penyimpanan server (fitur ganti foto profil berstatus mockup interaktif dengan preview state lokal).

---

## 3. Spesifikasi Arsitektur & Desain Visual

### 3.1. Header Halaman
- **Judul**: "Profil Pengguna" (`text-xl sm:text-2xl font-bold tracking-tight text-white`).
- **Deskripsi**: "Kelola informasi profil, data kontak, dan pengaturan keamanan kata sandi akun Anda." (`text-xs sm:text-sm text-zinc-400 mt-1`).
- **Pemisah**: Jarak margin `mb-6 sm:mb-8`.

---

### 3.2. Kolom Kiri: Kartu Identitas & Metadata Akun (`lg:col-span-4`)
- **Container**: `bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 relative overflow-hidden shadow-xl lg:sticky lg:top-6`.
- **Top Accent Glow**: Aksen gradien radial di bagian atas kartu (`absolute inset-x-0 -top-24 h-48 bg-gradient-to-b from-brand-500/15 via-emerald-500/10 to-transparent blur-2xl pointer-events-none`).
- **Avatar Section**:
  - Avatar lingkaran berukuran `h-20 w-20 sm:h-24 sm:w-24` dengan background `bg-gradient-to-br from-brand-500/20 to-emerald-500/20 text-brand-300 font-bold text-2xl ring-2 ring-brand-500/30 shadow-lg shadow-brand-500/10`.
  - Tombol kamera kecil di sudut kanan bawah avatar (`absolute bottom-0 right-0 p-1.5 rounded-full bg-zinc-800 border border-white/10 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors`).
- **Informasi Nama & Handle**:
  - Nama: "Administrator" (`text-lg font-bold text-white mt-4`).
  - Username: `@admin` (`text-xs font-mono text-zinc-400 mt-0.5`).
  - Badge Peran: Badge pill `Super Admin` berlatar `bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 text-xs font-medium rounded-full inline-flex items-center gap-1.5 mt-3`.
- **Daftar Metadata Akun (`divide-y divide-white/5 mt-6 pt-4 border-t border-white/5 text-xs`)**:
  - **Status Akun**: Label "Status Akun", value "Aktif" dengan indikator titik hijau pulsing (`h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block mr-1.5`).
  - **Hak Akses**: Label "Hak Akses", value "Full Access / Super Admin".
  - **Bergabung Sejak**: Label "Terdaftar", value "15 Januari 2024".

---

### 3.3. Kolom Kanan: Form Informasi Pribadi (`lg:col-span-8` - Kartu 1)
- **Container**: `bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl`.
- **Card Header**:
  - Ikon: `<User className="h-5 w-5 text-brand-400" />` di dalam wadah bundar kecil beraksen `bg-brand-500/10 border border-brand-500/20`.
  - Judul: "Informasi Pribadi" (`text-base font-semibold text-white`).
  - Subjudul: "Perbarui identitas tampilan dan alamat email utama Anda." (`text-xs text-zinc-400 mt-0.5`).
- **Field Form**:
  1. **Nama Lengkap / Tampilan**:
     - Label: "Nama Lengkap" dengan ikon `<User className="h-3.5 w-3.5 text-zinc-400 inline mr-1.5" />`.
     - Input teks: `value={displayName}` dengan placeholder "Masukkan nama lengkap".
     - Styling: `bg-zinc-950/60 border-white/10 text-white placeholder:text-zinc-500 focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 text-sm h-10 rounded-lg`.
  2. **Username Sistem (Read-only)**:
     - Label: "Username Sistem" dengan ikon `<Lock className="h-3.5 w-3.5 text-zinc-400 inline mr-1.5" />`.
     - Input teks: `value="admin" readOnly`.
     - Styling: `bg-white/[0.02] border-white/5 text-zinc-400 cursor-not-allowed text-sm h-10 rounded-lg`.
     - Keterangan pembantu: "Username akun sistem default tidak dapat diubah demi keamanan." (`text-[11px] text-zinc-400 mt-1`).
  3. **Email Kontak**:
     - Label: "Alamat Email" dengan ikon `<Mail className="h-3.5 w-3.5 text-zinc-400 inline mr-1.5" />`.
     - Input email: `value={email}` dengan placeholder "admin@ifk-kotabaru.go.id".
     - Styling standar focus ring.
- **Tombol Aksi**:
  - Tombol: "Simpan Perubahan" (`bg-brand-600 hover:bg-brand-500 text-white font-medium px-4 py-2 text-xs sm:text-sm rounded-lg shadow-lg shadow-brand-500/20 border border-brand-400/30 inline-flex items-center gap-2`).
  - Ikon: `<Save className="h-4 w-4" />`.

---

### 3.4. Kolom Kanan: Form Keamanan & Kata Sandi (`lg:col-span-8` - Kartu 2)
- **Container**: `bg-zinc-900/60 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl mt-6`.
- **Card Header**:
  - Ikon: `<KeyRound className="h-5 w-5 text-emerald-400" />` di dalam wadah bundar beraksen `bg-emerald-500/10 border border-emerald-500/20`.
  - Judul: "Keamanan & Kata Sandi" (`text-base font-semibold text-white`).
  - Subjudul: "Pastikan akun Anda menggunakan kata sandi yang kuat dan aman." (`text-xs text-zinc-400 mt-0.5`).
- **Field Form**:
  1. **Kata Sandi Lama**:
     - Input password dengan toggle ikon `<Eye className="h-4 w-4" />` / `<EyeOff className="h-4 w-4" />`.
     - Placeholder: "Masukkan kata sandi saat ini".
  2. **Kata Sandi Baru**:
     - Input password dengan toggle ikon `Eye` / `EyeOff`.
     - Placeholder: "Minimal 8 karakter".
  3. **Konfirmasi Kata Sandi Baru**:
     - Input password dengan toggle ikon `Eye` / `EyeOff`.
     - Placeholder: "Ulangi kata sandi baru".
- **Petunjuk Keamanan**:
  - Kotak hint keamanan halus (`bg-white/[0.02] border border-white/5 rounded-lg p-3 text-xs text-zinc-400 flex items-start gap-2.5`):
    - Ikon: `<ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />`.
    - Teks: "Gunakan kombinasi minimal 8 karakter dengan campuran huruf kapital, angka, dan simbol untuk keamanan maksimal."
- **Tombol Aksi**:
  - Tombol: "Perbarui Kata Sandi" (`bg-zinc-800 hover:bg-zinc-700 text-white font-medium px-4 py-2 text-xs sm:text-sm rounded-lg border border-white/10 hover:border-white/20 inline-flex items-center gap-2`).
  - Ikon: `<Lock className="h-4 w-4" />`.

---

### 3.5. Interaktivitas & Feedback Banner
- Menghilangkan pemanggilan `alert(...)` bawaan browser.
- Menggunakan banner alert lokal in-page:
  - **Sukses**: Banner berlatar `bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg p-3.5 text-xs flex items-center justify-between` dengan ikon centang `<CheckCircle2 />` dan tombol tutup dismiss.
  - **Error**: Banner berlatar `bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg p-3.5 text-xs flex items-center justify-between` dengan ikon peringatan `<AlertCircle />`.
- Notifikasi auto-dismiss atau dapat ditutup manual.

---

## 4. Spesifikasi Responsivitas & Aksesibilitas

1. **Prioritas Breakpoint Desktop & Mobile Review**:
   - Diatur agar optimal pada resolusi `md+` (≥768px) dan layar HP Android Chrome mode *Desktop Site* (~1024-1280px).
   - Pada layar kecil mobile murni (`<1024px`), tata letak berubah menjadi 1 kolom vertikal: Kartu Identitas di atas, diikuti Form Informasi Pribadi, dan Form Keamanan.
2. **Proteksi Hover Layar Sentuh**:
   - Seluruh state hover tombol menggunakan aturan `[@media(hover:hover)]:hover:...` serta `active:scale-[0.98]` untuk memberikan respon sentuhan alami tanpa meninggalkan efek sticky hover.
3. **Standarisasi Focus Ring**:
   - Seluruh elemen input interaktif menggunakan token seragam: `focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40 focus:outline-none`.

---

## 5. Rencana Pengujian (Testing & Verification)

1. **Pemeriksaan Visual**:
   - Buka URL `http://43.129.57.214/profile-ifk/admin/profil`.
   - Verifikasi keselarasan visual Dark Ethereal dengan Dashboard, Berita, Kategori, dan Pengguna.
   - Uji responsivitas pada viewport desktop dan simulasi mobile.
2. **Pengujian Fungsional**:
   - Simpan perubahan nama tampilan & email → verifikasi update pada kartu identitas di sisi kiri dan kemunculan banner sukses in-page.
   - Ubah kata sandi dengan konfirmasi tidak cocok → verifikasi munculnya banner error.
   - Ubah kata sandi dengan ketentuan yang benar → verifikasi banner sukses dan reset input password.
   - Uji toggle mata (`Eye`/`EyeOff`) pada ketiga field kata sandi.
3. **Validasi CI**:
   - Buat branch fitur `feat/admin-profil-dark-ethereal`.
   - Buat Pull Request ke branch `develop`.
   - Pastikan GitHub Actions CI run (Lint & Build) lulus tanpa error.
