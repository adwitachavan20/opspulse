const express    = require("express");
const cors       = require("cors");
const twilio     = require("twilio");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── Twilio Credentials (set these in your .env file) ────────────────────────
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const client     = twilio(accountSid, authToken);
const FROM       = process.env.TWILIO_FROM_NUMBER;
const NUMBERS    = (process.env.SMS_RECIPIENTS || "").split(",").filter(Boolean);

// ─── Email Config (set these in your .env file) ───────────────────────────────
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_TO   = (process.env.EMAIL_TO || "").split(",").filter(Boolean);

const mailer = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  tls: { rejectUnauthorized: false }
});

// ─── Helper: Send HTML Email ──────────────────────────────────────────────────
async function sendEmail(subject, htmlBody) {
  try {
    const info = await mailer.sendMail({
      from: `"Horizon Alerts" <${EMAIL_USER}>`,
      to: EMAIL_TO.join(", "),
      subject,
      html: htmlBody,
    });
    console.log(`[EMAIL] Sent | MessageID: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("[EMAIL] Failed:", err.message);
    return { success: false, error: err.message };
  }
}

// ─── Helper: Build HTML Email Template ───────────────────────────────────────
function buildEmailHTML(data) {
  const { stressScore, metrics, alerts, type } = data;
  const now = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  const scoreColor = stressScore?.overall > 85 ? "#ef4444"
    : stressScore?.overall > 70 ? "#f59e0b"
    : stressScore?.overall > 50 ? "#00e5ff" : "#22c55e";

  const crisisAlerts = (alerts || []).filter(a => a.type === "crisis");

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#080c14;font-family:'Courier New',monospace;">
  <div style="max-width:600px;margin:0 auto;padding:24px;">
    <div style="background:#0d1526;border:1px solid #1e2d47;border-radius:12px;padding:24px;margin-bottom:16px;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
        <div style="width:12px;height:12px;border-radius:50%;background:${scoreColor};"></div>
        <h1 style="margin:0;color:#e2e8f0;font-size:20px;letter-spacing:2px;">
          ${type === "crisis" ? "🚨 CRITICAL ALERT" : "📊 HORIZON REPORT"}
        </h1>
      </div>
      <p style="margin:0;color:#64748b;font-size:12px;">${now}</p>
    </div>
    <div style="background:#0d1526;border:1px solid ${scoreColor}40;border-radius:12px;padding:20px;margin-bottom:16px;text-align:center;">
      <p style="margin:0 0 8px;color:#64748b;font-size:11px;letter-spacing:2px;">BUSINESS STRESS SCORE</p>
      <p style="margin:0;color:${scoreColor};font-size:48px;font-weight:700;">${stressScore?.overall ?? "—"}</p>
      <p style="margin:4px 0 0;color:${scoreColor};font-size:13px;">/ 100</p>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      ${[
        { label: "Revenue", value: "Rs." + Math.round(metrics?.sales?.revenue || 0).toLocaleString("en-IN"), color: "#00e5ff" },
        { label: "Cash Runway", value: (metrics?.cashflow?.runway_days ?? "—") + " days", color: metrics?.cashflow?.runway_days < 30 ? "#ef4444" : "#22c55e" },
        { label: "Open Tickets", value: metrics?.support?.open_tickets ?? "—", color: metrics?.support?.open_tickets > 60 ? "#ef4444" : "#f59e0b" },
        { label: "Stockouts", value: (metrics?.inventory?.stockout_items ?? "—") + " SKUs", color: metrics?.inventory?.stockout_items > 2 ? "#ef4444" : "#22c55e" },
        { label: "Sales Stress", value: (stressScore?.sales ?? "—") + "/100", color: "#f59e0b" },
        { label: "CSAT Score", value: (metrics?.support?.csat_score ?? "—") + "%", color: "#22c55e" },
      ].map(m => `
        <div style="background:#0d1526;border:1px solid ${m.color}30;border-radius:8px;padding:14px;">
          <p style="margin:0 0 4px;color:#64748b;font-size:10px;letter-spacing:1px;">${m.label}</p>
          <p style="margin:0;color:${m.color};font-size:18px;font-weight:700;">${m.value}</p>
        </div>
      `).join("")}
    </div>
    ${crisisAlerts.length > 0 ? `
    <div style="background:#1a0008;border:1px solid #ef444440;border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 12px;color:#ef4444;font-size:11px;letter-spacing:2px;">ACTIVE CRISES (${crisisAlerts.length})</p>
      ${crisisAlerts.map(a => `
        <div style="padding:8px 0;border-bottom:1px solid #ef444420;">
          <p style="margin:0;color:#fca5a5;font-size:13px;">• ${a.message}</p>
        </div>
      `).join("")}
    </div>
    ` : ""}
    <div style="background:#0d1526;border:1px solid #1e2d47;border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="margin:0 0 12px;color:#64748b;font-size:11px;letter-spacing:2px;">STRESS BREAKDOWN</p>
      ${[
        { label: "Sales", value: stressScore?.sales ?? 0 },
        { label: "Inventory", value: stressScore?.inventory ?? 0 },
        { label: "Support", value: stressScore?.support ?? 0 },
        { label: "Cash Flow", value: stressScore?.cash ?? 0 },
      ].map(s => {
        const c = s.value > 70 ? "#ef4444" : s.value > 50 ? "#f59e0b" : "#22c55e";
        return `
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:#94a3b8;font-size:12px;">${s.label}</span>
              <span style="color:${c};font-size:12px;font-weight:700;">${s.value}/100</span>
            </div>
            <div style="background:#1e2d47;border-radius:99px;height:6px;">
              <div style="background:${c};width:${s.value}%;height:6px;border-radius:99px;"></div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
    <div style="text-align:center;padding:16px;">
      <p style="margin:0;color:#1e2d47;font-size:11px;">
        Horizon · HORIZON 1.0 · Vidyavardhini's College of Engineering & Technology
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

// ─── In-Memory Data Store ─────────────────────────────────────────────────────
const dataStore = {
  history: {}, latest: {}, thresholds: {}, alerts: [], subscribers: [],
};

const DEFAULT_THRESHOLDS = {
  high: null, low: null, enabled: true, windowSize: 20, zThreshold: 2.5,
};

// ─── Helper: Send SMS ─────────────────────────────────────────────────────────
async function sendSMS(message) {
  const results = [];
  for (const number of NUMBERS) {
    try {
      const msg = await client.messages.create({ body: message, from: FROM, to: number });
      console.log(`[SMS] Sent to ${number} | SID: ${msg.sid}`);
      results.push({ number, sid: msg.sid, status: "sent" });
    } catch (err) {
      console.error(`[SMS] Failed to ${number}:`, err.message);
      results.push({ number, error: err.message, status: "failed" });
    }
  }
  return results;
}

function pushSSE(event, data) {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  dataStore.subscribers.forEach((res) => {
    try { res.write(payload); } catch (_) {}
  });
}

function detectAnomaly(key, newValue) {
  const cfg     = dataStore.thresholds[key] || { ...DEFAULT_THRESHOLDS };
  const history = (dataStore.history[key] || []).slice(-cfg.windowSize);
  if (history.length < 5) return { spike: false, dip: false };
  const values   = history.map((h) => h.value);
  const mean     = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
  const stdDev   = Math.sqrt(variance) || 1;
  const zScore   = (newValue - mean) / stdDev;
  const threshold = cfg.zThreshold ?? DEFAULT_THRESHOLDS.zThreshold;
  return {
    spike: zScore > threshold || newValue > (cfg.high ?? Infinity),
    dip:   zScore < -threshold || newValue < (cfg.low ?? -Infinity),
    zScore: +zScore.toFixed(3), mean: +mean.toFixed(3), stdDev: +stdDev.toFixed(3), newValue,
  };
}

async function ingestDataUpdate(key, value, source = "api") {
  const timestamp = new Date().toISOString();
  const anomaly   = detectAnomaly(key, value);
  if (!dataStore.history[key])    dataStore.history[key]    = [];
  if (!dataStore.thresholds[key]) dataStore.thresholds[key] = { ...DEFAULT_THRESHOLDS };
  dataStore.history[key].push({ value, timestamp });
  if (dataStore.history[key].length > 500) dataStore.history[key].shift();
  const previousLatest = dataStore.latest[key];
  dataStore.latest[key] = { value, timestamp };
  pushSSE("data-update", { key, value, timestamp, source, previous: previousLatest?.value ?? null, anomaly });
  console.log(`[DATA] ${key} = ${value} (z=${anomaly.zScore})`);
  const cfg = dataStore.thresholds[key];
  if (cfg.enabled !== false && (anomaly.spike || anomaly.dip)) {
    const direction = anomaly.spike ? "🔺 HIGH SPIKE" : "🔻 LOW DIP";
    const smsBody = [
      `⚠️ ALERT [${key}] ${direction}`,
      `Value: ${value}`,
      `Mean (last ${cfg.windowSize ?? 20}): ${anomaly.mean}`,
      `Std Dev: ${anomaly.stdDev} | Z-Score: ${anomaly.zScore}`,
      `Time: ${new Date(timestamp).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`,
    ].join("\n");
    const smsResults = await sendSMS(smsBody);
    const alertRecord = { id: Date.now(), key, value, timestamp, direction, anomaly, smsResults };
    dataStore.alerts.push(alertRecord);
    if (dataStore.alerts.length > 200) dataStore.alerts.shift();
    pushSSE("alert", alertRecord);
  }
  return { key, value, timestamp, anomaly };
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/events", (req, res) => {
  res.setHeader("Content-Type",  "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection",    "keep-alive");
  res.flushHeaders();
  const heartbeat = setInterval(() => {
    try { res.write(`: heartbeat\n\n`); } catch (_) { clearInterval(heartbeat); }
  }, 20_000);
  dataStore.subscribers.push(res);
  req.on("close", () => {
    clearInterval(heartbeat);
    dataStore.subscribers = dataStore.subscribers.filter((s) => s !== res);
  });
});

app.post("/data/update", async (req, res) => {
  const { key, value, source } = req.body;
  if (!key || value === undefined || typeof value !== "number")
    return res.status(400).json({ success: false, error: "key and numeric value required" });
  try {
    const result = await ingestDataUpdate(key, value, source || "api");
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/data/update/batch", async (req, res) => {
  const { updates } = req.body;
  if (!Array.isArray(updates) || updates.length === 0)
    return res.status(400).json({ success: false, error: "updates array required" });
  const results = [];
  for (const { key, value, source } of updates) {
    if (!key || typeof value !== "number") { results.push({ key, error: "invalid" }); continue; }
    results.push(await ingestDataUpdate(key, value, source || "batch"));
  }
  res.json({ success: true, results });
});

app.get("/thresholds", (req, res) => res.json({ success: true, thresholds: dataStore.thresholds }));
app.post("/thresholds/:key", (req, res) => {
  const { key } = req.params;
  const { high, low, enabled, windowSize, zThreshold } = req.body;
  dataStore.thresholds[key] = {
    ...(dataStore.thresholds[key] || { ...DEFAULT_THRESHOLDS }),
    ...(high       !== undefined ? { high }       : {}),
    ...(low        !== undefined ? { low }        : {}),
    ...(enabled    !== undefined ? { enabled }    : {}),
    ...(windowSize !== undefined ? { windowSize } : {}),
    ...(zThreshold !== undefined ? { zThreshold } : {}),
  };
  res.json({ success: true, key, threshold: dataStore.thresholds[key] });
});
app.delete("/thresholds/:key", (req, res) => {
  delete dataStore.thresholds[req.params.key];
  res.json({ success: true, key: req.params.key, reset: true });
});

app.get("/data/latest",        (req, res) => res.json({ success: true, data: dataStore.latest }));
app.get("/data/history/:key",  (req, res) => {
  const limit = parseInt(req.query.limit) || 100;
  res.json({ success: true, key: req.params.key, history: (dataStore.history[req.params.key] || []).slice(-limit) });
});
app.get("/data/alerts",        (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  res.json({ success: true, alerts: dataStore.alerts.slice(-limit).reverse() });
});

app.post("/send-sms", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ success: false, error: "message required" });
  try {
    const results = await sendSMS(message);
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/send-email", async (req, res) => {
  const { stressScore, metrics, alerts, type = "crisis" } = req.body;
  const subject = type === "crisis"
    ? `🚨 CRITICAL ALERT — Horizon Stress Score: ${stressScore?.overall}/100`
    : `📊 Horizon Business Report — ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`;
  const html = buildEmailHTML({ stressScore, metrics, alerts, type });
  try {
    const result = await sendEmail(subject, html);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/health", (req, res) => res.json({
  status: "ok", uptime: process.uptime(),
  subscribers: dataStore.subscribers.length,
  keys: Object.keys(dataStore.latest),
  alertCount: dataStore.alerts.length,
}));

app.listen(4000, () => {
  console.log("🚀 Horizon Alert Server running on http://localhost:4000");
  console.log("   POST /send-sms    → manual SMS");
  console.log("   POST /send-email  → email report");
  console.log("   POST /data/update → ingest + auto-alert");
  console.log("   GET  /events      → SSE stream");
  console.log("   GET  /health      → status check");
});
