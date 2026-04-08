'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AdminNavTabs from '@/components/admin/AdminNavTabs';
import ExtractedDetailsGrid from '@/components/extracted/ExtractedDetailsGrid';
import PrimaryButton from '@/components/ui/PrimaryButton';
import { useAuth } from '@/components/providers/AuthProvider';
import { getRecentFlyers, type Flyer } from '@/services/flyers';
import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';
import type { SlackIngestSummary } from '@/backend/slack/runSlackIngest';
import { logger } from '@/lib/logger';

const SLACK_UI_LOOKBACK_DAYS = 7;

type LocalRecentRecord = {
  id: string;
  createdAtIso: string;
  imageUrl?: string | null;
  source?: {
    originalFilename?: string;
    sourceType?: 'flyer' | 'slack_text';
    slackFileId?: string;
    slackMessageTs?: string;
    slackWorkspaceName?: string;
    slackWorkspaceLabel?: string;
  };
  event?: ExtractedEvent;
};

function msSinceDays(days: number) {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

function flyerCreatedMs(f: Flyer): number {
  const ca = f.createdAt;
  if (ca && typeof ca === 'object' && 'seconds' in ca) {
    return (ca as { seconds: number }).seconds * 1000;
  }
  return 0;
}

function isWithinLastDaysMs(ms: number, days: number): boolean {
  return ms >= msSinceDays(days);
}

function isFlyerFromSlack(f: Flyer): boolean {
  return Boolean(f.slackFileId || f.slackTeamId || f.sourceType === 'slack_text' || f.slackMessageTs);
}

function isLocalRecordFromSlack(r: LocalRecentRecord): boolean {
  return Boolean(r.source?.slackFileId || r.source?.sourceType === 'slack_text' || r.source?.slackMessageTs);
}

export default function AdminSlackPage() {
  const { firebaseConfigured, user, me, loading: authLoading } = useAuth();
  const [recentFlyers, setRecentFlyers] = useState<Flyer[]>([]);
  const [localRecents, setLocalRecents] = useState<LocalRecentRecord[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [slackSyncing, setSlackSyncing] = useState(false);
  const [slackBanner, setSlackBanner] = useState<{ tone: 'info' | 'success' | 'error'; text: string } | null>(null);

  const fetchRecentFlyers = useCallback(async () => {
    try {
      const flyers = await getRecentFlyers(100);
      setRecentFlyers(flyers);
    } catch (error) {
      logger.error('admin-slack-fetch-flyers', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const fetchLocalRecents = useCallback(async () => {
    try {
      const res = await fetch('/api/local/events');
      const json = await res.json();
      setLocalRecents(Array.isArray(json.records) ? (json.records as LocalRecentRecord[]) : []);
    } catch (error) {
      logger.error('admin-slack-local-recents', {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }, []);

  const loadLists = useCallback(async () => {
    setListLoading(true);
    if (process.env.NEXT_PUBLIC_BACKEND_MODE === 'local') {
      await fetchLocalRecents();
    } else {
      await fetchRecentFlyers();
    }
    setListLoading(false);
  }, [fetchLocalRecents, fetchRecentFlyers]);

  useEffect(() => {
    if (!firebaseConfigured || authLoading) return;
    if (!user || !me?.isAdmin) return;
    void loadLists();
  }, [authLoading, firebaseConfigured, loadLists, me?.isAdmin, user]);

  const slackFirebaseRows = useMemo(() => {
    return recentFlyers.filter((f) => {
      if (!isFlyerFromSlack(f)) return false;
      return isWithinLastDaysMs(flyerCreatedMs(f), SLACK_UI_LOOKBACK_DAYS);
    });
  }, [recentFlyers]);

  const slackLocalRows = useMemo(() => {
    return localRecents.filter((r) => {
      if (!isLocalRecordFromSlack(r)) return false;
      const t = new Date(r.createdAtIso).getTime();
      if (Number.isNaN(t)) return false;
      return isWithinLastDaysMs(t, SLACK_UI_LOOKBACK_DAYS);
    });
  }, [localRecents]);

  const slackWorkspaceHeading = useMemo(() => {
    const names = new Set<string>();
    slackFirebaseRows.forEach((f) => {
      const n = f.slackWorkspaceName?.trim();
      if (n) names.add(n);
    });
    slackLocalRows.forEach((r) => {
      const n = r.source?.slackWorkspaceName?.trim();
      if (n) names.add(n);
    });
    return Array.from(names);
  }, [slackFirebaseRows, slackLocalRows]);

  const slackFirebaseSorted = useMemo(
    () => [...slackFirebaseRows].sort((a, b) => flyerCreatedMs(b) - flyerCreatedMs(a)),
    [slackFirebaseRows]
  );

  const slackLocalSorted = useMemo(
    () => [...slackLocalRows].sort((a, b) => (b.createdAtIso || '').localeCompare(a.createdAtIso || '')),
    [slackLocalRows]
  );

  const handleSlackSync = async () => {
    if (!user || !me?.isAdmin) return;
    setSlackSyncing(true);
    setSlackBanner(null);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/slack-ingest', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = (await res.json().catch(() => ({}))) as Record<string, unknown>;

      if (!res.ok) {
        const err = typeof result.error === 'string' ? result.error : `HTTP ${res.status}`;
        setSlackBanner({ tone: 'error', text: err });
        return;
      }

      if (result.ok !== true) {
        setSlackBanner({ tone: 'error', text: 'Unexpected Slack sync response.' });
        return;
      }
      if (result.disabled === true) {
        const msg = typeof result.message === 'string' ? result.message : 'Slack is not configured.';
        setSlackBanner({ tone: 'info', text: msg });
        return;
      }

      const summary = result.summary as SlackIngestSummary | undefined;
      if (!summary || typeof summary !== 'object') {
        setSlackBanner({ tone: 'error', text: 'Unexpected Slack sync response.' });
        return;
      }

      const s = summary;
      const wsHint =
        s.workspaceSummaries && s.workspaceSummaries.length > 0
          ? ` Workspaces: ${s.workspaceSummaries.map((w) => w.teamName).join(', ')}.`
          : '';
      const lines = [
        `Ingested ${s.ingested} flyer image(s).${wsHint}`,
        s.textEventsIngested > 0 ? `Activities from text-only posts: ${s.textEventsIngested}.` : null,
        s.textMessagesSkippedSeen > 0
          ? `Text posts skipped (already processed): ${s.textMessagesSkippedSeen}.`
          : null,
        s.skippedAlreadySeen > 0 ? `Already processed earlier: ${s.skippedAlreadySeen}.` : null,
        s.skippedNotImage > 0 ? `Skipped (not images): ${s.skippedNotImage}.` : null,
        s.failed > 0 ? `Failed: ${s.failed}.` : null,
        s.errors.length > 0 ? s.errors.slice(0, 5).join(' · ') : null,
      ].filter(Boolean) as string[];
      const nothingIngested =
        s.ingested === 0 &&
        (s.textEventsIngested ?? 0) === 0 &&
        s.imageFilesConsidered + (s.textMessagesConsidered ?? 0) > 0;
      const tone: 'success' | 'error' = s.failed > 0 && nothingIngested ? 'error' : 'success';
      setSlackBanner({ tone, text: lines.join(' ') });
      await loadLists();
    } catch (err) {
      setSlackBanner({
        tone: 'error',
        text: err instanceof Error ? err.message : 'Slack sync failed.',
      });
    } finally {
      setSlackSyncing(false);
    }
  };

  if (!firebaseConfigured) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24">
        <p className="text-gray-600 dark:text-gray-400">Firebase is not configured.</p>
      </main>
    );
  }

  if (authLoading) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24">
        <p className="text-gray-600 dark:text-gray-400">Loading…</p>
      </main>
    );
  }

  if (!user || !me?.isAdmin) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-24">
        <p className="text-gray-600 dark:text-gray-400">Admin sign-in required.</p>
        <Link href="/admin" className="mt-4 inline-block font-semibold text-brand-orange">
          ← Admin home
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-24">
      <AdminNavTabs />

      <div className="mt-8">
        <h1 className="font-serif text-3xl font-bold text-gray-900 dark:text-gray-50">Slack ingest</h1>
        <p className="mt-2 max-w-2xl text-sm text-gray-600 dark:text-gray-400">
          Pull image posts and text announcements from the Slack channels listed in{' '}
          <code className="rounded bg-gray-100 px-1 text-[11px] dark:bg-gray-800">SLACK_CHANNEL_IDS</code> (only those
          IDs are scanned). Same pipeline as the daily cron. After a sync, the list below refreshes.
        </p>

        <div className="mt-6 space-y-3">
          <PrimaryButton
            type="button"
            variant="outline"
            isLoading={slackSyncing}
            disabled={slackSyncing}
            className="justify-center"
            onClick={() => void handleSlackSync()}
          >
            {slackSyncing ? 'Scanning Slack…' : 'Extract from Slack workspace'}
          </PrimaryButton>
          {slackBanner ? (
            <div
              className={`rounded-lg p-3 text-sm ${
                slackBanner.tone === 'error'
                  ? 'bg-red-50 text-red-900 dark:bg-red-950/40 dark:text-red-100'
                  : slackBanner.tone === 'success'
                    ? 'bg-green-50 text-green-900 dark:bg-green-950/40 dark:text-green-100'
                    : 'bg-gray-50 text-gray-700 dark:bg-gray-900 dark:text-gray-200'
              }`}
            >
              {slackBanner.text}
            </div>
          ) : null}
        </div>
      </div>

      {listLoading ? (
        <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">Loading Slack-sourced items…</p>
      ) : (process.env.NEXT_PUBLIC_BACKEND_MODE === 'local' ? slackLocalSorted : slackFirebaseSorted).length > 0 ? (
        <div className="mt-10 space-y-6">
          <div>
            <h2 className="font-serif text-2xl font-bold text-gray-900 dark:text-gray-50">
              From Slack (last {SLACK_UI_LOOKBACK_DAYS} days)
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {slackWorkspaceHeading.length > 0 ? (
                <>
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {slackWorkspaceHeading.length > 1 ? 'Workspaces' : 'Workspace'}:{' '}
                  </span>
                  {slackWorkspaceHeading.join(' · ')}.{' '}
                </>
              ) : null}
              Same lookback as the scanner (
              <code className="rounded bg-gray-100 px-1 text-[11px] dark:bg-gray-800">SLACK_LOOKBACK_DAYS</code>
              , default 7).
            </p>
          </div>

          <div className="space-y-10">
            {process.env.NEXT_PUBLIC_BACKEND_MODE === 'local'
              ? slackLocalSorted.map((r) => {
                  const ev = r.event;
                  const createdLabel = r.createdAtIso ? new Date(r.createdAtIso).toLocaleString() : '';
                  const wsName = r.source?.slackWorkspaceName ?? r.source?.slackWorkspaceLabel;
                  const img = r.imageUrl;
                  return (
                    <div
                      key={r.id}
                      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs dark:border-gray-800 dark:bg-gray-950/80">
                        <span className="rounded-full bg-brand-orange/15 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-orange">
                          Slack
                        </span>
                        {wsName ? (
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{wsName}</span>
                        ) : null}
                        {r.source?.slackWorkspaceLabel ? (
                          <span className="text-gray-500 dark:text-gray-400">({r.source.slackWorkspaceLabel})</span>
                        ) : null}
                        {createdLabel ? (
                          <span className="ml-auto text-gray-400 dark:text-gray-500">{createdLabel}</span>
                        ) : null}
                      </div>
                      <div className="space-y-5 p-5 sm:p-6">
                        {img ? (
                          <div className="flex justify-center rounded-xl bg-gray-100 p-3 dark:bg-gray-950">
                            <img
                              src={img}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="max-h-80 w-auto max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100 text-4xl dark:bg-gray-950">
                            📄
                          </div>
                        )}
                        {ev ? (
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-gray-50">
                                Extracted details
                              </h3>
                              <span className="inline-flex items-center rounded-full border border-brand-orange/20 bg-brand-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                                AI
                              </span>
                            </div>
                            <ExtractedDetailsGrid event={ev} />
                            {ev.details ? (
                              <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                  Details
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                  {ev.details}
                                </p>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">No extracted event data.</p>
                        )}
                      </div>
                    </div>
                  );
                })
              : slackFirebaseSorted.map((f) => {
                  const ev = f.extractedEvent;
                  const createdLabel = f.createdAt
                    ? new Date((f.createdAt as { seconds: number }).seconds * 1000).toLocaleString()
                    : '';
                  const wsName = f.slackWorkspaceName ?? f.slackWorkspaceLabel;
                  const img = f.downloadURL;
                  return (
                    <div
                      key={f.id ?? f.storagePath}
                      className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >
                      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs dark:border-gray-800 dark:bg-gray-950/80">
                        <span className="rounded-full bg-brand-orange/15 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-orange">
                          Slack
                        </span>
                        {wsName ? (
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{wsName}</span>
                        ) : null}
                        {f.slackWorkspaceLabel ? (
                          <span className="text-gray-500 dark:text-gray-400">({f.slackWorkspaceLabel})</span>
                        ) : null}
                        {createdLabel ? (
                          <span className="ml-auto text-gray-400 dark:text-gray-500">{createdLabel}</span>
                        ) : null}
                      </div>
                      <div className="space-y-5 p-5 sm:p-6">
                        {img ? (
                          <div className="flex justify-center rounded-xl bg-gray-100 p-3 dark:bg-gray-950">
                            <img
                              src={img}
                              alt=""
                              referrerPolicy="no-referrer"
                              className="max-h-80 w-auto max-w-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="flex h-40 items-center justify-center rounded-xl bg-gray-100 text-4xl dark:bg-gray-950">
                            📄
                          </div>
                        )}
                        {ev ? (
                          <>
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-gray-50">
                                Extracted details
                              </h3>
                              <span className="inline-flex items-center rounded-full border border-brand-orange/20 bg-brand-orange/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-orange">
                                AI
                              </span>
                            </div>
                            <ExtractedDetailsGrid event={ev} />
                            {ev.details ? (
                              <div>
                                <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                  Details
                                </div>
                                <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                                  {ev.details}
                                </p>
                              </div>
                            ) : null}
                          </>
                        ) : (
                          <p className="text-sm text-gray-500">No extracted event data.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      ) : (
        <p className="mt-10 text-sm text-gray-500 dark:text-gray-400">
          No Slack-sourced flyers in the last {SLACK_UI_LOOKBACK_DAYS} days yet. Run a sync after posts land in your
          configured channels.
        </p>
      )}
    </main>
  );
}
