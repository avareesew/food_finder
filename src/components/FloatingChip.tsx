import { ReactNode } from 'react';

interface FloatingChipProps {
    icon: ReactNode;
    position: string; // e.g., "top-10 left-10"
    delay?: number; // Animation delay in ms
}

export default function FloatingChip({ icon, position, delay = 0 }: FloatingChipProps) {
    return (
        <div
            className={`absolute ${position} bg-white p-3 rounded-full shadow-float border border-gray-50 flex items-center justify-center text-2xl z-20 animate-float`}
            style={{ animationDelay: `${delay}ms` }}
        >
            {icon}
        </div>
    );
}
