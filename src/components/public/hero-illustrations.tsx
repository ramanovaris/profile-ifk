import React from "react";

/**
 * Filter dan gradasi bersama untuk ilustrasi SVG Dark Ethereal.
 */
function SharedSvgDefs({ idPrefix }: { idPrefix: string }) {
  return (
    <defs>
      <linearGradient id={`${idPrefix}-emerald-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
        <stop offset="100%" stopColor="#059669" stopOpacity="0.4" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-cyan-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-card-bg`} x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
      </linearGradient>
      <linearGradient id={`${idPrefix}-border-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
        <stop offset="50%" stopColor="#10b981" stopOpacity="0.4" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0.05" />
      </linearGradient>
      <radialGradient id={`${idPrefix}-glow`} cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
      </radialGradient>
      <filter id={`${idPrefix}-blur`} x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="12" />
      </filter>
    </defs>
  );
}

/**
 * 1. Ilustrasi Halaman Layanan (/layanan)
 * Tema: Alur Standar Pelayanan Operasional Gudang Farmasi
 * (Pengajuan LPLPO, Verifikasi Gudang Farmasi, Cold Chain 2-8°C & Serah Terima Faskes)
 */
export function LayananHeroIllustration({ className }: { className?: string }) {
  const p = "layanan";
  return (
    <div className={`relative flex items-center justify-center ${className || ""}`}>
      <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
      <svg
        viewBox="0 0 480 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[460px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none"
      >
        <SharedSvgDefs idPrefix={p} />

        {/* Latar Belakang Lingkaran Glow */}
        <circle cx="240" cy="180" r="145" fill={`url(#${p}-glow)`} />

        {/* Garis Grid Skematik Alur Pelayanan */}
        <g stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3">
          <line x1="40" y1="90" x2="440" y2="90" />
          <line x1="40" y1="180" x2="440" y2="180" />
          <line x1="40" y1="270" x2="440" y2="270" />
          <line x1="120" y1="40" x2="120" y2="320" />
          <line x1="240" y1="40" x2="240" y2="320" />
          <line x1="360" y1="40" x2="360" y2="320" />
        </g>

        {/* Jalur Panah Alur dari Pengajuan (Kiri) ke Gudang (Tengah) ke Kontrol Mutu (Kanan) */}
        <path
          d="M 145 150 C 160 150, 160 145, 175 145"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        <path
          d="M 305 145 C 320 145, 320 150, 335 150"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        {/* Jalur Menuju Serah Terima Bawah */}
        <path
          d="M 240 200 L 240 225"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />

        {/* ── 1. KIRI: TAHAP PENGAJUAN (DOKUMEN LPLPO & DIGITAL) ──────── */}
        <g transform="translate(35, 100)">
          <rect
            width="110"
            height="100"
            rx="14"
            fill={`url(#${p}-card-bg)`}
            stroke="#ffffff"
            strokeOpacity="0.15"
            strokeWidth="1.2"
          />
          <rect x="10" y="10" width="62" height="16" rx="4" fill="#10b981" fillOpacity="0.2" />
          <text x="41" y="21" textAnchor="middle" fill="#34d399" fontSize="7.5" fontWeight="bold">
            01. PENGAJUAN
          </text>

          {/* Ikon Dokumen Berkas LPLPO */}
          <g transform="translate(20, 35)">
            <rect width="32" height="42" rx="3" fill="#09090b" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />
            {/* Garis-Garis Form */}
            <line x1="6" y1="10" x2="26" y2="10" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="18" x2="22" y2="18" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="24" x2="24" y2="24" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="30" x2="18" y2="30" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
            {/* Cap/Stempel Persetujuan */}
            <circle cx="24" cy="32" r="6" fill="#10b981" fillOpacity="0.3" stroke="#10b981" strokeWidth="1" />
            <path d="M 22 32 L 23.5 33.5 L 26.5 30.5" stroke="#34d399" strokeWidth="1" strokeLinecap="round" />
          </g>

          {/* Badge Smartphone/Digital H-1 */}
          <g transform="translate(62, 42)">
            <rect width="28" height="35" rx="4" fill="#09090b" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx="76" cy="46" r="1.5" fill="#38bdf8" />
            <rect x="4" y="6" width="20" height="20" rx="2" fill="#38bdf8" fillOpacity="0.1" />
            <text x="14" y="19" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold">
              PDF
            </text>
            <text x="14" y="31" textAnchor="middle" fill="#a1a1aa" fontSize="5.5">
              WA H-1
            </text>
          </g>

          <text x="55" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="7.5" fontWeight="500">
            Hardcopy &amp; Digital
          </text>
        </g>

        {/* ── 2. PUSAT: LOKET PELAYANAN GUDANG FARMASI ────────────────── */}
        <g transform="translate(170, 85)">
          {/* Badan Loket */}
          <rect
            width="140"
            height="115"
            rx="16"
            fill="#09090b"
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.5"
          />

          {/* Papan Nama Utama: GUDANG FARMASI */}
          <g transform="translate(15, -12)">
            <rect
              width="110"
              height="24"
              rx="6"
              fill="#09090b"
              stroke="#10b981"
              strokeWidth="1.5"
            />
            <circle cx="14" cy="12" r="5" fill="#10b981" fillOpacity="0.3" />
            <path d="M 14 9 L 14 15 M 11 12 L 17 12" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
            <text x="26" y="15" fill="#ffffff" fontSize="8.5" fontWeight="bold" letterSpacing="0.04em">
              GUDANG FARMASI
            </text>
          </g>

          {/* Jendela Kaca Loket Pelayanan */}
          <rect
            x="16"
            y="24"
            width="108"
            height="50"
            rx="8"
            fill="#10b981"
            fillOpacity="0.08"
            stroke="#ffffff"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
          {/* Garis Pantulan Kaca */}
          <line x1="28" y1="64" x2="68" y2="28" stroke="#34d399" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />

          {/* Celah Meja Loket Penyerahan */}
          <rect x="42" y="58" width="56" height="16" rx="4" fill="#09090b" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1" />
          <text x="70" y="69" textAnchor="middle" fill="#34d399" fontSize="7" fontWeight="bold">
            LOKET LAYANAN
          </text>

          {/* Meja Konter Depan */}
          <rect x="10" y="80" width="120" height="24" rx="6" fill="#ffffff" fillOpacity="0.03" stroke="#ffffff" strokeOpacity="0.1" />
          <circle cx="28" cy="92" r="4" fill="#10b981" className="animate-pulse" />
          <text x="38" y="95" fill="#e4e4e7" fontSize="8.5" fontWeight="600">
            Verifikasi &amp; Penyiapan
          </text>
        </g>

        {/* ── 3. KANAN: STANDAR MUTU & RANTAI DINGIN (COLD CHAIN) ─────── */}
        <g transform="translate(335, 100)">
          <rect
            width="110"
            height="100"
            rx="14"
            fill={`url(#${p}-card-bg)`}
            stroke="#ffffff"
            strokeOpacity="0.15"
            strokeWidth="1.2"
          />
          <rect x="10" y="10" width="70" height="16" rx="4" fill="#38bdf8" fillOpacity="0.15" />
          <text x="45" y="21" textAnchor="middle" fill="#38bdf8" fontSize="7.5" fontWeight="bold">
            02. KONTROL MUTU
          </text>

          {/* Boks Vaksin / Cold Box Suhu Dingin */}
          <g transform="translate(25, 36)">
            {/* Boks Insulasi */}
            <rect width="60" height="38" rx="6" fill="#09090b" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="1.2" />
            <path d="M 12 36 L 48 36" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1" />
            {/* Pegangan Boks */}
            <path d="M 22 36 L 22 32 C 22 30, 38 30, 38 32 L 38 36" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />

            {/* Simbol Kristal Salju & Suhu */}
            <circle cx="22" cy="55" r="7" fill="#38bdf8" fillOpacity="0.2" />
            {/* Ikon Suhu Terjaga 2-8 C */}
            <text x="34" y="58" fill="#38bdf8" fontSize="9" fontWeight="bold" fontFamily="monospace">
              2°– 8°C
            </text>
          </g>

          <text x="55" y="90" textAnchor="middle" fill="#a1a1aa" fontSize="7.5" fontWeight="500">
            Standar Rantai Dingin
          </text>
        </g>

        {/* ── 4. BAWAH: SERAH TERIMA & PUSKESMAS MITRA ────────────────── */}
        <g transform="translate(100, 228)">
          <rect
            width="280"
            height="70"
            rx="16"
            fill="#09090b"
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.2"
          />
          {/* Header Status Penyerahan */}
          <g transform="translate(18, 14)">
            <circle cx="10" cy="10" r="10" fill="#10b981" fillOpacity="0.2" />
            <path d="M 6 10 L 9 13 L 15 7" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <text x="26" y="9" fill="#ffffff" fontSize="9.5" fontWeight="bold">
              03. Serah Terima Perbekalan
            </text>
            <text x="26" y="20" fill="#a1a1aa" fontSize="8">
              Pemeriksaan Fisik, Kartu Batch &amp; BAP Resmi
            </text>
          </g>

          {/* Badge Faskes Tujuan */}
          <g transform="translate(18, 42)">
            <rect width="244" height="20" rx="6" fill="#ffffff" fillOpacity="0.04" stroke="#ffffff" strokeOpacity="0.08" />
            <text x="12" y="13" fill="#34d399" fontSize="8" fontWeight="bold">
              DISTRIBUSI RESMI:
            </text>
            <text x="96" y="13" fill="#d4d4d8" fontSize="8">
              28 Puskesmas, 2 RSUD &amp; Jaringan Kepulauan
            </text>
          </g>
        </g>

        {/* Lencana Status Atas */}
        <g transform="translate(160, 42)">
          <rect
            width="160"
            height="26"
            rx="13"
            fill="#09090b"
            stroke="#10b981"
            strokeOpacity="0.4"
            strokeWidth="1"
          />
          <circle cx="16" cy="13" r="3.5" fill="#34d399" className="animate-pulse" />
          <text x="26" y="16" fill="#e4e4e7" fontSize="8.5" fontWeight="600">
            Standar Pelayanan Operasional
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * 2. Ilustrasi Halaman Profil (/profil)
 * Tema: Kompleks Perkantoran & Pergudangan Farmasi UPTD IFK Kotabaru
 * (Gedung Kantor Utama 2 Lantai diapit 2 Gudang Farmasi di Kiri & Kanan)
 */
export function ProfilHeroIllustration({ className }: { className?: string }) {
  const p = "profil";
  return (
    <div className={`relative flex items-center justify-center ${className || ""}`}>
      <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
      <svg
        viewBox="0 0 480 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[460px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none"
      >
        <SharedSvgDefs idPrefix={p} />

        {/* Glow Latar Belakang */}
        <circle cx="240" cy="180" r="150" fill={`url(#${p}-glow)`} />

        {/* Garis Grid Sketsa Arsitektur Blueprint */}
        <g stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3">
          <line x1="20" y1="90" x2="460" y2="90" />
          <line x1="20" y1="180" x2="460" y2="180" />
          <line x1="20" y1="270" x2="460" y2="270" />
          <line x1="85" y1="50" x2="85" y2="310" />
          <line x1="240" y1="40" x2="240" y2="310" />
          <line x1="395" y1="50" x2="395" y2="310" />
        </g>

        {/* Lingkaran Lambang Integritas di Belakang Kantor */}
        <circle cx="240" cy="80" r="50" stroke="#10b981" strokeOpacity="0.2" strokeWidth="1" strokeDasharray="4 4" />
        <circle cx="240" cy="80" r="38" stroke="#ffffff" strokeOpacity="0.08" strokeWidth="1" />

        {/* ── KORIDOR PENGHUBUNG ANTAR-GEDUNG ────────────────────────── */}
        {/* Koridor Kiri (Gudang A ke Kantor) */}
        <rect x="130" y="200" width="25" height="70" fill="#09090b" stroke="#ffffff" strokeOpacity="0.1" />
        <rect x="128" y="196" width="29" height="5" rx="1" fill="#10b981" fillOpacity="0.5" />
        <line x1="130" y1="225" x2="155" y2="225" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* Koridor Kanan (Kantor ke Gudang B) */}
        <rect x="325" y="200" width="25" height="70" fill="#09090b" stroke="#ffffff" strokeOpacity="0.1" />
        <rect x="323" y="196" width="29" height="5" rx="1" fill="#10b981" fillOpacity="0.5" />
        <line x1="325" y1="225" x2="350" y2="225" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1.5" strokeDasharray="3 3" />

        {/* ── 1. GUDANG KIRI (Gudang 1 - Logistik Obat) ───────────────── */}
        <g transform="translate(25, 125)">
          {/* Dinding Bangunan Gudang */}
          <rect
            width="110"
            height="145"
            rx="8"
            fill={`url(#${p}-card-bg)`}
            stroke="#ffffff"
            strokeOpacity="0.15"
            strokeWidth="1.2"
          />
          {/* Atap Parapet Industri */}
          <rect x="-4" y="-8" width="118" height="12" rx="3" fill="#09090b" stroke="#10b981" strokeOpacity="0.4" strokeWidth="1.2" />
          <line x1="4" y1="-2" x2="106" y2="-2" stroke="#34d399" strokeOpacity="0.3" strokeWidth="1" />

          {/* Ventilasi / Jendela Atas Gudang */}
          <rect x="15" y="16" width="80" height="20" rx="4" fill="#38bdf8" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.12" />
          <line x1="41" y1="16" x2="41" y2="36" stroke="#ffffff" strokeOpacity="0.12" />
          <line x1="68" y1="16" x2="68" y2="36" stroke="#ffffff" strokeOpacity="0.12" />

          {/* Label Gudang A */}
          <rect x="18" y="44" width="74" height="18" rx="5" fill="#09090b" stroke="#10b981" strokeOpacity="0.3" strokeWidth="1" />
          <text x="55" y="56" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">
            GUDANG OBAT
          </text>

          {/* Kanopi Pintu Bongkar Muat (Loading Dock) */}
          <rect x="12" y="68" width="86" height="5" rx="1" fill="#10b981" fillOpacity="0.7" />

          {/* Pintu Rolling Door Gudang */}
          <rect x="16" y="73" width="78" height="72" rx="3" fill="#09090b" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="1" />
          {/* Garis-Garis Bilah Rolling Door */}
          {[83, 93, 103, 113, 123, 133].map((yVal, idx) => (
            <line key={idx} x1="20" y1={yVal} x2="90" y2={yVal} stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          ))}
          {/* Kunci / Handle Pintu */}
          <line x1="50" y1="138" x2="60" y2="138" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ── 2. GUDANG KANAN (Gudang 2 - Cold Chain & BMHP) ──────────── */}
        <g transform="translate(345, 125)">
          {/* Dinding Bangunan Gudang */}
          <rect
            width="110"
            height="145"
            rx="8"
            fill={`url(#${p}-card-bg)`}
            stroke="#ffffff"
            strokeOpacity="0.15"
            strokeWidth="1.2"
          />
          {/* Atap Parapet Industri */}
          <rect x="-4" y="-8" width="118" height="12" rx="3" fill="#09090b" stroke="#10b981" strokeOpacity="0.4" strokeWidth="1.2" />
          <line x1="4" y1="-2" x2="106" y2="-2" stroke="#34d399" strokeOpacity="0.3" strokeWidth="1" />

          {/* Unit Pendingin Cold Room di Atap */}
          <g transform="translate(70, -22)">
            <rect width="28" height="14" rx="2" fill="#09090b" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1" />
            <circle cx="14" cy="7" r="4" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="6" y1="4" x2="22" y2="10" stroke="#38bdf8" strokeOpacity="0.5" />
          </g>

          {/* Ventilasi / Jendela Atas Gudang */}
          <rect x="15" y="16" width="80" height="20" rx="4" fill="#38bdf8" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.12" />
          <line x1="41" y1="16" x2="41" y2="36" stroke="#ffffff" strokeOpacity="0.12" />
          <line x1="68" y1="16" x2="68" y2="36" stroke="#ffffff" strokeOpacity="0.12" />

          {/* Label Gudang B */}
          <rect x="18" y="44" width="74" height="18" rx="5" fill="#09090b" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1" />
          <text x="55" y="56" textAnchor="middle" fill="#38bdf8" fontSize="8" fontWeight="bold">
            COLD CHAIN &amp; BMHP
          </text>

          {/* Kanopi Pintu Bongkar Muat */}
          <rect x="12" y="68" width="86" height="5" rx="1" fill="#38bdf8" fillOpacity="0.7" />

          {/* Pintu Rolling Door Gudang */}
          <rect x="16" y="73" width="78" height="72" rx="3" fill="#09090b" stroke="#ffffff" strokeOpacity="0.15" strokeWidth="1" />
          {/* Garis-Garis Bilah Rolling Door */}
          {[83, 93, 103, 113, 123, 133].map((yVal, idx) => (
            <line key={idx} x1="20" y1={yVal} x2="90" y2={yVal} stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1" />
          ))}
          {/* Handle Pintu */}
          <line x1="50" y1="138" x2="60" y2="138" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ── 3. GEDUNG UTAMA (KANTOR UPTD IFK - TENGAH) ──────────────── */}
        <g transform="translate(145, 95)">
          {/* Badan Gedung 2 Lantai (Paling Tinggi & Menonjol) */}
          <rect
            width="190"
            height="175"
            rx="12"
            fill={`url(#${p}-card-bg)`}
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.5"
          />

          {/* Atap Fascia Gedung Kantor */}
          <rect x="-6" y="-10" width="202" height="14" rx="4" fill="#09090b" stroke="#34d399" strokeWidth="1.5" />
          <line x1="2" y1="-3" x2="188" y2="-3" stroke="#10b981" strokeOpacity="0.5" strokeWidth="1" />

          {/* Papan Nama Instansi di Puncak */}
          <g transform="translate(25, -42)">
            <rect
              width="140"
              height="30"
              rx="8"
              fill="#09090b"
              stroke="#10b981"
              strokeOpacity="0.6"
              strokeWidth="1.2"
            />
            {/* Palang Medis Hijau */}
            <circle cx="18" cy="15" r="7" fill="#10b981" fillOpacity="0.2" />
            <path d="M 18 10 L 18 20 M 13 15 L 23 15" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
            <text x="32" y="15" fill="#ffffff" fontSize="8.5" fontWeight="bold" letterSpacing="0.05em">
              KANTOR UPTD IFK
            </text>
            <text x="32" y="23" fill="#a1a1aa" fontSize="6.5" fontWeight="500">
              Dinas Kesehatan Kab. Kotabaru
            </text>
          </g>

          {/* Jendela Lantai 2 (Kaca Reflektif) */}
          {[16, 68, 120].map((xPos, idx) => (
            <g key={idx}>
              <rect
                x={xPos}
                y={18}
                width="42"
                height="40"
                rx="6"
                fill="#38bdf8"
                fillOpacity="0.08"
                stroke="#ffffff"
                strokeOpacity="0.15"
                strokeWidth="1"
              />
              <line x1={xPos + 6} y1={52} x2={xPos + 24} y2={24} stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1.5" strokeLinecap="round" />
              <line x1={xPos + 21} y1={18} x2={xPos + 21} y2={58} stroke="#ffffff" strokeOpacity="0.1" />
            </g>
          ))}

          {/* List Horizontal Pembatas Lantai 1 & 2 */}
          <line x1="0" y1="75" x2="190" y2="75" stroke="#10b981" strokeOpacity="0.4" strokeWidth="2" />

          {/* Jendela Sisi Kiri & Kanan Lantai 1 */}
          <rect x="16" y="90" width="38" height="60" rx="6" fill="#38bdf8" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.12" />
          <line x1="16" y1="120" x2="54" y2="120" stroke="#ffffff" strokeOpacity="0.1" />
          <rect x="136" y="90" width="38" height="60" rx="6" fill="#38bdf8" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.12" />
          <line x1="136" y1="120" x2="174" y2="120" stroke="#ffffff" strokeOpacity="0.1" />

          {/* Kanopi Lobi Masuk Kantor */}
          <rect x="58" y="78" width="74" height="7" rx="2" fill="#10b981" fillOpacity="0.8" />
          <rect x="62" y="76" width="66" height="2" fill="#34d399" />

          {/* Pilar Modern Lobi */}
          <rect x="64" y="85" width="8" height="90" fill="#09090b" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1" />
          <rect x="118" y="85" width="8" height="90" fill="#09090b" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1" />

          {/* Pintu Kaca Geser Lobi */}
          <rect
            x="76"
            y="88"
            width="38"
            height="87"
            rx="3"
            fill="#10b981"
            fillOpacity="0.12"
            stroke="#ffffff"
            strokeOpacity="0.2"
          />
          <line x1="95" y1="88" x2="95" y2="175" stroke="#34d399" strokeOpacity="0.4" strokeWidth="1.5" />
          <line x1="92" y1="130" x2="92" y2="145" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="98" y1="130" x2="98" y2="145" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* ── TANGGA & HALAMAN ASPAL KOMPLEKS ────────────────────────── */}
        <rect x="15" y="270" width="450" height="6" rx="2" fill="#09090b" stroke="#ffffff" strokeOpacity="0.12" />
        <rect x="5" y="276" width="470" height="8" rx="2" fill="#09090b" stroke="#ffffff" strokeOpacity="0.06" />

        {/* Marka Jalur Distribusi Depan Gudang */}
        <line x1="45" y1="284" x2="115" y2="284" stroke="#10b981" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 4" />
        <line x1="365" y1="284" x2="435" y2="284" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1.5" strokeDasharray="4 4" />
      </svg>
    </div>
  );
}

/**
 * 3. Ilustrasi Halaman Stok Obat (/stok)
 * Tema: Rak Gudang Logistik, Blister Obat & Checklist Opname Fisik
 */
export function StokHeroIllustration({ className }: { className?: string }) {
  const p = "stok";
  return (
    <div className={`relative flex items-center justify-center ${className || ""}`}>
      <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
      <svg
        viewBox="0 0 480 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[440px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none"
      >
        <SharedSvgDefs idPrefix={p} />

        {/* Glow Latar Belakang */}
        <circle cx="240" cy="180" r="140" fill={`url(#${p}-glow)`} />

        {/* Struktur Rak Palet Gudang Farmasi */}
        <g stroke="#ffffff" strokeOpacity="0.12" strokeWidth="2">
          {/* Tiang Vertikal */}
          <line x1="120" y1="70" x2="120" y2="280" />
          <line x1="240" y1="70" x2="240" y2="280" />
          <line x1="360" y1="70" x2="360" y2="280" />
          {/* Rak Horizontal */}
          <line x1="110" y1="140" x2="370" y2="140" stroke="#10b981" strokeOpacity="0.3" />
          <line x1="110" y1="210" x2="370" y2="210" stroke="#10b981" strokeOpacity="0.3" />
          <line x1="110" y1="280" x2="370" y2="280" stroke="#ffffff" strokeOpacity="0.2" />
        </g>

        {/* Kardus / Boks Obat di Rak 1 (Atas) */}
        <g transform="translate(140, 95)">
          <rect width="36" height="42" rx="4" fill={`url(#${p}-card-bg)`} stroke="#34d399" strokeWidth="1.2" />
          <path d="M 140 116 L 176 116" stroke="#34d399" strokeOpacity="0.4" strokeWidth="1" />
          <line x1="8" y1="18" x2="28" y2="18" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
        </g>
        <g transform="translate(185, 102)">
          <rect width="42" height="35" rx="4" fill={`url(#${p}-card-bg)`} stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.2" />
          <line x1="8" y1="16" x2="34" y2="16" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1.5" />
        </g>

        {/* Botol Sirup / Cairan di Rak 1 Kanan */}
        <g transform="translate(265, 96)">
          <rect x="6" y="10" width="20" height="32" rx="4" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeWidth="1.2" />
          <rect x="11" y="4" width="10" height="6" rx="2" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
          <line x1="9" y1="24" x2="23" y2="24" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2 2" />
        </g>
        <g transform="translate(295, 96)">
          <rect x="6" y="10" width="20" height="32" rx="4" fill="#34d399" fillOpacity="0.15" stroke="#34d399" strokeWidth="1.2" />
          <rect x="11" y="4" width="10" height="6" rx="2" fill="#34d399" fillOpacity="0.4" stroke="#34d399" strokeWidth="1" />
        </g>

        {/* Panel Kartu Verifikasi Stok Opname Tengah (Melayang) */}
        <g transform="translate(170, 160)">
          <rect
            width="150"
            height="90"
            rx="16"
            fill="#09090b"
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.5"
          />
          {/* Header Kartu */}
          <circle cx="24" cy="24" r="8" fill="#10b981" fillOpacity="0.2" />
          <path d="M 20 24 L 23 27 L 29 21" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="38" y="24" fill="#e4e4e7" fontSize="10" fontWeight="bold">
            Opname Fisik
          </text>
          <text x="38" y="34" fill="#71717a" fontSize="8">
            Cut-off Akhir Bulan
          </text>

          {/* Baris Progress Kapasitas */}
          <rect x="20" y="46" width="110" height="6" rx="3" fill="#ffffff" fillOpacity="0.08" />
          <rect x="20" y="46" width="88" height="6" rx="3" fill="#10b981" />

          {/* Tag Status */}
          <rect x="20" y="60" width="55" height="18" rx="6" fill="#10b981" fillOpacity="0.15" />
          <text x="47" y="72" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="600">
            Aman (92%)
          </text>
          <text x="130" y="72" textAnchor="end" fill="#a1a1aa" fontSize="9" fontFamily="monospace">
            200+ Item
          </text>
        </g>

        {/* Blister Tablet di Sudut Kiri Bawah */}
        <g transform="translate(90, 220)">
          <rect width="48" height="34" rx="6" fill={`url(#${p}-card-bg)`} stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
          <circle cx="16" cy="13" r="4" fill="#34d399" fillOpacity="0.5" />
          <circle cx="32" cy="13" r="4" fill="#34d399" fillOpacity="0.5" />
          <circle cx="16" cy="23" r="4" fill="#34d399" fillOpacity="0.5" />
          <circle cx="32" cy="23" r="4" fill="#34d399" fillOpacity="0.5" />
        </g>
      </svg>
    </div>
  );
}

/**
 * 4. Ilustrasi Halaman Kontak (/kontak)
 * Tema: Kanal Komunikasi Terpadu, Gelombang Hotline & Respon Pengaduan
 */
export function KontakHeroIllustration({ className }: { className?: string }) {
  const p = "kontak";
  return (
    <div className={`relative flex items-center justify-center ${className || ""}`}>
      <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
      <svg
        viewBox="0 0 480 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[440px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none"
      >
        <SharedSvgDefs idPrefix={p} />

        {/* Glow Latar */}
        <circle cx="240" cy="180" r="140" fill={`url(#${p}-glow)`} />

        {/* Gelombang Frekuensi Komunikasi */}
        <g stroke="#10b981" strokeOpacity="0.2" strokeWidth="1.5" fill="none">
          <circle cx="240" cy="170" r="110" strokeDasharray="4 6" />
          <circle cx="240" cy="170" r="80" strokeDasharray="3 4" />
          <circle cx="240" cy="170" r="50" />
        </g>

        {/* Kartu Dialog Konsultasi Utama (Tengah) */}
        <g transform="translate(160, 115)">
          <rect
            width="160"
            height="110"
            rx="20"
            fill="#09090b"
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.5"
          />
          {/* Header Chat */}
          <circle cx="28" cy="28" r="12" fill="#10b981" fillOpacity="0.2" />
          <path
            d="M 23 28 C 23 25, 33 25, 33 28 C 33 30, 26 31, 26 33"
            stroke="#34d399"
            strokeWidth="1.75"
            strokeLinecap="round"
            fill="none"
          />
          <circle cx="26" cy="36" r="1" fill="#34d399" />
          <text x="46" y="26" fill="#ffffff" fontSize="11" fontWeight="bold">
            Konsultasi IFK
          </text>
          <text x="46" y="38" fill="#10b981" fontSize="9" fontWeight="500">
            Aktif Jam Kerja
          </text>

          {/* Balon Pesan 1 */}
          <rect x="20" y="52" width="100" height="20" rx="8" fill="#ffffff" fillOpacity="0.06" />
          <text x="30" y="65" fill="#d4d4d8" fontSize="8.5">
            Layanan Pengaduan
          </text>

          {/* Balon Pesan 2 (Respon Timbal Balik) */}
          <rect x="45" y="78" width="95" height="20" rx="8" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeOpacity="0.3" />
          <text x="55" y="91" fill="#34d399" fontSize="8.5" fontWeight="500">
            Respon Tanggap
          </text>
        </g>

        {/* Ikon Satelit WhatsApp (Kiri) */}
        <g transform="translate(85, 140)">
          <circle cx="32" cy="32" r="28" fill={`url(#${p}-card-bg)`} stroke="#ffffff" strokeOpacity="0.15" />
          <path
            d="M 23 38 L 24 33 C 21 29, 23 23, 29 21 C 35 19, 41 23, 41 29 C 41 35, 35 39, 30 38 Z"
            stroke="#34d399"
            strokeWidth="1.75"
            fill="none"
          />
          <text x="32" y="72" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="500">
            WhatsApp
          </text>
        </g>

        {/* Ikon Satelit SP4N-LAPOR! (Kanan) */}
        <g transform="translate(335, 140)">
          <circle cx="32" cy="32" r="28" fill={`url(#${p}-card-bg)`} stroke="#ffffff" strokeOpacity="0.15" />
          {/* Ikon Megafon / Pengeras Suara */}
          <path
            d="M 24 30 L 32 26 L 40 34 L 32 38 Z"
            stroke="#38bdf8"
            strokeWidth="1.5"
            fill="none"
            strokeLinejoin="round"
          />
          <path d="M 24 30 L 22 38" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          <text x="32" y="72" textAnchor="middle" fill="#a1a1aa" fontSize="9" fontWeight="500">
            SP4N-LAPOR!
          </text>
        </g>
      </svg>
    </div>
  );
}

/**
 * 5. Ilustrasi Halaman Berita (/berita)
 * Tema: Portal Publikasi Digital, Lembar Warta & Gelombang Informasi
 */
export function BeritaHeroIllustration({ className }: { className?: string }) {
  const p = "berita";
  return (
    <div className={`relative flex items-center justify-center ${className || ""}`}>
      <div className="absolute -inset-4 bg-emerald-500/10 blur-2xl rounded-full pointer-events-none" />
      <svg
        viewBox="0 0 480 360"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-[440px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none"
      >
        <SharedSvgDefs idPrefix={p} />

        {/* Glow Latar */}
        <circle cx="240" cy="180" r="140" fill={`url(#${p}-glow)`} />

        {/* Garis Orbit Pancaran Informasi */}
        <ellipse cx="240" cy="180" rx="150" ry="80" stroke="#ffffff" strokeOpacity="0.08" strokeDasharray="3 3" />
        <ellipse cx="240" cy="180" rx="100" ry="130" stroke="#10b981" strokeOpacity="0.15" strokeDasharray="5 5" />

        {/* Lembar Artikel Belakang (Efek Layered Paper) */}
        <g transform="translate(140, 95) rotate(-6, 80, 80)">
          <rect
            width="170"
            height="140"
            rx="14"
            fill="#ffffff"
            fillOpacity="0.03"
            stroke="#ffffff"
            strokeOpacity="0.08"
          />
          <line x1="20" y1="30" x2="80" y2="30" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" />
          <line x1="20" y1="50" x2="140" y2="50" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.5" />
          <line x1="20" y1="65" x2="120" y2="65" stroke="#ffffff" strokeOpacity="0.1" strokeWidth="1.5" />
        </g>

        {/* Lembar Artikel Utama (Tengah Depan) */}
        <g transform="translate(155, 105)">
          <rect
            width="175"
            height="150"
            rx="16"
            fill="#09090b"
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.5"
          />
          {/* Header Publikasi & Kategori */}
          <rect x="20" y="20" width="50" height="16" rx="6" fill="#10b981" fillOpacity="0.2" />
          <text x="45" y="31" textAnchor="middle" fill="#34d399" fontSize="8" fontWeight="bold">
            WARTA
          </text>
          <circle cx="145" cy="28" r="4" fill="#38bdf8" />

          {/* Thumbnail Ilustratif Mini */}
          <rect x="20" y="44" width="135" height="40" rx="8" fill="#ffffff" fillOpacity="0.05" stroke="#ffffff" strokeOpacity="0.1" />
          <path d="M 30 74 L 55 56 L 75 68 L 100 50 L 140 74" stroke="#34d399" strokeWidth="1.5" fill="none" />
          <circle cx="120" cy="56" r="4" fill="#38bdf8" fillOpacity="0.6" />

          {/* Garis-Garis Tipografi Warta */}
          <line x1="20" y1="98" x2="110" y2="98" stroke="#ffffff" strokeOpacity="0.7" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="20" y1="112" x2="155" y2="112" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="20" y1="124" x2="135" y2="124" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
        </g>

        {/* Sinyal Siaran Mengambang (Kanan Atas) */}
        <g transform="translate(325, 75)">
          <circle cx="24" cy="24" r="22" fill="#09090b" stroke="#10b981" strokeOpacity="0.3" />
          <path d="M 18 24 A 6 6 0 0 1 30 24" stroke="#34d399" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M 14 24 A 10 10 0 0 1 34 24" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.6" strokeLinecap="round" fill="none" />
          <circle cx="24" cy="24" r="2" fill="#ffffff" />
        </g>
      </svg>
    </div>
  );
}
