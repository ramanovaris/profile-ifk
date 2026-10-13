# Dokumen Desain: Redesain Halaman Login Admin (`/admin/login`)

**Tanggal:** 2026-09-06  
**Status:** Approved  
**Author:** Rama Novaris & Hermes Agent  

---

## 1. Ringkasan & Tujuan
Meningkatkan kualitas visual dan pengalaman pengguna (*user experience*) pada halaman login admin (`/admin/login`). Desain lama yang berupa kartu putih standar di atas background abu-abu terang digantikan dengan konsep **Dark Ethereal / Aurora** yang senada dengan hero dark theme pada halaman publik, lengkap dengan material glassmorphism dan peningkatan ergonomi form input.

---

## 2. Spesifikasi Desain & Visual

### 2.1 Background & Canvas Atmosphere
- **Canvas Base**: Warna dasar gelap pekat `#09090b` (zinc-950).
- **Aurora Mesh Glow**:
  - Radial gradient emerald di sudut kanan atas (`rgba(16, 185, 129, 0.15)`).
  - Radial gradient brand green di sudut kiri bawah (`rgba(61, 143, 32, 0.12)`).
  - Terpusat memenuhi viewport layar (`min-h-screen`) dengan layout flex center.
- **Navigasi Cepat**:
  - Tombol/link `"← Kembali ke Beranda"` minimalis di bagian atas atau dalam area kartu, mengarahkan pengguna kembali ke root portal publik (`/`).

### 2.2 Kartu Login (Floating Glassmorphism Card)
- **Container**:
  - Lebar responsif: `w-full max-w-md mx-auto`.
  - Material: `bg-zinc-900/75 backdrop-blur-xl`.
  - Border & Shadow: `border border-white/10 shadow-2xl shadow-black/70 rounded-2xl p-6 sm:p-8`.
- **Header Kartu**:
  - Avatar Logo IFK berbentuk lingkaran dengan aksen ring glow hijau (`ring-2 ring-brand-500/30 shadow-md shadow-brand-500/10`).
  - Judul Instansi: `text-lg sm:text-xl font-bold text-white text-center mt-3`.
  - Subtitle: `text-xs text-zinc-400 text-center mt-0.5` ("Panel Administrasi Internal").
  - Security Badge: Badge pill kecil terpusat `"Akses Terbatas Petugas"` (`text-[10px] uppercase tracking-wider font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2.5 py-0.5 rounded-full mt-2 inline-block`).

### 2.3 Ergonomi Form & Interaktivitas
- **Input Username**:
  - Ikon `User` di sisi kiri (`text-zinc-500`).
  - Background gelap `bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl pl-10`.
- **Input Password**:
  - Ikon `Lock` di sisi kiri (`text-zinc-500`).
  - Tombol toggle show/hide password (`Eye` / `EyeOff`) di sisi kanan untuk memudahkan pengetikan sandi.
  - Pl-10 dan pr-10 untuk menjaga kenyamanan jarak teks.
- **Tombol Submit (Masuk)**:
  - Tombol beraksen brand green: `bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-brand-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2`.
  - Ikon `LogIn` atau `ArrowRight` untuk aksentuasi tindakan.

### 2.4 Footer Kartu
- Teks copyright & atribusi halus di bawah form: `text-[11px] text-zinc-500 text-center mt-6` ("Hak Cipta © Dinas Kesehatan Kota Banjarmasin").

---

## 3. Scope & Batasan (Boundaries)
- **Dalam Scope**:
  - Styling visual UI, tata letak, icon, glassmorphism, dan toggle visibility password di `src/app/(admin)/admin/login/page.tsx`.
- **Di Luar Scope**:
  - Perubahan logika backend autentikasi, JWT/session cookie, middleware proteksi rute admin, atau koneksi database (tetap mempertahankan mock redirect client-side sementara).

---

## 4. Kriteria Keberhasilan (Acceptance Criteria)
1. Tampilan halaman login menggunakan tema Dark Ethereal yang konsisten dengan estetika halaman publik.
2. Form kartu login responsif di layar mobile maupun desktop tanpa clipping atau overflow.
3. Toggle password berfungsi dengan baik (mengubah tipe input dari `password` ke `text` dan sebaliknya).
4. Tombol navigasi kembali ke beranda publik berfungsi.
5. Verifikasi `tsc --noEmit` dan CI lolos tanpa error.
