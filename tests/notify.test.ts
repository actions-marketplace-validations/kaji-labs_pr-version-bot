import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as https from 'https';
import { EventEmitter } from 'events';

vi.mock('https');
vi.mock('@actions/core');

import * as core from '@actions/core';
import { sendSlackNotification, sendDiscordNotification } from '../src/notify';

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
});
