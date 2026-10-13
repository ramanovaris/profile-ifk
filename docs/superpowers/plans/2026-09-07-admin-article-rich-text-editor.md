# Rich Text Editor (WYSIWYG) Form Artikel Admin Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Mengganti field plain `<Textarea>` isi konten artikel di `src/components/admin/article-form.tsx` dengan komponen Rich Text Editor (WYSIWYG) berbasis TipTap dengan tema Dark Ethereal, toolbar formatting lengkap, dan output semantic HTML string yang kompatibel dengan halaman publik.

**Architecture:** Memasang dependensi TipTap (React 19 support), membuat komponen client-side mandiri `RichTextEditor` di `src/components/admin/rich-text-editor.tsx`, lalu mengintegrasikannya ke `ArticleForm` menggantikan elemen textarea dengan tetap mempertahankan keyboard shortcut `Ctrl+Enter` submit.

**Tech Stack:** Next.js 16 (App Router), React 19, TipTap v3 (`@tiptap/react`, `@tiptap/pm`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`), Tailwind CSS v4, Lucide React icons, TypeScript.

## Global Constraints
- Tema: Dark Ethereal (`bg-zinc-950/60`, border `border-white/10`, aksen `brand-500`).
- Focus ring seragam: `border-brand-500/60 ring-2 ring-brand-500/40 outline-none`.
- SSR Hydration Safety: Setel `immediatelyRender: false` pada konfigurasi TipTap `useEditor`.
- Data Contract: State dan output berupa HTML string murni (`<p>`, `<h2>`, `<h3>`, `<ul>`, `<blockquote>`, dll) tanpa mengubah skema artikel publik.
- React Pitfall Guard: Jangan definisikan komponen di dalam komponen lain (hindari focus loss).

---

### Task 1: Install Dependensi TipTap untuk React 19

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [ ] **Step 1: Install paket TipTap**
  - Jalankan instalasi:
    `npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-placeholder`
- [ ] **Step 2: Verifikasi instalasi paket**
  - Jalankan `npm run lint` untuk memastikan tidak ada konflik dependensi.
- [ ] **Step 3: Commit dependensi**
  - `git add package.json package-lock.json`
  - `git commit -m "chore(deps): pasang dependensi tiptap editor untuk react 19"`

---

### Task 2: Buat Komponen Mandiri `RichTextEditor`

**Files:**
- Create: `src/components/admin/rich-text-editor.tsx`

**Interfaces:**
```tsx
export interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  className?: string;
  disabled?: boolean;
}
```

- [ ] **Step 1: Implementasi Komponen `RichTextEditor`**
  - Konfigurasi `useEditor`:
    - Extensions: `StarterKit`, `Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-brand-400 underline underline-offset-4' } })`, `Placeholder.configure({ placeholder })`.
    - `content: value`
    - `immediatelyRender: false` (mencegah hydration mismatch pada Next.js App Router).
    - `onUpdate: ({ editor }) => onChange(editor.getHTML())`.
  - Sticky Top Toolbar:
    - Group 1 (Text): Bold (`Ctrl+B`), Italic (`Ctrl+I`), Strike.
    - Group 2 (Heading): Paragraph, H2, H3.
    - Group 3 (List): Bullet List, Numbered List.
    - Group 4 (Block): Blockquote, Horizontal Rule, Link prompt / unlink.
    - Group 5 (History): Undo, Redo.
    - Active styling: `bg-brand-500/20 text-brand-400 border border-brand-500/30`.
  - Content Area Styling:
    - Container: `rounded-xl border border-white/10 bg-zinc-950/60 focus-within:border-brand-500/60 focus-within:ring-2 focus-within:ring-brand-500/40`.
    - Area Tulis: Typography gelap Tailwind yang rapi, minimum height `min-h-[240px]`.
- [ ] **Step 2: Type Check & Lint**
  - `npx tsc --noEmit`
  - `npm run lint`
- [ ] **Step 3: Commit komponen**
  - `git add src/components/admin/rich-text-editor.tsx`
  - `git commit -m "feat(admin): buat komponen mandiri rich text editor tiptap dark ethereal"`

---

### Task 3: Integrasikan `RichTextEditor` ke Form Artikel

**Files:**
- Modify: `src/components/admin/article-form.tsx`

- [ ] **Step 1: Ganti `<Textarea>` dengan `<RichTextEditor>`**
  - Import `RichTextEditor` dari `@/components/admin/rich-text-editor`.
  - Ganti field textarea dengan:
    ```tsx
    <RichTextEditor
      value={content}
      onChange={setContent}
      placeholder="Tuliskan isi artikel secara lengkap di sini..."
      onKeyDown={(e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
          e.preventDefault();
          handleSubmit(e);
        }
      }}
    />
    ```
  - Navigasi keyboard dari upload sampul mengarah ke elemen editor.
  - Form validation: cegah submit jika `!content || content === "<p></p>"`.
- [ ] **Step 2: Type Check & Lint**
  - `npx tsc --noEmit`
  - `npm run lint`
- [ ] **Step 3: Commit integrasi form**
  - `git add src/components/admin/article-form.tsx`
  - `git commit -m "feat(admin): integrasikan rich text editor ke form berita admin"`

---

### Task 4: Verifikasi & Build Testing

**Files:**
- Verify: Full project build & live endpoints

- [ ] **Step 1: Production Build Verification**
  - Jalankan `npm run build` dan pastikan compile output 100% sukses tanpa warning/error.
- [ ] **Step 2: Dev Server & Route Health Checks**
  - Pastikan server port 3003 aktif normal.
  - Verifikasi response HTTP 200 via `curl -I http://localhost:3003/profile-ifk/admin/berita/baru`.
  - Verifikasi response HTTP 200 via `curl -I http://localhost:3003/profile-ifk/admin/berita/1/edit`.
  - Verifikasi response HTTP 200 via `curl -I http://localhost:3003/profile-ifk/berita/sosialisasi-sistem-informasi-kefarmasian`.
- [ ] **Step 3: Push branch & Open Pull Request**
  - Buat PR ke `develop`.
