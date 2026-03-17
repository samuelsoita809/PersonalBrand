import React, { useEffect } from 'react';
import { createLogger, VERSION } from '@monorepo/shared';
import HeroSection from '../components/HeroSection';
import { useAnalytics } from '../context/analytics';

const logger = createLogger('Frontend');

const HomePage: React.FC = () => {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        logger.info('Home page mounted', { version: VERSION });
        trackEvent('page_view', { page: 'home' });
    }, [trackEvent]);

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col items-center p-4 font-['Outfit',sans-serif] overflow-x-hidden">
            {/* Background Glows */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/20 blur-[120px] rounded-full animate-pulse"></div>
            </div>

            {/* Dynamic Hero Section */}
            <main className="max-w-7xl w-full">
                <HeroSection />

                {/* Status Indicators preserved from previous design */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 px-6">
                    {[
                        { label: 'Cloud Status', value: 'Google Cloud Connected', color: 'bg-green-500' },
                        { label: 'Platform Engine', value: 'Vercel Edge Runtime', color: 'bg-blue-500' },
                        { label: 'AI Integration', value: 'Google AI Studio Ready', color: 'bg-purple-500' }
                    ].map((item, idx) => (
                        <div key={idx} className="backdrop-blur-md bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-all hover:scale-[1.02]">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                                <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">{item.label}</span>
                            </div>
                            <div className="text-sm font-medium">{item.value}</div>
                        </div>
                    ))}
                </div>
            </main>

            <footer className="mt-20 py-10 text-slate-500 text-sm flex flex-col items-center gap-2">
                <div>© 2026 Samuel Soita. Built with Antigravity.</div>
                <div className="text-[10px] uppercase tracking-tighter opacity-50">Build Version: {VERSION}</div>
            </footer>
        </div>
    );
};

export default HomePage;
