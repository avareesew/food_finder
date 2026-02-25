import Link from 'next/link';
import PrimaryButton from './PrimaryButton';

interface EmptyStateProps {
    title: string;
    description: string;
    actionLabel?: string;
    actionLink?: string;
}

export default function EmptyState({ title, description, actionLabel, actionLink }: EmptyStateProps) {
    return (
        <div className="text-center py-12 px-4">
            <div className="mx-auto h-12 w-12 text-4xl mb-4">
                👻
            </div>
            <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-50">{title}</h3>
            <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto dark:text-gray-400">{description}</p>
            {actionLabel && actionLink && (
                <div className="mt-6">
                    <Link href={actionLink}>
                        <PrimaryButton className="mx-auto text-sm px-4 py-2">
                            {actionLabel}
                        </PrimaryButton>
                    </Link>
                </div>
            )}
        </div>
    );
}
