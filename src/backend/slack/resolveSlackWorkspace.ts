import { slackAuthTest } from '@/backend/slack/slackClient';
import { getSlackIngestWorkspaces, type SlackIngestWorkspace } from '@/lib/slackIngestEnv';

export type ResolvedSlackWorkspace = {
    ws: SlackIngestWorkspace;
    teamId: string;
    slackWorkspaceName: string;
};

const cache = new Map<string, ResolvedSlackWorkspace>();

/** Map Slack `team_id` from Events API to a configured ingest workspace (auth.test per token until match). */
export async function resolveWorkspaceForSlackTeam(teamId: string): Promise<ResolvedSlackWorkspace | null> {
    const hit = cache.get(teamId);
    if (hit) return hit;

    for (const ws of getSlackIngestWorkspaces()) {
        try {
            const auth = await slackAuthTest(ws.botToken);
            if (auth.team_id !== teamId) continue;
            const name = typeof auth.team === 'string' && auth.team.trim() ? auth.team.trim() : ws.label;
            const resolved: ResolvedSlackWorkspace = { ws, teamId: auth.team_id, slackWorkspaceName: name };
            cache.set(teamId, resolved);
            return resolved;
        } catch {
            continue;
        }
    }
    return null;
}
