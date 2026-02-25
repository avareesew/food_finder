import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    isLoading?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
}

export default function PrimaryButton({
    children,
    isLoading,
    className = '',
    variant = 'primary',
    ...props
}: PrimaryButtonProps) {

    const baseStyles = "relative overflow-hidden group font-semibold tracking-wide py-4 px-8 rounded-2xl transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus:ring-4 focus:ring-primary-light";

    const variants = {
        primary: "bg-[#FF5A1F] text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 hover:bg-[#E64A19] hover:-translate-y-0.5 active:translate-y-0",
        secondary: "bg-[#FFF0E5] text-[#FF5A1F] hover:bg-[#FFDBCC] dark:bg-gray-900 dark:text-[#FF5A1F] dark:hover:bg-gray-800",
        outline: "bg-white border-2 border-gray-100 text-gray-600 hover:border-[#FF5A1F] hover:text-[#FF5A1F] dark:bg-gray-900 dark:border-gray-800 dark:text-gray-200 dark:hover:border-[#FF5A1F] dark:hover:text-[#FF5A1F]"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            )}
            <span className="relative z-10 flex items-center gap-2">{children}</span>
        </button>
    );
}
