/**
 * Sanitasi HTML ringan tanpa dependensi eksternal (zero-dep) untuk TipTap rich text.
 * Menghapus tag script, iframe, object, embed, style, event handler inline, dan protokol URL berbahaya.
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== "string") return "";

  // 1. Hapus tag berpasangan yang berbahaya beserta seluruh isinya: script, iframe, object, embed, style
  let clean = html.replace(
    /<\s*(script|iframe|object|embed|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi,
    ""
  );

  // 2. Hapus self-closing atau unclosed dangerous tags
  clean = clean.replace(
    /<\s*(script|iframe|object|embed|style)[^>]*\/?>/gi,
    ""
  );

  // 3. Hapus inline event handlers (on*, seperti onload, onerror, onclick, onmouseover, dll.)
  clean = clean.replace(/\s+on[a-z0-9_-]+\s*=\s*(["'][^"']*["']|[^\s>]+)/gi, "");

  // 4. Hapus URL protokol berbahaya pada href, src, formaction, action (javascript:, vbscript:, data:text/html)
  clean = clean.replace(
    /(href|src|formaction|action)\s*=\s*(["'])\s*(javascript|data|vbscript):[^"']*\2/gi,
    '$1="#"'
  );

  return clean;
}
