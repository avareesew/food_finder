'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const pathname = usePathname();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-canvas/80 backdrop-blur-md border-b border-gray-100/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20 relative">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link href="/" className="flex items-center gap-2">
                            <span className="text-2xl font-serif font-bold text-brand-orange">
                                Scavenger
                            </span>
                        </Link>
                    </div>

                    {/* Centered Navigation */}
                    <div className="hidden md:flex space-x-8 items-center absolute left-1/2 transform -translate-x-1/2">
                        <Link href="/" className="text-sm font-medium text-gray-900 hover:text-brand-orange transition-colors">
                            Home
                        </Link>
                        <Link href="/feed" className="text-sm font-medium text-gray-900 hover:text-brand-orange transition-colors">
                            Discover
                        </Link>
                        <Link href="/about" className="text-sm font-medium text-gray-900 hover:text-brand-orange transition-colors">
                            About
                        </Link>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-4">
                        <Link href="/feed">
                            <span className="text-sm font-medium text-gray-900 hover:text-brand-orange cursor-pointer hidden sm:block">
                                Browse Feed
                            </span>
                        </Link>
                        <Link href="/upload">
                            <button className="bg-[#FF5A1F] text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-all shadow-md hover:shadow-lg active:scale-95">
                                Upload Flyer
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
