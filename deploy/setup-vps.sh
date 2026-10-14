#!/usr/bin/env bash

# ==============================================================================
# Script Otomasi Provisioning & Setup VPS Ubuntu (Next.js Standalone + PM2 + Nginx)
# Portal Profil & Logistik Farmasi UPTD IFK Kotabaru
# ==============================================================================

set -euo pipefail

# Pewarnaan Output Terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[PERINGATAN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

# Direktori Proyek
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

# Deteksi Hak Akses Sudo / Root
SUDO=""
if [ "$(id -u)" -ne 0 ]; then
    if command -v sudo >/dev/null 2>&1; then
        SUDO="sudo"
    else
        log_error "Skrip ini memerlukan hak akses root atau sudo. Silakan jalankan dengan sudo."
        exit 1
    fi
fi

# Banner
echo -e "${CYAN}===================================================================${NC}"
echo -e "${CYAN}  Otomatisasi Provisioning & Deployment VPS UPTD IFK Kotabaru     ${NC}"
echo -e "${CYAN}===================================================================${NC}"
log_info "Lokasi aplikasi: ${APP_DIR}"

# 1. Konfigurasi Variabel (Bisa di-override lewat ENV)
DOMAIN_NAME="${DOMAIN_NAME:-}"
DB_NAME="${DB_NAME:-profile_ifk}"
DB_USER="${DB_USER:-ifk_user}"
DB_PASSWORD="${DB_PASSWORD:-}"
APP_PORT="${APP_PORT:-3000}"
SETUP_SSL="${SETUP_SSL:-auto}"
RUN_SEED="${RUN_SEED:-true}"

# Interaktif jika dijalankan manual dan DOMAIN_NAME belum diset
if [ -z "$DOMAIN_NAME" ]; then
    if [ -t 0 ]; then
        echo -e "\n${YELLOW}Konfigurasi Domain / Alamat IP:${NC}"
        read -rp "Masukkan Domain (contoh: ifk.kotabarukab.go.id atau tekan Enter untuk IP publik): " INPUT_DOMAIN
        if [ -n "$INPUT_DOMAIN" ]; then
            DOMAIN_NAME="$INPUT_DOMAIN"
        fi
    fi
fi

# Fallback ke IP Publik jika domain tetap kosong
if [ -z "$DOMAIN_NAME" ]; then
    PUBLIC_IP="$(curl -s --max-time 5 ifconfig.me || curl -s --max-time 5 icanhazip.com || echo "localhost")"
    DOMAIN_NAME="$PUBLIC_IP"
    log_warn "Domain tidak ditentukan. Menggunakan alamat: ${DOMAIN_NAME}"
fi

# Buat kata sandi database acak jika belum ada
if [ -z "$DB_PASSWORD" ]; then
    if command -v openssl >/dev/null 2>&1; then
        DB_PASSWORD="$(openssl rand -hex 16)"
    else
        DB_PASSWORD="ifk_$(date +%s)_$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 12)"
    fi
fi

log_info "Domain: ${DOMAIN_NAME}"
log_info "Database: ${DB_NAME} (User: ${DB_USER})"
log_info "Port Internal: ${APP_PORT}"

# 2. Update Sistem & Instalasi Paket Dasar
log_info "Memperbarui paket repositori sistem Ubuntu..."
$SUDO apt-get update -y
$SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y \
    curl \
    git \
    ufw \
    openssl \
    nginx \
    postgresql \
    postgresql-contrib \
    certbot \
    python3-certbot-nginx

# 3. Instalasi Node.js 20 LTS (Jika belum terpasang atau versi lama)
NEED_NODE_INSTALL=true
if command -v node >/dev/null 2>&1; then
    NODE_MAJOR="$(node -v | cut -d'v' -f2 | cut -d'.' -f1)"
    if [ "$NODE_MAJOR" -ge 20 ]; then
        log_success "Node.js sudah terpasang: $(node -v)"
        NEED_NODE_INSTALL=false
    fi
fi

if [ "$NEED_NODE_INSTALL" = true ]; then
    log_info "Memasang Node.js 20 LTS via NodeSource..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | $SUDO -E bash -
    $SUDO DEBIAN_FRONTEND=noninteractive apt-get install -y nodejs
    log_success "Node.js berhasil dipasang: $(node -v) (npm $(npm -v))"
fi

# 4. Instalasi PM2 Process Manager
if ! command -v pm2 >/dev/null 2>&1; then
    log_info "Memasang PM2 secara global..."
    $SUDO npm install -g pm2
    log_success "PM2 berhasil dipasang: $(pm2 -v)"
else
    log_success "PM2 sudah terpasang: $(pm2 -v)"
fi

# 5. Konfigurasi Basis Data PostgreSQL
log_info "Mengonfigurasi basis data PostgreSQL..."
$SUDO systemctl enable --now postgresql

# Buat user postgres jika belum ada, atau sinkronkan password
USER_EXISTS="$($SUDO -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" || true)"
if [ "$USER_EXISTS" != "1" ]; then
    log_info "Membuat user PostgreSQL: ${DB_USER}..."
    $SUDO -u postgres psql -c "CREATE USER \"${DB_USER}\" WITH PASSWORD '${DB_PASSWORD}';"
else
    log_info "Memperbarui kata sandi user PostgreSQL: ${DB_USER}..."
    $SUDO -u postgres psql -c "ALTER USER \"${DB_USER}\" WITH PASSWORD '${DB_PASSWORD}';"
fi

# Buat database jika belum ada
DB_EXISTS="$($SUDO -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" || true)"
if [ "$DB_EXISTS" != "1" ]; then
    log_info "Membuat database: ${DB_NAME}..."
    $SUDO -u postgres psql -c "CREATE DATABASE \"${DB_NAME}\" OWNER \"${DB_USER}\";"
else
    log_info "Database ${DB_NAME} sudah tersedia."
fi

# Berikan hak akses skema
$SUDO -u postgres psql -d "${DB_NAME}" -c "GRANT ALL ON SCHEMA public TO \"${DB_USER}\";" >/dev/null 2>&1 || true
$SUDO -u postgres psql -d "${DB_NAME}" -c "ALTER SCHEMA public OWNER TO \"${DB_USER}\";" >/dev/null 2>&1 || true
log_success "PostgreSQL siap digunakan."

# 6. Konfigurasi Environment File (.env)
log_info "Menyiapkan berkas lingkungan .env produksi..."
DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@localhost:5432/${DB_NAME}?schema=public"

if [ -f "${APP_DIR}/.env" ]; then
    cp "${APP_DIR}/.env" "${APP_DIR}/.env.backup-$(date +%s)"
    log_warn "Berkas .env lama dicadangkan ke .env.backup-*"
fi

cat > "${APP_DIR}/.env" <<EOF
# Konfigurasi Lingkungan Produksi UPTD IFK Kotabaru
# Dihasilkan otomatis oleh deploy/setup-vps.sh pada $(date)

NEXT_PUBLIC_BASE_PATH=""
DATABASE_URL="${DATABASE_URL}"
PORT=${APP_PORT}
NODE_ENV="production"
EOF

chmod 600 "${APP_DIR}/.env"
log_success "Berkas .env berhasil dibuat."

# 7. Build Aplikasi Standalone Next.js
cd "${APP_DIR}"
mkdir -p "${APP_DIR}/logs"

log_info "Memasang dependensi proyek (npm install)..."
npm install --prefer-offline --no-audit

log_info "Menjalankan migrasi skema basis data Prisma..."
npx prisma generate
npx prisma db push --skip-generate

if [ "${RUN_SEED}" = "true" ]; then
    log_info "Menjalankan seeder awal data operasional..."
    npm run prisma:seed || log_warn "Seeder dilewati atau menghasilkan peringatan."
fi

log_info "Melakukan build Next.js mode standalone..."
npm run build

# Standalone Next.js memerlukan static assets & public folder disalin ke .next/standalone
log_info "Menyiapkan aset folder standalone..."
if [ -d "${APP_DIR}/.next/standalone" ]; then
    mkdir -p "${APP_DIR}/.next/standalone/.next"
    cp -r "${APP_DIR}/public" "${APP_DIR}/.next/standalone/"
    cp -r "${APP_DIR}/.next/static" "${APP_DIR}/.next/standalone/.next/"
    log_success "Aset standalone Next.js siap."
else
    log_error "Direktori .next/standalone tidak ditemukan. Periksa konfigurasi output standalone di next.config.ts."
    exit 1
fi

# 8. Konfigurasi & Jalankan PM2
log_info "Mendaftarkan aplikasi ke PM2..."
pm2 delete profile-ifk >/dev/null 2>&1 || true
PORT="${APP_PORT}" pm2 start deploy/ecosystem.config.cjs
pm2 save

# Setup PM2 Startup Systemd
STARTUP_CMD="$(pm2 startup systemd -u "$(whoami)" --hp "$HOME" | grep "sudo" || true)"
if [ -n "$STARTUP_CMD" ]; then
    eval "$STARTUP_CMD" >/dev/null 2>&1 || true
fi
log_success "PM2 berhasil mengelola proses aplikasi."

# 9. Konfigurasi Nginx
log_info "Mengonfigurasi virtual host Nginx..."
NGINX_CONF_TMP="/tmp/nginx-profile-ifk.conf"
sed -e "s|{{DOMAIN_NAME}}|${DOMAIN_NAME}|g" \
    -e "s|{{APP_DIR}}|${APP_DIR}|g" \
    -e "s|{{APP_PORT}}|${APP_PORT}|g" \
    "${APP_DIR}/deploy/nginx-profile-ifk.conf" > "${NGINX_CONF_TMP}"

$SUDO cp "${NGINX_CONF_TMP}" /etc/nginx/sites-available/profile-ifk
$SUDO ln -sf /etc/nginx/sites-available/profile-ifk /etc/nginx/sites-enabled/profile-ifk

# Nonaktifkan default site jika ada
if [ -f /etc/nginx/sites-enabled/default ]; then
    $SUDO rm -f /etc/nginx/sites-enabled/default
fi

$SUDO nginx -t
$SUDO systemctl reload nginx
log_success "Virtual host Nginx aktif."

# 10. Konfigurasi Firewall UFW
log_info "Mengaktifkan firewall UFW..."
$SUDO ufw allow OpenSSH >/dev/null 2>&1 || true
$SUDO ufw allow 'Nginx Full' >/dev/null 2>&1 || true
echo "y" | $SUDO ufw enable >/dev/null 2>&1 || true
log_success "Firewall UFW aktif (Port SSH, HTTP, dan HTTPS terbuka)."

# 11. Pemasangan Sertifikat SSL Let's Encrypt (Opsional/Auto)
IS_IP=false
if [[ "$DOMAIN_NAME" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || [ "$DOMAIN_NAME" = "localhost" ]; then
    IS_IP=true
fi

if [ "$SETUP_SSL" = "true" ] || { [ "$SETUP_SSL" = "auto" ] && [ "$IS_IP" = false ]; }; then
    log_info "Mendaftarkan sertifikat SSL Let's Encrypt untuk ${DOMAIN_NAME}..."
    $SUDO certbot --nginx -d "${DOMAIN_NAME}" --non-interactive --agree-tos --register-unsafely-without-email --redirect || {
        log_warn "Pendaftaran SSL otomatis belum berhasil (pastikan DNS domain sudah mengarah ke IP VPS ini)."
    }
else
    log_info "Pemasangan SSL otomatis dilewati (domain berupa IP atau localhost)."
fi

# 12. Penjadwalan Backup Database Harian (Cron)
log_info "Menjadwalkan otomatisasi backup database harian (02.00 WITA)..."
CRON_CMD="0 18 * * * /bin/bash ${APP_DIR}/scripts/backup-db.sh >> ${APP_DIR}/logs/cron-backup.log 2>&1"
CURRENT_CRON="$(crontab -l 2>/dev/null || true)"
if ! echo "$CURRENT_CRON" | grep -q "${APP_DIR}/scripts/backup-db.sh"; then
    (echo "$CURRENT_CRON"; echo "$CRON_CMD") | crontab -
    log_success "Cronjob backup database terpasang."
else
    log_success "Cronjob backup database sudah ada di crontab."
fi

# 13. Ringkasan Akhir
echo -e "\n${GREEN}===================================================================${NC}"
echo -e "${GREEN}   DEPLOYMENT SELESAI & SERVER PRODUKSI BERJALAN AKTIF!           ${NC}"
echo -e "${GREEN}===================================================================${NC}"
echo -e "Aplikasi dapat diakses melalui: ${CYAN}http://${DOMAIN_NAME}/${NC}"
echo -e "Status PM2:"
pm2 status profile-ifk
echo -e "\nCatatan Operasional:"
echo -e "1. Informasi database disimpan di: ${APP_DIR}/.env"
echo -e "2. Log aplikasi tersimpan di: ${APP_DIR}/logs/"
echo -e "3. Log Nginx: /var/log/nginx/error.log"
echo -e "4. Skrip backup database aktif setiap hari pukul 02.00 WITA."
echo -e "${GREEN}===================================================================${NC}\n"
