'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { getRecentFlyers, Flyer } from '@/services/flyers';
import type { ExtractedEvent } from '@/backend/openai/extractEventFromFlyer';
import ExtractedDetailsGrid from '@/components/extracted/ExtractedDetailsGrid';
import PrimaryButton from './ui/PrimaryButton';
import { logger } from '@/lib/logger';
import { useAuth, useFlyerUploadRequiresAuth } from '@/components/providers/AuthProvider';

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

export default function UploadForm() {
    const requiresFlyerAuth = useFlyerUploadRequiresAuth();
    const { user, me, loading: authLoading } = useAuth();
    const mayUploadFlyers = !requiresFlyerAuth || (Boolean(user) && Boolean(me?.canUpload));

    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [extracted, setExtracted] = useState<ExtractedEvent | null>(null);
    const [savedId, setSavedId] = useState<string | null>(null);
    const [recentFlyers, setRecentFlyers] = useState<Flyer[]>([]);
    const [localRecents, setLocalRecents] = useState<LocalRecentRecord[]>([]);
    const [errorDetails, setErrorDetails] = useState<string | null>(null);
    const [errorHint, setErrorHint] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (process.env.NEXT_PUBLIC_BACKEND_MODE === 'local') {
            fetchLocalRecents();
        } else {
            fetchRecentFlyers();
        }
    }, []);

    const fetchRecentFlyers = async () => {
        logger.info('fetch-recent-flyers-start');
        try {
            const flyers = await getRecentFlyers(100);
            setRecentFlyers(flyers);
            logger.info('fetch-recent-flyers-success', { count: flyers.length });
        } catch (error) {
            logger.error('fetch-recent-flyers-failure', {
                message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    };

    const fetchLocalRecents = async () => {
        try {
            const res = await fetch('/api/local/events');
            const json = await res.json();
            setLocalRecents(Array.isArray(json.records) ? (json.records as LocalRecentRecord[]) : []);
        } catch (error) {
            logger.error('local-recents-fetch-error', { message: error instanceof Error ? error.message : String(error) });
        }
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
            setStatus('idle');
            setMessage('');
            setExtracted(null);
            setSavedId(null);
            setErrorDetails(null);
            setErrorHint(null);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setStatus('idle');
        setMessage('');
        setExtracted(null);
        setSavedId(null);
        setErrorDetails(null);
        setErrorHint(null);

        logger.info('upload-submit-start', { fileName: file.name });

        try {
            const formData = new FormData();
            formData.append('file', file);

            const endpoint =
                process.env.NEXT_PUBLIC_BACKEND_MODE === 'firebase'
                    ? '/api/upload'
                    : '/api/local/extract';

            const headers: Record<string, string> = {};
            if (endpoint === '/api/upload' && requiresFlyerAuth && user) {
                const token = await user.getIdToken();
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: Object.keys(headers).length > 0 ? headers : undefined,
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(
                    process.env.NEXT_PUBLIC_BACKEND_MODE === 'firebase'
                        ? 'Flyer stored in Firebase and extracted successfully.'
                        : 'Flyer extracted successfully'
                );

                if (result?.event) {
                    setExtracted(result.event as ExtractedEvent);
                }
                if (result?.saved?.id && typeof result.saved.id === 'string') {
                    setSavedId(result.saved.id);
                }

                if (process.env.NEXT_PUBLIC_BACKEND_MODE === 'local') fetchLocalRecents();
                else fetchRecentFlyers();
            } else if (response.status === 422 && result?.validationFailed) {
                setStatus('error');
                setMessage(result.error || 'Flyer not saved');
                setErrorDetails(typeof result.details === 'string' ? result.details : null);
                const miss = Array.isArray(result.missing) ? (result.missing as string[]).filter(Boolean) : [];
                setErrorHint(
                    miss.length > 0
                        ? `Required on the flyer: ${miss.join(', ')}.`
                        : 'The flyer must include a clear date, time, and place before it can be saved.'
                );
                if (result?.event) {
                    setExtracted(result.event as ExtractedEvent);
                }
                setSavedId(null);
                logger.warn('upload-validation-rejected', {
                    missing: miss,
                    details: result.details,
                });
            } else {
                setStatus('error');
                setMessage(result.error || 'Upload failed');
                setErrorDetails(typeof result.details === 'string' ? result.details : null);
                setErrorHint(typeof result.hint === 'string' ? result.hint : null);
                logger.warn('upload-submit-failed', {
                    status: response.status,
                    message: result.error,
                    details: result.details,
                });
            }
        } catch (error) {
            const msg = error instanceof Error ? error.message : 'Unknown error';
            const code =
                error && typeof error === 'object' && 'code' in error
                    ? String((error as { code: unknown }).code)
                    : '';
            logger.error('upload-submit-error', {
                message: msg,
                code: code || undefined,
            });
            setStatus('error');
            setMessage('Upload or processing failed');
            setErrorDetails(code ? `${code}: ${msg}` : msg);
            setErrorHint(
                /storage\/|permission-denied/i.test(`${code} ${msg}`)
                    ? 'Allow reads/writes in Firebase Storage rules for path flyers/*, and Firestore rules for flyers.'
                    : null
            );
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setStatus('idle');
        setMessage('');
        setExtracted(null);
        setSavedId(null);
        setErrorDetails(null);
        setErrorHint(null);
    };

    return (
        <div className="max-w-3xl mx-auto px-1 sm:px-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 dark:bg-gray-900 dark:border-gray-800">
                {requiresFlyerAuth && authLoading ? (
                    <p className="mb-6 text-sm text-gray-600 dark:text-gray-300">Checking your account…</p>
                ) : null}
                {requiresFlyerAuth && !authLoading && user && !me?.canUpload ? (
                    <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-950/50 dark:text-gray-200">
                        <p className="font-semibold">Upload not enabled yet</p>
                        {me == null ? (
                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                Couldn&apos;t load your account permissions from the server. Check the terminal for API
                                errors, confirm Firebase Admin credentials in <code className="text-xs">.env</code>, then
                                refresh the page.
                            </p>
                        ) : !me.adminEmailConfigured ? (
                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                You&apos;re signed in as <span className="font-medium">{me.email}</span>. The server has
                                no <code className="text-xs">ADMIN_EMAIL</code> set, so nobody is treated as the
                                auto-admin. Add{' '}
                                <code className="text-xs break-all">ADMIN_EMAIL=you@example.com</code> (your exact
                                sign-in email) to <code className="text-xs">.env</code>, restart{' '}
                                <code className="text-xs">npm run dev</code>, and sign in again.
                            </p>
                        ) : (
                            <p className="mt-1 text-gray-600 dark:text-gray-300">
                                You&apos;re signed in as <span className="font-medium">{me.email}</span>. An admin must
                                turn on flyer upload for your account on the Admin page before you can post.
                            </p>
                        )}
                    </div>
                ) : null}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <label className="block text-xl font-serif font-bold text-gray-900 dark:text-gray-50">
                            Select Flyer Image
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-200 border-dashed rounded-[1.5rem] hover:bg-orange-50/50 hover:border-[#FF5A1F]/50 transition-all cursor-pointer relative group dark:border-gray-700 dark:hover:bg-gray-800/40">
                            <div className="space-y-2 text-center">
                                {!preview ? (
                                    <>
                                        <div className="mx-auto h-16 w-16 bg-orange-100 text-[#FF5A1F] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="flex text-sm text-gray-600 justify-center dark:text-gray-300">
                                            <span className="relative rounded-md font-bold text-[#FF5A1F] hover:text-orange-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                                Upload a file
                                            </span>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, GIF up to 10MB</p>
                                        <p className="text-xs text-amber-800/90 dark:text-amber-200/90 max-w-xs mx-auto mt-2 leading-snug">
                                            Flyers must show a <strong>date</strong>, <strong>time</strong> (start and/or end),
                                            and <strong>where</strong> it happens — otherwise we won&apos;t save the upload.
                                        </p>
                                    </>
                                ) : (
                                    <div className="relative group/preview">
                                        <img src={preview} alt="Preview" className="max-h-80 rounded-2xl object-contain mx-auto shadow-sm" />
                                        <button
                                            type="button"
                                            onClick={handleRemoveFile}
                                            className="absolute -top-3 -right-3 bg-white text-red-500 rounded-full p-2 shadow-lg hover:bg-red-50 transition-all z-10"
                                        >
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {status === 'error' && (
                        <div className="rounded-lg bg-red-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3 space-y-2">
                                    <h3 className="text-sm font-medium text-red-800 dark:text-red-200">{message}</h3>
                                    {errorDetails && (
                                        <pre className="text-xs text-red-900/90 whitespace-pre-wrap break-words font-mono bg-red-100/80 dark:bg-red-950/50 dark:text-red-100 rounded-md p-2 border border-red-200/80 dark:border-red-900">
                                            {errorDetails}
                                        </pre>
                                    )}
                                    {errorHint && (
                                        <p className="text-xs text-red-900/90 dark:text-red-200/90">{errorHint}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="rounded-lg bg-green-50 p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-green-800">{message}</h3>
                                </div>
                            </div>
                        </div>
                    )}

                    <PrimaryButton
                        type="submit"
                        isLoading={uploading}
                        disabled={!file || !mayUploadFlyers}
                        className="w-full justify-center"
                    >
                        {uploading ? 'Extracting...' : 'Extract Flyer'}
                    </PrimaryButton>

                    {me?.isAdmin ? (
                        <p className="text-center text-xs text-gray-500 dark:text-gray-400">
                            Admin: sync Slack posts from{' '}
                            <Link href="/admin/slack" className="font-semibold text-brand-orange hover:underline">
                                Admin → Slack
                            </Link>
                            .
                        </p>
                    ) : null}
                </form>
            </div>

            {/* Extracted details */}
            {status === 'success' && extracted && (
                <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-serif font-bold text-gray-900 dark:text-gray-50">
                                Extracted Details
                            </h3>
                            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                                {process.env.NEXT_PUBLIC_BACKEND_MODE === 'firebase'
                                    ? savedId
                                        ? `Saved to Firestore (flyers/${savedId})`
                                        : 'Saved to Firestore'
                                    : savedId
                                      ? `Saved to data/events.json as ${savedId}`
                                      : 'Saved to data/events.json'}
                            </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-orange/10 text-brand-orange border border-brand-orange/20 dark:bg-brand-orange/15">
                            AI
                        </span>
                    </div>

                    <div className="mt-5">
                        <ExtractedDetailsGrid event={extracted} />
                    </div>

                    {extracted.details && (
                        <div className="mt-5">
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500">
                                Details
                            </div>
                            <p className="mt-2 text-sm text-gray-700 leading-relaxed dark:text-gray-300">
                                {extracted.details}
                            </p>
                        </div>
                    )}

                    {extracted.other && (
                        <details className="mt-5">
                            <summary className="cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-200">
                                Other fields (JSON)
                            </summary>
                            <pre className="mt-3 text-xs bg-gray-50 border border-gray-200 rounded-xl p-4 overflow-auto dark:bg-gray-950 dark:border-gray-800 dark:text-gray-200">
{JSON.stringify(extracted.other, null, 2)}
                            </pre>
                        </details>
                    )}
                </div>
            )}

            <div className="mt-12">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2 dark:text-gray-50">
                    <span>Recent Uploads</span>
                    <span className="bg-[#FF5A1F]/10 text-[#FF5A1F] text-sm font-bold px-3 py-1 rounded-full">
                        {process.env.NEXT_PUBLIC_BACKEND_MODE === 'local' ? localRecents.length : recentFlyers.length}
                    </span>
                </h3>

                {process.env.NEXT_PUBLIC_BACKEND_MODE === 'local' ? (
                    localRecents.length === 0 ? (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                            <p className="text-gray-500 text-sm dark:text-gray-400">No uploads yet. Be the first!</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {localRecents.slice(0, 5).map((r) => (
                                <div key={r.id} className="flex items-start space-x-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:translate-x-1 transition-all cursor-default dark:bg-gray-900 dark:border-gray-800">
                                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                                        {r.imageUrl ? (
                                            <img
                                                src={r.imageUrl}
                                                alt="Flyer thumbnail"
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center text-xl">📄</div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="text-base font-serif font-bold text-gray-900 truncate pr-4 dark:text-gray-50" title={r.event?.title ?? r.source?.originalFilename ?? r.id}>
                                                {r.event?.title ?? r.source?.originalFilename ?? 'Flyer'}
                                            </p>
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 dark:bg-gray-950 dark:text-gray-300">
                                                local
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 font-medium dark:text-gray-500">
                                            Uploaded {r.createdAtIso ? new Date(r.createdAtIso).toLocaleString() : 'Just now'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : recentFlyers.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-800">
                        <p className="text-gray-500 text-sm dark:text-gray-400">No uploads yet. Be the first!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentFlyers.slice(0, 5).map((flyer) => (
                            <div key={flyer.id} className="flex items-start space-x-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:translate-x-1 transition-all cursor-default dark:bg-gray-900 dark:border-gray-800">
                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100 border border-gray-200">
                                    {flyer.downloadURL ? (
                                        <img
                                            src={flyer.downloadURL}
                                            alt="Flyer thumbnail"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-xl">📄</div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <p
                                            className="text-base font-serif font-bold text-gray-900 truncate pr-4 dark:text-gray-50"
                                            title={
                                                flyer.extractedEvent?.title?.trim()
                                                    ? flyer.extractedEvent.title
                                                    : flyer.originalFilename
                                            }
                                        >
                                            {flyer.extractedEvent?.title?.trim()
                                                ? flyer.extractedEvent.title
                                                : flyer.originalFilename}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${flyer.status === 'available' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {flyer.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 font-medium dark:text-gray-500">
                                        Uploaded {flyer.createdAt ? new Date(flyer.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
