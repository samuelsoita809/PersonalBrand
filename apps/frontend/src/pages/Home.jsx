import React, { useEffect } from 'react';
import { createLogger, VERSION } from '@monorepo/shared';

const logger = createLogger('Frontend');

const Home = () => {
    useEffect(() => {
        logger.info('Home page mounted', { version: VERSION });
        logger.trackEvent('page_view', { page: 'home' });
    }, []);
    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-center p-4 font-['Outfit',sans-serif]">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            {/* Hero Section */}
            <main className="max-w-4xl w-full">
                <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-12 shadow-2xl transition-all hover:border-white/20 group">
                    <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <span className="text-2xl font-bold">S</span>
                    </div>

                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        Samuel Soita
                    </h1>

                    <p className="text-xl text-slate-400 mb-8 leading-relaxed max-w-2xl">
                        Software Engineer & Digital Strategist. Building the future with
                        <span className="text-white font-medium"> Premium Code </span> and
                        <span className="text-white font-medium"> Aesthetic Design</span>.
                    </p>

                    <div className="flex gap-4">
                        <button className="px-8 py-3 bg-white text-black font-semibold rounded-full hover:bg-slate-200 transition-colors shadow-lg shadow-white/10">
                            View Projects
                        </button>
                        <button className="px-8 py-3 bg-transparent border border-white/20 rounded-full hover:bg-white/5 transition-colors">
                            Contact Me
                        </button>
                    </div>
                </div>

                {/* Status Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                    {[
                        { label: 'Cloud Status', value: 'Google Cloud Connected', color: 'bg-green-500' },
                        { label: 'Platform Engine', value: 'Vercel Edge Runtime', color: 'bg-blue-500' },
                        { label: 'AI Integration', value: 'Google AI Studio Ready', color: 'bg-purple-500' }
                    ].map((item, idx) => (
                        <div key={idx} className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">{item.label}</span>
                            </div>
                            <div className="text-sm font-medium">{item.value}</div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="mt-20 text-slate-500 text-sm flex flex-col items-center gap-2">
                <div>© 2026 Samuel Soita. Built with Antigravity.</div>
                <div className="text-[10px] uppercase tracking-tighter opacity-50">Build Version: {VERSION}</div>
            </footer>
        </div>
    );
};

export default Home;
