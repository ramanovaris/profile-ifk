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
 * Tema: Alur Simbolik Standar Pelayanan Operasional Gudang Farmasi
 * (Pengajuan Berkas & Digital -> Loket Verifikasi Farmasi & Cold Chain -> Serah Terima Distribusi)
 * Didesain murni simbolik vektor tanpa teks untuk estetika premium dan bersih.
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

        {/* Garis Grid Skematik Alur Simbolik */}
        <g stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3">
          <line x1="40" y1="90" x2="440" y2="90" />
          <line x1="40" y1="180" x2="440" y2="180" />
          <line x1="40" y1="270" x2="440" y2="270" />
          <line x1="120" y1="40" x2="120" y2="320" />
          <line x1="240" y1="40" x2="240" y2="320" />
          <line x1="360" y1="40" x2="360" y2="320" />
        </g>

        {/* Orbit Lingkaran Simbolik */}
        <circle cx="240" cy="155" r="115" stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
        <circle cx="240" cy="155" r="75" stroke="#10b981" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="4 4" />

        {/* Jalur Panah Alur Berdenyut */}
        <path
          d="M 140 155 C 160 155, 160 150, 175 150"
          stroke="#10b981"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        <path
          d="M 305 150 C 320 150, 320 155, 340 155"
          stroke="#38bdf8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        <path
          d="M 240 215 L 240 230"
          stroke="#34d399"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />

        {/* ── 1. KIRI: SIMBOL PENGAJUAN (BERKAS & DIGITAL) ────────────── */}
        <g transform="translate(40, 95)">
          <rect
            width="100"
            height="115"
            rx="16"
            fill={`url(#${p}-card-bg)`}
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="1.2"
          />

          {/* Ikon Berkas / Dokumen Fisik */}
          <g transform="translate(18, 20)">
            <rect width="36" height="48" rx="4" fill="#09090b" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.2" />
            {/* Sudut Lipat Dokumen */}
            <path d="M 24 0 L 36 12 L 24 12 Z" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" strokeOpacity="0.25" />
            {/* Garis-Garis Dokumen */}
            <line x1="6" y1="12" x2="20" y2="12" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
            <line x1="6" y1="20" x2="30" y2="20" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="27" x2="26" y2="27" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="6" y1="34" x2="22" y2="34" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
            {/* Stempel Centang Verifikasi */}
            <circle cx="26" cy="38" r="6" fill="#10b981" fillOpacity="0.25" stroke="#10b981" strokeWidth="1" />
            <path d="M 23.5 38 L 25 39.5 L 28.5 36.5" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Ikon Perangkat Digital / PDF Pengajuan */}
          <g transform="translate(56, 45)">
            <rect width="28" height="46" rx="5" fill="#09090b" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1.2" />
            {/* Kamera Depan */}
            <circle cx="14" cy="5" r="1" fill="#38bdf8" />
            {/* Layar dengan Simbol Panah Unggah / Kirim */}
            <rect x="3" y="9" width="22" height="28" rx="2" fill="#38bdf8" fillOpacity="0.08" />
            <path d="M 14 18 L 14 28 M 9 23 L 14 18 L 19 23" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            {/* Tombol Home */}
            <circle cx="14" cy="41" r="2" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />
          </g>

          {/* Indikator Titik Status Bawah */}
          <g transform="translate(38, 98)">
            <circle cx="6" cy="0" r="2.5" fill="#10b981" />
            <circle cx="18" cy="0" r="2.5" fill="#38bdf8" />
          </g>
        </g>

        {/* ── 2. PUSAT: LOKET PELAYANAN GUDANG FARMASI ────────────────── */}
        <g transform="translate(170, 75)">
          {/* Badan Loket Farmasi */}
          <rect
            width="140"
            height="130"
            rx="18"
            fill="#09090b"
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.5"
          />

          {/* Medali Lambang Farmasi (Palang Medis & Perisai) di Puncak */}
          <g transform="translate(70, 0)">
            <circle cx="0" cy="0" r="20" fill="#09090b" stroke="#10b981" strokeWidth="1.5" />
            <circle cx="0" cy="0" r="16" fill="#10b981" fillOpacity="0.15" />
            {/* Palang Farmasi */}
            <path d="M 0 -8 L 0 8 M -8 0 L 8 0" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
          </g>

          {/* Jendela Kaca Loket Transparan */}
          <rect
            x="16"
            y="30"
            width="108"
            height="56"
            rx="10"
            fill="#10b981"
            fillOpacity="0.08"
            stroke="#ffffff"
            strokeOpacity="0.15"
            strokeWidth="1"
          />
          {/* Garis Kilap Refleksi Kaca */}
          <line x1="28" y1="74" x2="72" y2="34" stroke="#34d399" strokeOpacity="0.25" strokeWidth="2" strokeLinecap="round" />

          {/* Laser Pemindai / Barcode Scanner Simbolik */}
          <line x1="26" y1="58" x2="114" y2="58" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

          {/* Celah Meja Serah Terima Loket */}
          <rect x="42" y="72" width="56" height="14" rx="4" fill="#09090b" stroke="#34d399" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="70" cy="79" r="2" fill="#34d399" />

          {/* Meja Konter Layanan Bawah */}
          <rect x="10" y="94" width="120" height="26" rx="8" fill="#ffffff" fillOpacity="0.03" stroke="#ffffff" strokeOpacity="0.1" />
          {/* Sepasang Indikator Lampu LED Status */}
          <circle cx="28" cy="107" r="3.5" fill="#10b981" className="animate-pulse" />
          <line x1="40" y1="107" x2="80" y2="107" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
          <circle cx="112" cy="107" r="3.5" fill="#38bdf8" />
        </g>

        {/* ── 3. KANAN: SIMBOL KONTROL MUTU & RANTAI DINGIN ────────────── */}
        <g transform="translate(340, 95)">
          <rect
            width="100"
            height="115"
            rx="16"
            fill={`url(#${p}-card-bg)`}
            stroke="#ffffff"
            strokeOpacity="0.12"
            strokeWidth="1.2"
          />

          {/* Boks Insulasi Rantai Dingin (Cold Box Vaksin) */}
          <g transform="translate(18, 22)">
            <rect width="48" height="38" rx="6" fill="#09090b" stroke="#38bdf8" strokeOpacity="0.6" strokeWidth="1.2" />
            {/* Pegangan Logam Boks */}
            <path d="M 16 0 L 16 -6 C 16 -8, 32 -8, 32 -6 L 32 0" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            {/* Kunci Grendel Boks */}
            <rect x="20" y="14" width="8" height="8" rx="2" fill="#38bdf8" fillOpacity="0.4" stroke="#38bdf8" strokeWidth="1" />
          </g>

          {/* Ikon Kristal Salju (Suhu Terkendali) */}
          <g transform="translate(36, 75)">
            <circle cx="0" cy="0" r="14" fill="#38bdf8" fillOpacity="0.15" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1" />
            {/* Sumbu Salju */}
            <line x1="0" y1="-8" x2="0" y2="8" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-7" y1="-4" x2="7" y2="4" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="-7" y1="4" x2="7" y2="-4" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Termometer Tabung Presisi di Samping */}
          <g transform="translate(74, 22)">
            <rect width="10" height="50" rx="5" fill="#09090b" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
            {/* Kolom Cairan Raksa / Suhu Hijau Optimal */}
            <rect x="3" y="16" width="4" height="26" rx="2" fill="#10b981" />
            <circle cx="5" cy="42" r="4" fill="#10b981" />
            {/* Garis-Garis Skala Termometer */}
            <line x1="1" y1="12" x2="4" y2="12" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="1" y1="20" x2="4" y2="20" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" />
            <line x1="1" y1="28" x2="4" y2="28" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="1" />
          </g>
        </g>

        {/* ── 4. BAWAH: SERAH TERIMA & DISTRIBUSI KE FASKES ───────────── */}
        <g transform="translate(100, 225)">
          <rect
            width="280"
            height="85"
            rx="18"
            fill="#09090b"
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.2"
          />

          {/* Tumpukan Kardus Logistik Obat Bersegel */}
          <g transform="translate(24, 20)">
            {/* Kardus Utama */}
            <rect width="46" height="42" rx="4" fill="#10b981" fillOpacity="0.1" stroke="#34d399" strokeWidth="1.2" />
            {/* Lakban Pengaman */}
            <line x1="23" y1="0" x2="23" y2="42" stroke="#34d399" strokeOpacity="0.4" strokeWidth="1.5" />
            {/* Matriks Kode QR */}
            <rect x="8" y="12" width="14" height="14" rx="2" fill="#ffffff" fillOpacity="0.1" stroke="#ffffff" strokeOpacity="0.3" strokeWidth="1" />
            <circle cx="15" cy="19" r="2" fill="#34d399" />
          </g>

          <g transform="translate(64, 28)">
            {/* Kardus Pendamping */}
            <rect width="36" height="34" rx="3" fill="#38bdf8" fillOpacity="0.08" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1.2" />
            <line x1="18" y1="0" x2="18" y2="34" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1" />
          </g>

          {/* Vektor Panah Distribusi Bergerak Menuju Faskes */}
          <g transform="translate(125, 42)">
            <path
              d="M 0 0 L 35 0 M 27 -6 L 35 0 L 27 6"
              stroke="#34d399"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-pulse"
            />
          </g>

          {/* Node Simbolik Fasilitas Kesehatan Jejaring */}
          {/* Faskes 1: Puskesmas */}
          <g transform="translate(195, 42)">
            <circle cx="0" cy="0" r="16" fill={`url(#${p}-card-bg)`} stroke="#10b981" strokeOpacity="0.5" strokeWidth="1.2" />
            <path d="M 0 -6 L 0 6 M -6 0 L 6 0" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Faskes 2: Puskesmas Pulau (Simbol Gelombang / Perahu) */}
          <g transform="translate(242, 28)">
            <circle cx="0" cy="0" r="13" fill={`url(#${p}-card-bg)`} stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1" />
            <path d="M -5 3 C -2 6, 2 6, 5 3 L 6 0 L -6 0 Z" stroke="#38bdf8" strokeWidth="1.2" fill="none" strokeLinejoin="round" />
            <line x1="0" y1="-4" x2="0" y2="0" stroke="#38bdf8" strokeWidth="1.2" />
          </g>

          {/* Faskes 3: Rumah Sakit / Jejaring */}
          <g transform="translate(242, 56)">
            <circle cx="0" cy="0" r="13" fill={`url(#${p}-card-bg)`} stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1" />
            <path d="M 0 -5 L 0 5 M -5 0 L 5 0" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Garis Koneksi Antar Simpul Faskes */}
          <line x1="195" y1="42" x2="230" y2="32" stroke="#38bdf8" strokeOpacity="0.3" strokeDasharray="2 2" />
          <line x1="195" y1="42" x2="230" y2="52" stroke="#10b981" strokeOpacity="0.3" strokeDasharray="2 2" />
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
          {/* Header Kartu Simbolik */}
          <circle cx="24" cy="24" r="8" fill="#10b981" fillOpacity="0.2" />
          <path d="M 20 24 L 23 27 L 29 21" stroke="#34d399" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="40" y1="20" x2="105" y2="20" stroke="#ffffff" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="40" y1="27" x2="80" y2="27" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />

          {/* Baris Progress Kapasitas */}
          <rect x="20" y="46" width="110" height="6" rx="3" fill="#ffffff" fillOpacity="0.08" />
          <rect x="20" y="46" width="88" height="6" rx="3" fill="#10b981" />

          {/* Indikator Status Simbolik (Diagram Batang / Gauge) */}
          <g transform="translate(20, 60)">
            <rect x="0" y="0" width="36" height="18" rx="5" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeOpacity="0.3" />
            <circle cx="10" cy="9" r="3" fill="#34d399" />
            <line x1="17" y1="9" x2="28" y2="9" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" />
          </g>
          {/* Mini Barchart Kanan */}
          <g transform="translate(90, 60)">
            <rect x="0" y="8" width="4" height="10" rx="1.5" fill="#38bdf8" />
            <rect x="8" y="4" width="4" height="14" rx="1.5" fill="#10b981" />
            <rect x="16" y="0" width="4" height="18" rx="1.5" fill="#34d399" />
            <rect x="24" y="6" width="4" height="12" rx="1.5" fill="#38bdf8" />
          </g>
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
 * Tema: Pusat Komunikasi & Layanan Informasi Publik Terpadu
 * (Konsol Dialog Responsif, Kanal WhatsApp, Hotline Telepon, Email & Geolokasi Kantor)
 * Didesain murni simbolik vektor tanpa teks dan tanpa SP4N-LAPOR.
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
        className="w-full h-auto max-w-[460px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] select-none"
      >
        <SharedSvgDefs idPrefix={p} />

        {/* Glow Latar Belakang */}
        <circle cx="240" cy="180" r="145" fill={`url(#${p}-glow)`} />

        {/* Gelombang Frekuensi Komunikasi Melingkar */}
        <g stroke="#ffffff" strokeOpacity="0.05" strokeDasharray="3 3">
          <circle cx="240" cy="180" r="140" />
          <circle cx="240" cy="180" r="95" stroke="#10b981" strokeOpacity="0.12" />
          <circle cx="240" cy="180" r="50" />
          <line x1="40" y1="180" x2="440" y2="180" />
          <line x1="240" y1="30" x2="240" y2="330" />
        </g>

        {/* Jalur Berkas Energi Dinamis dari Simpul Kanal ke Pusat */}
        <path
          d="M 100 115 C 140 115, 150 140, 175 155"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        <path
          d="M 110 235 C 140 235, 150 215, 175 200"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
        <path
          d="M 380 115 C 340 115, 330 140, 305 155"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 4"
          className="animate-pulse"
        />
        <path
          d="M 370 235 C 340 235, 330 215, 305 200"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />

        {/* ── 1. PUSAT: KONSOL PERANGKAT DIALOG & RESPON CEPAT ────────── */}
        <g transform="translate(175, 80)">
          {/* Rangka Layar / Perangkat Komunikasi */}
          <rect
            width="130"
            height="185"
            rx="22"
            fill="#09090b"
            stroke={`url(#${p}-border-grad)`}
            strokeWidth="1.5"
          />

          {/* Kamera & Speaker Atas */}
          <rect x="50" y="8" width="30" height="3" rx="1.5" fill="#ffffff" fillOpacity="0.2" />
          <circle cx="88" cy="9.5" r="2" fill="#10b981" className="animate-pulse" />

          {/* Area Layar Obrolan Transparan */}
          <rect x="10" y="20" width="110" height="142" rx="14" fill="#ffffff" fillOpacity="0.02" />

          {/* Balon Pesan 1 (Pertanyaan / Masuk - Kiri) */}
          <g transform="translate(18, 36)">
            <rect width="78" height="28" rx="8" fill="#ffffff" fillOpacity="0.06" stroke="#ffffff" strokeOpacity="0.1" />
            <line x1="8" y1="10" x2="68" y2="10" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="18" x2="48" y2="18" stroke="#ffffff" strokeOpacity="0.2" strokeWidth="1.5" strokeLinecap="round" />
          </g>

          {/* Balon Pesan 2 (Tanggapan Resmi IFK - Kanan) */}
          <g transform="translate(34, 74)">
            <rect width="78" height="32" rx="8" fill="#10b981" fillOpacity="0.15" stroke="#10b981" strokeOpacity="0.3" />
            <line x1="8" y1="11" x2="68" y2="11" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
            <line x1="8" y1="19" x2="52" y2="19" stroke="#34d399" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
            {/* Tanda Centang Dua (Read Receipt) */}
            <path d="M 58 24 L 62 27 L 70 20 M 64 24 L 67 27 L 72 21" stroke="#34d399" strokeWidth="1.2" strokeLinecap="round" />
          </g>

          {/* Equalizer Frekuensi Suara / Respon Aktif */}
          <g transform="translate(32, 126)">
            <rect x="0" y="8" width="3" height="12" rx="1.5" fill="#34d399" />
            <rect x="8" y="2" width="3" height="18" rx="1.5" fill="#10b981" />
            <rect x="16" y="5" width="3" height="15" rx="1.5" fill="#38bdf8" />
            <rect x="24" y="0" width="3" height="20" rx="1.5" fill="#34d399" />
            <rect x="32" y="6" width="3" height="14" rx="1.5" fill="#10b981" />
            <rect x="40" y="2" width="3" height="18" rx="1.5" fill="#38bdf8" />
            <rect x="48" y="7" width="3" height="13" rx="1.5" fill="#34d399" />
            <rect x="56" y="10" width="3" height="10" rx="1.5" fill="#10b981" />
            <rect x="64" y="4" width="3" height="16" rx="1.5" fill="#38bdf8" />
          </g>

          {/* Tombol Home Bawah */}
          <circle cx="65" cy="172" r="3" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1" />
        </g>

        {/* ── 2. SIMPUL KANAL 1: WHATSAPP PELAYANAN (KIRI ATAS) ──────── */}
        <g transform="translate(80, 95)">
          {/* Cincin Luar Berdenyut */}
          <circle cx="0" cy="0" r="28" fill={`url(#${p}-card-bg)`} stroke="#10b981" strokeOpacity="0.4" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="34" stroke="#10b981" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3" />
          {/* Ikon Balon Percakapan WhatsApp */}
          <path
            d="M -7 9 L -6 4 C -9 0, -8 -6, -2 -8 C 5 -10, 11 -6, 11 0 C 11 7, 5 11, 0 10 Z"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Gagang Telepon di Dalam */}
          <path
            d="M -2 -3 C -1 -4, 1 -4, 2 -3 L 4 -1 C 5 0, 5 1, 4 2 C 3 3, 2 4, 1 4 C -2 4, -4 2, -4 -1 C -4 -2, -3 -3, -2 -3 Z"
            fill="#34d399"
          />
        </g>

        {/* ── 3. SIMPUL KANAL 2: TELEPON KANTOR / HOTLINE (KIRI BAWAH) ─── */}
        <g transform="translate(85, 235)">
          <circle cx="0" cy="0" r="24" fill={`url(#${p}-card-bg)`} stroke="#ffffff" strokeOpacity="0.15" strokeWidth="1.2" />
          {/* Gagang Telepon Klasik */}
          <path
            d="M -6 -7 C -4 -9, -1 -9, 1 -7 L 3 -5 C 5 -3, 5 -1, 3 1 L 2 2 C 3 5, 5 7, 8 8 L 9 7 C 11 5, 13 5, 15 7 L 17 9 C 19 11, 19 14, 17 16 C 14 19, 9 18, 4 14 C -2 9, -5 4, -7 0 C -9 -3, -8 -6, -6 -7 Z"
            stroke="#34d399"
            strokeWidth="1.5"
            fill="none"
          />
          {/* Gelombang Suara Siaran */}
          <path d="M 6 -8 C 10 -6, 13 -3, 14 2" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" fill="none" />
          <path d="M 10 -11 C 15 -8, 18 -4, 19 3" stroke="#34d399" strokeWidth="1.2" strokeOpacity="0.5" strokeLinecap="round" fill="none" />
        </g>

        {/* ── 4. SIMPUL KANAL 3: EMAIL RESMI KEDINASAN (KANAN ATAS) ───── */}
        <g transform="translate(390, 95)">
          <circle cx="0" cy="0" r="28" fill={`url(#${p}-card-bg)`} stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1.2" />
          <circle cx="0" cy="0" r="34" stroke="#38bdf8" strokeOpacity="0.15" strokeWidth="1" strokeDasharray="3 3" />
          {/* Amplop Surat Modern */}
          <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#09090b" stroke="#38bdf8" strokeWidth="1.5" />
          <path d="M -14 -8 L 0 3 L 14 -8" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Lencana Notifikasi Pesan Baru */}
          <circle cx="12" cy="-10" r="4.5" fill="#10b981" />
        </g>

        {/* ── 5. SIMPUL KANAL 4: GEOLOKASI KANTOR IFK (KANAN BAWAH) ───── */}
        <g transform="translate(385, 235)">
          <circle cx="0" cy="0" r="24" fill={`url(#${p}-card-bg)`} stroke="#ffffff" strokeOpacity="0.15" strokeWidth="1.2" />
          {/* Pin Lokasi Geografis */}
          <path
            d="M 0 -9 C -6 -9, -9 -5, -9 1 C -9 6, 0 13, 0 13 C 0 13, 9 6, 9 1 C 9 -5, 6 -9, 0 -9 Z"
            stroke="#10b981"
            strokeWidth="1.5"
            fill="none"
          />
          <circle cx="0" cy="0" r="3" fill="#34d399" />
          {/* Cincin Radar Target */}
          <circle cx="0" cy="0" r="14" stroke="#10b981" strokeWidth="1" strokeDasharray="2 2" opacity="0.4" />
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
          {/* Header Publikasi & Kategori Simbolik */}
          <rect x="20" y="20" width="38" height="14" rx="4" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeOpacity="0.4" />
          <line x1="28" y1="27" x2="48" y2="27" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
          <circle cx="145" cy="27" r="4" fill="#38bdf8" />

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
