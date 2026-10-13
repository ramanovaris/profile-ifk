#!/usr/bin/env bash
# ==============================================================================
# Script: backup-db.sh
# Deskripsi: Utilitas pencadangan basis data PostgreSQL mandiri dan terkompresi
#            disertai rotasi pembersihan arsip lama untuk sistem Profile IFK Kotabaru.
# ==============================================================================

set -euo pipefail

# 1. Resolusi direktori root proyek
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# 2. Pemuatan variabel lingkungan dari .env jika belum tersedia
if [ -z "${DATABASE_URL:-}" ] && [ -f "$PROJECT_ROOT/.env" ]; then
  DATABASE_URL=$(grep -E '^[[:space:]]*DATABASE_URL=' "$PROJECT_ROOT/.env" | head -n 1 | cut -d '=' -f2- | sed -e 's/^[[:space:]]*["\x27]//' -e 's/["\x27][[:space:]]*$//')
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "Error: Variabel DATABASE_URL tidak ditemukan pada berkas .env atau environment." >&2
  exit 1
fi

# 3. Pembersihan query parameter Prisma (seperti ?schema=public) agar kompatibel dengan pg_dump
CLEAN_DB_URL=$(echo "$DATABASE_URL" | sed -E 's/([?&])schema=[^&]*(&?)/\1/g; s/\?&/?/g; s/[?&]$//')

# 4. Validasi ketersediaan perkakas CLI
if ! command -v pg_dump >/dev/null 2>&1; then
  echo "Error: Perintah 'pg_dump' tidak ditemukan di sistem. Harap instal postgresql-client." >&2
  exit 1
fi

if ! command -v gzip >/dev/null 2>&1; then
  echo "Error: Perintah 'gzip' tidak ditemukan di sistem." >&2
  exit 1
fi

# 5. Konfigurasi folder cadangan dan masa retensi (default 7 hari)
BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/profile_ifk_backup_${TIMESTAMP}.sql.gz"

echo "=============================================================================="
echo " [1/2] Memulai Pencadangan Basis Data Profile IFK Kotabaru"
echo "=============================================================================="
echo " Waktu Mulai : $(date +'%Y-%m-%d %H:%M:%S')"
echo " Direktori   : $BACKUP_DIR"
echo " Berkas      : $(basename "$BACKUP_FILE")"

# 6. Eksekusi pencadangan pg_dump yang dialirkan ke gzip
if pg_dump "$CLEAN_DB_URL" --no-owner --no-privileges | gzip -c > "$BACKUP_FILE"; then
  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo " Status      : SUKSES (Ukuran: $FILE_SIZE)"
else
  echo " Status      : GAGAL mengekspor basis data!" >&2
  rm -f "$BACKUP_FILE"
  exit 1
fi

echo ""
echo "=============================================================================="
echo " [2/2] Pemeriksaan Rotasi Arsip Cadangan (Retensi: $RETENTION_DAYS Hari)"
echo "=============================================================================="

# 7. Pembersihan arsip cadangan yang melampaui batas hari retensi
OLD_FILES=$(find "$BACKUP_DIR" -maxdepth 1 -name "profile_ifk_backup_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" || true)

if [ -n "$OLD_FILES" ]; then
  COUNT_DELETED=$(echo "$OLD_FILES" | wc -l)
  echo " Menghapus $COUNT_DELETED berkas cadangan lama (> $RETENTION_DAYS hari):"
  echo "$OLD_FILES" | sed 's/^/   - /'
  find "$BACKUP_DIR" -maxdepth 1 -name "profile_ifk_backup_*.sql.gz" -type f -mtime +"$RETENTION_DAYS" -delete
else
  echo " Tidak ada berkas cadangan lama yang melampaui batas $RETENTION_DAYS hari."
fi

TOTAL_BACKUPS=$(find "$BACKUP_DIR" -maxdepth 1 -name "profile_ifk_backup_*.sql.gz" -type f | wc -l)
echo " Total arsip tersimpan saat ini: $TOTAL_BACKUPS berkas"
echo " Waktu Selesai: $(date +'%Y-%m-%d %H:%M:%S')"
echo "=============================================================================="
