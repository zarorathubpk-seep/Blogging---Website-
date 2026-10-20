import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import { setAnalyticsConsent, isCookieYesActive, getCookieYesConsent } from '../utils/analytics';

interface CookieConsentBannerProps {
  onNavigate: (path: string) => void;
}

export const CookieConsentBanner: React.FC<CookieConsentBannerProps> = ({ onNavigate }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      // If CookieYes is installed or active on the site, suppress fallback banner
      if (isCookieYesActive() || getCookieYesConsent() !== null) {
        return;
      }

      const stored = localStorage.getItem('toolcrest_analytics_consent');
      if (!stored) {
        // Show after a brief delay so it doesn't jarringly block the viewport on initial render
        const timer = setTimeout(() => {
          // Double-check CookieYes hasn't dynamically loaded in the meantime
          if (!isCookieYesActive()) {
            setIsVisible(true);
          }
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage not accessible
    }
  }, []);

  if (!isVisible) return null;

  const handleAccept = () => {
    setAnalyticsConsent(true);
    setIsVisible(false);
  };

  const handleDecline = () => {
    setAnalyticsConsent(false);
    setIsVisible(false);
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-fadeIn">
      <div className="bg-[#111827]/95 backdrop-blur-md text-[#CBD5E1] border border-[#F3B542]/30 rounded-2xl p-4 sm:p-5 shadow-2xl space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F3B542]/15 text-[#F3B542] border border-[#F3B542]/30 flex items-center justify-center shrink-0">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-white">Privacy & Cookie Preferences</h4>
              <p className="text-[11px] text-[#CBD5E1]/80 leading-tight">
                ToolCrest processes files 100% in your browser. We use cookies and GA4 to analyze traffic.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleDecline}
            className="text-slate-400 hover:text-white transition p-1 cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-between gap-2 pt-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setIsVisible(false);
              onNavigate('/cookie-policy');
            }}
            className="text-[11px] text-slate-400 hover:text-[#F3B542] underline underline-offset-2 transition cursor-pointer"
          >
            Read Cookie Policy
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecline}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-[11px] font-semibold transition cursor-pointer"
            >
              Essential Only
            </button>
            <button
              type="button"
              onClick={handleAccept}
              className="px-3.5 py-1.5 rounded-xl bg-[#F3B542] hover:bg-[#dfa234] text-slate-950 text-[11px] font-bold shadow-md transition cursor-pointer"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
