/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

module.exports = {
  apps: [
    {
      name: "profile-ifk",
      script: path.resolve(__dirname, "../.next/standalone/server.js"),
      cwd: path.resolve(__dirname, ".."),
      instances: process.env.PM2_INSTANCES ? parseInt(process.env.PM2_INSTANCES, 10) : 1,
      exec_mode: process.env.PM2_EXEC_MODE || "fork",
      env: {
        PORT: process.env.PORT || 3000,
        NODE_ENV: "production",
        HOSTNAME: "127.0.0.1",
      },
      max_memory_restart: "400M",
      exp_backoff_restart_delay: 100,
      restart_delay: 3000,
      error_file: path.resolve(__dirname, "../logs/pm2-error.log"),
      out_file: path.resolve(__dirname, "../logs/pm2-out.log"),
      merge_logs: true,
      time: true,
    },
  ],
};
