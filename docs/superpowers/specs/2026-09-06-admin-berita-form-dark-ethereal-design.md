# Design Spec: Admin Berita & Form Redesign (Dark Ethereal)

## 1. Overview & Goals
Menyelaraskan modul Kelola Berita (`/admin/berita`, `/admin/berita/baru`, `/admin/berita/[id]/edit`) ke estetika **Dark Ethereal** (`zinc-950`, glassmorphism `zinc-900/60`, border `white/5`, aksen emerald & brand).

Mencakup:
1. **Daftar Berita (`/admin/berita`)**:
   - Header halaman dengan judul putih tebal & tombol CTA *"Tambah Artikel"* (gradien brand/emerald).
   - Toolbar filter & search: input pencarian judul (dengan icon Search) + dropdown/pill filter kategori (Semua, Kegiatan, Informasi, Sosialisasi).
   - Tabel responsif Dark Glass dengan kolom: Cover preview ringkas, Judul Artikel + Slug, Kategori, Status (`Terbit` / `Draft`), Tanggal, dan Aksi (Edit & Delete modal).
   - Dialog konfirmasi hapus artikel bertema dark glass.
2. **Form Tulis / Edit Berita (`ArticleForm`)**:
   - Kontainer form dalam kartu glassmorphic elegan (`bg-zinc-900/60 backdrop-blur-xl border-white/5`).
   - Field input judul dengan auto-preview slug interaktif di bawahnya.
   - Select kategori dark theme.
   - Upload cover image box dengan dropzone look & preview gambar interaktif.
   - Textarea konten artikel dark input (`bg-zinc-950/60 border-white/10 text-white focus:border-brand-500/50`).
   - Checkbox / toggle switch "Terbitkan Artikel" dengan badge indikator status aktif.
   - Tombol aksi: Simpan (primary brand/emerald gradient) & Batal (outline dark).

---

## 2. Layout & Breakpoint
- Target `md+` (≥768px dan mode Desktop site 1024-1280px) dengan responsivitas tetap rapi di mobile.
- `overflow-x-auto` pada tabel agar tidak merusak lebar layout card.
- Breadcrumb / tombol kembali ke `/admin/berita` pada halaman form tulis/edit.

---

## 3. Verification Plan
- `npx tsc --noEmit` & `npm run build`
- Cek responsivitas dan filter pencarian interaktif di browser.
