# Plan: `/layanan` Reveal Cascade

**Tanggal:** 2026-09-04
**Spec:** `docs/superpowers/specs/2026-09-04-layanan-reveal-cascade-design.md`
**Branch:** `fix/layanan-reveal-cascade` (dari `develop`)

---

## Tujuan

Eksekusi spec: bungkus section + list item di `src/app/(public)/layanan/page.tsx`
dengan `<Reveal>` mengikuti rhythm C-simple.

---

## Pre-flight

- [x] Spec di-commit di `develop` (`a479fd6`)
- [ ] Branch `fix/layanan-reveal-cascade` dibuat dari `develop`
- [ ] `Reveal` component sudah support `delay` prop (verified dari `/profil` PR #5)

---

## Step 1: Branch

```bash
git checkout develop
git pull origin develop
git checkout -b fix/layanan-reveal-cascade
```

Expected: branch baru di local, fast-forward dari `a479fd6`.

---

## Step 2: Modifikasi `src/app/(public)/layanan/page.tsx`

### Section A: Jam Pelayanan (lines 15-48)

**Sekarang:**
```tsx
<Reveal>
  <h2>Jam Pelayanan</h2>
</Reveal>
<div className="mt-8 overflow-x-auto font-mono">
  <table>...</table>
</div>
```

**Sesudah:**
```tsx
<Reveal>
  <h2>Jam Pelayanan</h2>
</Reveal>
<Reveal delay={80}>
  <div className="mt-8 overflow-x-auto font-mono">
    <table>...</table>
  </div>
</Reveal>
```

(Pembungkus tabel dengan satu Reveal, delay 80ms setelah judul.)

### Section B: Standar Mutu & Penyimpanan (lines 50-74)

**Sekarang:**
```tsx
<Reveal>
  <h2>Standar Mutu & Penyimpanan</h2>
</Reveal>
<div className="mt-12 space-y-0 divide-y divide-border">
  {items.map((item) => (
    <div key={item.title} className="flex items-start gap-4 py-6">
      <item.icon ... />
      <div>...</div>
    </div>
  ))}
</div>
```

**Sesudah:**
```tsx
<Reveal>
  <h2>Standar Mutu & Penyimpanan</h2>
</Reveal>
<div className="mt-12 space-y-0 divide-y divide-border">
  {items.map((item, i) => (
    <Reveal key={item.title} delay={80 + i * 80}>
      <div className="flex items-start gap-4 py-6">
        <item.icon ... />
        <div>...</div>
      </div>
    </Reveal>
  ))}
</div>
```

(3 items, delay 80/160/240. Map: tambah index `i` parameter.)

### Section C: Alur Pelayanan Rutin (LPLPO) (lines 76-130)

**Sekarang:**
```tsx
<Reveal>
  <h2>Alur Pelayanan Rutin (LPLPO)</h2>
  <p>Laporan Pemakaian dan Lembar Permintaan Obat — ...</p>
</Reveal>
<div className="mt-12 border-l-2 border-brand-300 pl-6">
  {steps.map((item) => (
    <div key={item.step} className="relative mb-8 last:mb-0">
      <div className="absolute -left-10 ...">{item.step}</div>
      <h3>{item.title}</h3>
      <p>{item.detail}</p>
    </div>
  ))}
</div>
```

**Sesudah:**
```tsx
<Reveal>
  <h2>Alur Pelayanan Rutin (LPLPO)</h2>
</Reveal>
<Reveal delay={80}>
  <p className="mt-2 max-w-[65ch] text-base text-muted">
    Laporan Pemakaian dan Lembar Permintaan Obat — ...
  </p>
</Reveal>
<div className="mt-12 border-l-2 border-brand-300 pl-6">
  {steps.map((item, i) => (
    <Reveal key={item.step} delay={80 + i * 120}>
      <div className="relative mb-8 last:mb-0">
        <div className="absolute -left-10 ...">{item.step}</div>
        <h3>{item.title}</h3>
        <p>{item.detail}</p>
      </div>
    </Reveal>
  ))}
</div>
```

(5 steps, delay 80/200/320/440/560. Sub-header dipisah Reveal sendiri dengan
delay 80. Map: tambah index `i` parameter.)

**Catatan:** sub-header `<p>` dipisah dari `<h2>` Reveal — supaya judul muncul
duluan, baru deskripsi LPLPO 80ms kemudian, baru 5 step cascade. Match dengan
pola `/profil` (judul → sub-header → items).

### Section D: Permintaan Bon / Sewaktu (lines 132-179)

**Sekarang:**
```tsx
<Reveal>
  <h2>Permintaan Bon / Sewaktu</h2>
</Reveal>
<div className="rounded-[2rem] border border-brand-200/60 ...">
  <div className="flex items-center gap-3">
    <AlertTriangle ... />
    <span>Permintaan Darurat / Sewaktu</span>
  </div>
  <div className="mt-6 grid gap-6 md:grid-cols-2">
    <div>
      <h4>Kriteria</h4>
      <p>...</p>
    </div>
    <div>
      <h4>Persyaratan</h4>
      <ul>...</ul>
    </div>
    <div>
      <h4>Metode Penyerahan</h4>
      <p>...</p>
    </div>
    <div>
      <h4>Komitmen Waktu</h4>
      <p>...</p>
    </div>
  </div>
</div>
```

**Sesudah:**
```tsx
<Reveal>
  <h2>Permintaan Bon / Sewaktu</h2>
</Reveal>
<Reveal delay={0}>
  <div className="rounded-[2rem] border border-brand-200/60 bg-brand-50/60 p-8 ...">
    <div className="flex items-center gap-3">
      <AlertTriangle ... />
      <span>Permintaan Darurat / Sewaktu</span>
    </div>
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <Reveal delay={80}>
        <div>
          <h4>Kriteria</h4>
          <p>...</p>
        </div>
      </Reveal>
      <Reveal delay={160}>
        <div>
          <h4>Persyaratan</h4>
          <ul>...</ul>
        </div>
      </Reveal>
      <Reveal delay={240}>
        <div>
          <h4>Metode Penyerahan</h4>
          <p>...</p>
        </div>
      </Reveal>
      <Reveal delay={320}>
        <div>
          <h4>Komitmen Waktu</h4>
          <p>...</p>
        </div>
      </Reveal>
    </div>
  </div>
</Reveal>
```

(Card container Reveal delay 0, 4 sub-items Reveal delay 80/160/240/320.
Struktur: h4+content dibungkus Reveal individual.)

**Catatan:** Header "Permintaan Darurat / Sewaktu" (icon + span) tetap di dalam
card container — ia bagian dari visual card secara keseluruhan, bukan sub-item
terpisah. Container Reveal membungkus seluruh card sekaligus.

### Section E: Obat Rusak & Kedaluwarsa (lines 181-224)

**Sekarang:**
```tsx
<Reveal>
  <h2>Penanganan Obat Rusak & Kedaluwarsa</h2>
</Reveal>
<div className="rounded-[2rem] border border-red-200/60 ...">
  <div className="flex items-center gap-3">
    <AlertTriangle ... />
    <span>Obat Rusak / Kedaluwarsa</span>
  </div>
  <div className="mt-6 space-y-6">
    <div className="border-t border-red-200 pt-4">
      <h4>Waktu Pelaporan</h4>
      <p>...</p>
    </div>
    <div className="border-t border-red-200 pt-4">
      <h4>Persyaratan</h4>
      <ul>...</ul>
    </div>
  </div>
  <div className="mt-6 border-t border-red-200 pt-4">
    <h4>Penanganan oleh IFK</h4>
    <p>...</p>
  </div>
</div>
```

**Sesudah:**
```tsx
<Reveal>
  <h2>Penanganan Obat Rusak & Kedaluwarsa</h2>
</Reveal>
<Reveal delay={0}>
  <div className="rounded-[2rem] border border-red-200/60 bg-red-50/60 p-8 ...">
    <div className="flex items-center gap-3">
      <AlertTriangle ... />
      <span>Obat Rusak / Kedaluwarsa</span>
    </div>
    <Reveal delay={80}>
      <div className="mt-6 border-t border-red-200 pt-4">
        <h4>Waktu Pelaporan</h4>
        <p>...</p>
      </div>
    </Reveal>
    <Reveal delay={160}>
      <div className="mt-6 border-t border-red-200 pt-4">
        <h4>Persyaratan</h4>
        <ul>...</ul>
      </div>
    </Reveal>
    <Reveal delay={240}>
      <div className="mt-6 border-t border-red-200 pt-4">
        <h4>Penanganan oleh IFK</h4>
        <p>...</p>
      </div>
    </Reveal>
  </div>
</Reveal>
```

(Card container Reveal delay 0, 3 sub-items Reveal delay 80/160/240.
Sub-item "Penanganan oleh IFK" tetap di dalam container — ia sub-bagian dari
card yang sama.)

---

## Step 3: Verifikasi

### 3.1 TypeScript check

```bash
npx tsc --noEmit
```

Expected: 0 errors. (Sama seperti verifikasi `/profil`.)

### 3.2 HTTP check lokal

```bash
curl -sI http://localhost:3003/profile-ifk/layanan/ | head -1
```

Expected: `HTTP/1.1 200 OK`.

### 3.3 Visual review (delegated to user)

User review di HP (mode desktop site) setelah PR merged & VPS pull:
- `http://43.129.57.214/profile-ifk/layanan/`
- Refresh halaman, scroll pelan
- Expected: tiap section cascade muncul bertahap, Alur LPLPO terasa cinematic

---

## Step 4: Commit & PR

### 4.1 Commit

```bash
git add src/app/(public)/layanan/page.tsx
git commit -m "fix(layanan): stagger reveal cascade per section + list item"
```

Expected: 1 file changed, ~50 insertions, ~50 deletions (structural refactor).

### 4.2 Push & Open PR

```bash
git push -u origin fix/layanan-reveal-cascade
gh pr create \
  --base develop \
  --head fix/layanan-reveal-cascade \
  --title "fix(layanan): stagger reveal cascade per section + list item" \
  --body "..."
```

PR body akan mengikuti template `/profil` (Summary, Test Plan, Related).

### 4.3 Setelah CI pass

```bash
gh pr merge --squash --delete-branch
git checkout develop
git pull origin develop
git branch -d fix/layanan-reveal-cascade
git remote prune origin
```

---

## Pitfalls

- **Map callback signature**: `.map((item) => ...)` jadi `.map((item, i) => ...)` —
  pastikan di setiap array.map() yang dibungkus Reveal. Lupa → delay tidak递增.
- **Section D grid wrapper**: `md:grid-cols-2` di Bon/Sewaktu punya 4 child Reveal.
  Di mobile (single column), Reveal child tetap cascade vertikal karena grid-cols
  fallback ke 1 kolom. Tidak ada masalah layout.
- **Section E 3 sub-items**: container Reveal membungkus card. Inner Reveal
  cascade 80/160/240. Sub-item "Penanganan oleh IFK" dipisah Reveal meskipun
  visually terpisah (ada `border-t mt-6`). Konsisten dengan 2 sub-item di atasnya.
- **PageHero tidak di-Reveal**: sesuai spec, PageHero instant. Tidak ada perubahan
  pada baris 8-13.

---

## Rollback

Jika setelah review dirasa animasi terlalu cepat/lambat/berlebihan:

- Increment 80/120 bisa di-tune (60/100) di seluruh file
- Container Reveal di Bon/Rusak bisa di-skip (Opsi B dari brainstorm)
- Branch sudah terisolasi di `fix/layanan-reveal-cascade`, tinggal amend commit
  sebelum merge
