// ── Inline SVG Placeholder Generator ──────────────────────────────────────────
//
// picsum.photos sering down (HTTP 522 / rate-limit). Untuk data dummy yang
// tidak butuh foto realistis, gunakan inline SVG data URI — tidak ada network
// call, instant render, dan tahan lama.
//
// Return: data URI string siap pakai untuk <Image src="..."> atau <img src="...">

type Category = "Kegiatan" | "Informasi" | "Sosialisasi" | "Profil" | "Layanan";

const PALETTE: Record<Category, { from: string; to: string; accent: string }> = {
  Kegiatan:     { from: "#0f4d35", to: "#1a6b4a", accent: "#86efac" },
  Informasi:    { from: "#1e3a5f", to: "#2d4f7c", accent: "#93c5fd" },
  Sosialisasi:  { from: "#5c2d6e", to: "#7c3a8e", accent: "#d8b4fe" },
  Profil:       { from: "#3d2914", to: "#5c3d1f", accent: "#fcd34d" },
  Layanan:      { from: "#0f4d35", to: "#1a6b4a", accent: "#86efac" },
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function placeholderImage(
  width: number,
  height: number,
  label: string,
  category: Category = "Kegiatan",
): string {
  const { from, to, accent } = PALETTE[category];
  const safeLabel = escapeXml(label);
  // Bungkus label panjang jadi 2 baris (maks ~22 char per baris)
  const words = label.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const w of words) {
    if ((current + " " + w).trim().length > 22) {
      if (current) lines.push(current);
      current = w;
    } else {
      current = (current + " " + w).trim();
    }
  }
  if (current) lines.push(current);
  const maxLines = 2;
  const truncated = lines.slice(0, maxLines);
  if (lines.length > maxLines) {
    truncated[maxLines - 1] = truncated[maxLines - 1].replace(/.{3}$/, "…");
  }

  const lineHeight = Math.round(height * 0.085);
  const startY = height / 2 - ((truncated.length - 1) * lineHeight) / 2 + lineHeight * 0.35;
  const tspans = truncated
    .map((ln, i) => `<tspan x="${width / 2}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(ln)}</tspan>`)
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="r" cx="0.3" cy="0.3" r="0.8">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <rect width="${width}" height="${height}" fill="url(#r)"/>
  <g fill="${accent}" opacity="0.08">
    <circle cx="${width * 0.15}" cy="${height * 0.2}" r="${Math.min(width, height) * 0.25}"/>
    <circle cx="${width * 0.85}" cy="${height * 0.8}" r="${Math.min(width, height) * 0.3}"/>
  </g>
  <text x="${width / 2}" y="${startY}" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="${Math.round(Math.min(width, height) * 0.075)}" font-weight="600" fill="#ffffff" letter-spacing="-0.02em">${tspans}</text>
  <text x="${width / 2}" y="${height * 0.92}" text-anchor="middle" font-family="system-ui, sans-serif" font-size="${Math.round(Math.min(width, height) * 0.035)}" font-weight="500" fill="${accent}" letter-spacing="0.2em" opacity="0.7">${category.toUpperCase()}</text>
</svg>`;

  // base64 encode agar aman untuk semua browser
  const base64 = Buffer.from(svg, "utf-8").toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
}
