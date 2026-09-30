# Manajemen Hapus / Reset Data Stok per Periode di Panel Admin Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Menyediakan fitur bagi administrator untuk menghapus atau mereset seluruh data stok obat dalam satu periode tertentu (`YYYY-MM`) secara terpusat dan aman pada panel admin (`/admin/stok`), dilengkapi konfirmasi modal simetris 50/50, feedback toast, dan sinkronisasi navigasi periode.

**Architecture:** Implementasi server action `deleteStockPeriodAction` di `src/actions/stock.ts` dengan Prisma `deleteMany({ where: { period } })`, penambahan properti `footerAction` pada `StockMultiSelectFilter`, integrasi dialog konfirmasi tema Dark Ethereal pada `StockTable`, dan penanganan perpindahan URL/state pasca-penghapusan.

**Tech Stack:** Next.js (App Router), React, Prisma ORM, PostgreSQL, Tailwind CSS, Lucide React, Sonner (Toast).

## Global Constraints
- Tema admin: *Dark Ethereal* (`zinc-950`, `border-white/10`, aksen merah untuk bahaya/destruktif).
- Dialog konfirmasi: Grid simetris 50/50 untuk tombol Batal vs Konfirmasi Hapus pada perangkat seluler dan desktop.
- Keamanan: Wajib validasi sesi admin dan format periode sebelum eksekusi `deleteMany`.
- Standar GitFlow: Branch fitur `feat/111-stock-delete-reset-period`, base `develop`.
- **STRICT NO-AUTO-MERGE:** Dilarang melakukan merge otomatis ke `develop` tanpa persetujuan eksplisit pengguna.

---

### Task 1: Buat Branch Fitur Baru
**Files:**
- Repository Git

**Interfaces:**
- Input: branch `develop` bersih
- Output: branch `feat/111-stock-delete-reset-period`

- [ ] **Step 1: Buat branch fitur baru**
  `git checkout -b feat/111-stock-delete-reset-period`
- [ ] **Step 2: Verifikasi branch aktif**
  `git branch --show-current`

---

### Task 2: Implementasi Server Action `deleteStockPeriodAction` (TDD)
**Files:**
- Modify: `src/actions/stock.ts`
- Create / Test: `scripts/verify-stock-period-delete.ts`

**Interfaces:**
- Consumes: `db.medicineStock`, `getCurrentSession()`
- Produces: `deleteStockPeriodAction(period: string, options?: { _testUserId?: string })`

- [ ] **Step 1: Tulis skrip verifikasi test runner**
  Buat berkas `scripts/verify-stock-period-delete.ts` yang membuat record uji coba di periode `2099-12`, memanggil `deleteStockPeriodAction`, dan menguji:
  1. Record di periode `2099-12` terhapus 100%.
  2. Nilai `count` yang dikembalikan sesuai jumlah data uji.
  3. Data pada periode riil (`2026-08`, `2026-07`, dsb.) sama sekali tidak terpengaruh.
  4. Validasi penolakan format periode tidak valid (misal: `"invalid-format"`).
- [ ] **Step 2: Jalankan skrip test (pastikan gagal/belum terdefinisi)**
  `npx tsx scripts/verify-stock-period-delete.ts`
- [ ] **Step 3: Implementasikan `deleteStockPeriodAction` di `src/actions/stock.ts`**
  Tambahkan fungsi:
  ```typescript
  export async function deleteStockPeriodAction(
    period: string,
    options?: { _testUserId?: string }
  ): Promise<StockActionResult<{ period: string; count: number }>> {
    if (!options?._testUserId) {
      const session = await getCurrentSession();
      if (!session) {
        return {
          success: false,
          error: "Sesi tidak valid atau telah kedaluwarsa. Silakan masuk kembali.",
        };
      }
    }

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
        // Safe fallback
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
- [ ] **Step 4: Jalankan skrip verifikasi dan pastikan PASS 100%**
  `npx tsx scripts/verify-stock-period-delete.ts`
- [ ] **Step 5: Bersihkan skrip uji atau pertahankan sebagai suite mandiri**
- [ ] **Step 6: Commit server action**
  `git commit -m "feat(stock): implementasi server action deleteStockPeriodAction (#111)"`

---

### Task 3: Tambahkan Fitur `footerAction` pada `StockMultiSelectFilter`
**Files:**
- Modify: `src/components/admin/stock-multi-select-filter.tsx`

**Interfaces:**
- Consumes: props baru `footerAction?: { label: string; icon?: React.ReactNode; onClick: () => void; variant?: "danger" | "default"; disabled?: boolean }`
- Produces: Bagian footer dropdown yang elegan di bawah opsi pencarian/daftar item.

- [ ] **Step 1: Perbarui interface `StockMultiSelectFilterProps`**
  Tambahkan definisi `footerAction`.
- [ ] **Step 2: Render footer action di kontainer dropdown popover**
  Tampilkan pemisah halus `border-t border-white/5 mt-1 pt-1 p-1` dan tombol aksi dengan styling fleksibel (danger: `text-rose-400 hover:bg-rose-500/10 hover:text-rose-300`).
  Saat diklik: panggil `footerAction.onClick()` dan tutup dropdown via `closeDropdown()`.
- [ ] **Step 3: Commit perubahan komponen filter**
  `git commit -m "feat(ui): tambahkan dukungan footerAction pada StockMultiSelectFilter (#111)"`

---

### Task 4: Integrasi Tombol Hapus Periode & Dialog Konfirmasi 50/50 di `StockTable`
**Files:**
- Modify: `src/app/(admin)/admin/stok/stock-table.tsx`

**Interfaces:**
- Consumes: `deleteStockPeriodAction`, `StockMultiSelectFilter` dengan `footerAction`, `Dialog`
- Produces: Alur lengkap penghapusan periode stok dari UI admin.

- [ ] **Step 1: Tambahkan state untuk modal hapus periode**
  - `const [isDeletePeriodOpen, setIsDeletePeriodOpen] = useState(false);`
  - `const [isDeletingPeriod, setIsDeletingPeriod] = useState(false);`
- [ ] **Step 2: Sambungkan `footerAction` pada filter Periode**
  - Tampilkan tombol `Hapus Data Periode Ini` dengan ikon `Trash2`.
  - Pasang handler pembuka dialog `setIsDeletePeriodOpen(true)`.
  - Perbarui juga kondisi render filter periode: agar tetap muncul jika `availablePeriods.length >= 1` (bukan hanya `> 1`), sehingga admin tetap bisa menghapus data jika hanya ada 1 periode.
- [ ] **Step 3: Implementasikan `handleConfirmDeletePeriod`**
  - Panggil `deleteStockPeriodAction(selectedPeriod)`.
  - Tampilkan toast notifikasi sukses: `toast.success(`Berhasil menghapus ${res.count} data obat pada periode ${selectedPeriod}.`)`.
  - Hitung periode tersisa: `const remainingPeriods = availablePeriods.filter((p) => p !== selectedPeriod)`.
  - Update URL ke periode terbaru yang tersisa: `updateUrl({ periode: remainingPeriods[0] || null, page: null })`.
  - Jika periode kosong, reset data lokal `setItems([])`.
- [ ] **Step 4: Susun UI Modal Dialog Konfirmasi 50/50**
  - Judul: `Hapus Seluruh Data Periode [Bulan YYYY]?`
  - Ringkasan item: Tampilkan badge periode dan jumlah obat dalam periode tersebut.
  - Tombol simetris: Batal (50%) & Ya, Hapus Periode (50%) dengan loading spinner.
- [ ] **Step 5: Verifikasi Type Checking**
  `npx tsc --noEmit`
- [ ] **Step 6: Commit integrasi UI admin stok**
  `git commit -m "feat(admin-stok): integrasi modal konfirmasi dan aksi hapus periode (#111)"`

---

### Task 5: Verifikasi Visual & Pengujian End-to-End
**Files:**
- Browser / Dev Server

- [ ] **Step 1: Restart Next.js dev server jika diperlukan**
- [ ] **Step 2: Buka halaman admin stok di peramban**
  Ambil tangkapan layar responsif (viewport mobile 390px & desktop) untuk:
  1. Dropdown filter periode terbuka dengan tombol footer "Hapus Data Periode Ini".
  2. Dialog konfirmasi hapus periode 50/50 terbuka rapi di mobile & desktop.
- [ ] **Step 3: Periksa hasil tangkapan layar via `vision_analyze`**
  Pastikan tidak ada overflow teks atau elemen terpotong.

---

### Task 6: Push Branch, Buat Pull Request, dan Pantau CI (STOP GATE)
**Files:**
- GitHub PR

- [ ] **Step 1: Push branch fitur ke origin**
  `git push -u origin feat/111-stock-delete-reset-period`
- [ ] **Step 2: Buat Pull Request ke `develop`**
  Gunakan `gh pr create` dengan judul dan deskripsi standar kedinasan.
- [ ] **Step 3: Tautkan PR ke GitHub Projects PNS**
  `gh project item-add 1 --owner ramanovaris --url <PR-URL>`
- [ ] **Step 4: Pantau CI GitHub Actions**
  `gh pr checks <PR-NUMBER> --watch`
- [ ] **Step 5: Sajikan skenario pengujian ke pengguna dan STOP (TIDAK MELAKUKAN AUTO-MERGE)**
  Tunggu pengujian mandiri dan izin eksplisit dari pengguna.
