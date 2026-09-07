# Design Spec: Redesain Modal Master Kategori (Dark Ethereal Elevated)

**Tanggal:** 2026-09-07  
**Penulis:** Tim Pengembang Profile IFK Kotabaru  
**Status:** In Review  
**Target:** Halaman Admin Master Kategori (`/admin/kategori`)

---

## 1. Problem Statement & Latar Belakang

Halaman Master Kategori (`src/app/(admin)/admin/kategori/page.tsx`) saat ini telah memiliki fungsionalitas dasar untuk menambah, mengedit, mengubah status, dan menghapus kategori. Namun, desain modal/dialog yang digunakan masih sangat polos dan memiliki beberapa kelemahan UX:
1. **Modal Form Tambah/Edit**:
   - Tampilan sangat minimalis dan datar (hanya satu text input putih standar tanpa hierarchy visual).
   - Tidak memiliki ambient icon badge yang selaras dengan tema Dark Ethereal pada halaman admin lainnya.
   - Tidak menampilkan preview URL slug secara langsung saat pengguna mengetik nama kategori (padahal deskripsi menyebut slug dibuat otomatis).
   - Pengguna tidak dapat mengatur status publikasi (Aktif vs Non-Aktif) saat pembuatan atau pengeditan kategori di dalam modal, sehingga terpaksa harus mencari kategori di tabel dan mengklik tombol toggle status secara terpisah.
   - Focus ring input belum mengikuti standar desain form admin (`border-brand-500/60 ring-2 ring-brand-500/40`).
2. **Dialog Konfirmasi Hapus**:
   - Menggunakan dialog generik tanpa indikator peringatan visual yang jelas.
   - Tidak menampilkan informasi spesifik mengenai kategori yang hendak dihapus (nama, slug, atau jumlah artikel terkait).
   - Ketika kategori yang hendak dihapus masih digunakan oleh artikel, sistem memicu native browser `alert(...)` yang mengganggu flow dan tidak konsisten dengan estetika web app modern.

## 2. Tujuan (Goals & Non-Goals)

### Goals
1. Meng-upgrade tampilan **Modal Form Tambah/Edit Kategori** dengan tema Dark Ethereal Elevated:
   - Header ber-icon badge dengan aksen emerald glow.
   - Input nama kategori dengan standar visual dan focus ring token (`border-brand-500/60 ring-2 ring-brand-500/40`).
   - Live Slug Preview Card interaktif realtime yang menunjukkan format slug (`/nama-kategori`) dalam chip monospace.
   - Status Switcher langsung di dalam modal (pilihan Aktif / Non-Aktif dengan keyboard support).
   - Tombol simpan dengan gradient emerald dan shadow glow.
2. Meng-upgrade tampilan **Dialog Konfirmasi Hapus Kategori**:
   - Header ber-icon peringatan dengan ambient red glow.
   - Category Info Preview Card yang merangkum nama, slug, dan jumlah artikel yang terhubung.
   - Smart Dependency Guard di dalam UI (menggantikan browser `alert()`) dengan banner informatif dan pencegahan klik hapus jika kategori masih dipakai artikel.
3. Menjamin aksesibilitas penuh: navigasi keyboard (Enter, Escape, Space, Tab), autofocus, dan responsivitas pada viewport mobile hingga desktop (`md+`).

### Non-Goals
- Mengubah struktur data skema kategori atau merombak dependensi `initialCategories` di `dummy-data.ts`.
- Mengubah alur routing halaman atau menambah pagination pada tabel kategori (fokus utama adalah kedua modal/dialog).

---

## 3. Spesifikasi Arsitektur & Desain Visual

### 3.1. Modal Form Tambah / Edit Kategori

#### Layout & Container
- Menggunakan komponen `Dialog` & `DialogContent` dengan token:
  `border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl`
- Overlay backdrop gelap semi-transparan dengan blur.

#### Header Section
- Container header dilengkapi icon badge di sebelah kiri judul:
  - Kotak ikon: `h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 shrink-0`
  - Ikon: `<Tags className="h-5 w-5" />` (Mode Tambah) atau `<Pencil className="h-5 w-5" />` (Mode Edit).
- Judul (`DialogTitle`): `text-lg font-bold text-white tracking-tight`
  - Mode Tambah: "Tambah Kategori Baru"
  - Mode Edit: "Edit Kategori"
- Deskripsi (`DialogDescription`): `text-xs text-zinc-400 mt-1`
  - Mode Tambah: "Tambahkan label kategori baru untuk mengelompokkan artikel dan berita publik."
  - Mode Edit: "Perbarui informasi nama dan status kategori artikel."

#### Input Field: Nama Kategori
- Label: Didampingi ikon kecil `<Type className="h-3.5 w-3.5 text-zinc-400 inline mr-1.5" />` dengan teks "Nama Kategori".
- Input text:
  - Class: `h-10 rounded-lg border border-white/10 bg-zinc-900/80 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus-visible:border-brand-500/60 focus-visible:ring-2 focus-visible:ring-brand-500/40 outline-none transition-all`
  - Auto-focus saat modal dibuka.
  - Menampilkan pesan error inline di bawah input berwana `text-xs text-red-400 flex items-center gap-1 mt-1.5` jika validasi gagal (kosong atau nama duplikat).

#### Live Slug Preview Card
- Kotak informatif di bawah input nama:
  - Container: `rounded-lg border border-white/5 bg-white/[0.02] p-2.5 flex items-center justify-between text-xs`
  - Sisi Kiri: Label "URL Slug Preview" dengan ikon `<Globe className="h-3.5 w-3.5 text-zinc-500" />`
  - Sisi Kanan: Chip monospace `font-mono px-2 py-0.5 rounded bg-black/40 border border-white/5 text-brand-400 max-w-[200px] truncate`
  - Perilaku: Menghasilkan slug secara reaktif dari state `formData.name` (misal `/{generatedSlug || "..."}`).

#### Status Switcher di Dalam Modal
- Komponen switch status terpadu di dalam form:
  - Kotak baris: `flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3`
  - Informasi status:
    - Judul: "Status Kategori" (`text-xs font-medium text-zinc-200`)
    - Sub-keterangan: "Kategori aktif dapat langsung dipilih pada form penulisan berita" (`text-[11px] text-zinc-400`)
  - Switch Button (Pill):
    - State Aktif: `bg-emerald-600 text-white border-emerald-500/30`
    - State Non-Aktif: `bg-zinc-800 text-zinc-400 border-white/10`
    - Interaktif via klik mouse atau keyboard (Space / Enter).

#### Footer & Action Buttons
- Tombol Batal:
  - `rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-white/10 hover:text-white transition-colors`
- Tombol Simpan:
  - `rounded-lg border border-brand-500/30 bg-gradient-to-r from-brand-600 to-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-brand-500/20 hover:brightness-110 transition-all flex items-center gap-2`
  - Menampilkan ikon centang/simpan `<Check className="h-4 w-4" />`.

---

### 3.2. Dialog Konfirmasi Hapus Kategori

#### Layout & Header
- Container dialog: `border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl`
- Header icon badge:
  - Kotak ikon: `h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0`
  - Ikon: `<AlertTriangle className="h-5 w-5" />`
- Judul: "Hapus Kategori?" (`text-lg font-bold text-white`)
- Subtitle: "Tindakan ini bersifat permanen dan akan menghapus kategori dari sistem." (`text-xs text-zinc-400`)

#### Category Target Preview Card
- Kotak informasi kategori yang sedang ditargetkan:
  - Container: `rounded-lg border border-white/5 bg-white/[0.03] p-3 space-y-2`
  - Baris Utama: Nama kategori dengan ikon `<Tags className="h-4 w-4 text-brand-400" />` dan chip slug `/{cat.slug}`.
  - Baris Relasi: Badge status kategori dan counter `Jumlah: {articleCount} artikel`.

#### Smart Dependency Guard (In-Modal Prevention)
- **Skenario A: Kategori Digunakan Oleh Artikel (`articleCount > 0`)**:
  - Banner peringatan:
    - Container: `rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300 flex items-start gap-2.5`
    - Ikon: `<AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />`
    - Pesan: "Kategori ini masih digunakan oleh **{articleCount} artikel aktif**. Anda tidak dapat menghapus kategori ini sebelum memindahkan atau menghapus artikel yang terkait."
  - Action Button:
    - Tombol "Hapus Kategori" disembunyikan atau di-disable dengan keterangan tooltip.
    - Tersedia tombol tunggal: "Tutup / Mengerti" (`bg-zinc-800 text-zinc-200 hover:bg-zinc-700`).
- **Skenario B: Kategori Tidak Memiliki Artikel (`articleCount === 0`)**:
  - Banner aman:
    - Container: `rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-400`
    - Pesan: "Kategori ini belum terhubung ke artikel manapun dan aman untuk dihapus secara permanen."
  - Action Button:
    - Tombol Batal (`bg-white/5 border border-white/10`).
    - Tombol Konfirmasi Hapus: `rounded-lg border border-red-500/30 bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/20 hover:bg-red-500 transition-all flex items-center gap-2` dengan ikon `<Trash2 className="h-4 w-4" />`.

---

## 4. Aksesibilitas & Navigasi Keyboard

1. **Auto Focus**:
   - Modal Form otomatis memfokuskan kursor pada input nama kategori saat terbuka.
   - Dialog Hapus otomatis memfokuskan tombol Batal demi keamanan preventif.
2. **Keyboard Traps & Shortcuts**:
   - Penekanan tombol `Escape` menutup modal secara instan.
   - Penekanan `Enter` pada input nama form langsung men-submit form jika valid.
   - Penekanan `Space` atau `Enter` pada switch status mengubah status aktif/non-aktif.

---

## 5. Rencana Verifikasi & Uji Kualitas

1. **Uji Tambah Kategori Baru**:
   - Buka modal tambah kategori.
   - Verifikasi ketikan nama langsung menghasilkan live slug preview di kartu preview.
   - Toggle status menjadi Non-Aktif, lalu simpan. Pastikan data baru muncul di tabel dengan status Non-Aktif.
2. **Uji Edit Kategori**:
   - Buka modal edit kategori yang sudah ada.
   - Verifikasi data nama, slug, dan status terisi sesuai kategori yang dipilih.
   - Ganti nama dan simpan, verifikasi duplikasi nama dicegah dengan error message yang tepat.
3. **Uji Dialog Hapus Terproteksi**:
   - Klik tombol hapus pada kategori yang memiliki artikel (misal: Regulasi / Berita).
   - Pastikan muncul banner amber pemberitahuan relasi artikel dan tombol hapus dinonaktifkan (tidak ada lagi native browser alert).
   - Klik tombol hapus pada kategori tanpa artikel (0 artikel).
   - Pastikan tombol hapus merah aktif dan ketika diklik kategori terhapus dari tabel.
4. **Uji Responsivitas**:
   - Pengujian tampilan modal pada mobile view (~360px-480px) dan desktop view (`md+`).
   - Verifikasi dialog tidak overflowing layar dan rounded corner/backdrop blur bekerja mulus.
