type SlackOkResponse = { ok: true; [k: string]: unknown };
type SlackErrResponse = { ok: false; error?: string };
type SlackApiResponse = SlackOkResponse | SlackErrResponse;

export type SlackAuthTestOk = {
  ok: true;
  team_id: string;
  /** Human-readable workspace name when returned by auth.test */
  team?: string;
  user_id?: string;
};

export type SlackFile = {
  id: string;
  name?: string;
  mimetype?: string;
  filetype?: string;
  size?: number;
  url_private_download?: string;
};

export type SlackMessage = {
  ts?: string;
  text?: string;
  subtype?: string;
  files?: SlackFile[];
};

type HistoryOk = {
  ok: true;
  messages: SlackMessage[];
  has_more?: boolean;
  response_metadata?: { next_cursor?: string };
};

async function slackApiJson(token: string, method: string, payload: Record<string, unknown>): Promise<SlackApiResponse> {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as SlackApiResponse;
  return json;
}

export async function slackAuthTest(token: string): Promise<SlackAuthTestOk> {
  const json = await slackApiJson(token, 'auth.test', {});
  if (!json.ok) {
    const err = (json as SlackErrResponse).error ?? 'unknown_error';
    throw new Error(`Slack auth.test failed: ${err}`);
  }
  return json as SlackAuthTestOk;
}

export async function slackConversationsHistory(args: {
  token: string;
  channel: string;
  oldest: string;
  cursor?: string;
}): Promise<HistoryOk> {
  const body: Record<string, unknown> = {
    channel: args.channel,
    oldest: args.oldest,
    limit: 200,
  };
  if (args.cursor) body.cursor = args.cursor;

  const json = await slackApiJson(args.token, 'conversations.history', body);
  if (!json.ok) {
    const err = (json as SlackErrResponse).error ?? 'unknown_error';
    let hint = '';
    if (err === 'channel_not_found') {
      hint =
        ' — For private channels, Slack often returns this if the bot is not a member (invite it: /invite @YourApp). ' +
        'Also check the token’s workspace matches this channel, and the ID has no typos (0 vs O).';
    }
    if (err === 'not_in_channel') {
      hint =
        ' — Invite the bot: in the channel run /invite @YourAppName';
    }
    throw new Error(`Slack conversations.history failed: ${err}${hint}`);
  }
  return json as HistoryOk;
}

export async function downloadSlackPrivateFile(
  token: string,
  urlPrivateDownload: string
): Promise<{ bytes: Uint8Array; contentType: string }> {
  const res = await fetch(urlPrivateDownload, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(120_000),
  });
  if (!res.ok) {
    throw new Error(`Slack file download failed (${res.status})`);
  }
  const buf = await res.arrayBuffer();
  const ct = res.headers.get('content-type')?.split(';')[0]?.trim() || 'application/octet-stream';
  return { bytes: new Uint8Array(buf), contentType: ct };
}

export function isSlackImageFile(f: SlackFile): boolean {
  const mt = (f.mimetype || '').toLowerCase();
  if (mt.startsWith('image/')) return true;
  const ft = (f.filetype || '').toLowerCase();
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(ft);
}
