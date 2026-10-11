# Spesifikasi Desain: Fitur Pemilih Tema Admin (Light Mode, Dark Mode, & Deteksi Sistem)

- **Tanggal Dokumen:** 2026-10-11
- **Status:** Disetujui Pengguna (Siap Masuk Perencanaan Implementasi)
- **Lingkup Implementasi:** Batch 1 (Admin Shell & Halaman Dashboard)

---

## 1. Latar Belakang & Tujuan

Panel Admin IFK Kotabaru saat ini dirancang eksklusif dengan tema *Dark Ethereal*. Sebagian staf dan pengguna membutuhkan opsi tema terang (*Light Mode*) untuk kenyamanan membaca di lingkungan terang, serta kemampuan mendeteksi tema otomatis sesuai preferensi sistem operasi (*System Theme*).

Tujuan implementasi:
1. Menyediakan kontrol pengalihan tema (*Theme Toggle*) berbentuk dropdown ringkas pada header atas admin.
2. Mendukung 3 pilihan mode: **Terang** (*Light*), **Gelap** (*Dark*), dan **Sistem** (*System*).
3. Nilai bawaan (*default*) untuk sesi baru adalah **Terang** (*Light Mode*).
4. Menyimpan pilihan pengguna ke memori browser lokal (`localStorage: "admin-theme"`) sehingga preferensi tetap bertahan saat berpindah halaman atau membuka sesi baru.
5. Mendukung sinkronisasi dinamis preferensi sistem operasi (*OS color scheme*) via `prefers-color-scheme` ketika mode *System* aktif, tanpa membutuhkan muat ulang (*reload*) halaman.
6. Memenuhi batasan arsitektur VPS (efisien memori, tanpa ketergantungan paket eksternal baru seperti `next-themes`).
7. Mematuhi panduan pengerjaan visual: 1-2 per batch lalu verifikasi di HP (Batch 1: *Admin Shell* dan *Dashboard*).

---

## 2. Arsitektur Teknis & Alur Data

### A. Alur Resolusi Tema (Theme Resolution Flow)
1. **Inisialisasi Client:**
   - Komponen membaca `localStorage.getItem("admin-theme")`.
   - Jika belum ada atau nilai tidak valid, gunakan nilai bawaan `"light"`.
2. **Kondisi Opsi:**
   - Jika pengaturan adalah `"light"` -> Tema aktif resolved = `"light"`.
   - Jika pengaturan adalah `"dark"` -> Tema aktif resolved = `"dark"`.
   - Jika pengaturan adalah `"system"` -> Tema aktif resolved dibaca dari `window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"`.
3. **Penerapan ke DOM:**
   - Elemen pembungkus root admin (`AdminShell`) diberi atribut:
     ```html
     <div data-admin-theme={resolvedTheme} className="admin-root relative flex h-dvh min-h-dvh ...">
     ```
4. **Listener Dinamis Mode Sistem:**
   - Bila mode `"system"` terpilih, tambahkan event listener pada `matchMedia("(prefers-color-scheme: dark)")` (`change` event).
   - Saat pengguna mengubah pengaturan tema OS HP/laptop, status resolved otomatis terperbarui seketika.

---

## 3. Desain Antarmuka & Token CSS

### A. Pemetaan Variabel CSS (`src/app/globals.css`)
Penambahan token CSS scoped untuk `.admin-root` agar tidak mengganggu layout publik:

```css
/* Token Tema Admin */
.admin-root[data-admin-theme="light"] {
  --admin-bg: #f8fafc;
  --admin-surface: #ffffff;
  --admin-surface-nav: #f1f5f9;
  --admin-border: #e2e8f0;
  --admin-border-subtle: #f1f5f9;
  --admin-text-main: #0f172a;
  --admin-text-muted: #64748b;
  --admin-card-bg: #ffffff;
  --admin-card-border: #e2e8f0;
  --admin-header-bg: rgba(255, 255, 255, 0.85);
  --admin-sidebar-bg: #ffffff;
  --admin-hover-bg: #f1f5f9;
}

.admin-root[data-admin-theme="dark"] {
  --admin-bg: #09090b;
  --admin-surface: rgba(24, 24, 27, 0.6);
  --admin-surface-nav: rgba(24, 24, 27, 0.6);
  --admin-border: rgba(255, 255, 255, 0.05);
  --admin-border-subtle: rgba(255, 255, 255, 0.03);
  --admin-text-main: #f4f4f5;
  --admin-text-muted: #a1a1aa;
  --admin-card-bg: rgba(24, 24, 27, 0.6);
  --admin-card-border: rgba(255, 255, 255, 0.05);
  --admin-header-bg: rgba(24, 24, 27, 0.6);
  --admin-sidebar-bg: rgba(24, 24, 27, 0.6);
  --admin-hover-bg: rgba(255, 255, 255, 0.05);
}
```

### B. Komponen Pengalih Tema (`ThemeDropdown`)
- Ditempatkan di header `AdminShell` sebelum badge role admin.
- Menggunakan `@base-ui/react/menu` yang sudah terpasang via `@/components/ui/dropdown-menu.tsx`.
- **Trigger Button:**
  - Ikon adaptif:
    - `Sun` jika tema pilihan saat ini adalah `"light"`.
    - `Moon` jika tema pilihan saat ini adalah `"dark"`.
    - `Laptop` / `Monitor` jika tema pilihan saat ini adalah `"system"`.
  - Tombol ringkas ukuran h-9 w-9 berbingkai lembut, ramah sentuhan di layar ponsel.
- **Menu Pilihan:**
  1. **Terang** (Ikon `Sun`, teks "Terang", centang jika aktif)
  2. **Gelap** (Ikon `Moon`, teks "Gelap", centang jika aktif)
  3. **Sistem** (Ikon `Monitor`, teks "Sistem", centang jika aktif)

---

## 4. Lingkup Perubahan Berkas (Batch 1)

1. **`src/app/globals.css`**
   - Mendefinisikan variabel CSS semantik untuk `.admin-root[data-admin-theme="light"]` dan `[data-admin-theme="dark"]`.
2. **`src/components/admin/admin-shell.tsx`**
   - Menambahkan state preferensi tema (`themeSetting`: `'light' | 'dark' | 'system'`).
   - Menerapkan hook deteksi `prefers-color-scheme`.
   - Menyematkan `data-admin-theme={resolvedTheme}` pada kontainer utama.
   - Menambahkan komponen `ThemeDropdown` pada bar atas header.
   - Memperbarui gaya sidebar, header, sheet mobile, dan background aura agar merespons variabel tema.
3. **`src/app/(admin)/admin/dashboard/page.tsx`**
   - Menyelaraskan kartu metrik KPI, header dashboard, dan tabel ringkasan agar mendukung Light Mode dan Dark Mode dengan kontras tajam.

---

## 5. Rencana Pengujian & Verifikasi

1. **Uji Fungsional Pengalihan:**
   - Buka `/admin/dashboard/` pertama kali -> Pastikan tampil dalam mode Terang (*Light*).
   - Klik dropdown tema -> Pilih "Gelap" -> Tampilan beralih instan ke tema gelap (*Dark Ethereal*).
   - Klik dropdown tema -> Pilih "Sistem" -> Tampilan mengikuti pengaturan tema browser/OS.
2. **Uji Persistensi:**
   - Pilih "Gelap", segarkan halaman (*refresh*) -> Tema tetap Gelap.
   - Pindah navigasi ke halaman lain -> Tema tetap konsisten.
3. **Uji Responsif & Review HP:**
   - Periksa tata letak header pada ukuran layar ponsel (`<640px`) dan tablet/desktop (`md+`).
   - Pastikan menu dropdown tidak terpotong tepi layar (*viewport boundary*).
