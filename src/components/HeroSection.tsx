import React from 'react';
import { Sparkles, ShieldCheck, Printer, Smartphone } from 'lucide-react';
import { AppImage } from './AppImage';
import { ASSET_IMAGES } from '../utils/assets';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-amber-500/20 bg-gradient-to-b from-[#090d18] via-[#0b0f1a] to-[#070a13] print:hidden text-slate-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/35 text-amber-300 text-xs font-bold mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>100% Free Browser-Based Planner Tool • No Sign-Up Needed</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
          Plan Your Week in <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">Minutes</span>, Not Hours
        </h1>

        {/* Hero Text */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
          Pick a planner type, add your goals and tasks, and get a clean, ready-to-use plan. No sign-up needed. Print it, save it as a PDF, or keep it in your browser.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-300 mb-8">
          <span className="flex items-center gap-1.5 bg-[#0e1424] px-3.5 py-1.5 rounded-xl border border-amber-500/30 shadow-md text-amber-200">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Runs 100% in your browser
          </span>
          <span className="flex items-center gap-1.5 bg-[#0e1424] px-3.5 py-1.5 rounded-xl border border-amber-500/30 shadow-md text-amber-200">
            <Printer className="w-4 h-4 text-amber-400" />
            Print-optimized layouts
          </span>
          <span className="flex items-center gap-1.5 bg-[#0e1424] px-3.5 py-1.5 rounded-xl border border-amber-500/30 shadow-md text-amber-200">
            <Smartphone className="w-4 h-4 text-amber-400" />
            Mobile & tablet friendly
          </span>
        </div>

        {/* Visual Hero Image Banner Showcase */}
        <div className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden border border-amber-500/30 shadow-2xl group">
          <AppImage
            src={ASSET_IMAGES.completeCollection}
            alt="Complete planner system flat lay with weekly schedule grid, monthly budget ledger, daily time blocks, and stationery"
            fallbackSrc={ASSET_IMAGES.heroWorkspace}
            className="w-full h-56 sm:h-80 md:h-96 object-cover object-center group-hover:scale-101 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent flex items-end justify-between p-4 sm:p-6 text-white text-left">
            <div>
              <span className="text-[11px] font-black tracking-wider uppercase bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 px-2.5 py-0.5 rounded-full inline-block mb-1 shadow-xs">
                Distraction-Free Planning
              </span>
              <p className="text-sm sm:text-base font-semibold drop-shadow-sm text-slate-100">
                Clean, printable planning frameworks for personal life and office work
              </p>
            </div>
            <span className="hidden sm:inline-block text-xs text-amber-300 font-mono bg-black/60 backdrop-blur-xs px-3 py-1 rounded-lg border border-amber-500/30">
              US & UK Ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
