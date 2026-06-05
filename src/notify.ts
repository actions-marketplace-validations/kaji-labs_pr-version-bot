import * as https from 'https';
import * as core from '@actions/core';

// Private / link-local / loopback ranges that must never be contacted (SSRF prevention).
// These patterns cover IPv4 loopback, link-local (169.254/16), RFC-1918 private ranges,
// and the unspecified address.
const SSRF_BLOCKED_PATTERNS = [
  /^localhost(:\d+)?$/i,
  /^127\.\d+\.\d+\.\d+(:\d+)?$/, // IPv4 loopback
  /^\[?::1\]?(:\d+)?$/, // IPv6 loopback
  /^169\.254\.\d+\.\d+(:\d+)?$/, // link-local / AWS metadata
  /^10\.\d+\.\d+\.\d+(:\d+)?$/, // RFC-1918 10/8
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/, // RFC-1918 172.16/12
  /^192\.168\.\d+\.\d+(:\d+)?$/, // RFC-1918 192.168/16
  /^0\.0\.0\.0(:\d+)?$/, // unspecified
  /^\[?fc[0-9a-f]{2}:[0-9a-f:]+\]?$/i, // IPv6 ULA fc00::/7
  /^\[?fe[89ab][0-9a-f]:[0-9a-f:]+\]?$/i, // IPv6 link-local fe80::/10
];

function requireHttps(url: string, label: string): void {
  if (!url.startsWith('https://')) {
    throw new Error(`${label} webhook URL must use HTTPS`);
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(`${label} webhook URL is not a valid URL: "${url}"`);
  }

  const host = parsed.host; // includes port if present
  if (SSRF_BLOCKED_PATTERNS.some((re) => re.test(host))) {
    throw new Error(
      `${label} webhook URL targets a private/internal address and is not allowed: "${url}"`
    );
  }
}

function post(url: string, body: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const req = https.request(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body),
        },
      },
      (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve(res.statusCode ?? 0));
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

export async function sendSlackNotification(webhookUrl: string, message: string): Promise<void> {
  requireHttps(webhookUrl, 'Slack');
  const body = JSON.stringify({ text: message });
  let status: number;
  try {
    status = await post(webhookUrl, body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Slack notification request failed: ${msg.replace(webhookUrl, '[redacted]')}`, {
      cause: err,
    });
  }
  if (status < 200 || status >= 300) {
    core.warning(`Slack notification failed with status ${status} — release continues`);
  }
}

export async function sendDiscordNotification(
  webhookUrl: string,
  message: string,
  tag: string
): Promise<void> {
  requireHttps(webhookUrl, 'Discord');
  const body = JSON.stringify({
    embeds: [
      {
        title: `Released ${tag}`,
        description: message,
        color: 5763719,
      },
    ],
  });
  let status: number;
  try {
    status = await post(webhookUrl, body);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Discord notification request failed: ${msg.replace(webhookUrl, '[redacted]')}`,
      { cause: err }
    );
  }
  if (status < 200 || status >= 300) {
    core.warning(`Discord notification failed with status ${status} — release continues`);
  }
}

export async function sendSlackNotifications(webhookUrls: string, message: string): Promise<void> {
  const urls = webhookUrls
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  for (const url of urls) {
    await sendSlackNotification(url, message);
  }
}

export async function sendDiscordNotifications(
  webhookUrls: string,
  message: string,
  tag: string
): Promise<void> {
  const urls = webhookUrls
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);
  for (const url of urls) {
    await sendDiscordNotification(url, message, tag);
  }
}
