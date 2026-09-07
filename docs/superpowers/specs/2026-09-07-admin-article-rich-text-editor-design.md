# Design Spec: Rich Text Editor (WYSIWYG) Form Artikel Admin

## 1. Overview & Goals
Meningkatkan field input **Isi Konten Artikel** pada form pembuatan dan pengeditan berita admin (`src/components/admin/article-form.tsx`) dari plain `<Textarea>` standar menjadi **Rich Text Editor (WYSIWYG)** berbasis **TipTap Editor**.

### Masalah Saat Ini:
1. Field isi konten artikel hanya berupa `<Textarea>` polos tanpa kontrol formatting teks (bold, heading, list, quote, link).
2. Admin tidak dapat melihat pratinjau hierarki teks (judul bab, penekanan teks, kutipan) secara langsung saat mengetik.
3. Halaman publik (`/berita/[slug]`) sudah siap merender HTML via `dangerouslySetInnerHTML`, namun saat ini konten dummy masih ditulis manual dengan tag HTML mentah.

### Sasaran Perubahan:
1. Mengintegrasikan **TipTap WYSIWYG Editor** (React 19 & Next.js App Router compatible).
2. Membangun komponen antarmuka mandiri `RichTextEditor` dengan estetika **Dark Ethereal** (`bg-zinc-950/60`, border halus `border-white/10`, aksen aktif `brand-500`).
3. Menyediakan **Sticky Formatting Toolbar** yang intuitif (Bold, Italic, Strike, Heading 2/3, Bullet List, Numbered List, Blockquote, Divider, Link, Undo/Redo).
4. Menjaga output data tetap berupa **HTML string** murni sehingga 100% kompatibel langsung dengan skema artikel publik tanpa mengubah rendering frontend publik.
5. Mempertahankan aksesibilitas keyboard (`Ctrl+Enter` untuk submit form, navigasi shortcut standar formatting).

---

## 2. Dependencies & Arsitektur Komponen

### A. Dependensi Paket
- `@tiptap/react` & `@tiptap/pm`: Core TipTap wrapper untuk React 19.
- `@tiptap/starter-kit`: Ekstensi standar (Document, Paragraph, Text, Bold, Italic, Strike, Heading, BulletList, OrderedList, Blockquote, HorizontalRule, History).
- `@tiptap/extension-link`: Dukungan pembuatan link hyperlink.
- `@tiptap/extension-placeholder`: Teks placeholder visual saat editor kosong.

### B. Komponen Baru: `src/components/admin/rich-text-editor.tsx`
- Komponen client-side (`'use client'`).
- Props:
  - `content: string`: HTML string isi konten.
  - `onChange: (html: string) => void`: Callback saat isi konten berubah.
  - `placeholder?: string`: Teks bantuan saat kosong (default: *"Tuliskan isi artikel secara lengkap di sini..."*).
  - `onKeyDown?: (e: React.KeyboardEvent) => void`: Meneruskan event keyboard (seperti `Ctrl+Enter` untuk submit).
  - `className?: string`: Custom styling pembungkus tambahan.

### C. Integrasi di `src/components/admin/article-form.tsx`
- Menggantikan elemen `<Textarea id="content" ... />` dengan `<RichTextEditor value={content} onChange={setContent} ... />`.
- Form validation tetap terjaga: memastikan konten tidak hanya berisi tag kosong `<p></p>`.

---

## 3. UI & Styling (Dark Ethereal Theme)

### A. Container Editor
- Styling: `rounded-xl border border-white/10 bg-zinc-950/60 backdrop-blur-md transition-all`
- Focus-within state: `focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/40`
- Minimum height: `min-h-[280px]` untuk kenyamanan mengetik artikel panjang.

### B. Toolbar Header
- **Layout:** `sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-white/10 bg-zinc-900/90 p-2 rounded-t-xl backdrop-blur-md`.
- **Grup Aksi:**
  1. **Text Formatting:**
     - **Bold** (`Bold` icon) -> `editor.chain().focus().toggleBold().run()`
     - *Italic* (`Italic` icon) -> `editor.chain().focus().toggleItalic().run()`
     - ~~Strike~~ (`Strikethrough` icon) -> `editor.chain().focus().toggleStrike().run()`
  2. **Separator / Divider:** `h-4 w-px bg-white/10 mx-1`
  3. **Headings:**
     - `H2` (Heading 2) -> `editor.chain().focus().toggleHeading({ level: 2 }).run()`
     - `H3` (Heading 3) -> `editor.chain().focus().toggleHeading({ level: 3 }).run()`
     - `P` (Normal Paragraph) -> `editor.chain().focus().setParagraph().run()`
  4. **Separator:** `h-4 w-px bg-white/10 mx-1`
  5. **Lists:**
     - Bullet List (`List` icon) -> `editor.chain().focus().toggleBulletList().run()`
     - Numbered List (`ListOrdered` icon) -> `editor.chain().focus().toggleOrderedList().run()`
  6. **Separator:** `h-4 w-px bg-white/10 mx-1`
  7. **Quotes & Divider:**
     - Blockquote (`Quote` icon) -> `editor.chain().focus().toggleBlockquote().run()`
     - Horizontal Rule (`Minus` icon) -> `editor.chain().focus().setHorizontalRule().run()`
     - Link (`Link2` icon) -> Toggle link dialog / prompt
  8. **Separator:** `h-4 w-px bg-white/10 mx-1`
  9. **History (Undo/Redo):**
     - Undo (`Undo2` icon) -> `editor.chain().focus().undo().run()`
     - Redo (`Redo2` icon) -> `editor.chain().focus().redo().run()`

### C. Styling Tombol Toolbar
- **Default State:** `h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 transition-colors text-xs font-medium`
- **Active State (Ketika kursor berada di format terkait):** `bg-brand-500/20 text-brand-400 border border-brand-500/30 font-semibold shadow-sm`
- **Disabled State (misal Undo saat riwayat kosong):** `opacity-40 cursor-not-allowed hover:bg-transparent hover:text-zinc-400`

### D. Area Konten Editor (`EditorContent`)
- Typography styling disesuaikan dengan tema gelap:
  - Teks paragraf: `text-zinc-200 text-sm leading-relaxed`
  - Headings: `font-bold text-white tracking-tight` (H2: `text-lg mt-4 mb-2`, H3: `text-base mt-3 mb-1.5`)
  - List items: `list-disc / list-decimal pl-5 space-y-1`
  - Blockquote: `border-l-2 border-brand-500/60 pl-3 italic text-zinc-400 my-2`
  - Links: `text-brand-400 underline underline-offset-4 hover:text-brand-300`
  - Padding: `p-4 min-h-[220px] outline-none`

---

## 4. Interaksi & Aksesibilitas

1. **Hydration Safety (Next.js SSR):**
   - Menyetel opsi TipTap `immediatelyRender: false` untuk mencegah hydration mismatch antara server render dan client mounting.
2. **Keyboard Navigation & Shortcuts:**
   - Shortcut bawaan: `Ctrl+B` (Bold), `Ctrl+I` (Italic), `Ctrl+Z` (Undo), `Ctrl+Shift+Z` / `Ctrl+Y` (Redo).
   - Global Submit: `Ctrl+Enter` atau `Meta+Enter` di dalam editor memicu `handleSubmit()` form artikel.
3. **Link Insertion UX:**
   - Ketika tombol Link diklik: jika sudah ada link, opsi *Unlink* atau edit; jika belum, meminta URL melalui prompt/mini popover yang bersih dan menolak javascript pseudo-protocol untuk keamanan.
4. **Placeholder Elemen:**
   - Menggunakan CSS selector TipTap placeholder `.is-editor-empty:first-child::before` dengan teks berwarna `text-zinc-500`.

---

## 5. Kompatibilitas Frontend Publik

- Format konten yang dihasilkan TipTap adalah semantic HTML:
  ```html
  <h2>Penyuluhan Obat di Desa</h2>
  <p>Kegiatan ini dihadiri oleh <strong>petugas farmasi</strong>...</p>
  <ul>
    <li>Poin satu</li>
    <li>Poin dua</li>
  </ul>
  <blockquote>Kutipan narasumber</blockquote>
  ```
- Di sisi public page (`src/app/(public)/berita/[slug]/page.tsx`), class `prose prose-zinc` sudah aktif merender elemen-elemen ini dengan baik dan rapi.

---

## 6. Verifikasi & Pengujian

1. **Build & Lint Check:**
   - Pastikan `npm run build` dan `npm run lint` sukses tanpa error tipe TypeScript atau lint rules.
2. **Uji Tambah Berita Baru (`/admin/berita/baru`):**
   - Mengetik konten dengan kombinasi Bold, Heading, List, dan Quote.
   - Memastikan toolbar aktif secara responsif sesuai posisi kursor.
   - Menyimpan dan memverifikasi data HTML tersimpan.
3. **Uji Edit Berita Eksisting (`/admin/berita/1/edit`):**
   - Memastikan konten HTML awal ter-load ke dalam editor dengan formatting yang terpetakan sempurna.
4. **Uji Responsif & Mobile View:**
   - Memastikan toolbar di mobile/tablet dapat di-scroll horizontal secara mulus (`overflow-x-auto`) tanpa merusak layout form.
