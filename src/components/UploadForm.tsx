'use client';

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { getRecentFlyers, Flyer } from '@/services/flyers';
import PrimaryButton from './ui/PrimaryButton';
import { logger } from '@/lib/logger';

type ExtractedEvent = {
    title: string | null;
    host: string | null;
    campus: string | null;
    date: string | null; // YYYY-MM-DD
    startTime: string | null; // HH:MM 24h
    endTime: string | null; // HH:MM 24h
    place: string | null;
    food: string | null;
    foodCategory: string | null;
    details: string | null;
    other: Record<string, unknown> | null;
};

type LocalRecentRecord = {
    id: string;
    createdAtIso: string;
    imageUrl?: string | null;
    source?: {
        originalFilename?: string;
    };
    event?: {
        title?: string | null;
    };
};

export default function UploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [extracted, setExtracted] = useState<ExtractedEvent | null>(null);
    const [savedId, setSavedId] = useState<string | null>(null);
    const [recentFlyers, setRecentFlyers] = useState<Flyer[]>([]);
    const [localRecents, setLocalRecents] = useState<LocalRecentRecord[]>([]);
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
            const flyers = await getRecentFlyers();
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
            console.error('Failed to fetch local recent flyers', error);
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

        logger.info('upload-submit-start', { fileName: file.name });
        const formData = new FormData();
        formData.append('file', file);

        try {
            const endpoint =
                process.env.NEXT_PUBLIC_BACKEND_MODE === 'firebase'
                    ? '/api/upload'
                    : '/api/local/extract';

            const response = await fetch(endpoint, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage(
                    process.env.NEXT_PUBLIC_BACKEND_MODE === 'firebase'
                        ? 'Flyer uploaded successfully!'
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
            } else {
                setStatus('error');
                setMessage(result.error || 'Upload failed');
                logger.warn('upload-submit-failed', {
                    status: response.status,
                    message: result.error,
                });
            }
        } catch (error) {
            logger.error('upload-submit-error', {
                message: error instanceof Error ? error.message : 'Unknown error',
            });
            setStatus('error');
            setMessage('An unexpected error occurred');
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
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 dark:bg-gray-900 dark:border-gray-800">
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
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">{message}</h3>
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
                        disabled={!file}
                        className="w-full justify-center"
                    >
                        {uploading ? 'Extracting...' : 'Extract Flyer'}
                    </PrimaryButton>
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
                                {savedId ? `Saved to data/events.json as ${savedId}` : 'Saved to data/events.json'}
                            </p>
                        </div>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-brand-orange/10 text-brand-orange border border-brand-orange/20 dark:bg-brand-orange/15">
                            AI
                        </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 text-sm">
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-gray-500 dark:text-gray-400">Title</div>
                            <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
                                {extracted.title ?? '—'}
                            </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-gray-500 dark:text-gray-400">Host</div>
                            <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
                                {extracted.host ?? '—'}
                            </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-gray-500 dark:text-gray-400">Campus</div>
                            <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
                                {extracted.campus ?? '—'}
                            </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-gray-500 dark:text-gray-400">Date</div>
                            <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
                                {extracted.date ?? '—'}
                            </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-gray-500 dark:text-gray-400">Time</div>
                            <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
                                {extracted.startTime ? (
                                    <span>
                                        {extracted.startTime}
                                        {extracted.endTime ? ` – ${extracted.endTime}` : ''}
                                    </span>
                                ) : (
                                    '—'
                                )}
                            </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-gray-500 dark:text-gray-400">Place</div>
                            <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
                                {extracted.place ?? '—'}
                            </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-gray-500 dark:text-gray-400">Food</div>
                            <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
                                {extracted.food ?? '—'}
                            </div>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                            <div className="text-gray-500 dark:text-gray-400">Category</div>
                            <div className="text-right font-semibold text-gray-900 dark:text-gray-50">
                                {extracted.foodCategory ?? '—'}
                            </div>
                        </div>
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
                                        <p className="text-base font-serif font-bold text-gray-900 truncate pr-4 dark:text-gray-50" title={flyer.originalFilename}>
                                            {flyer.originalFilename}
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
