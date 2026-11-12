import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Sliders, Check, Lock, ChevronDown, ChevronUp } from 'lucide-react';
import {
  setDetailedConsent,
  getStoredConsentPreferences,
  isCookieYesActive,
  getCookieYesConsent,
  ConsentPreferences,
} from '../utils/analytics';

interface CookieConsentBannerProps {
  onNavigate: (path: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showPreferencesModal, setShowPreferencesModal] = useState<boolean>(false);

  // Granular consent state
  const [analyticsEnabled, setAnalyticsEnabled] = useState<boolean>(true);
  const [advertisingEnabled, setAdvertisingEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Check if user already made choices
    const stored = getStoredConsentPreferences();
    if (stored) {
      setAnalyticsEnabled(stored.analytics);
      setAdvertisingEnabled(stored.advertising);
    } else {
      // If CookieYes is installed or active on the site, suppress fallback banner
      if (!isCookieYesActive() && getCookieYesConsent() === null) {
        const timer = setTimeout(() => {
          if (!isCookieYesActive()) {
            setIsVisible(true);
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    }

    // Global listener to re-open cookie preferences from footer or policy pages
    const handleOpenPreferences = () => {
      const current = getStoredConsentPreferences();
      if (current) {
        setAnalyticsEnabled(current.analytics);
        setAdvertisingEnabled(current.advertising);
      }
      setIsVisible(true);
      setShowPreferencesModal(true);
    };

    window.addEventListener('toolcrest_open_cookie_preferences', handleOpenPreferences);
    return () => {
      window.removeEventListener('toolcrest_open_cookie_preferences', handleOpenPreferences);
    };
  }, []);

  if (!isVisible) return null;

  const handleAcceptAll = () => {
    setDetailedConsent({ analytics: true, advertising: true });
    setAnalyticsEnabled(true);
    setAdvertisingEnabled(true);
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleDeclineNonEssential = () => {
    setDetailedConsent({ analytics: false, advertising: false });
    setAnalyticsEnabled(false);
    setAdvertisingEnabled(false);
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  const handleSavePreferences = () => {
    setDetailedConsent({ analytics: analyticsEnabled, advertising: advertisingEnabled });
    setIsVisible(false);
    setShowPreferencesModal(false);
  };

  return (
    <>
      {/* 1. COMPACT INITIAL BANNER */}
      {!showPreferencesModal && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 animate-fadeIn">
          <div className="bg-[#111827]/95 backdrop-blur-md text-[#CBD5E1] border border-[#F3B542]/35 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#F3B542]/15 text-[#F3B542] border border-[#F3B542]/30 flex items-center justify-center shrink-0">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-white">
                    Cookie & Advertising Preferences
                  </h4>
                  <p className="text-[11px] text-[#CBD5E1]/80 leading-tight mt-0.5">
                    ToolCrest processes files 100% in your browser. We respect your choices regarding traffic analytics and advertising partners (Google & RevBid).
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeclineNonEssential}
                className="text-slate-400 hover:text-white transition p-1 cursor-pointer shrink-0"
                title="Decline Non-Essential"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs border-t border-slate-800">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPreferencesModal(true)}
                  className="text-[11px] text-[#F3B542] hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Sliders className="w-3 h-3" />
                  <span>Customize</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsVisible(false);
                    onNavigate('/cookie-policy');
                  }}
                  className="text-[11px] text-slate-400 hover:text-white underline underline-offset-2 transition cursor-pointer"
                >
                  Cookie Policy
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleDeclineNonEssential}
                  className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] font-semibold transition cursor-pointer"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F3B542] hover:bg-[#dfa234] text-slate-950 text-[11px] font-bold shadow-md transition cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GRANULAR PREFERENCES MODAL */}
      {showPreferencesModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#0f1526] border border-[#F3B542]/40 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 text-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F3B542]/20 text-[#F3B542] border border-[#F3B542]/30 flex items-center justify-center">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base text-white">
                    Manage Privacy & Cookie Preferences
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Control which categories of cookies and identifiers you allow.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowPreferencesModal(false);
                  setIsVisible(false);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cookie Categories */}
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
              {/* Category 1: Strictly Necessary */}
              <div className="p-3.5 rounded-2xl bg-[#080c16] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-xs font-bold text-white">Strictly Necessary Cookies</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                    Always Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Required for site navigation, security token validation, in-browser document processing, and local settings storage. Cannot be disabled.
                </p>
              </div>

              {/* Category 2: Performance & Analytics */}
              <div className="p-3.5 rounded-2xl bg-[#080c16] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">Analytics Cookies (Google Analytics 4)</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F3B542]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Collects anonymous visitor counts, popular tools, and page view metrics to help us optimize performance. IP addresses are anonymized.
                </p>
              </div>

              {/* Category 3: Programmatic & Personalized Advertising */}
              <div className="p-3.5 rounded-2xl bg-[#080c16] border border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">
                    Advertising Cookies (RevBid & Google AdSense)
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={advertisingEnabled}
                      onChange={(e) => setAdvertisingEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#F3B542]"></div>
                  </label>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Enables authorized advertising partners (RevBid and Google AdSense) to display relevant, non-intrusive sponsorships and support free tool access. Only activated upon your explicit consent.
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleDeclineNonEssential}
                className="text-xs text-slate-400 hover:text-white transition underline cursor-pointer"
              >
                Reject All Non-Essential
              </button>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePreferences}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-200 transition cursor-pointer"
                >
                  Save Preferences
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="px-4 py-2 rounded-xl bg-[#F3B542] hover:bg-[#dfa234] text-slate-950 text-xs font-bold shadow-md transition cursor-pointer"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
