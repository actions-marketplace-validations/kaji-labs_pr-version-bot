import * as https from 'https';
import * as core from '@actions/core';

function requireHttps(url: string, label: string): void {
  if (!url.startsWith('https://')) {
    throw new Error(`${label} webhook URL must use HTTPS`);
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
  const status = await post(webhookUrl, body);
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
  const status = await post(webhookUrl, body);
  if (status < 200 || status >= 300) {
    core.warning(`Discord notification failed with status ${status} — release continues`);
  }
}
