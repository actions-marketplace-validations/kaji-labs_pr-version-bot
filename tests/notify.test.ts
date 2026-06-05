import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as https from 'https';
import { EventEmitter } from 'events';

// helper — reusable error-emitting request mock
function mockHttpsRequestError(error: Error) {
  const req = Object.assign(new EventEmitter(), {
    write: vi.fn(),
    end: vi.fn(),
  });
  vi.mocked(https.request).mockImplementation(() => {
    process.nextTick(() => req.emit('error', error));
    return req as unknown as import('http').ClientRequest;
  });
}

vi.mock('https');
vi.mock('@actions/core');

import * as core from '@actions/core';
import {
  sendSlackNotification,
  sendDiscordNotification,
  sendSlackNotifications,
  sendDiscordNotifications,
} from '../src/notify';

function mockHttpsRequest(statusCode: number, responseBody = '') {
  const res = Object.assign(new EventEmitter(), { statusCode });
  const req = Object.assign(new EventEmitter(), {
    write: vi.fn(),
    end: vi.fn(),
  });
  vi.mocked(https.request).mockImplementation((_url, _opts, callback) => {
    if (callback) {
      process.nextTick(() => {
        callback(res as unknown as import('http').IncomingMessage);
        process.nextTick(() => res.emit('data', responseBody));
        process.nextTick(() => res.emit('end'));
      });
    }
    return req as unknown as import('http').ClientRequest;
  });
  return { req, res };
}

describe('sendSlackNotification', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POSTs JSON to the webhook URL', async () => {
    mockHttpsRequest(200);
    await sendSlackNotification('https://hooks.slack.com/test', 'Hello release');
    expect(https.request).toHaveBeenCalledWith(
      'https://hooks.slack.com/test',
      expect.objectContaining({ method: 'POST' }),
      expect.any(Function)
    );
  });

  it('sends message as Slack text payload', async () => {
    const { req } = mockHttpsRequest(200);
    await sendSlackNotification('https://hooks.slack.com/test', 'v1.2.3 released');
    const written = JSON.parse((req.write as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(written).toEqual({ text: 'v1.2.3 released' });
  });

  it('logs warning on non-2xx response and does not throw', async () => {
    mockHttpsRequest(400);
    await expect(
      sendSlackNotification('https://hooks.slack.com/test', 'msg')
    ).resolves.not.toThrow();
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('400'));
  });

  it('rejects HTTP URLs', async () => {
    await expect(sendSlackNotification('http://hooks.slack.com/test', 'msg')).rejects.toThrow(
      'HTTPS'
    );
  });

  it('blocks IPv6 ULA addresses (fc00::/7)', async () => {
    await expect(sendSlackNotification('https://[fc00::1]/hook', 'msg')).rejects.toThrow(
      'private/internal'
    );
  });

  it('blocks IPv6 link-local addresses (fe80::/10)', async () => {
    await expect(sendSlackNotification('https://[fe80::1]/hook', 'msg')).rejects.toThrow(
      'private/internal'
    );
  });

  it('redacts webhook URL from error message on network failure', async () => {
    const webhookUrl = 'https://hooks.slack.com/secret-token/path';
    mockHttpsRequestError(new Error(`connect ECONNREFUSED ${webhookUrl}`));
    await expect(sendSlackNotification(webhookUrl, 'msg')).rejects.toThrow('[redacted]');
  });

  it('does not expose webhook URL in error message', async () => {
    const webhookUrl = 'https://hooks.slack.com/secret-token/path';
    mockHttpsRequestError(new Error(`connect ECONNREFUSED ${webhookUrl}`));
    try {
      await sendSlackNotification(webhookUrl, 'msg');
    } catch (e) {
      expect(e instanceof Error ? e.message : String(e)).not.toContain('secret-token');
    }
  });
});

describe('sendSlackNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls sendSlackNotification for each URL in a comma-separated list', async () => {
    mockHttpsRequest(200);
    await sendSlackNotifications('https://hooks.slack.com/a,https://hooks.slack.com/b', 'msg');
    expect(https.request).toHaveBeenCalledTimes(2);
  });

  it('skips empty entries from trailing commas', async () => {
    mockHttpsRequest(200);
    await sendSlackNotifications('https://hooks.slack.com/a,', 'msg');
    expect(https.request).toHaveBeenCalledTimes(1);
  });
});

describe('sendDiscordNotifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls sendDiscordNotification for each URL in a comma-separated list', async () => {
    mockHttpsRequest(204);
    await sendDiscordNotifications(
      'https://discord.com/api/webhooks/a,https://discord.com/api/webhooks/b',
      'msg',
      'v1.0.0'
    );
    expect(https.request).toHaveBeenCalledTimes(2);
  });

  it('skips empty entries from trailing commas', async () => {
    mockHttpsRequest(204);
    await sendDiscordNotifications('https://discord.com/api/webhooks/a,', 'msg', 'v1.0.0');
    expect(https.request).toHaveBeenCalledTimes(1);
  });
});

// S-023: SSRF block list exhaustive tests
describe('requireHttps SSRF block list', () => {
  beforeEach(() => vi.clearAllMocks());

  const blockedUrls = [
    'https://localhost/service',
    'https://127.0.0.1/api',
    'https://169.254.169.254/latest/meta-data/',
    'https://10.0.0.1/internal',
    'https://172.16.0.1/private',
    'https://192.168.1.1/router',
    'https://[::1]/loopback',
  ];

  for (const url of blockedUrls) {
    it(`blocks ${url}`, async () => {
      await expect(sendSlackNotification(url, 'test')).rejects.toThrow('private/internal address');
    });
  }

  it('allows a valid public URL', async () => {
    mockHttpsRequest(200);
    try {
      await sendSlackNotification('https://hooks.slack.com/services/test', 'msg');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      expect(msg).not.toContain('private/internal address');
    }
  });
});

describe('sendDiscordNotification', () => {
  beforeEach(() => vi.clearAllMocks());

  it('POSTs JSON to the Discord webhook URL', async () => {
    mockHttpsRequest(204);
    await sendDiscordNotification(
      'https://discord.com/api/webhooks/test',
      'Hello release',
      'v1.2.3'
    );
    expect(https.request).toHaveBeenCalledWith(
      'https://discord.com/api/webhooks/test',
      expect.objectContaining({ method: 'POST' }),
      expect.any(Function)
    );
  });

  it('sends Discord embed payload', async () => {
    const { req } = mockHttpsRequest(204);
    await sendDiscordNotification('https://discord.com/api/webhooks/test', 'New feature', 'v1.1.0');
    const written = JSON.parse((req.write as ReturnType<typeof vi.fn>).mock.calls[0][0]);
    expect(written.embeds[0].title).toBe('Released v1.1.0');
    expect(written.embeds[0].description).toBe('New feature');
    expect(written.embeds[0].color).toBe(5763719);
  });

  it('logs warning on non-2xx response and does not throw', async () => {
    mockHttpsRequest(500);
    await expect(
      sendDiscordNotification('https://discord.com/api/webhooks/test', 'msg', 'v1.0.0')
    ).resolves.not.toThrow();
    expect(core.warning).toHaveBeenCalledWith(expect.stringContaining('500'));
  });

  it('rejects HTTP URLs', async () => {
    await expect(
      sendDiscordNotification('http://discord.com/api/webhooks/test', 'msg', 'v1.0.0')
    ).rejects.toThrow('HTTPS');
  });

  it('blocks IPv6 ULA addresses (fc00::/7)', async () => {
    await expect(
      sendDiscordNotification('https://[fc00::1]/hook', 'msg', 'v1.0.0')
    ).rejects.toThrow('private/internal');
  });

  it('blocks IPv6 link-local addresses (fe80::/10)', async () => {
    await expect(
      sendDiscordNotification('https://[fe80::1]/hook', 'msg', 'v1.0.0')
    ).rejects.toThrow('private/internal');
  });

  it('redacts webhook URL from error message on network failure', async () => {
    const webhookUrl = 'https://discord.com/api/webhooks/secret-id/secret-token';
    mockHttpsRequestError(new Error(`connect ECONNREFUSED ${webhookUrl}`));
    await expect(sendDiscordNotification(webhookUrl, 'msg', 'v1.0.0')).rejects.toThrow(
      '[redacted]'
    );
  });

  it('does not expose webhook URL in error message', async () => {
    const webhookUrl = 'https://discord.com/api/webhooks/secret-id/secret-token';
    mockHttpsRequestError(new Error(`connect ECONNREFUSED ${webhookUrl}`));
    try {
      await sendDiscordNotification(webhookUrl, 'msg', 'v1.0.0');
    } catch (e) {
      expect(e instanceof Error ? e.message : String(e)).not.toContain('secret-token');
    }
  });
});
