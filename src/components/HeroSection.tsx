import React from 'react';
import { Sparkles, ShieldCheck, Printer, Smartphone } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="pt-8 pb-10 sm:pt-12 sm:pb-14 border-b border-slate-200/80 bg-linear-to-b from-white via-slate-50/50 to-slate-50 print:hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Subtle Pill Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Free Browser-Based Planner Tool • No Sign-Up Needed</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          Plan Your Week in Minutes, Not Hours
        </h1>

        {/* Hero Text */}
        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-6">
          Pick a planner type, add your goals and tasks, and get a clean, ready-to-use plan. No sign-up needed. Print it, save it as a PDF, or keep it in your browser.
        </p>

        {/* Trust Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600 mb-8">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Runs 100% in your browser
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Printer className="w-4 h-4 text-emerald-600" />
            Print-optimized layouts
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
            <Smartphone className="w-4 h-4 text-emerald-600" />
            Mobile & tablet friendly
          </span>
        </div>

        {/* Visual Hero Image Banner Showcase */}
        <div className="relative mx-auto max-w-4xl rounded-3xl overflow-hidden border border-slate-200/90 shadow-lg group">
          <img
            src="/src/assets/images/hero_planner_workspace_1791414654531.jpg"
            alt="Minimalist workspace desk with printed weekly planner notebook, ink pen, and laptop in natural morning sunlight"
            referrerPolicy="no-referrer"
            className="w-full h-56 sm:h-80 md:h-96 object-cover object-center group-hover:scale-101 transition duration-500"
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-transparent to-transparent flex items-end justify-between p-4 sm:p-6 text-white text-left">
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase bg-emerald-600 text-white px-2.5 py-0.5 rounded-full inline-block mb-1">
                Distraction-Free Planning
              </span>
              <p className="text-sm sm:text-base font-semibold drop-shadow-sm">
                Clean, printable planning frameworks for personal life and office work
              </p>
            </div>
            <span className="hidden sm:inline-block text-xs text-slate-200 font-mono bg-black/40 backdrop-blur-xs px-3 py-1 rounded-lg">
              US & UK Ready
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
