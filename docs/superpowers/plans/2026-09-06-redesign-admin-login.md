# Implementation Plan: Redesain Halaman Login Admin (`/admin/login`)

**Tujuan:** Mengimplementasikan tema Dark Ethereal pada halaman login admin dengan floating glassmorphism card, aurora mesh background glow, navigasi kembali ke beranda publik, dan toggle visibility password.

**Arsitektur:** Mengganti styling pada komponen client `src/app/(admin)/admin/login/page.tsx` dengan memanfaatkan utility Tailwind CSS v4, Lucide React icons (`User`, `Lock`, `Eye`, `EyeOff`, `LogIn`, `ArrowLeft`), dan token warna brand yang sudah tersedia di `src/app/globals.css`.

**Tech Stack:** Next.js 16.3.3 (App Router), React 19, Tailwind CSS v4, Lucide React, TypeScript.

---

## Global Constraints
- Bahasa pengantar dokumentasi dan PR: Bahasa Indonesia (istilah teknis tetap bahasa Inggris).
- Pertahankan fungsionalitas mock login saat ini (`e.preventDefault() -> router.push("/admin/dashboard")`).
- Jangan mendefinisikan komponen di dalam komponen React (hindari remount dan keyboard loss di mobile).
- Pastikan input tidak terhalang atau berantakan di layar smartphone.
- Verifikasi dengan `npx tsc --noEmit` dan uji HTTP status route pada dev server.

---

## Tasks

### Task 1: Implementasi Dark Ethereal UI & Ergonomi Form pada `AdminLoginPage`

**Files:**
- Modify: `src/app/(admin)/admin/login/page.tsx`

**Rincian Perubahan:**
1. Impor icon dari `lucide-react`: `User`, `Lock`, `Eye`, `EyeOff`, `LogIn`, `ArrowLeft`.
2. Impor `Link` dari `next/link`.
3. Tambahkan state `showPassword` (`useState(false)`).
4. Buat container layar penuh `min-h-screen relative flex items-center justify-center bg-zinc-950 px-4 py-12 overflow-hidden`.
5. Buat layer aurora glow dekoratif di background:
   - Glow emerald di kanan atas: `absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none`
   - Glow brand green di kiri bawah: `absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-brand-600/15 blur-3xl pointer-events-none`
6. Buat tombol kembali `"← Kembali ke Beranda"` di atas kartu:
   - `<Link href="/" className="inline-flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white transition-colors mb-6">`
7. Perbarui kartu login:
   - Glassmorphism container: `w-full max-w-md rounded-2xl bg-zinc-900/75 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/70 p-6 sm:p-8`
   - Logo instansi beraksen ring glow hijau: `ring-2 ring-brand-500/30 shadow-md shadow-brand-500/20`
   - Judul instansi & subtitle panel admin internal
   - Badge pill `"Akses Terbatas Petugas"` beraksen emerald
8. Field input form:
   - Input username dengan icon `User` di kiri
   - Input password dengan icon `Lock` di kiri dan tombol toggle `Eye`/`EyeOff` di kanan
   - Styling dark input: `bg-zinc-950/70 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 rounded-xl`
9. Tombol Masuk:
   - `bg-brand-600 hover:bg-brand-500 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-brand-600/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2`
10. Footer teks hak cipta kecil di bawah form.

**Verifikasi:**
- [ ] TypeScript check: `npx tsc --noEmit` → output 0 error
- [ ] Dev server HTTP 200 check: `curl -I http://localhost:3003/profile-ifk/admin/login` → 200 OK
- [ ] Git commit perubahan kode UI

---

### Task 2: Verifikasi Visual & Pengujian di Dev Server

**Files:**
- Tidak ada modifikasi file (tahap verifikasi runtime & browser).

**Langkah:**
1. Cek log dev server untuk memastikan tidak ada runtime/hydration error.
2. Lakukan curl test render HTML halaman login untuk memastikan semua elemen text dan icon ada.
3. Push branch `feat/redesign-admin-login` ke remote repository.
4. Buat Pull Request (PR) ke branch `develop` dengan judul dan deskripsi dalam Bahasa Indonesia.
5. Tunggu hasil validasi CI di GitHub Actions.
6. Berikan URL preview kepada user untuk peninjauan visual di HP.
