'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { getFlyer, Flyer } from '@/services/flyers';
import PrimaryButton from '@/components/ui/PrimaryButton';
import Link from 'next/link';

export default function EventDetailPage() {
    const params = useParams();
    const [flyer, setFlyer] = useState<Flyer | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadFlyer() {
            if (params.id) {
                const data = await getFlyer(params.id as string);
                setFlyer(data);
                setLoading(false);
            }
        }
        loadFlyer();
    }, [params.id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 animate-pulse">
                <div className="h-96 bg-gray-200"></div>
                <div className="max-w-3xl mx-auto px-6 -mt-32 relative">
                    <div className="bg-white rounded-3xl p-8 h-64"></div>
                </div>
            </div>
        );
    }

    if (!flyer) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <h1 className="text-4xl mb-4">😕</h1>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Event not found</h2>
                <p className="text-gray-500 mb-8">This food might have already disappeared.</p>
                <Link href="/feed">
                    <PrimaryButton variant="secondary">Back to Feed</PrimaryButton>
                </Link>
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-brand-canvas lg:flex">

            {/* Left Column: Immersive Image (Sticky on Desktop) */}
            <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-screen lg:sticky lg:top-0 bg-gray-100 overflow-hidden group">
                {/* Back Button (Floating on Mobile, Hidden on Desktop content side) */}
                <Link href="/feed" className="absolute top-6 left-6 z-20 lg:hidden">
                    <button className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-all border border-white/20 shadow-lg">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                        </svg>
                    </button>
                </Link>

                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500 z-10" />

                {flyer.downloadURL ? (
                    <img
                        src={flyer.downloadURL}
                        alt="Event Flyer"
                        className="w-full h-full object-cover transition-transform duration-[3s] ease-in-out group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                        <span className="text-9xl opacity-20">🍕</span>
                    </div>
                )}

                {/* Image Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden z-10" />
            </div>

            {/* Right Column: Scrollable Content */}
            <div className="w-full lg:w-1/2 flex flex-col min-h-screen relative">
                {/* Desktop Back Nav */}
                <div className="hidden lg:flex items-center p-8 pb-0">
                    <Link href="/feed" className="flex items-center gap-2 text-gray-500 hover:text-brand-orange transition-colors group">
                        <div className="p-2 rounded-full bg-white border border-gray-200 group-hover:border-brand-orange transition-colors">
                            <svg className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7 7-7" />
                            </svg>
                        </div>
                        <span className="font-medium text-sm">Back to Feed</span>
                    </Link>
                </div>

                <div className="flex-1 p-6 sm:p-12 lg:p-16 flex flex-col justify-center max-w-2xl mx-auto w-full">

                    {/* Status & Time Ticket */}
                    <div className="flex items-center flex-wrap gap-3 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-current/20 shadow-sm ${flyer.status === 'available'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${flyer.status === 'available' ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`}></span>
                            {flyer.status === 'available' ? 'Live Now' : 'Expired'}
                        </span>
                        <div className="h-px w-8 bg-gray-300 hidden sm:block"></div>
                        <span className="text-gray-400 text-xs font-semibold tracking-widest uppercase">
                            {flyer.createdAt?.seconds
                                ? new Date(flyer.createdAt.seconds * 1000).toLocaleString(undefined, {
                                    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                                })
                                : 'Just now'
                            }
                        </span>
                    </div>

                    {/* Main Title */}
                    <h1 className="text-5xl sm:text-6xl md:text-7xl font-serif font-black text-gray-900 leading-[0.9] mb-8 tracking-tight animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
                        {flyer.originalFilename}
                    </h1>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-6 mb-12 border-y border-gray-100 py-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Location</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                                <span>📍 Building 3220</span>
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Distance</p>
                            <div className="flex items-center gap-2 text-gray-900 font-medium text-lg">
                                <span>🚶 5 min walk</span>
                            </div>
                        </div>
                    </div>

                    {/* AI 'Tasting Notes' - Professional Redesign */}
                    <div className="bg-gray-50 rounded-[2.5rem] p-8 mb-10 border border-gray-100 relative overflow-hidden">

                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-3">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-orange text-white text-sm">✦</span>
                                On the Menu
                            </h3>
                            <div className="bg-white border border-gray-200 rounded-full px-4 py-1.5 flex items-center gap-2 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[10px] font-bold tracking-widest uppercase text-gray-500">AI Verified</span>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl p-1 shadow-sm border border-gray-100">
                            <div className="bg-white/50 rounded-[1.3rem] p-6">
                                <ul className="space-y-4">
                                    {['Pizza', 'Cookies', 'Soda'].map((item) => (
                                        <li key={item} className="flex items-center justify-between group cursor-default">
                                            <div className="flex items-center gap-4">
                                                <div className="h-1.5 w-1.5 rounded-full bg-gray-300 group-hover:bg-brand-orange transition-colors"></div>
                                                <span className="text-gray-900 font-medium text-lg leading-none group-hover:translate-x-1 transition-transform">{item}</span>
                                            </div>
                                            <div className="flex-1 mx-4 border-b border-dotted border-gray-200 relative top-1"></div>
                                            <span className="text-xs font-mono text-gray-400 group-hover:text-brand-orange transition-colors">100%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                    </div>

                    {/* Action Bar */}
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">
                        <PrimaryButton className="flex-1 py-5 text-lg shadow-2xl shadow-brand-orange/20 hover:shadow-brand-orange/30">
                            I&apos;m Going! 🏃‍♂️
                        </PrimaryButton>
                        <button className="flex-none h-16 w-16 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-[#FF5A1F] hover:border-[#FF5A1F] flex items-center justify-center transition-all shadow-sm hover:shadow-lg">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                            </svg>
                        </button>
                    </div>

                </div>
            </div>
        </main>
    );
}
