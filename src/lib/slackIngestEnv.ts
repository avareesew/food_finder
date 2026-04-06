/**
 * Slack flyer ingest: one or two workspaces (e.g. personal test bot + BYU when approved).
 *
 * Primary: SLACK_BOT_TOKEN + SLACK_CHANNEL_IDS (comma-separated C… / G… IDs)
 * Secondary (optional): SLACK_BOT_TOKEN_2 + SLACK_CHANNEL_IDS_2
 *
 * Advanced: SLACK_INGEST_JSON — JSON array of { "token": "xoxb-…", "channels": ["C…","C…"] }
 * merged after the primary/secondary pairs (useful for 3+ workspaces without more _N vars).
 */

export type SlackIngestWorkspace = {
  label: string;
  botToken: string;
  channelIds: string[];
};

function parseChannelIds(raw: string | undefined): string[] {
  if (!raw || typeof raw !== 'string') return [];
  return raw
    .split(/[,;\s]+/)
    .map((s) => s.trim())
    .filter((id) => id.startsWith('C') || id.startsWith('G'));
}

function pushWorkspace(
  out: SlackIngestWorkspace[],
  label: string,
  token: string | undefined,
  channelsRaw: string | undefined
) {
  const botToken = typeof token === 'string' ? token.trim() : '';
  const channelIds = parseChannelIds(channelsRaw);
  if (!botToken || channelIds.length === 0) return;
  out.push({ label, botToken, channelIds });
}

function parseJsonWorkspaces(): SlackIngestWorkspace[] {
  const raw = process.env.SLACK_INGEST_JSON?.trim();
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    const out: SlackIngestWorkspace[] = [];
    parsed.forEach((item, i) => {
      if (!item || typeof item !== 'object') return;
      const o = item as { token?: unknown; channels?: unknown };
      const token = typeof o.token === 'string' ? o.token.trim() : '';
      let channelIds: string[] = [];
      if (Array.isArray(o.channels)) {
        channelIds = o.channels
          .map((c) => (typeof c === 'string' ? c.trim() : ''))
          .filter((id) => id.startsWith('C') || id.startsWith('G'));
      } else if (typeof o.channels === 'string') {
        channelIds = parseChannelIds(o.channels);
      }
      if (token && channelIds.length) {
        out.push({ label: `json_${i}`, botToken: token, channelIds });
      }
    });
    return out;
  } catch {
    return [];
  }
}

export function getSlackIngestWorkspaces(): SlackIngestWorkspace[] {
  const out: SlackIngestWorkspace[] = [];
  pushWorkspace(out, 'primary', process.env.SLACK_BOT_TOKEN, process.env.SLACK_CHANNEL_IDS);
  pushWorkspace(out, 'secondary', process.env.SLACK_BOT_TOKEN_2, process.env.SLACK_CHANNEL_IDS_2);
  out.push(...parseJsonWorkspaces());
  return out;
}

export function slackIngestLookbackDays(): number {
  const raw = process.env.SLACK_LOOKBACK_DAYS?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 7;
  if (!Number.isFinite(n) || n < 1) return 7;
  return Math.min(n, 30);
}
