import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ GAGAL: ${message}`);
    process.exit(1);
  }
  console.log(`✅ LULUS: ${message}`);
}

const ROOT_DIR = path.resolve(__dirname, "..");
const DEPLOY_DIR = path.join(ROOT_DIR, "deploy");

console.log("=== Verifikasi Artefak Deployment VPS Produksi ===");

// 1. Uji Keberadaan Berkas
const requiredFiles = [
  "deploy/setup-vps.sh",
  "deploy/ecosystem.config.cjs",
  "deploy/nginx-profile-ifk.conf",
  "deploy/README.md",
  "docs/superpowers/specs/2026-10-13-vps-production-deployment-automation-design.md",
  "docs/superpowers/plans/2026-10-13-vps-production-deployment-automation.md",
];

for (const relPath of requiredFiles) {
  const fullPath = path.join(ROOT_DIR, relPath);
  assert(fs.existsSync(fullPath), `Berkas wajib ${relPath} ditemukan`);
}

// 2. Uji Izin Eksekusi Skrip Bash
const scriptPath = path.join(DEPLOY_DIR, "setup-vps.sh");
const stats = fs.statSync(scriptPath);
const isExecutable = (stats.mode & 0o111) !== 0;
assert(isExecutable, "deploy/setup-vps.sh memiliki izin eksekusi (chmod +x)");

// 3. Uji Sintaksis Bash (bash -n)
try {
  execSync(`bash -n "${scriptPath}"`, { stdio: "pipe" });
  assert(true, "Sintaks deploy/setup-vps.sh valid (bash -n lolos)");
} catch (err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  assert(false, `Sintaks bash deploy/setup-vps.sh tidak valid: ${message}`);
}

// 4. Uji Konten & Logika Kritis deploy/setup-vps.sh
const scriptContent = fs.readFileSync(scriptPath, "utf-8");
const criticalKeywords = [
  "set -euo pipefail",
  "DOMAIN_NAME",
  "DB_NAME",
  "DB_USER",
  "DB_PASSWORD",
  "APP_PORT",
  "postgresql",
  "npm install",
  "npx prisma db push",
  "npm run build",
  ".next/standalone",
  "pm2 start deploy/ecosystem.config.cjs",
  "nginx -t",
  "ufw allow",
  "certbot",
  "backup-db.sh",
];

for (const kw of criticalKeywords) {
  assert(scriptContent.includes(kw), `Kata kunci wajib '${kw}' tersedia dalam deploy/setup-vps.sh`);
}

// 5. Uji Konfigurasi PM2 deploy/ecosystem.config.cjs
const ecosystemPath = path.join(DEPLOY_DIR, "ecosystem.config.cjs");
const ecosystem = require(ecosystemPath);
assert(Array.isArray(ecosystem.apps) && ecosystem.apps.length > 0, "ecosystem.config.cjs mendefinisikan array apps");
const appConfig = ecosystem.apps[0];
assert(appConfig.name === "profile-ifk", "Nama aplikasi PM2 adalah 'profile-ifk'");
assert(appConfig.script.includes("standalone/server.js"), "Script PM2 menargetkan standalone/server.js");
assert(Boolean(appConfig.max_memory_restart), "max_memory_restart dikonfigurasi");

// 6. Uji Template Nginx deploy/nginx-profile-ifk.conf
const nginxConf = fs.readFileSync(path.join(DEPLOY_DIR, "nginx-profile-ifk.conf"), "utf-8");
const requiredNginxPlaceholders = ["{{DOMAIN_NAME}}", "{{APP_DIR}}", "{{APP_PORT}}"];
for (const ph of requiredNginxPlaceholders) {
  assert(nginxConf.includes(ph), `Placeholder ${ph} tersedia dalam template Nginx`);
}
assert(nginxConf.includes("client_max_body_size 15M"), "Nginx mendukung upload 15M");
assert(nginxConf.includes("gzip on"), "Kompresi Gzip aktif");
assert(nginxConf.includes("/_next/static/"), "Cache Next.js static dikonfigurasi");
assert(nginxConf.includes("proxy_pass"), "Reverse proxy upstream dikonfigurasi");

// 7. Uji Panduan deploy/README.md
const readmeContent = fs.readFileSync(path.join(DEPLOY_DIR, "README.md"), "utf-8");
assert(readmeContent.includes("deploy/setup-vps.sh"), "README memuat petunjuk eksekusi setup-vps.sh");
assert(readmeContent.includes("pm2 reload"), "README memuat petunjuk rolling update tanpa downtime");
assert(readmeContent.includes("npm run db:backup"), "README memuat instruksi backup database");

console.log("\n=== Seluruh 7 Pengujian Artefak Deployment VPS LULUS 100% ===");
