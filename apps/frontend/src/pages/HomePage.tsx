import React, { useEffect } from 'react';
import { createLogger, VERSION } from '@monorepo/shared';
import HeroSection from '../components/HeroSection';
import { useAnalytics } from '../context/analytics';

const logger = createLogger('Frontend');

const HomePage: React.FC = () => {
    const { trackEvent } = useAnalytics();

    useEffect(() => {
        logger.info('Home page mounted', { version: VERSION });
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
            </main>

            <footer className="mt-20 py-10 text-slate-500 text-sm flex flex-col items-center gap-2">
                <div>© 2026 Samuel Soita. All rights reserved.</div>
            </footer>
        </div>
    );
};

export default HomePage;
