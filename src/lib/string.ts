/**
 * Utilitas string untuk membersihkan markup HTML dan mengekstrak cuplikan teks
 * yang aman digunakan pada tag meta description, OpenGraph, maupun Twitter Card.
 */
export function stripHtmlAndTruncate(
  content: string | null | undefined,
  maxLength: number = 160
): string {
  if (!content || typeof content !== "string") {
    return "";
  }

  // 1. Ganti tag block/pemisah (p, br, h1-h6, div, li) dengan spasi agar teks tidak menempel
  let text = content
    .replace(/<\/(p|div|h[1-6]|li|tr)>/gi, " ")
    .replace(/<(br|hr)\s*\/?>/gi, " ")
    // 2. Hapus seluruh tag HTML lainnya
    .replace(/<[^>]*>/g, " ");

  // 3. Decode entitas HTML umum
  text = text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");

  // 4. Hapus spasi sebelum tanda baca yang tercipta akibat pembersihan tag inline
  text = text.replace(/\s+([.,;:!?])/g, "$1");

  // 5. Normalisasi spasi dan baris baru
  text = text.replace(/\s+/g, " ").trim();

  if (!text) {
    return "";
  }

  // 6. Potong teks jika melebihi panjang maksimum
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(" ");

  // Hindari memotong kata di tengah jika posisi spasi terakhir masih wajar (>60% dari batas)
  if (lastSpace > maxLength * 0.6) {
    return `${truncated.slice(0, lastSpace)}...`;
  }

  return `${truncated}...`;
}
