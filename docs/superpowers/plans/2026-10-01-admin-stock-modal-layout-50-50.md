# Rencana Implementasi: Tata Letak Modal Form Obat Desktop Responsif 50/50 & Peniadaan Spin Button (Issue #120)

Rencana kerja ini menguraikan tahapan pengubahan formulir Tambah Obat dan Edit Obat di panel admin IFK Kotabaru (`src/app/(admin)/admin/stok/stock-table.tsx`) agar berarsitektur 2 kolom 50/50 pada layar desktop, meniadakan panah spin button pada input angka untuk menghindari kesalahan input kuantitas, dan menjaga kenyamanan pada layar ponsel.

## Tahapan Pekerjaan

### Tahap 1: Konfigurasi Styling Input Angka (No-Spinner)
- [ ] Tambahkan konfigurasi CSS / utility pada `src/app/globals.css` untuk menonaktifkan tombol panah (*spin button*) pada seluruh elemen `input[type="number"]`.
- [ ] Verifikasi bahwa input angka di peramban tidak lagi menampilkan panah atas/bawah.

### Tahap 2: Restrukturisasi Modal Tambah Obat (`isAddOpen`)
- [ ] Ubah kontainer dialog menjadi responsif: `max-w-lg md:max-w-3xl lg:max-w-4xl`.
- [ ] Ubah struktur form bagian dalam menjadi grid 2 kolom (`grid-cols-1 md:grid-cols-2 gap-5`).
- [ ] Kelompokkan input sisi kiri: Nama Barang, Kode Barang & Kategori, Satuan Kemasan & Jumlah Stok Fisik, Status Ketersediaan.
- [ ] Kelompokkan input sisi kanan: Header Logistik & Perencanaan, Rata-rata Pemakaian/Bln (RPB), Kecukupan Stok (Bulan), Tanggal Kedaluwarsa (ED), Nomenklatur, serta kartu pratinjau ringkas (*Quick Insight Box*).
- [ ] Ubah tombol aksi (Batal & Simpan) menjadi responsif: mobile grid 2 kolom 50/50, desktop `flex justify-end gap-3`.

### Tahap 3: Restrukturisasi Modal Edit Obat (`editItem`)
- [ ] Terapkan arsitektur kontainer `max-w-lg md:max-w-3xl lg:max-w-4xl` dan grid 2 kolom 50/50 yang simetris pada modal Edit Obat.
- [ ] Pastikan seluruh nilai terisi (*pre-filled*) dan reaktivitas perubahan kuantitas/pemakaian bekerja mulus.

### Tahap 4: Verifikasi & Uji Visual
- [ ] Uji tampilan menggunakan skrip headless browser Playwright pada resolusi Desktop (1280x800) dan Mobile (390x844).
- [ ] Pastikan tidak ada tombol aksi yang terpotong di bawah layar (*no cut-off*).
- [ ] Pastikan panah spin button pada `Jumlah Stok Fisik` dan `Rata-rata Pemakaian` bersih hilang di tampilan desktop.
- [ ] Jalankan validasi tipe TypeScript via `npx tsc --noEmit`.

### Tahap 5: Commit, Push, dan Pull Request
- [ ] Lakukan git commit rapi mengikuti konvensi Commitizen.
- [ ] Push branch fitur `feat/120-admin-stock-modal-layout-50-50` ke remote repository.
- [ ] Buka Pull Request ke branch `develop` dan monitor GitHub Actions CI.
