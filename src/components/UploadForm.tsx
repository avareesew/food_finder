'use client';

import { useState, useEffect, useRef, ChangeEvent, FormEvent } from 'react';
import { getRecentFlyers, Flyer } from '@/services/flyers';
import PrimaryButton from './ui/PrimaryButton';
import { logger } from '@/lib/logger';

export default function UploadForm() {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [recentFlyers, setRecentFlyers] = useState<Flyer[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchRecentFlyers();
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

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            const objectUrl = URL.createObjectURL(selectedFile);
            setPreview(objectUrl);
            setStatus('idle');
            setMessage('');
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!file) return;

        setUploading(true);
        setStatus('idle');
        setMessage('');

        logger.info('upload-submit-start', { fileName: file.name });
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (response.ok) {
                setStatus('success');
                setMessage('Flyer uploaded successfully!');
                setFile(null);
                setPreview(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
                fetchRecentFlyers();
                logger.info('upload-submit-success', {
                    fileName: file.name,
                    flyerId: result.flyerId,
                });
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
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <label className="block text-xl font-serif font-bold text-gray-900">
                            Select Flyer Image
                        </label>
                        <div className="mt-1 flex justify-center px-6 pt-10 pb-10 border-2 border-gray-200 border-dashed rounded-[1.5rem] hover:bg-orange-50/50 hover:border-[#FF5A1F]/50 transition-all cursor-pointer relative group">
                            <div className="space-y-2 text-center">
                                {!preview ? (
                                    <>
                                        <div className="mx-auto h-16 w-16 bg-orange-100 text-[#FF5A1F] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <svg className="h-8 w-8" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <span className="relative rounded-md font-bold text-[#FF5A1F] hover:text-orange-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-orange-500">
                                                Upload a file
                                            </span>
                                            <p className="pl-1">or drag and drop</p>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
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
                        {uploading ? 'Uploading...' : 'Upload Flyer'}
                    </PrimaryButton>
                </form>
            </div>

            <div className="mt-12">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <span>Recent Uploads</span>
                    <span className="bg-[#FF5A1F]/10 text-[#FF5A1F] text-sm font-bold px-3 py-1 rounded-full">{recentFlyers.length}</span>
                </h3>

                {recentFlyers.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <p className="text-gray-500 text-sm">No uploads yet. Be the first!</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentFlyers.map((flyer) => (
                            <div key={flyer.id} className="flex items-start space-x-4 p-4 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:translate-x-1 transition-all cursor-default">
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
                                        <p className="text-base font-serif font-bold text-gray-900 truncate pr-4" title={flyer.originalFilename}>
                                            {flyer.originalFilename}
                                        </p>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${flyer.status === 'available' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-gray-100 text-gray-600'
                                            }`}>
                                            {flyer.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-400 mt-1 font-medium">
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
