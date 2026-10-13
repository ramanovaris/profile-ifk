# `/profil` Reveal Cascade Implementation Plan

> **For agentic workers:** Use `delegate_task()` with goal+context per task.

**Goal:** Memperbaiki animasi scroll-reveal di `/profil` agar tiap section + list item
muncul bertahap dari atas ke bawah saat user scroll, bukan barengan / hanya judul saja.

**Architecture:** Hybrid stagger — bungkus blok konten besar dengan `<Reveal>` per section
dan tiap list item dengan `<Reveal delay={n*60}>`. Tidak ada perubahan pada `Reveal`
component, hanya pemakaian `delay` prop yang sudah ada.

**Tech Stack:** Next.js 16.3.3 (App Router), React, Tailwind CSS, TypeScript, existing
`Reveal` component di `src/components/public/reveal.tsx`.

**Spec reference:** `docs/superpowers/specs/2026-09-04-profile-reveal-cascade-design.md`

## Global Constraints

- Branch: `fix/profile-reveal-cascade` (dari `develop`)
- 1 commit logical: `fix(profil): stagger reveal cascade per section + list item`
- Hanya 1 file yang berubah: `src/app/(public)/profil/page.tsx`
- Stagger increment: 60ms per item
- Tidak ada perubahan pada komponen, CSS, atau file lain
- Verifikasi visual via browser di HP (desktop site mode)
- `prefers-reduced-motion` sudah di-handle `Reveal` (tidak perlu diubah)

---

## Task 1: Create branch & inspect current source

**Files:**
- Inspect (no change): `src/app/(public)/profil/page.tsx`

**Step 1: Create branch dari develop**
```bash
cd /home/ubuntu/projects/profile-ifk
git checkout -b fix/profile-reveal-cascade
git status  # expect: on branch fix/profile-reveal-cascade
```

**Step 2: Verify current state file**
```bash
cd /home/ubuntu/projects/profile-ifk
wc -l "src/app/(public)/profil/page.tsx"  # expect: 169
```

**Step 3: Mark todo**
- [x] Task 1 done — proceed to Task 2

---

## Task 2: Refactor Sambutan section (Sambutan Kepala)

**Files:**
- Modify: `src/app/(public)/profil/page.tsx` (lines 17-61)

**Current structure (lines 17-61):**
```tsx
{/* ── Sambutan Kepala ───────────────────────────────────────── */}
<section className="border-t border-border bg-surface py-24">
  <div className="section-container">
    <Reveal>
    <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
      Sambutan Kepala UPTD
    </h2>
    </Reveal>
    <div className="mt-12 grid gap-12 md:grid-cols-[280px_1fr]">
      <div className="bezel w-full">
        <div className="bezel-inner relative aspect-[3/4]">
          <Image ... />
        </div>
      </div>
      <div>
        <p className="text-sm font-semibold text-brand-700">...</p>
        <p className="text-xs text-muted">...</p>
        <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
          <p>Assalamualaikum...</p>
          ...6 paragraphs
        </div>
      </div>
    </div>
  </div>
</section>
```

**Target structure:** bungkus grid container dengan 1 Reveal (delay 80ms) supaya foto
+ nama + paragraf muncul barengan setelah judul (delay 0).

```tsx
{/* ── Sambutan Kepala ───────────────────────────────────────── */}
<section className="border-t border-border bg-surface py-24">
  <div className="section-container">
    <Reveal>
      <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
        Sambutan Kepala UPTD
      </h2>
    </Reveal>
    <Reveal delay={80} className="mt-12 block">
      <div className="grid gap-12 md:grid-cols-[280px_1fr]">
        <div className="bezel w-full">
          <div className="bezel-inner relative aspect-[3/4]">
            <Image
              src={placeholderImage(300, 400, "Kepala IFK", "Profil")}
              alt="Kepala UPTD Instalasi Farmasi"
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-brand-700">
            apt. H. Muhammad Yusuf, S.Farm
          </p>
          <p className="text-xs text-muted">Kepala UPTD Instalasi Farmasi Kab. Kotabaru</p>
          <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted">
            <p>Assalamualaikum Warahmatullahi Wabarakatuh.</p>
            <p>
              Puji syukur kami panjatkan ke hadirat Tuhan Yang Maha Esa atas segala rahmat
              dan karunia-Nya sehingga UPTD Instalasi Farmasi Kabupaten Kotabaru dapat terus
              memberikan pelayanan terbaik di bidang kefarmasian bagi masyarakat Kabupaten
              Kotabaru.
            </p>
            <p>
              Kami berkomitmen untuk terus meningkatkan kualitas distribusi obat dan farmasi,
              menjaga mutu pelayanan, serta memastikan ketersediaan obat yang aman, berkhasiat,
              dan berkualitas di seluruh fasilitas kesehatan binaan.
            </p>
            <p>Semoga website ini dapat menjadi sarana informasi yang bermanfaat bagi seluruh masyarakat.</p>
            <p>Wassalamualaikum Warahmatullahi Wabarakatuh.</p>
          </div>
        </div>
      </div>
    </Reveal>
  </div>
</section>
```

**Catatan teknis:**
- `Reveal` membungkus `<div>` (block element) → gunakan `className="mt-12 block"` agar
  `mt-12` tetap berlaku. Default `Reveal` render `<div>` jadi `block` adalah default,
  tapi eksplisit `block` membuat intent jelas.
- Tidak ada stagger per paragraf di Sambutan (paragraf saling terkait secara naratif,
  lebih baik muncul bareng sebagai 1 blok).

**Step 1: Apply edit**
- Gunakan `patch` tool dengan `mode="replace"`, old_string = baris 17-61 (section
  Sambutan saat ini), new_string = versi baru di atas.

**Step 2: Verify file syntax**
```bash
cd /home/ubuntu/projects/profile-ifk
npx tsc --noEmit
```
- Expect: 0 errors.

**Step 3: Verify dev server hot-reload**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/profile-ifk/profil/
```
- Expect: `200`

**Step 4: Visual check (user)**
- Refresh `http://43.129.57.214/profile-ifk/profil/` di HP.
- Scroll ke section Sambutan.
- Expected: judul muncul duluan, lalu ~80ms kemudian grid (foto + nama + paragraf)
  muncul bareng.

---

## Task 3: Refactor Visi & Misi section

**Files:**
- Modify: `src/app/(public)/profil/page.tsx` (lines 63-107)

**Target structure:**

```tsx
{/* ── Visi & Misi ───────────────────────────────────────────── */}
<section className="border-t border-border bg-surface py-24">
  <div className="section-container">
    <Reveal>
      <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
        Visi &amp; Misi
      </h2>
    </Reveal>

    {/* Visi */}
    <Reveal delay={80} className="mt-12 block">
      <h3 className="text-lg font-semibold text-muted">Visi</h3>
      <p className="mt-4 max-w-[65ch] text-base italic leading-relaxed text-heading">
        Menjadi pengelola logistik kefarmasian yang profesional dan terpercaya dalam
        mendukung ketersediaan obat bermutu bagi seluruh masyarakat Kabupaten Kotabaru.
      </p>
    </Reveal>

    {/* Misi */}
    <div className="mt-16">
      <Reveal delay={160} className="block">
        <h3 className="text-lg font-semibold text-muted">Misi</h3>
      </Reveal>
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        {[
          "Mengoptimalkan distribusi obat ke fasilitas kesehatan secara tepat waktu dan tepat jumlah.",
          "Menjamin mutu dan keamanan obat melalui pengawasan sesuai standar farmakope.",
          "Memberikan pelayanan kefarmasian yang profesional, cepat, dan akurat.",
          "Meningkatkan kompetensi SDM melalui pelatihan dan pengembangan berkelanjutan.",
        ].map((item, i) => (
          <Reveal key={i} delay={240 + i * 60} className="block">
            <div className="flex items-start gap-4 border-t border-border pt-4">
              <span
                className="shrink-0 text-4xl font-bold text-brand-200"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <p className="text-sm leading-relaxed text-muted">{item}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  </div>
</section>
```

**Delay scheme Visi-Misi:**
- 0ms: judul Visi & Misi
- 80ms: sub-judul Visi + quote
- 160ms: sub-judul Misi
- 240ms: Misi item 1
- 300ms: Misi item 2
- 360ms: Misi item 3
- 420ms: Misi item 4
- Total: ~420ms untuk section Visi-Misi penuh

**Catatan:**
- `Reveal` membungkus `<div>`/`<h3>`/block. Pakai `className="block"` untuk elemen
  yang butuh display block eksplisit.
- `Reveal` sudah include `mt-*`/spacing tambahan via className prop.

**Step 1: Apply edit** — `patch` mode replace, old_string = lines 63-107.

**Step 2: Verify syntax**
```bash
cd /home/ubuntu/projects/profile-ifk
npx tsc --noEmit
```

**Step 3: Verify dev server**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/profile-ifk/profil/
```

**Step 4: Visual check (user)**
- Refresh, scroll ke Visi-Misi.
- Expected: judul → Visi quote → 4 Misi item muncul berurutan.

---

## Task 4: Refactor Tupoksi section

**Files:**
- Modify: `src/app/(public)/profil/page.tsx` (lines 109-140)

**Target structure:**

```tsx
{/* ── Tupoksi ───────────────────────────────────────────────── */}
<section className="border-t border-border bg-surface py-24">
  <div className="section-container">
    <Reveal>
      <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
        Tugas Pokok &amp; Fungsi
      </h2>
    </Reveal>

    {/* Tugas Pokok */}
    <Reveal delay={80} className="mt-12 block">
      <h3 className="text-lg font-semibold text-muted">Tugas Pokok</h3>
      <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-muted">
        <li>Melaksanakan pelayanan kefarmasian di bidang penyaluran obat dan bahan medis habis pakai.</li>
        <li>Melaksanakan pengendalian mutu distribusi obat dan bahan medis habis pakai.</li>
        <li>Melaksanakan pembinaan teknis kefarmasian terhadap fasilitas kesehatan binaan.</li>
      </ol>
    </Reveal>

    {/* Fungsi */}
    <div className="mt-12">
      <Reveal delay={320} className="block">
        <h3 className="text-lg font-semibold text-muted">Fungsi</h3>
      </Reveal>
      <ol className="mt-4 list-decimal list-inside space-y-2 text-sm text-muted">
        {[
          "Perencanaan kebutuhan dan pengadaan obat serta bahan medis habis pakai.",
          "Penyimpanan dan pengelolaan stok obat sesuai standar farmakope.",
          "Distribusi dan penyaluran obat ke faskes binaan secara tepat waktu.",
          "Pengawasan mutu obat melalui pemeriksaan fisik dan dokumentasi.",
          "Pembinaan dan sosialisasi tata cara pengelolaan obat di faskes.",
        ].map((item, i) => (
          <Reveal key={i} delay={400 + i * 60} className="block">
            <li>{item}</li>
          </Reveal>
        ))}
      </ol>
    </div>
  </div>
</section>
```

**Delay scheme Tupoksi:**
- 0ms: judul Tugas Pokok & Fungsi
- 80ms: sub-judul Tugas Pokok + 3 list item (muncul bareng)
- 320ms: sub-judul Fungsi
- 400ms: Fungsi item 1
- 460ms: Fungsi item 2
- 520ms: Fungsi item 3
- 580ms: Fungsi item 4
- 640ms: Fungsi item 5
- Total: ~640ms untuk section Tupoksi penuh

**Catatan:**
- Tugas Pokok dibungkus 1 Reveal (3 item muncul bareng) — tidak di-stagger karena
  hanya 3 item dan saling terkait.
- Fungsi di-stagger per item (5 item, cukup banyak untuk dirasa perlu).
- Gap 240ms antara akhir "Tugas Pokok block" (80ms + animasi duration ~600ms = ~680ms
  total terlihat) dan "sub-judul Fungsi" (320ms) — ini memberi jeda agar mata user
  bisa register transisi.

**Step 1: Apply edit** — `patch` mode replace, old_string = lines 109-140.

**Step 2: Verify syntax**
```bash
cd /home/ubuntu/projects/profile-ifk
npx tsc --noEmit
```

**Step 3: Verify dev server**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/profile-ifk/profil/
```

**Step 4: Visual check (user)**
- Refresh, scroll ke Tupoksi.
- Expected: judul → Tugas Pokok block (3 item bareng) → jeda → Fungsi item 1-5
  berurutan.

---

## Task 5: Refactor Struktur Organisasi section

**Files:**
- Modify: `src/app/(public)/profil/page.tsx` (lines 142-166)

**Target structure:**

```tsx
{/* ── Struktur Organisasi ───────────────────────────────────── */}
<section className="border-t border-border bg-surface py-24 text-center">
  <div className="section-container">
    <Reveal>
      <h2 className="text-2xl font-bold tracking-tight text-heading sm:text-3xl">
        Struktur Organisasi
      </h2>
    </Reveal>
    <Reveal delay={80} className="mt-12 block">
      <div className="bezel mx-auto max-w-3xl">
        <div className="bezel-inner">
          <Image
            src={placeholderImage(800, 500, "Struktur Organisasi", "Profil")}
            alt="Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru"
            width={800}
            height={500}
            unoptimized
            className="h-auto w-full"
          />
        </div>
      </div>
      <p className="mt-4 text-sm text-muted">
        Struktur Organisasi UPTD Instalasi Farmasi Kab. Kotabaru
      </p>
    </Reveal>
  </div>
</section>
```

**Delay scheme Struktur Organisasi:**
- 0ms: judul
- 80ms: image + caption (muncul bareng)

**Step 1: Apply edit** — `patch` mode replace, old_string = lines 142-166.

**Step 2: Verify syntax**
```bash
cd /home/ubuntu/projects/profile-ifk
npx tsc --noEmit
```

**Step 3: Verify dev server**
```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/profile-ifk/profil/
```

**Step 4: Visual check (user)**
- Refresh, scroll ke Struktur Organisasi.
- Expected: judul → image + caption bareng.

---

## Task 6: Full-page visual check

**Step 1: TypeScript & build check**
```bash
cd /home/ubuntu/projects/profile-ifk
npx tsc --noEmit
npx next build
```
- Expect: 0 TS errors, build SUCCESS.

**Step 2: HTTP check**
```bash
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3003/profile-ifk/profil/
```
- Expect: `200`.

**Step 3: Visual full-page review (user)**
- Buka `http://43.129.57.214/profile-ifk/profil/` di HP (mode desktop site).
- **Penting:** refresh halaman agar animasi reset.
- Scroll dari atas ke bawah pelan-pelan.
- Expected untuk tiap section:
  - Sambutan: judul → 80ms → grid (foto+paragraf) bareng
  - Visi-Misi: judul → 80ms → Visi quote → 160ms → sub-judul Misi → 240/300/360/420ms → 4 Misi
  - Tupoksi: judul → 80ms → Tugas Pokok (3 item bareng) → 320ms → sub-judul Fungsi → 400/460/520/580/640ms → 5 Fungsi
  - Struktur: judul → 80ms → image + caption bareng
- Bug check: tidak ada konten yang tiba-tiba visible tanpa animasi.

---

## Task 7: Commit & push & open PR

**Step 1: Verify final diff**
```bash
cd /home/ubuntu/projects/profile-ifk
git diff --stat
```
- Expect: 1 file changed, `src/app/(public)/profil/page.tsx`.

**Step 2: Stage & commit**
```bash
cd /home/ubuntu/projects/profile-ifk
git add "src/app/(public)/profil/page.tsx"
git -c user.email=hermes@local -c user.name=Hermes commit -m "fix(profil): stagger reveal cascade per section + list item"
```

**Step 3: Push & open PR**
```bash
cd /home/ubuntu/projects/profile-ifk
git push -u origin fix/profile-reveal-cascade
gh pr create \
  --base develop \
  --head fix/profile-reveal-cascade \
  --title "fix(profil): stagger reveal cascade per section + list item" \
  --body "$(cat <<'EOF'
## Ringkasan
Memperbaiki animasi scroll-reveal di /profil agar tiap section + list item muncul
bertahap dari atas ke bawah, bukan barengan atau hanya judul.

## Perubahan
- 1 file: `src/app/(public)/profil/page.tsx`
- Tambah `<Reveal>` wrapper + `delay` prop递增 (60ms increment) untuk section body
  dan tiap list item (Misi 4, Fungsi 5)
- Sambutan & Struktur: judul (0ms) + body block (80ms)
- Visi-Misi: judul (0) → Visi quote (80) → Misi items (240/300/360/420)
- Tupoksi: judul (0) → Tugas Pokok block (80) → Fungsi items (400/460/520/580/640)

## Verifikasi
- [x] `npx tsc --noEmit` — 0 errors
- [x] `npx next build` — SUCCESS
- [x] `curl /profile-ifk/profil/` — HTTP 200
- [x] Visual review di HP (desktop site mode) — cascade smooth

## Spec
docs/superpowers/specs/2026-09-04-profile-reveal-cascade-design.md
EOF
)"
```

**Step 4: Tunggu CI pass**
```bash
cd /home/ubuntu/projects/profile-ifk
gh pr checks --watch
```
- Expect: CI SUCCESS.

**Step 5: Merge ke develop**
```bash
cd /home/ubuntu/projects/profile-ifk
gh pr merge --squash --delete-branch
```

**Step 6: Verify final state**
```bash
cd /home/ubuntu/projects/profile-ifk
git checkout develop
git pull
git log --oneline -3
git branch -a
```
- Expect: PR commit ada di develop log, branch `fix/profile-reveal-cascade` deleted
  dari local & remote.

---

## Self-Review (Plan)

- **Spec coverage:** setiap goal di spec ter-cover di task 2-5 (4 section stagger) +
  task 6 (verifikasi) + task 7 (commit/PR/merge). ✅
- **Placeholder scan:** tidak ada TBD/TODO. Semua delay numerik eksplisit. ✅
- **Type consistency:** tidak ada type baru. `Reveal` API dipakai sesuai interface
  (`children`, `className`, `delay`). ✅
- **Test verification:** setiap task punya verification (TypeScript check, HTTP check,
  visual check). Untuk animation-heavy work, visual review adalah test yang valid —
  automated test untuk animasi tidak standar dan overkill untuk scope ini. ✅
- **Right-sizing:** 7 task, tiap task 1 logical change, semua verifiable independently. ✅
- **DRY:** tidak ada duplikasi. Section yang sama (Sambutan, Visi-Misi, Tupoksi, Struktur)
  masing-masing 1 task dengan delay scheme yang konsisten. ✅
- **Frequent commits:** 1 commit logical di akhir (semua Reveal dalam 1 PR — cohesive
  fix, bukan commit per section karena dipisah hanya akan menghasilkan 4 commit di
  PR yang sama, dan CI jalan per push bukan per commit). ✅
