'use client';

import { useEffect, type ReactNode } from 'react';

type Props = {
    open: boolean;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onCancel: () => void;
    /** When true, primary action is styled as destructive (delete). */
    variant?: 'default' | 'danger';
    isBusy?: boolean;
};

/**
 * In-app confirm dialog (replaces window.confirm) with the same dark overlay treatment as EventDetailModal.
 */
export default function ConfirmModal({
    open,
    title,
    description,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    variant = 'default',
    isBusy = false,
}: Props) {
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && !isBusy) onCancel();
        };
        window.addEventListener('keydown', onKey);
        return () => {
            document.body.style.overflow = prev;
            window.removeEventListener('keydown', onKey);
        };
    }, [open, isBusy, onCancel]);

    if (!open) return null;

    const confirmClasses =
        variant === 'danger'
            ? 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500/40 disabled:opacity-60'
            : 'bg-[#FF5A1F] text-white hover:bg-[#E64A19] focus-visible:ring-orange-500/40 disabled:opacity-60';

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-[3px]"
            role="presentation"
            onClick={isBusy ? undefined : onCancel}
        >
            <div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-modal-title"
                aria-describedby="confirm-modal-desc"
                className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-gray-950 p-6 text-gray-100 shadow-[0_25px_80px_-20px_rgba(0,0,0,0.85)]"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 id="confirm-modal-title" className="font-serif text-xl font-bold text-white">
                    {title}
                </h2>
                <div
                    id="confirm-modal-desc"
                    className="mt-3 text-sm leading-relaxed text-gray-300 [&_strong]:font-semibold [&_strong]:text-gray-100"
                >
                    {description}
                </div>
                <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={onCancel}
                        className="rounded-xl border border-gray-600 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-gray-200 transition hover:bg-gray-800 disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        disabled={isBusy}
                        onClick={onConfirm}
                        className={`rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-950 ${confirmClasses}`}
                    >
                        {isBusy ? 'Please wait…' : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
