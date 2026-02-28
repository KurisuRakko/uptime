// RSSS (Rakko System Service Status) - uptime.config.ts
// Based on UptimeFlare config schema (quickstart style)

// Don't edit this line
import { MaintenanceConfig, PageConfig, WorkerConfig } from './types/config'

/* =========================
 * Status Page (Branding)
 * ========================= */
const pageConfig: PageConfig = {
  title: 'RSSS · Rakko System Service Status',
  links: [
    { link: 'https://rakko.cn', label: 'Main Website', highlight: true },
    { link: 'https://github.com/KurisuRakko', label: 'GitHub' },
    { link: 'mailto:yang@rakko.cn', label: 'Contact' },
  ],
}

/* =========================
 * Worker Config
 * ========================= */
const workerConfig: WorkerConfig = {
  monitors: [
    /* ---------- rakko.cn (Main) ---------- */
    {
      id: 'rakko-web-main',
      name: 'Rakko Main Website',
      method: 'GET',
      target: 'https://rakko.cn',
      tooltip: 'Rakko System main website',
      statusPageLink: 'https://rakko.cn',
      expectedCodes: [200, 301, 302],
      timeout: 5000,
      headers: {
        'User-Agent': 'RSSS/1.0 (Rakko System Service Status)',
      },
    },

    /* ---------- music.rakko.cn (App) ---------- */
    {
      id: 'rakko-music-player',
      name: 'Rakko Music Player',
      method: 'GET',
      target: 'https://music.rakko.cn',
      tooltip: 'Rakko Music Player web application',
      statusPageLink: 'https://music.rakko.cn',
      expectedCodes: [200, 301, 302],
      timeout: 8000,
      headers: {
        'User-Agent': 'RSSS/1.0 (Rakko System Service Status)',
      },
    },

    /* ---------- static.rakko.cn (Static/CDN) ---------- */
    {
      id: 'rakko-static-site',
      name: 'Rakko Static Site',
      method: 'GET',
      target: 'https://static.rakko.cn',
      tooltip: 'Rakko static site & assets',
      statusPageLink: 'https://static.rakko.cn',
      expectedCodes: [200, 301, 302],
      timeout: 4000,
      headers: {
        'User-Agent': 'RSSS/1.0 (Rakko System Service Status)',
      },
    },

    /* ---------- kurisu.rakko.cn (Server) ---------- */
    {
      id: 'rakko-kurisu-server',
      name: 'Kurisu Server',
      method: 'GET',
      target: 'https://kurisu.rakko.cn',
      tooltip: 'Kurisu server status',
      statusPageLink: 'https://kurisu.rakko.cn',
      expectedCodes: [200, 301, 302],
      timeout: 5000,
      headers: {
        'User-Agent': 'RSSS/1.0 (Rakko System Service Status)',
      },
    },

    /* ---------- connect.chuuya.cn (Connect) ---------- */
    {
      id: 'rakko-connect-15',
      name: 'KurisuRakko-Connect15',
      method: 'GET',
      target: 'https://connect.chuuya.cn',
      tooltip: 'KurisuRakko connect service',
      statusPageLink: 'https://connect.chuuya.cn',
      expectedCodes: [200, 301, 302],
      timeout: 5000,
      headers: {
        'User-Agent': 'RSSS/1.0 (Rakko System Service Status)',
      },
    },

    /* ---------- yukinoshita.net (Landing) ---------- */
    {
      id: 'rakko-yukinoshita-landing',
      name: 'KurisuRakko 起始页',
      method: 'GET',
      target: 'https://yukinoshita.net',
      tooltip: 'KurisuRakko landing page',
      statusPageLink: 'https://yukinoshita.net',
      expectedCodes: [200, 301, 302],
      timeout: 5000,
      headers: {
        'User-Agent': 'RSSS/1.0 (Rakko System Service Status)',
      },
    },

    /* ---------- (Optional) TCP: Server SSH ---------- */
    // 如果你有自己的服务器，把 YOUR_SERVER_IP 换成真实 IP 即可启用
    // {
    //   id: 'rakko-server-ssh',
    //   name: 'Rakko Server SSH',
    //   method: 'TCP_PING',
    //   target: 'YOUR_SERVER_IP:22',
    //   tooltip: 'Rakko production server SSH',
    //   timeout: 5000,
    // },
  ],

  /* =========================
   * Notification (Telegram Example)
   * ========================= */
  notification: {
    webhook: {
      // 把下面改成你的 Telegram Bot API 地址
      url: 'https://api.telegram.org/botYOUR_BOT_TOKEN/sendMessage',
      payloadType: 'x-www-form-urlencoded',
      payload: {
        // 改成你的 chat_id
        chat_id: 12345678,
        // 这里加了品牌头：RSSS
        text: '🚨 RSSS Alert · Rakko System\n\n$MSG',
      },
      timeout: 10000,
    },
    timeZone: 'Asia/Shanghai',
    // 连续失败 N 分钟才通知（避免抖动误报）
    gracePeriod: 3,
  },
}

/* =========================
 * Maintenance
 * ========================= */
const maintenances: MaintenanceConfig[] = [
  {
    monitors: ['rakko-web-main', 'rakko-music-player'],
    title: 'RSSS · Scheduled Maintenance',
    body: 'Rakko System infrastructure maintenance in progress',
    // 你可以把 start/end 换成你真实维护窗口
    start: '2026-01-01T00:00:00+08:00',
    end: '2026-06-31T23:59:59+08:00',
    color: 'blue',
  },
]

// Don't edit this line
export { maintenances, pageConfig, workerConfig }
