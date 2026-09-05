# Spec: `/kontak` Reveal Cascade (Polish)

**Tanggal**: 2026-09-04
**Scope**: Polish halaman `/kontak` agar reveal lebih responsif di mobile
**Tipe**: Feature (polish) — bukan bug fix, karena halaman belum ada animasi cascade sama sekali; hanya 1 Reveal membungkus seluruh section sekaligus
**Branch**: `fix/kontak-reveal-cascade` (dari `develop`)

---

## Problem Statement

User review di HP (mobile, mode "desktop site") merasakan dua hal pada `/kontak`:

1. **Animasi lambat** — section terlalu tinggi, 1 Reveal membungkus seluruh blok (5 item info + iframe map 360-440px). `IntersectionObserver` dengan `rootMargin: "0px 0px -10% 0px"` + `threshold: 0` baru trigger saat 10% bottom section masuk viewport — kalau user scroll cepat, observer trigger telat.
2. **Konten tidak muncul sampai scroll footer** — pada kasus terburuk, `IntersectionObserver` benar-benar miss trigger (mis. scroll sangat cepat, atau user lompat dengan anchor), dan konten baru muncul setelah fallback `setTimeout` 1.5 detik — terlalu lama.

Root cause utama: `Reveal` component tidak punya props untuk override `rootMargin`/`threshold`/`fallbackMs`, sehingga setiap halaman pakai default global. Default global cocok untuk section pendek (`/profil`, `/layanan`) tapi **kurang cocok** untuk section tinggi (`/kontak`).

## Goals

- Konten `/kontak` muncul **responsif** saat user scroll di mobile, tanpa terasa lambat atau "hilang"
- Konsisten dengan pattern halaman lain: **PageHero instant** (no Reveal), reveal ada di section konten
- Reveal di `/kontak` punya **rhythm beda** dari `/profil` & `/layanan` — karena `/kontak` adalah list pendek (5 item), cocok untuk per-item stagger. Halaman lain tetap container-first agar tidak regress.

## Non-Goals

- Tidak mengubah behavior Reveal di `/profil` & `/layanan`
- Tidak mengubah default global Reveal component (default tetap `rootMargin: "0px 0px -10% 0px"`, `threshold: 0`, `fallbackMs: 1500`)
- Tidak menambah animasi baru selain reveal
- Tidak mengubah layout, copy, atau data `/kontak`
- Tidak menyentuh homepage, halaman lain, atau Reveal props selain 3 yang akan ditambah

## Solution Overview

### A. Reveal component — tambah 3 props baru (backward compatible)

Tambah 3 props opsional di `src/components/public/reveal.tsx`:

| Prop | Tipe | Default | Tujuan |
|---|---|---|---|
| `rootMargin` | `string` | `"0px 0px -10% 0px"` | Override `IntersectionObserver.rootMargin` per-instance |
| `threshold` | `number` | `0` | Override `IntersectionObserver.threshold` per-instance |
| `fallbackMs` | `number` | `1500` | Override `setTimeout` fallback (ms) per-instance |

Backward compat: default sama dengan kondisi sekarang, halaman lain yang tidak set prop ini **tidak terpengaruh**.

### B. `/kontak/page.tsx` — restructure jadi 6 Reveal

**Sekarang**: 1 `Reveal` membungkus seluruh section (info list + maps).

**Menjadi**:
1. PageHero — **no Reveal** (konsisten `/layanan`)
2. Section container — wrapper tanpa Reveal (cuma styling)
3. Info column:
   - 1 `Reveal` untuk heading "Informasi Kontak" + container div (rootMargin longgar, threshold 0.05, fallback 800ms)
   - 5 `Reveal` per item (Alamat, Jam, WhatsApp, Email, SP4N) dengan stagger `delay={0|80|160|240|320}` — rhythm medium, sama dengan `/profil`
4. Maps column:
   - 1 `Reveal` untuk heading "Lokasi Kami" + iframe (rootMargin longgar, threshold 0.05, fallback 800ms)

**Override per-section**:
- `rootMargin="0px 0px 50px 0px"` — longgar bottom, trigger lebih awal saat scroll
- `threshold={0.05}` — 5% element visible baru trigger, kurangi false trigger pada element tinggi
- `fallbackMs={800}` — fallback setengah dari default, konten muncul lebih cepat kalau IO gagal

**Per-section delay judul → item pertama**: 80ms (konsisten `/profil`).

### C. Rhythm choice

`/kontak` berbeda rhythm dari `/profil` & `/layanan`:

| Halaman | Rhythm | Alasan |
|---|---|---|
| `/profil` | Container-first (4 section, tiap section 1 Reveal) | Section berat dengan sub-konten banyak |
| `/layanan` | Container-first + per-item list ringan | Section bervariasi, ada list pendek (Standar Mutu 3) dan list panjang (Alur LPLPO 5) |
| `/kontak` | **Per-item stagger** (5 item info + 1 maps) | List pendek, tiap item pendek dan independen — per-item stagger terasa snappy |

Tidak ada PR untuk harmonisasi rhythm global — biarkan tiap halaman pilih rhythm yang cocok untuk kontennya.

## Acceptance Criteria

1. **Reveal component tetap backward compatible**:
   - TypeScript `tsc --noEmit` lulus dengan 0 error
   - Halaman yang tidak set prop baru (`/profil`, `/layanan`, dst.) **byte-identical** behavior (default sama)
2. **`/kontak` reveal behavior**:
   - PageHero muncul instant (no animation)
   - Section konten muncul saat user scroll, **tidak lebih dari 800ms** setelah page load (fallback worst case)
   - Saat scroll cepat dari atas ke bawah, **semua konten muncul** (tidak ada yang "hilang" sampai di-footer)
   - Stagger info 5 item: 0/80/160/240/320ms (rhythm medium)
3. **Visual quality**:
   - Stagger tidak terasa lambat (total reveal info ~1s, masih snappy)
   - Maps tidak "lompat" mendahului info (muncul paralel atau sedikit setelah)
4. **Code quality**:
   - 1 file Reveal yang diubah + 1 file `/kontak/page.tsx` yang diubah
   - Tidak ada dead code atau unused import
   - Comment di Reveal component menjelaskan kapan harus override prop
5. **Git hygiene**:
   - 3-commit pattern: `docs(spec):` → `docs(plan):` → `fix(kontak):`
   - Branch `fix/kontak-reveal-cascade` dari `develop`
   - PR ke `develop` (bukan langsung merge — tunggu konfirmasi user)

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Default Reveal berubah, side-effect ke `/profil`/`/layanan` | Low | High | Default sama persis; tambah test manual review di kedua halaman |
| Stagger 5 item terasa lambat di low-end device | Medium | Medium | Rhythm medium (80ms increment) masih snappy; fallback 800ms sebagai safety net |
| RootMargin longgar bikin reveal prematur saat scroll mundur | Low | Low | `once` behavior sudah ada (`io.unobserve` setelah trigger) — tidak re-trigger |
| User tidak suka rhythm beda `/kontak` vs halaman lain | Low | Low | Spec jelaskan reasoning per-halaman; bisa di-tune via PR berikutnya tanpa ubah default |

## Out of Scope (Future)

- Harmonisasi rhythm global (kalau user minta konsistensi)
- Tambah prop `once?: boolean` ke Reveal (saat ini hardcoded `true`)
- Tambah prop `as?: keyof JSX.IntrinsicElements` (saat ini hardcoded `<div>`)
- Performa audit IntersectionObserver (kalau halaman tumbuh banyak)
- Animasi non-reveal (parallax, morph, dst.)

## References

- Reveal component: `src/components/public/reveal.tsx`
- Halaman sebelumnya: `/profil` (PR #5, commit `3f5cfce`), `/layanan` (PR #6, commit `79b0de6`)
- Spec `/profil`: `docs/superpowers/specs/2026-09-04-profile-reveal-cascade-design.md`
- Spec `/layanan`: `docs/superpowers/specs/2026-09-04-layanan-reveal-cascade-design.md`
- Plan menyusul: `docs/superpowers/plans/2026-09-04-kontak-reveal-cascade.md`
