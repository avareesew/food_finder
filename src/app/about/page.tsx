import Link from 'next/link';
import PrimaryButton from '@/components/ui/PrimaryButton';

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-brand-canvas pt-28 pb-20">

            {/* Hero Section */}
            <section className="px-6 mb-20">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="inline-block py-1 px-3 rounded-full bg-orange-100 text-brand-orange text-xs font-bold uppercase tracking-widest mb-6">
                        Our Mission
                    </span>
                    <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-8 leading-[1.1]">
                        Make invisible food <br />
                        <span className="text-brand-orange">discoverable.</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        41% of students experience food insecurity, yet thousands of pounds of catering goes to waste every day. We're closing that gap with AI.
                    </p>
                </div>
            </section>

            {/* The Problem Grid */}
            <section className="px-6 mb-24">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-center">
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-3xl mb-6">
                            🗑️
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">The Waste</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">
                            Every day, club meetings and department events end with leftover pizza, sandwiches, and catering. Without a way to share it quickly, it gets tossed in the trash.
                        </p>
                    </div>
                    <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
                        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center text-3xl mb-6 relative z-10">
                            🎓
                        </div>
                        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4 relative z-10">The Hunger</h3>
                        <p className="text-gray-600 text-lg leading-relaxed relative z-10">
                            Meanwhile, thousands of students are skipping meals or running on empty because they can't afford decent food. It's an information problem, not a supply problem.
                        </p>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="px-6 mb-24">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-gray-900 mb-6">Built for Campus Life</h2>
                        <p className="text-gray-600 text-lg">No apps to download. No accounts to create. Just food.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '📸',
                                title: 'Snap',
                                desc: 'Organizers take a photo of any food flyer they see on campus.'
                            },
                            {
                                icon: '🤖',
                                title: 'Scan',
                                desc: 'Our Gemini AI reads the flyer and extracts date, time, and location instantly.'
                            },
                            {
                                icon: '🍕',
                                title: 'Serve',
                                desc: 'Students see a real-time feed of free food nearby. No login required.'
                            }
                        ].map((feature, i) => (
                            <div key={i} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-center group">
                                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-4xl mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-500 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="px-6 mb-20">
                <div className="max-w-4xl mx-auto bg-[#FFF0E5] rounded-[3rem] p-8 md:p-16 text-center relative overflow-hidden">
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-serif font-bold text-brand-orange mb-8">
                            Stigma-Free. <br />
                            Community-Led.
                        </h2>
                        <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
                            We believe finding food shouldn't feel like applying for aid. It should feel like a scavenger hunt. By normalizing sharing, we build a stronger, more sustainable campus.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link href="/feed">
                                <PrimaryButton className="w-full sm:w-auto">
                                    Find Food Now
                                </PrimaryButton>
                            </Link>
                            <Link href="/upload">
                                <button className="px-8 py-4 rounded-2xl bg-white text-brand-orange font-bold hover:bg-orange-50 transition-colors w-full sm:w-auto shadow-sm">
                                    Post a Flyer
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer / Credits */}
            <div className="text-center text-gray-400 text-sm pb-10">
                <p>Designed with ❤️ by the Scavenger Team @ BYU</p>
            </div>

        </main>
    );
}
