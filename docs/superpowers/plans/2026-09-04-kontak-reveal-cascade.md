# Plan: `/kontak` Reveal Cascade

**Tanggal**: 2026-09-04
**Spec**: `docs/superpowers/specs/2026-09-04-kontak-reveal-cascade-design.md`
**Branch**: `fix/kontak-reveal-cascade` (dari `develop`)
**PR target**: `develop`
**Review rule**: Tunggu konfirmasi user sebelum squash merge (rule baru 2026-09-04)

---

## File yang Diubah

| File | Tipe | Alasan |
|---|---|---|
| `src/components/public/reveal.tsx` | Modify | Tambah 3 props baru (`rootMargin`, `threshold`, `fallbackMs`) dengan default sama |
| `src/app/(public)/kontak/page.tsx` | Rewrite restructure | 1 Reveal → 6 Reveal (5 info item stagger + 1 maps) |

Total: 2 file, target ~30 baris tambah di `reveal.tsx`, ~30 baris refactor di `kontak/page.tsx`.

## Langkah Eksekusi

### Step 1: Modify `src/components/public/reveal.tsx`

Tambah 3 props di interface `RevealProps`:
```ts
interface RevealProps {
  children: React.ReactNode;
  className?: string;
  /** delay ms sebelum animasi berjalan (untuk stagger) */
  delay?: number;
  /** override IntersectionObserver rootMargin (default: "0px 0px -10% 0px") */
  rootMargin?: string;
  /** override IntersectionObserver threshold (default: 0) */
  threshold?: number;
  /** override fallback setTimeout dalam ms (default: 1500) */
  fallbackMs?: number;
}
```

Update signature component:
```ts
export function Reveal({
  children,
  className,
  delay = 0,
  rootMargin = "0px 0px -10% 0px",
  threshold = 0,
  fallbackMs = 1500,
}: RevealProps) {
```

Update `useEffect` body — gunakan variabel baru, **bukan hardcode**:
```ts
const fallback = window.setTimeout(() => el.classList.add("is-visible"), fallbackMs);

const io = new IntersectionObserver(
  (entries) => { /* ... tetap sama ... */ },
  { threshold, rootMargin }
);
```

Comment block di atas component tambahkan catatan kapan harus override:
```ts
/**
 * Wrapper scroll-reveal via IntersectionObserver.
 * CSS-driven: hanya animasi opacity/transform/filter (GPU-safe).
 *
 * Props `rootMargin`, `threshold`, `fallbackMs` untuk override per-instance
 * ketika section tinggi butuh trigger lebih awal. Default cocok untuk section pendek.
 */
```

### Step 2: Restructure `src/app/(public)/kontak/page.tsx`

Struktur baru (pseudo-code):

```tsx
<>
  <PageHero ... /> {/* no Reveal */}

  <section className="border-t border-border bg-surface py-24">
    <div className="section-container">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
        {/* KOLOM KIRI: Info */}
        <div>
          <Reveal
            rootMargin="0px 0px 50px 0px"
            threshold={0.05}
            fallbackMs={800}
            delay={80}  {/* judul section muncul duluan */}
          >
            <h2>Informasi Kontak</h2>
          </Reveal>

          <div className="mt-8 space-y-0 divide-y divide-border">
            {items.map((item, i) => (
              <Reveal
                key={item.label}
                delay={80 + i * 80}  {/* 0, 80, 160, 240, 320 */}
                rootMargin="0px 0px 50px 0px"
                threshold={0.05}
                fallbackMs={800}
              >
                <div className="flex items-start gap-3 py-6">
                  {/* ... item konten sama ... */}
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        {/* KOLOM KANAN: Maps */}
        <div>
          <Reveal
            rootMargin="0px 0px 50px 0px"
            threshold={0.05}
            fallbackMs={800}
            delay={80}
          >
            <h2>Lokasi Kami</h2>
          </Reveal>
          <Reveal
            rootMargin="0px 0px 50px 0px"
            threshold={0.05}
            fallbackMs={800}
          >
            <div className="bezel mt-8">
              <div className="bezel-inner">
                <iframe ... />
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  </section>
</>
```

**Catatan penting**:
- `items` array tetap, cuma dibungkus `Reveal` per item (bukan 1 map div)
- Index `i` dari 0–4, delay jadi `0, 80, 160, 240, 320` — `80 + i * 80`
- PageHero tetap **tidak** dibungkus Reveal (konsisten `/layanan`)
- 2 kolom info & maps tetap dalam 1 grid; Reveal per-element, bukan per-section besar

### Step 3: Verifikasi

```bash
# TypeScript
npx tsc --noEmit

# HTTP smoke test
curl -I http://localhost:3003/profile-ifk/kontak/
# Expected: HTTP/1.1 200 OK

# HTML inspection (Reveal count)
curl -s http://localhost:3003/profile-ifk/kontak/ | grep -c "reveal"
# Expected: 7 (1 PageHero tidak ada, 6 Reveal di section + 1 di stylesheet)
```

Visual review: user review di HP mode "desktop site", scroll dari atas ke bawah cepat — pastikan tidak ada konten "hilang" sampai footer.

### Step 4: Commit & PR

```bash
# Stage
git add src/components/public/reveal.tsx
git add src/app/\(public\)/kontak/page.tsx

# Pisah jadi 2 commit sesuai aturan "1 commit = 1 logical change"
# Commit 1: Reveal component
git commit -m "feat(reveal): add rootMargin, threshold, fallbackMs props

Backward compatible — default sama dengan kondisi sekarang.
Halaman yang tidak set prop baru (/profil, /layanan) tidak terpengaruh.
Override per-instance untuk section tinggi (mis. /kontak) yang butuh
trigger lebih awal.

Refs: spec /kontak reveal cascade"

# Commit 2: /kontak restructure
git commit -m "fix(kontak): stagger reveal cascade — 5 info items + maps

- Replace 1 Reveal jadi 6 Reveal: heading info + 5 item stagger (0/80/160/240/320ms) + heading maps + iframe
- Override rootMargin longgar (0px 0px 50px 0px) + threshold 0.05 + fallback 800ms untuk responsif di mobile
- Per-section delay 80ms judul → item pertama (konsisten /profil)
- PageHero instant (no Reveal), konsisten /layanan

Refs: spec /kontak reveal cascade"

# Push & PR
git push -u origin fix/kontak-reveal-cascade
gh pr create --base develop --head fix/kontak-reveal-cascade \
  --title "fix(kontak): stagger reveal cascade + robust IO trigger" \
  --body "..."
```

### Step 5: Tunggu konfirmasi

Setelah CI pass, **JANGAN langsung squash merge**. Konfirmasi dulu ke user:
> "PR #7 sudah open & CI pass. Mau aku merge, atau mau review visual dulu di HP?"

## Acceptance Criteria Recap

1. ✅ Reveal backward compat — `tsc --noEmit` clean, halaman lain byte-identical behavior
2. ✅ `/kontak` reveal:
   - PageHero instant
   - Fallback worst case 800ms (bukan 1500ms)
   - Scroll cepat: semua konten muncul
   - Stagger info: 0/80/160/240/320ms
3. ✅ Stagger snappy (< 1s total reveal info)
4. ✅ 2 file, 0 dead code
5. ✅ 3-commit pattern: `docs(spec):` di develop → `docs(plan):` di fix branch → 2 code commits di fix branch (= 1 spec + 1 plan + 2 code di branch fix)

## Rollback Plan

Kalau setelah merge user merasa `/kontak` regress atau rhythm per-item kurang cocok:

**Option A — revert PR**: `gh pr revert` atau revert commit di develop
**Option B — tune di PR baru**: branch `fix/kontak-reveal-cascade-tune` dari develop, adjust delay angka

Reveal component tetap aman karena default tidak berubah — halaman lain tidak regress.

## Verification Checklist

- [ ] `npx tsc --noEmit` clean
- [ ] HTTP 200 di `/profile-ifk/kontak/`
- [ ] Visual review di HP mode "desktop site"
- [ ] Scroll cepat dari atas ke bawah: semua konten muncul, tidak ada yang "hilang"
- [ ] Reveal count check: 6 Reveal instances di section
- [ ] `/profil` & `/layanan` visual review: tidak berubah dari sebelumnya
- [ ] CI pass
- [ ] User konfirmasi sebelum merge
