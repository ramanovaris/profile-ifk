# Multi-Select Combobox Filter Kategori Berita Admin Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengganti filter pills statis pada halaman `/admin/berita` dengan komponen Multi-Select Combobox yang dinamis (mengambil master kategori aktif), mendukung pencarian kategori, aksi cepat, dan seleksi multi-kategori (logika OR) dengan tampilan Dark Ethereal.

**Architecture:** Membuat komponen mandiri `CategoryMultiSelectFilter` di `src/components/admin/category-multi-select-filter.tsx` agar terhindar dari React remount / re-render pitfall. Komponen diintegrasikan ke toolbar `/admin/berita` menggantikan horizontal category pills.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS, Lucide React icons, TypeScript.

## Global Constraints
- Tema: Dark Ethereal (`bg-zinc-950`, kartu `bg-zinc-900/60`, border `border-white/5`).
- Focus ring seragam: `border-brand-500/60 ring-2 ring-brand-500/40 outline-none`.
- Zero additional npm dependencies (pure React + Tailwind + Lucide).
- React Pitfall Guard: Jangan definisikan komponen di dalam komponen lain.
- Mobile/Desktop responsiveness: Default untuk desktop md+, responsif fleksibel di mobile.

---

### Task 1: Buat Komponen `CategoryMultiSelectFilter`

**Files:**
- Create: `src/components/admin/category-multi-select-filter.tsx`

**Interfaces:**
```tsx
export interface CategoryFilterItem {
  id: string;
  name: string;
  slug: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface CategoryMultiSelectFilterProps {
  categories: CategoryFilterItem[];
  selectedCategories: string[];
  onChange: (selected: string[]) => void;
  getArticleCount?: (categoryName: string) => number;
}
```

- [ ] **Step 1: Implementasi Komponen Mandiri**
  - Trigger Button:
    - Default (0 terpilih): Teks `"Semua Kategori"`, icon `SlidersHorizontal` dan `ChevronDown`.
    - 1 terpilih: Nama kategori (misal `"Kegiatan"`) + badge counter `1`.
    - >1 terpilih: Label ringkas (misal `"2 Kategori"`) + badge counter `N`.
    - Focus style seragam `border-brand-500/60 ring-2 ring-brand-500/40`.
  - Dropdown Popover:
    - Click outside ref & Escape keydown listener.
    - Mini search input untuk menyaring daftar kategori.
    - Baris aksi cepat: *"Pilih Semua"* (mencentang semua kategori yang tampil) dan *"Reset Filter"* (mengosongkan seleksi).
    - Daftar kategori scrollable (`max-h-60 overflow-y-auto`).
    - Custom checkbox dengan visual check `brand-500` saat terpilih.
    - Teks nama kategori + counter jumlah artikel.
    - Keyboard navigation (ArrowDown, ArrowUp, Enter/Space toggle, Escape).
- [ ] **Step 2: Type Check & Lint**
  - `npx tsc --noEmit`
  - `npm run lint`

---

### Task 2: Integrasikan ke Halaman Admin Berita

**Files:**
- Modify: `src/app/(admin)/admin/berita/page.tsx`

- [ ] **Step 1: Perbarui State & Logika Filter**
  - Ubah `selectedCategory: string` menjadi `selectedCategories: string[]` (default: `[]`).
  - Ambil kategori aktif dari `initialCategories` di `dummy-data.ts`:
    ```tsx
    const activeCategories = initialCategories.filter((c) => c.status === "ACTIVE");
    ```
  - Perbarui predicate `matchesCategory`:
    ```tsx
    const matchesCategory =
      selectedCategories.length === 0 ||
      selectedCategories.includes(article.category);
    ```
  - Reset pagination ke `1` setiap kali `selectedCategories` berubah.
- [ ] **Step 2: Pasang Komponen di Toolbar**
  - Ganti markup pills horizontal lama (`{filterCategories.map(...)}`) dengan:
    ```tsx
    <CategoryMultiSelectFilter
      categories={activeCategories}
      selectedCategories={selectedCategories}
      onChange={(cats) => {
        setSelectedCategories(cats);
        setCurrentPage(1);
      }}
      getArticleCount={(catName) =>
        dummyArticles.filter((a) => a.category === catName).length
      }
    />
    ```
- [ ] **Step 3: Verifikasi Kompilasi & Build**
  - `npx tsc --noEmit`
  - `npm run lint`

---

### Task 3: Verifikasi Visual & Interaksi di Dev Server

**Files:**
- Test via browser / curl:
  - Buka `http://43.129.57.214/profile-ifk/admin/berita`

- [ ] **Step 1: Test Skenario Filter**
  - Test 1: Kondisi awal menampilkan seluruh berita (5 item per page).
  - Test 2: Buka dropdown, centang "Kegiatan" -> hanya artikel Kegiatan yang muncul.
  - Test 3: Centang "Informasi" -> artikel Kegiatan DAN Informasi muncul (OR condition).
  - Test 4: Klik "Pilih Semua" -> semua kategori tercentang.
  - Test 5: Klik "Reset Filter" -> kembali ke kondisi default (semua artikel).
  - Test 6: Cari kategori lewat mini search input -> daftar kategori terfilter.
  - Test 7: Uji responsive layout di viewport desktop dan mobile.
- [ ] **Step 4: Commit & Buat Pull Request**
  - Commit perubahan dengan pesan deskriptif.
  - Push branch `feat/admin-berita-multi-select-combobox`.
  - Buat PR ke `develop`.
