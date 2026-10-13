#!/usr/bin/env bash
# ==============================================================================
# Script: restore-db.sh
# Deskripsi: Utilitas pemulihan (restore) basis data interaktif dan aman
#            untuk sistem Profile IFK Kotabaru.
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

# 3. Pembersihan query parameter Prisma agar kompatibel dengan psql
CLEAN_DB_URL=$(echo "$DATABASE_URL" | sed -E 's/([?&])schema=[^&]*(&?)/\1/g; s/\?&/?/g; s/[?&]$//')

# 4. Validasi ketersediaan perkakas CLI
if ! command -v psql >/dev/null 2>&1; then
  echo "Error: Perintah 'psql' tidak ditemukan di sistem. Harap instal postgresql-client." >&2
  exit 1
fi

if ! command -v gzip >/dev/null 2>&1; then
  echo "Error: Perintah 'gzip' tidak ditemukan di sistem." >&2
  exit 1
fi

BACKUP_DIR="${BACKUP_DIR:-$PROJECT_ROOT/backups}"
TARGET_FILE=""

# 5. Penentuan berkas target (dari argumen baris perintah atau pemilihan interaktif)
if [ "${1:-}" != "" ]; then
  if [ -f "$1" ]; then
    TARGET_FILE="$1"
  elif [ -f "$BACKUP_DIR/$1" ]; then
    TARGET_FILE="$BACKUP_DIR/$1"
  else
    echo "Error: Berkas cadangan '$1' tidak ditemukan." >&2
    exit 1
  fi
else
  # Mode interaktif: periksa ketersediaan berkas di direktori backups
  if [ ! -d "$BACKUP_DIR" ]; then
    echo "Error: Direktori cadangan '$BACKUP_DIR' belum dibuat atau tidak ditemukan." >&2
    exit 1
  fi

  # Kumpulkan daftar berkas cadangan (terbaru di atas)
  mapfile -t BACKUP_FILES < <(find "$BACKUP_DIR" -maxdepth 1 -name "profile_ifk_backup_*.sql.gz" -type f | sort -r)

  TOTAL_FILES="${#BACKUP_FILES[@]}"
  if [ "$TOTAL_FILES" -eq 0 ]; then
    echo "Tidak ditemukan berkas cadangan ('profile_ifk_backup_*.sql.gz') di direktori: $BACKUP_DIR"
    exit 1
  fi

  echo "=============================================================================="
  echo " Daftar Berkas Cadangan Tersedia di: $BACKUP_DIR"
  echo "=============================================================================="
  for i in "${!BACKUP_FILES[@]}"; do
    FILE_PATH="${BACKUP_FILES[$i]}"
    FILE_NAME=$(basename "$FILE_PATH")
    FILE_SIZE=$(du -h "$FILE_PATH" | cut -f1)
    FILE_MOD=$(date -r "$FILE_PATH" +"%Y-%m-%d %H:%M:%S" 2>/dev/null || stat -c "%y" "$FILE_PATH" 2>/dev/null | cut -d'.' -f1)
    printf " [%2d] %s (%s | %s)\n" "$((i + 1))" "$FILE_NAME" "$FILE_SIZE" "$FILE_MOD"
  done
  echo "=============================================================================="

  # Prompt pilihan berkas
  if [ -n "${CHOSEN_BACKUP_INDEX:-}" ]; then
    CHOICE="$CHOSEN_BACKUP_INDEX"
  else
    read -r -p "Pilih nomor berkas yang ingin dipulihkan (1-$TOTAL_FILES) atau 'q' untuk batal: " CHOICE
  fi

  if [ "$CHOICE" = "q" ] || [ "$CHOICE" = "Q" ]; then
    echo "Operasi dibatalkan oleh pengguna."
    exit 0
  fi

  # Validasi input angka
  if ! [[ "$CHOICE" =~ ^[0-9]+$ ]] || [ "$CHOICE" -lt 1 ] || [ "$CHOICE" -gt "$TOTAL_FILES" ]; then
    echo "Pilihan tidak valid ($CHOICE). Operasi dibatalkan." >&2
    exit 1
  fi

  INDEX=$((CHOICE - 1))
  TARGET_FILE="${BACKUP_FILES[$INDEX]}"
fi

# 6. Validasi integritas berkas cadangan sebelum melakukan restore
echo ""
echo "Memverifikasi integritas berkas cadangan: $(basename "$TARGET_FILE")..."
if ! gzip -t "$TARGET_FILE" 2>/dev/null; then
  echo "Error: Berkas cadangan rusak atau tidak valid (gagal validasi gzip)!" >&2
  exit 1
fi
echo "Integritas berkas valid."

# 7. Perlindungan Keamanan: Konfirmasi Eksplisit Sebelum Menimpa Data
echo ""
echo "******************************************************************************"
echo "                           PERINGATAN KEAMANAN                                "
echo "******************************************************************************"
echo " Anda akan memulihkan basis data aktif menggunakan berkas cadangan berikut:"
echo " -> Berkas : $TARGET_FILE"
echo " -> Ukuran : $(du -h "$TARGET_FILE" | cut -f1)"
echo ""
echo " PERHATIAN: Seluruh perubahan data saat ini akan DITIMPA oleh data dari berkas!"
echo "******************************************************************************"

if [ -n "${CONFIRM_RESTORE:-}" ]; then
  CONFIRM="$CONFIRM_RESTORE"
else
  read -r -p "Ketik 'YES' (huruf besar) untuk melanjutkan pemulihan: " CONFIRM
fi

if [ "$CONFIRM" != "YES" ]; then
  echo "Konfirmasi tidak sesuai ('$CONFIRM'). Proses pemulihan DIBATALKAN dengan aman."
  exit 0
fi

# 8. Eksekusi pemulihan
echo ""
echo "Memulai proses pemulihan ke basis data..."
START_TIME=$(date +%s)

if gunzip -c "$TARGET_FILE" | psql "$CLEAN_DB_URL" --quiet > /dev/null; then
  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))
  echo "=============================================================================="
  echo " STATUS: SUKSES! Basis data berhasil dipulihkan dalam ${DURATION} detik."
  echo " Waktu Selesai: $(date +'%Y-%m-%d %H:%M:%S')"
  echo "=============================================================================="
else
  echo "=============================================================================="
  echo " STATUS: GAGAL memulihkan basis data!" >&2
  echo "=============================================================================="
  exit 1
fi
