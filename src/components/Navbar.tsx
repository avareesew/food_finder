import Link from 'next/link';

export default function Navbar() {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-center pointer-events-none">
            <nav className="pointer-events-auto flex items-center justify-between bg-white/90 backdrop-blur-md px-6 py-3 rounded-full w-full max-w-xl shadow-none border-none ring-0">
                <Link href="/" className="font-bold text-xl tracking-tight text-gray-900 flex items-center gap-2">
                    <span>🍕</span>
                    <span className="hidden sm:inline">Scavenger</span>
                </Link>

                <div className="flex items-center gap-2">
                    <Link
                        href="/feed"
                        className="px-4 py-2 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                    >
                        Feed
                    </Link>
                    <Link href="/upload">
                        <button className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-gray-900/20">
                            Upload
                        </button>
                    </Link>
                </div>
            </nav>
        </div>
    );
}
