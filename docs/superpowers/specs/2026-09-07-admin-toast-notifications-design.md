# Spesifikasi Desain: Dark Ethereal Toast Notifications (Batch 1)

## 1. Ringkasan Fitur
Sistem notifikasi toast native ringan (zero-dependency) bertema **Dark Ethereal** untuk memberikan umpan balik instan (*feedback*) kepada administrator atas setiap aksi (Create, Update, Delete, Toggle, Validation Error) tanpa memblokir alur kerja pengguna.

Fase Batch 1 difokuskan pada:
1. Pembuatan fondasi komponen `<Toaster />` dan utilitas `toast` (`src/components/ui/toast.tsx`).
2. Pemasangan viewport `<Toaster />` di root `AdminShell` (`src/components/admin/admin-shell.tsx`).
3. Integrasi aksi di modul **Master Kategori** (`/admin/kategori`).
4. Integrasi aksi di modul **Kelola Berita** (`/admin/berita` & `src/components/admin/article-form.tsx`).

---

## 2. Arsitektur & Perilaku Komponen

### 2.1 State Management (Event-Driven Observer)
- Implementasi native React menggunakan modul observer sederhana (listener pattern) tanpa dependensi eksternal.
- Komponen `Toaster` mendengarkan perubahan queue toast secara reaktif.
- Method global yang diekspos:
  - `toast.success(message, title?)`
  - `toast.error(message, title?)`
  - `toast.info(message, title?)`
  - `toast.warning(message, title?)`
  - `toast.dismiss(id)`

### 2.2 Visual & Styling (Dark Ethereal)
- **Container**:
  - Desktop: Kanan bawah (`fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none`).
  - Mobile: Bawah layar dengan margin aman (`fixed bottom-4 inset-x-4 z-50 flex flex-col gap-2 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm pointer-events-none`).
- **Toast Item Card**:
  - `pointer-events-auto rounded-xl p-3.5 shadow-2xl shadow-black/60 backdrop-blur-xl border transition-all duration-300`
  - Background: `bg-zinc-900/95`
  - Border & Icon Accents:
    - **Success**: `border-emerald-500/20 text-emerald-400` dengan ikon `<CheckCircle2 />`
    - **Error**: `border-rose-500/20 text-rose-400` dengan ikon `<AlertCircle />`
    - **Info**: `border-brand-500/20 text-brand-400` dengan ikon `<Info />`
    - **Warning**: `border-amber-500/20 text-amber-400` dengan ikon `<AlertTriangle />`
- **Dismiss Interaction**:
  - Auto-dismiss dalam 3.5 detik.
  - Tombol tutup manual (ikon silang `<X />`) yang responsif dan mendukung sentuhan layar (`p-1 hover:bg-white/10 rounded-lg`).
- **Animasi Masuk/Keluar**:
  - CSS animation / Tailwind transition halus saat muncul dan hilang.

---

## 3. Ruang Lingkup Integrasi Batch 1

### 3.1 Master Kategori (`/admin/kategori`)
1. **Tambah Kategori Baru**: `toast.success("Kategori baru berhasil ditambahkan")`
2. **Edit Kategori**: `toast.success("Kategori berhasil diperbarui")`
3. **Ubah Status (Toggle)**: `toast.info("Status kategori diubah menjadi [Aktif / Nonaktif]")`
4. **Hapus Kategori**: `toast.success("Kategori berhasil dihapus")`
5. **Validasi Error (Kategori Terkait Artikel)**: `toast.error("Tidak dapat menghapus: Kategori masih digunakan oleh artikel")`

### 3.2 Kelola Berita (`/admin/berita` & `article-form.tsx`)
1. **Hapus Artikel** di `/admin/berita`: Menggantikan `alert(...)` bawaan dengan `toast.success("Artikel berhasil dihapus")`.
2. **Simpan/Publikasi Artikel** di `article-form.tsx`: Menggantikan `alert(...)` dengan `toast.success("Artikel berhasil diterbitkan")` atau `toast.success("Perubahan artikel berhasil disimpan")`.
3. **Validasi Konten Kosong**: Menggantikan `alert(...)` dengan `toast.error("Isi konten artikel wajib diisi")`.

---

## 4. Kriteria Keberhasilan (Verification Criteria)
1. Tidak ada dependensi baru di `package.json`.
2. Notifikasi toast tampil dengan animasi halus di desktop (kanan bawah) dan mobile (bawah layar) tanpa menutupi navigasi krusial.
3. Semua interaksi CRUD di Kategori dan Berita memberikan umpan balik visual yang jelas.
4. Kode memenuhi standar lint, build, dan typecheck saat di-push ke GitHub Actions CI.
