'use client';

import { body } from '@/shared/lib/fonts';
import { useTheme } from '@/shared/hooks/useTheme';
import { AmbientBackground } from '@/shared/ui/AmbientBackground';
import { Navbar } from './ui/Navbar';
import { HeroSection } from './sections/HeroSection';
import { IntegrationsMarquee } from './demo/IntegrationsMarquee';
import { ComparisonSection } from './sections/ComparisonSection';
import { HowItWorksSection } from './sections/HowItWorksSection';
import { FeaturesSection } from './sections/FeaturesSection';
import { AiShowcaseSection } from './sections/AiShowcaseSection';
import { SplitBillSection } from './sections/SplitBillSection';
import { PricingSection } from './sections/PricingSection';
import { CtaBannerSection } from './sections/CtaBannerSection';
import { FooterSection } from './sections/FooterSection';


export function LandingView() {
    const { theme, toggle, mounted } = useTheme();

    if (!mounted) return null;

    return (
        <div className={`${body.className} relative min-h-screen text-[#0A0A0C] antialiased dark:text-[#F5F4F2]`}>
            <style
                dangerouslySetInnerHTML={{
                    __html: `
            @keyframes marquee {
              from { transform: translateX(0); }
              to { transform: translateX(-50%); }
            }
            html { scroll-behavior: smooth; }
            ::selection { background: #3B82F6; color: #FAFAF9; }
            :focus-visible { outline: 2px solid #3B82F6; outline-offset: 2px; }
            @media (prefers-reduced-motion: reduce) {
              *, *::before, *::after {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
              }
              html { scroll-behavior: auto; }
            }
          `,
                }}
            />

            <AmbientBackground />
            <Navbar theme={theme} toggleTheme={toggle} />

            <HeroSection />
            <IntegrationsMarquee />
            <ComparisonSection />
            <HowItWorksSection />
            <FeaturesSection />
            <AiShowcaseSection />
            <SplitBillSection />
            <PricingSection />
            <CtaBannerSection />
            <FooterSection />
        </div>
    );
}
