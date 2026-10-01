# Spesifikasi Desain: Manajemen Hapus / Reset Data Stok per Periode di Panel Admin (Issue #111)

## 1. Latar Belakang & Tujuan
Pada panel admin Instalasi Farmasi Kabupaten (IFK) Kotabaru (`/admin/stok`), data ketersediaan perbekalan farmasi dikelola berbasis periode bulanan (`YYYY-MM`). Saat melakukan pembaruan berkas Excel bulanan, administrator terkadang menghadapi kondisi:
- Berkas yang diunggah salah bulan atau keliru versi sebelum finalisasi.
- Struktur data impor membutuhkan perbaikan total sehingga data periode tersebut perlu dibersihkan terlebih dahulu.
- Rekap periode tertentu perlu di-reset agar dapat diimpor ulang dari awal secara bersih (*clean slate*).

Fitur ini menyediakan fasilitas bagi administrator untuk **menghapus atau mereset seluruh data obat dalam satu periode tertentu secara terpusat**, aman, dan terisolasi tanpa memengaruhi riwayat periode lainnya.

## 2. Ruang Lingkup & Kriteria Kebutuhan
1. **Pemicu Aksi Kontekstual:**
   - Tombol aksi *"Hapus Seluruh Data Periode [Bulan YYYY]"* disematkan di bagian bawah (*footer action*) pada dropdown filter **Periode** di panel admin `/admin/stok`.
   - Menggunakan pemisah visual garis halus dan warna teks peringatan lembut (`text-rose-400 hover:bg-rose-500/10`).
2. **Dialog Konfirmasi Keamanan (Tema Dark Ethereal):**
   - Modal konfirmasi modal 50/50 yang simetris, seragam dengan standar dialog konfirmasi admin IFK.
   - Peringatan jelas: menyebutkan nama periode, jumlah total item obat yang akan dihapus, dan jaminan bahwa periode lain tidak terpengaruh.
3. **Backend Server Action Aman:**
   - Server action `deleteStockPeriodAction(period: string)` di `src/actions/stock.ts`.
   - Memeriksa sesi aktif administrator (`getCurrentSession()`).
   - Validasi ketat format periode (`^\d{4}-\d{2}$`).
   - Eksekusi terisolasi menggunakan Prisma `db.medicineStock.deleteMany({ where: { period } })`.
   - Revalidasi cache halaman `/admin/stok` dan `/stok`.
4. **Respon Visual & Navigasi Pasca Penghapusan:**
   - Notifikasi toast sukses mengabarkan jumlah item yang terhapus.
   - Jika masih ada periode lain: Otomatis berpindah dan menampilkan periode terbaru yang tersisa.
   - Jika seluruh periode habis: Menampilkan *empty state* bersih tanpa galat runtime.

---

## 3. Desain Antarmuka Pengguna (UI / UX)

### 3.1. Dropdown Filter Periode (`StockMultiSelectFilter`)
Pada komponen `src/components/admin/stock-multi-select-filter.tsx`, ditambahkan properti opsional untuk aksi footer:
- `footerAction?: { label: string; icon?: React.ReactNode; onClick: () => void; variant?: "danger" | "default" }`
- Ketika properti ini diberikan, dropdown menampilkan pemisah `border-t border-white/5` di bawah daftar opsi dan merender tombol aksi di bagian bawah kontainer dropdown.
- Saat tombol footer diklik, dropdown otomatis ditutup dan memicu `onClick` (membuka dialog konfirmasi).

### 3.2. Modal Dialog Konfirmasi (`Dialog`)
- **Backdrop & Kontainer:** `border border-white/10 bg-zinc-950/95 text-white backdrop-blur-2xl max-w-md shadow-2xl rounded-2xl p-6`.
- **Ikon Header:** Ikon peringatan `AlertTriangle` di dalam badge melingkar merah lembut (`border border-red-500/20 bg-red-500/10 text-red-400`).
- **Judul:** `Hapus Data Periode [Bulan YYYY]?`
- **Deskripsi:** `Tindakan ini permanen. Seluruh data stok obat pada periode ini akan dihapus dari sistem.`
- **Ringkasan Informasi:**
  - Kartu ringkas berlatar gelap (`border border-white/5 bg-white/[0.02] p-3.5 rounded-xl space-y-2`).
  - Baris 1: Label Periode (misal: "Agustus 2026") dan kode periode (`2026-08`).
  - Baris 2: Total Item yang Terpengaruh (misal: "224 item obat").
  - Keterangan penenang: *"Data arsip periode lainnya tetap aman dan tidak berubah."*
- **Tata Letak Tombol Aksi Simetris 50/50:**
  - Tombol **Batal:** `w-full h-10 rounded-xl border border-white/10 bg-white/5 font-medium text-zinc-300 hover:bg-white/10 hover:text-white`.
  - Tombol **Hapus Periode:** `w-full h-10 rounded-xl border border-red-500/30 bg-gradient-to-r from-red-600 to-rose-600 font-semibold text-white shadow-lg shadow-red-500/20 hover:brightness-110 active:scale-95 disabled:opacity-50`.
  - State Loading: Tombol hapus menampilkan spinner `Loader2` saat proses server action berlangsung.

---

## 4. Arsitektur Data & Aliran Proses (Data Flow)

```
[Administrator di /admin/stok]
       │
       │ 1. Buka Dropdown Filter Periode
       │ 2. Klik "Hapus Seluruh Data Periode [YYYY-MM]"
       ▼
[Modal Dialog Konfirmasi Keamanan]
       │
       │ 3. Konfirmasi "Hapus Periode"
       ▼
[Server Action: deleteStockPeriodAction(period)]
       │
       ├─▶ A. Cek autentikasi sesi admin
       ├─▶ B. Validasi format string periode (YYYY-MM)
       ├─▶ C. Hitung total baris yang cocok (count)
       ├─▶ D. db.medicineStock.deleteMany({ where: { period } })
       ├─▶ E. revalidatePath("/admin/stok") & revalidatePath("/stok")
       ▼
[Client State & URL Update]
       │
       ├─▶ Tampilkan Toast Sukses ("Berhasil menghapus X data obat...")
       ├─▶ Perbarui availablePeriods di client (filter out periode terhapus)
       └─▶ Alihkan URL ke periode tersisa berikutnya atau mode bersih
```

---

## 5. Spesifikasi Server Action (`src/actions/stock.ts`)

```typescript
export async function deleteStockPeriodAction(
  period: string,
  options?: { _testUserId?: string }
): Promise<StockActionResult<{ period: string; count: number }>> {
  // 1. Verifikasi sesi
  if (!options?._testUserId) {
    const session = await getCurrentSession();
    if (!session) {
      return {
        success: false,
        error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
      };
    }
  }

  // 2. Validasi format periode
  const trimmed = period?.trim();
  if (!trimmed || !/^\d{4}-\d{2}$/.test(trimmed)) {
    return {
      success: false,
      error: "Format periode tidak valid (harus YYYY-MM).",
    };
  }

  try {
    const result = await db.medicineStock.deleteMany({
      where: { period: trimmed },
    });

    try {
      revalidatePath("/admin/stok");
      revalidatePath("/stok");
    } catch {
      // Safe fallback di luar request context
    }

    return {
      success: true,
      data: {
        period: trimmed,
        count: result.count,
      },
      count: result.count,
    };
  } catch (err: unknown) {
    console.error("[deleteStockPeriodAction] Error:", err);
    return {
      success: false,
      error: "Gagal menghapus data periode obat.",
    };
  }
}
```

---

## 6. Penanganan Skenario Batas (Edge Cases)
1. **Hanya Tersisa 1 Periode:**
   - Dropdown filter periode tetap dapat menampilkan tombol hapus.
   - Jika periode terakhir dihapus, tabel beralih ke state kosong (`initialItems = []`), tidak melempar error, dan tombol ekspor dinonaktifkan/ditangani dengan aman.
2. **Double-Clicking / Klik Cepat:**
   - Tombol hapus di-disable selama status `isPending = true` dengan indikator loading spinner.
3. **Periode Tidak Ditemukan di DB:**
   - Jika periode sudah dihapus oleh pengguna lain, `deleteMany` mengembalikan `count: 0`, action tetap sukses tanpa galat, dan UI menyinkronkan state.
4. **Isolasi Data:**
   - Klausa `where: { period }` memastikan secara deterministik bahwa record dengan periode berbeda tidak pernah tersentuh.

---

## 7. Rencana Pengujian & Verifikasi
1. **Self-Check Test Script:**
   - Skrip mandiri berbasis Node.js/TypeScript untuk:
     1. Menambahkan item dummy pada periode uji coba `2099-01`.
     2. Memanggil `deleteStockPeriodAction("2099-01")`.
     3. Memastikan `count` sesuai, baris terhapus dari basis data, dan periode produksi (`2026-08`, `2026-07`) tetap utuh 100%.
2. **Verifikasi Visual:**
   - Uji tampilan dropdown periode di layar HP dan desktop.
   - Uji interaksi pembukaan modal konfirmasi 50/50 dan aksi pembatalan maupun eksekusi.
