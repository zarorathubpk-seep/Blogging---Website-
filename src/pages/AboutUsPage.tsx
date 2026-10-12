import React from 'react';
import { Users, Target, ShieldCheck, Heart, Sparkles, ChevronRight, Award } from 'lucide-react';

interface AboutUsPageProps {
  onNavigate: (path: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onNavigate }) => {
  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-emerald-700 transition"
        >
          Home
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-700 font-semibold">About Us</span>
      </nav>

      {/* Hero */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              About ToolCrest
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Building private, lightning-fast digital tools and practical knowledge for professionals worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Main Narrative */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs text-sm text-slate-700 leading-relaxed space-y-6">
        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-600" />
            Our Mission
          </h2>
          <p>
            At <strong>ToolCrest</strong>, we believe everyday software utility should be accessible to everyone—without paywalls, forced subscriptions, intrusive software installations, or compromises to personal privacy.
          </p>
          <p>
            Whether you need to merge sensitive contracts, calculate a 50/30/20 household budget, generate a Wi-Fi QR code, or organize your entire work week, ToolCrest provides instant, beautifully engineered browser utilities that get the job done in seconds.
          </p>
        </section>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">Privacy by Architecture</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Files are processed locally in your web browser. Your private documents never touch our servers.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">Zero Friction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No sign-up barriers, no credit cards, and no download waiting queues. Open the page and work immediately.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-xs text-slate-900">Editorial Integrity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Our productivity guides, PDF tutorials, and budgeting guides are written by real practitioners with practical experience.
            </p>
          </div>
        </div>

        <section className="space-y-3 pt-2">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-emerald-600" />
            The Editorial Team
          </h2>
          <p>
            Our content and software tools are maintained by the <strong>ToolCrest Engineering & Editorial Team</strong>. Our contributors include frontend engineers, document workflow specialists, and productivity researchers serving users globally.
          </p>
          <p>
            We continually update our guides to provide actionable tutorials on time management, document manipulation standards, and personal finance organizers.
          </p>
          <div className="pt-3 border-t border-slate-100 flex flex-wrap gap-4 text-xs text-slate-600">
            <span>Email: <a href="mailto:info@toolcrest.site" className="text-emerald-700 font-semibold hover:underline">info@toolcrest.site</a></span>
            <span>Phone: <a href="tel:+9230305881136" className="text-emerald-700 font-semibold hover:underline">+9230305881136</a></span>
          </div>
        </section>
      </div>
    </div>
  );
};
