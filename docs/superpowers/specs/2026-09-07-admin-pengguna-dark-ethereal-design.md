# Design Spec: Redesain Halaman Kelola Pengguna (Dark Ethereal)

**Tanggal:** 2026-09-07  
**Penulis:** Tim Pengembang Profile IFK Kotabaru  
**Status:** In Review  
**Target:** Halaman Admin Kelola Pengguna (`/admin/pengguna` & `/admin/pengguna/baru`)

---

## 1. Problem Statement & Latar Belakang

Halaman Kelola Pengguna saat ini (`src/app/(admin)/admin/pengguna/page.tsx` dan `src/app/(admin)/admin/pengguna/baru/page.tsx`) masih menggunakan desain legacy bertema terang (light mode) dengan beberapa keterbatasan:
1. **Inkonsistensi Tema Visual**:
   - Masih menggunakan container putih (`bg-white`), border abu-abu (`border-b bg-slate-50`), dan teks gelap (`text-slate-900`), yang kontras dan tidak harmonis dengan halaman Dashboard, Berita, dan Master Kategori yang telah bertema **Dark Ethereal**.
2. **Alur Navigasi Terpisah yang Kurang Efisien**:
   - Tombol "Tambah Pengguna" mengarahkan pengguna ke halaman terpisah (`/admin/pengguna/baru`), padahal form pembuatan pengguna sangat ringkas (hanya nama, username, password, dan peran). Hal ini memperlambat alur kerja admin dibanding modal in-place.
   - Tombol Edit dan Reset Sandi masih memicu native browser `alert(...)` dummy tanpa antarmuka form interaktif.
3. **Ketiadaan Fitur Pencarian & Paginasi**:
   - Belum memiliki search bar untuk mencari pengguna berdasarkan nama atau username.
   - Belum memiliki filter peran (Role Filter: Super Admin vs Staff).
   - Belum memiliki bar paginasi jika daftar staf/admin bertambah banyak.
4. **Resiko Keamanan & Validasi Akun Root**:
   - Belum ada proteksi terhadap penghapusan akun utama (`admin`), sehingga berpotensi terhapus secara tidak sengaja.

---

## 2. Tujuan (Goals & Non-Goals)

### Goals
1. Meng-upgrade tampilan utama `/admin/pengguna` ke tema **Full Dark Ethereal**:
   - Latar belakang ambient dark `bg-zinc-950` dengan kartu tabel `bg-zinc-900/60 backdrop-blur-xl border border-white/5`.
   - Header terpadu dengan judul, deskripsi, dan tombol aksi "+ Tambah Pengguna" (emerald glow).
2. Mengintegrasikan **Search & Role Filter Toolbar**:
   - Pencarian realtime berdasarkan Nama Lengkap dan Username.
   - Tombol filter cepat untuk menyaring peran: *Semua*, *Super Admin*, dan *Staff*.
3. Menyediakan **In-Place Modal Dialogs**:
   - **Modal Tambah/Edit Pengguna**: Form pembuatan & pengeditan pengguna langsung di halaman tanpa reload.
   - **Modal Reset Sandi**: Dialog khusus untuk mengganti password pengguna yang dipilih secara aman.
   - **Dialog Konfirmasi Hapus**: Dialog peringatan bahaya dengan kartu detail pengguna dan proteksi akun root (`admin`).
4. Menyediakan **Paginasi & Empty State**:
   - Rentang data, selector baris (5, 10, 20), dan kontrol prev/next yang seragam dengan modul Berita & Kategori.
   - Empty state informatif jika hasil pencarian nihil.
5. Menjamin responsivitas dan aksesibilitas:
   - Target review layar desktop & HP Android Chrome desktop mode (`md+`).
   - Proteksi tombol hover pada mobile dengan `[@media(hover:hover)]`.
   - Menghindari pemotongan teks dengan `text-xs font-medium` (tanpa `leading-none`).
6. Penanganan halaman `/admin/pengguna/baru`:
   - Memberikan redirect ramah pengguna kembali ke `/admin/pengguna` agar tidak memicu 404 pada bookmark lama.

### Non-Goals
- Menghubungkan ke backend database produksi nyata (tetap beroperasi dengan `dummyUsers` dan state reaktif lokal di client-side).
- Sistem audit log login atau sesi pengguna.

---

## 3. Spesifikasi Arsitektur & Desain Visual

### 3.1. Halaman Utama (`/admin/pengguna/page.tsx`)

#### Header Section
- **Judul**: "Kelola Pengguna" (`text-xl font-bold tracking-tight text-white`).
- **Deskripsi / Subtitle**: "Manajemen akun staf dan administrator sistem profil UPTD IFK Kotabaru" (`text-xs text-zinc-400 mt-1`).
- **Tombol Tambah Pengguna**:
  - Posisi: Kanan atas pada desktop, full-width atau sejajar responsif.
  - Tampilan: `bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-lg shadow-lg shadow-brand-500/20 border border-brand-400/30 px-3.5 py-2 text-xs flex items-center gap-2 transition-all`.
  - Icon: `<Plus className="h-4 w-4" />`.
  - Aksi: Membuka Modal Tambah Pengguna.

#### Toolbar Pencarian & Filter Peran
- **Container**: `flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4`.
- **Search Bar**:
  - Input field dengan icon `<Search className="h-4 w-4 text-zinc-400" />` di sisi kiri.
  - Placeholder: "Cari nama atau username pengguna...".
  - Tombol clear "×" saat query terisi.
  - Focus ring token: `focus:border-brand-500/60 focus:ring-2 focus:ring-brand-500/40`.
- **Filter Peran (Tabs / Pills)**:
  - Pilihan: *Semua*, *Super Admin*, *Staff*.
  - Pill aktif: `bg-brand-500/15 border-brand-500/30 text-brand-400`.
  - Pill tidak aktif: `bg-zinc-900/60 border-white/5 text-zinc-400 hover:text-white`.

#### Tabel Pengguna (Dark Ethereal Table Card)
- **Container**: `rounded-xl border border-white/5 bg-zinc-900/60 backdrop-blur-xl overflow-hidden shadow-2xl`.
- **Header Kolom (`<thead>`)**:
  - Warna: `bg-white/[0.02] border-b border-white/5 text-zinc-400 text-xs font-medium uppercase tracking-wider`.
  - Kolom:
    1. **Pengguna** (`th` teks kiri): Avatar + Nama Lengkap + Username.
    2. **Peran** (`th` teks kiri): Badge peran.
    3. **Tanggal Dibuat** (`th` teks kiri, hidden di mobile kecil jika diperlukan).
    4. **Aksi** (`th` teks kanan): Tombol aksi.
- **Baris Tabel (`<tbody>`)**:
  - Styling baris: `border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors`.
  - **Kolom Pengguna**:
    - Avatar bulat: `h-8 w-8 rounded-full bg-gradient-to-br from-brand-600 to-emerald-700 flex items-center justify-center text-white text-xs font-bold ring-1 ring-white/10`.
    - Nama Lengkap: `text-sm font-semibold text-white`.
    - Username: `text-xs text-zinc-400 font-mono flex items-center gap-1`.
  - **Kolom Peran**:
    - `SUPER_ADMIN`: Badge hijau emerald (`bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 text-xs font-medium rounded-full`).
    - `STAFF`: Badge biru/zinc (`bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-1 text-xs font-medium rounded-full`).
  - **Kolom Tanggal Dibuat**:
    - Format Indonesia (contoh: `15 Jan 2024`), `text-xs text-zinc-400`.
  - **Kolom Aksi**:
    - Tombol Edit: `<Pencil className="h-3.5 w-3.5" />`, tooltip "Edit Pengguna", hover aksen zinc-200.
    - Tombol Reset Sandi: `<KeyRound className="h-3.5 w-3.5" />`, tooltip "Reset Kata Sandi", hover aksen amber-400.
    - Tombol Hapus: `<Trash2 className="h-3.5 w-3.5 text-red-400" />`, tooltip "Hapus Pengguna", hover aksen red-300.
    - Semua tombol aksi dilindungi dengan `[@media(hover:hover)]:hover:...` dan `active:scale-95`.

#### Pagination Bar
- Terletak di bawah tabel dengan pembatas border `border-t border-white/5 p-4 flex flex-col sm:flex-row items-center justify-between gap-4`.
- **Kiri**: Info rentang data: `Menampilkan X–Y dari Z pengguna`.
- **Kanan**:
  - Dropdown selector: 5, 10, 20 pengguna per halaman.
  - Tombol Navigasi: *Sebelumnya* dan *Selanjutnya* dengan icon Chevron.

---

### 3.2. Modal Tambah & Edit Pengguna

- **Komponen**: `Dialog` & `DialogContent` dengan token:
  `border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6`.
- **Header**:
  - Icon Badge: `<UserPlus className="h-5 w-5 text-brand-400" />` (Tambah) atau `<Pencil className="h-5 w-5 text-brand-400" />` (Edit).
  - Title: "Tambah Pengguna Baru" / "Edit Pengguna".
  - Description: "Isi data akun staf atau administrator sistem."
- **Form Fields**:
  1. **Nama Lengkap**: Input text dengan label + icon `<User className="h-3.5 w-3.5" />`.
  2. **Username**: Input text unik (hanya huruf, angka, underscore).
  3. **Password & Konfirmasi Password**:
     - Mode Tambah: Wajib diisi.
     - Mode Edit: Opsional (diberi catatan "Kosongkan jika tidak ingin mengubah password").
  4. **Peran (Role)**:
     - Toggle atau radio card pilihan peran: *STAFF* atau *SUPER_ADMIN*, dilengkapi deskripsi hak akses ringkas.
- **Footer**:
  - Tombol Batal & Simpan terpusat (`justify-center gap-3`).
  - Tombol Simpan dengan icon `<Save className="h-4 w-4" />` dan gradient emerald.

---

### 3.3. Modal Reset Sandi Pengguna

- **Komponen**: Dialog khusus terisolasi untuk reset password.
- **Header**:
  - Icon Badge amber: `<KeyRound className="h-5 w-5 text-amber-400" />`.
  - Title: "Reset Kata Sandi".
  - Description: Mereset password untuk akun `@username` (Nama Pengguna).
- **Form Fields**:
  1. Password Baru: Input type password dengan toggle intip/sembunyikan (opsional).
  2. Konfirmasi Password Baru: Validasi kesesuaian input.
- **Validasi**:
  - Pesan error inline jika password kurang dari 6 karakter atau tidak cocok.
- **Footer**:
  - Tombol Batal & Simpan Password Baru (warna amber/brand).

---

### 3.4. Dialog Konfirmasi Hapus Pengguna

- **Komponen**: `Dialog` dengan nuansa proteksi bahaya (destructive).
- **Header**:
  - Icon Badge merah: `<AlertTriangle className="h-5 w-5 text-red-400" />`.
  - Title: "Hapus Akun Pengguna".
  - Description: "Tindakan ini akan menghapus akses pengguna dari sistem portal admin."
- **Target User Card Preview**:
  - Menampilkan ringkasan akun yang akan dihapus: Nama, Username, dan Peran.
- **Proteksi Akun Root**:
  - Jika akun yang dipilih memiliki username `admin`:
    - Tampilkan banner peringatan kuning/merah: *"Akun Administrator Utama tidak dapat dihapus demi keamanan sistem."*
    - Tombol "Hapus" dinonaktifkan (`disabled`).
- **Footer**:
  - Tombol Batal & Hapus terpusat.

---

### 3.5. Halaman `/admin/pengguna/baru`

- Komponen `src/app/(admin)/admin/pengguna/baru/page.tsx` diperbarui untuk melakukan redirect otomatis ke `/admin/pengguna` saat diakses langsung, dengan pesan ramah jika rendering fallback terjadi.

---

## 4. State Management & Data Contract

Menggunakan model data `User` dari `src/lib/dummy-data.ts`:
```ts
export type User = {
  id: string;
  username: string;
  name: string;
  role: "SUPER_ADMIN" | "STAFF";
  createdAt: string;
};
```

State lokal pada `AdminPenggunaPage`:
- `users`: Array objek `User` (diinisialisasi dari `dummyUsers`).
- `searchQuery`: String query pencarian.
- `roleFilter`: `"ALL" | "SUPER_ADMIN" | "STAFF"`.
- `currentPage`: Number indeks halaman aktif (default: 1).
- `itemsPerPage`: Number jumlah item per halaman (default: 5).
- `isUserModalOpen`: Boolean kontrol modal Tambah/Edit.
- `editUser`: Objek `User | null` (null untuk mode Tambah).
- `isResetPasswordOpen`: Boolean kontrol modal reset sandi.
- `resetPasswordTarget`: Objek `User | null`.
- `deleteId`: String id pengguna yang hendak dihapus | null.

---

## 5. Aksesibilitas & Responsivitas

1. **Touch Target**: Seluruh tombol aksi memiliki padding minimal dan target sentuh ramah mobile (≥ 36px).
2. **Hover State Protection**: Seluruh efek hover tabel dan tombol dibungkus dengan `[@media(hover:hover)]` agar tidak menyebabkan sticky hover pada layar sentuh.
3. **Subpixel Antialiasing**: Tidak menggunakan `leading-none` pada label/badge untuk memastikan seluruh huruf tidak terpotong pada perangkat berdensitas tinggi.
4. **Keyboard Accessibility**: Modal dialog dapat ditutup dengan `Escape`, form dapat disubmit dengan `Enter`, dan fokus trap ditangani secara alami oleh Shadcn Radix UI.
