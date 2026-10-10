#!/usr/bin/env bash
# ==============================================================================
# Script: verify-database-backup.sh
# Deskripsi: Skrip pengujian otomatis end-to-end untuk memastikan fungsi
#            pencadangan, integritas kompresi gzip, dan rotasi retensi berjalan 100%.
# ==============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
TEST_BACKUP_DIR="$PROJECT_ROOT/backups_test"

echo "=============================================================================="
echo " [TEST SUITE] Verifikasi Otomatis Pencadangan & Rotasi Basis Data (#115)"
echo "=============================================================================="

# 1. Bersihkan lingkungan uji coba
rm -rf "$TEST_BACKUP_DIR"
mkdir -p "$TEST_BACKUP_DIR"

# ------------------------------------------------------------------------------
# Test 1: Eksekusi Pencadangan Mandiri
# ------------------------------------------------------------------------------
echo ">> [Test 1] Menjalankan pencadangan ke direktori pengujian terisolasi..."
if ! BACKUP_DIR="$TEST_BACKUP_DIR" bash "$SCRIPT_DIR/backup-db.sh" > /dev/null; then
  echo "FAIL: Eksekusi backup-db.sh gagal!" >&2
  exit 1
fi

GENERATED_BACKUP=$(find "$TEST_BACKUP_DIR" -maxdepth 1 -name "profile_ifk_backup_*.sql.gz" -type f | head -n 1)
if [ -z "$GENERATED_BACKUP" ] || [ ! -f "$GENERATED_BACKUP" ]; then
  echo "FAIL: Berkas cadangan tidak ditemukan di $TEST_BACKUP_DIR" >&2
  exit 1
fi
echo "PASS: Berkas cadangan berhasil dibuat: $(basename "$GENERATED_BACKUP")"

# ------------------------------------------------------------------------------
# Test 2: Validasi Integritas Berkas Gzip
# ------------------------------------------------------------------------------
echo ">> [Test 2] Memeriksa integritas berkas cadangan via gzip -t..."
if ! gzip -t "$GENERATED_BACKUP"; then
  echo "FAIL: Berkas cadangan korup atau gagal verifikasi gzip!" >&2
  exit 1
fi
echo "PASS: Integritas berkas kompresi valid 100%."

# ------------------------------------------------------------------------------
# Test 3: Simulasi Rotasi & Pembersihan Arsip Lama (> 7 Hari)
# ------------------------------------------------------------------------------
echo ">> [Test 3] Menguji logika pembersihan rotasi arsip lama..."
DUMMY_OLD_BACKUP="$TEST_BACKUP_DIR/profile_ifk_backup_20260901_000000.sql.gz"
touch -d "10 days ago" "$DUMMY_OLD_BACKUP"

if [ ! -f "$DUMMY_OLD_BACKUP" ]; then
  echo "FAIL: Gagal membuat berkas simulasi cadangan lama." >&2
  exit 1
fi

# Jalankan skrip pencadangan kembali dengan retensi 7 hari
BACKUP_DIR="$TEST_BACKUP_DIR" RETENTION_DAYS=7 bash "$SCRIPT_DIR/backup-db.sh" > /dev/null

if [ -f "$DUMMY_OLD_BACKUP" ]; then
  echo "FAIL: Berkas lama (> 7 hari) tidak terhapus oleh mekanisme rotasi!" >&2
  exit 1
fi

REMAINING_COUNT=$(find "$TEST_BACKUP_DIR" -maxdepth 1 -name "profile_ifk_backup_*.sql.gz" -type f | wc -l)
if [ "$REMAINING_COUNT" -lt 1 ]; then
  echo "FAIL: Berkas cadangan baru ikut terhapus secara tidak sengaja!" >&2
  exit 1
fi
echo "PASS: Logika rotasi sukses. Berkas usang terhapus dan berkas baru tetap terjaga."

# ------------------------------------------------------------------------------
# Test 4: Verifikasi Perlindungan Keamanan Skrip Restore (Abort on non-YES)
# ------------------------------------------------------------------------------
echo ">> [Test 4] Menguji proteksi keselamatan skrip pemulihan (restore fail-safe)..."
ABORT_OUTPUT=$(CONFIRM_RESTORE="NO" bash "$SCRIPT_DIR/restore-db.sh" "$GENERATED_BACKUP" 2>&1 || true)
if ! echo "$ABORT_OUTPUT" | grep -q "DIBATALKAN"; then
  echo "FAIL: Skrip restore tidak membatalkan proses saat konfirmasi bukan YES!" >&2
  echo "Output: $ABORT_OUTPUT" >&2
  exit 1
fi
echo "PASS: Proteksi pembatalan restore bekerja dengan aman."

# ------------------------------------------------------------------------------
# Test 5: Pembersihan Lingkungan Uji Coba
# ------------------------------------------------------------------------------
echo ">> [Test 5] Membersihkan direktori pengujian..."
rm -rf "$TEST_BACKUP_DIR"
echo "PASS: Direktori pengujian dibersihkan dengan sempurna."

echo "=============================================================================="
echo " SELURUH PENGUJIAN OTOMATISASI PENCADANGAN LULUS 100% (5/5 PASS) ✅"
echo "=============================================================================="
