export default function HeroPreview() {
    return (
        <div className="relative w-full max-w-sm mx-auto mt-12 mb-20 perspective-1000">
            {/* The "Phone" Frame */}
            <div className="relative bg-white rounded-3xl shadow-2xl border-4 border-gray-100 overflow-hidden z-10 transform transition-transform hover:scale-[1.02] duration-500">

                {/* Mock Phone Header */}
                <div className="px-6 py-4 border-b border-gray-50 flex justify-between items-center bg-white/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="font-bold text-gray-900">Feed</div>
                    <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400"></div>
                        <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                        <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    </div>
                </div>

                {/* Mock Content (Skeleton-ish but colorful) */}
                <div className="p-4 space-y-4 bg-gray-50 min-h-[400px]">
                    {/* Card 1 */}
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-xl">🍕</div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-100 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 opacity-90">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-xl">🥯</div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/3"></div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-3 opacity-75">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-xl">🌯</div>
                        <div className="flex-1 space-y-2 py-1">
                            <div className="h-4 bg-gray-100 rounded w-4/5"></div>
                            <div className="h-3 bg-gray-100 rounded w-1/4"></div>
                        </div>
                    </div>

                    {/* Fade out at bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent"></div>
                </div>

                {/* Bottom Nav Mock */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-200 rounded-full"></div>
            </div>

            {/* Background Blob/Glow behind phone */}
            <div className="absolute top-10 left-10 right-10 bottom-10 bg-primary/20 blur-3xl -z-10 rounded-full"></div>
        </div>
    );
}
