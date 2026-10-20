import React from 'react';
import { Users, Target, ShieldCheck, Heart, Sparkles, ChevronRight, Award } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface AboutUsPageProps {
  onNavigate: (path: string) => void;
}

export const AboutUsPage: React.FC<AboutUsPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 transition-colors duration-200 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
      {/* Breadcrumb */}
      <nav className={`flex items-center gap-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className={`transition cursor-pointer ${isDark ? 'hover:text-amber-300' : 'hover:text-amber-700'}`}
        >
          Home
        </button>
        <ChevronRight className={`w-3.5 h-3.5 ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
        <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>About Us</span>
      </nav>

      {/* Hero */}
      <div
        className={`rounded-3xl p-6 sm:p-8 space-y-3 border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
            : 'bg-white border-slate-200/90 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
              isDark
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                : 'bg-amber-100 text-amber-800 border border-amber-300'
            }`}
          >
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              About ToolCrest
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Building private, lightning-fast digital tools and practical knowledge for professionals worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Main Narrative */}
      <div
        className={`rounded-3xl p-6 sm:p-8 text-sm leading-relaxed space-y-6 border transition-colors duration-200 ${
          isDark
            ? 'bg-[#0c101d] border-amber-500/25 text-slate-300 shadow-xl'
            : 'bg-white border-slate-200/90 text-slate-700 shadow-sm'
        }`}
      >
        <section className="space-y-3">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Target className="w-4 h-4 text-amber-500" />
            Our Mission
          </h2>
          <p>
            At <strong className={isDark ? 'text-white' : 'text-slate-900'}>ToolCrest</strong>, we believe everyday software utility should be accessible to everyone—without paywalls, forced subscriptions, intrusive software installations, or compromises to personal privacy.
          </p>
          <p>
            Whether you need to merge sensitive contracts, calculate a 50/30/20 household budget, generate a Wi-Fi QR code, or organize your entire work week, ToolCrest provides instant, beautifully engineered browser utilities that get the job done in seconds.
          </p>
        </section>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div
            className={`p-4 rounded-2xl space-y-2 border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Privacy by Architecture</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Files are processed locally in your web browser. Your private documents never touch our servers.
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl space-y-2 border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Zero Friction</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              No sign-up barriers, no credit cards, and no download waiting queues. Open the page and work immediately.
            </p>
          </div>

          <div
            className={`p-4 rounded-2xl space-y-2 border ${
              isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
              }`}
            >
              <Award className="w-4 h-4" />
            </div>
            <h3 className={`font-bold text-xs ${isDark ? 'text-white' : 'text-slate-900'}`}>Editorial Integrity</h3>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Our productivity guides, PDF tutorials, and budgeting guides are written by real practitioners with practical experience.
            </p>
          </div>
        </div>

        <section className="space-y-3 pt-2">
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <Heart className="w-4 h-4 text-amber-500" />
            The Editorial Team
          </h2>
          <p>
            Our content and software tools are maintained by the <strong className={isDark ? 'text-white' : 'text-slate-900'}>ToolCrest Engineering & Editorial Team</strong>. Our contributors include frontend engineers, document workflow specialists, and productivity researchers serving users globally.
          </p>
          <p>
            We continually update our guides to provide actionable tutorials on time management, document manipulation standards, and personal finance organizers.
          </p>
          <div className={`pt-3 border-t flex flex-wrap gap-4 text-xs ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-600'}`}>
            <span>Email: <a href="mailto:info@toolcrest.site" className={`font-semibold hover:underline ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>info@toolcrest.site</a></span>
            <span>Phone: <a href="tel:+9230305881136" className={`font-semibold hover:underline ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>+9230305881136</a></span>
          </div>
        </section>
      </div>
    </div>
  );
};
