import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, ChevronRight, Clock, MapPin, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { sendContactMessage } from '../services/contactService';

interface ContactUsPageProps {
  onNavigate: (path: string) => void;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Feedback / Suggestion');
  const [message, setMessage] = useState('');
  const [botTrap, setBotTrap] = useState(''); // Anti-bot honeypot
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSending(true);

    try {
      await sendContactMessage({
        name,
        email,
        category,
        message,
        botTrap,
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Contact submission error:', err);
      setErrorMessage(err?.message || 'Failed to deliver message. Please check your network connection.');
    } finally {
      setIsSending(false);
    }
  };

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
        <span className={`font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Contact Us</span>
      </nav>

      {/* Header */}
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
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Contact & Support
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Have a tool feature request, question, partnership inquiry, or editorial feedback? We’d love to hear from you.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Form & Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form (7 cols) */}
        <div
          className={`md:col-span-7 rounded-3xl p-6 sm:p-8 space-y-4 border transition-colors duration-200 ${
            isDark
              ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
              : 'bg-white border-slate-200/90 shadow-sm'
          }`}
        >
          <h2 className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            <MessageSquare className="w-4 h-4 text-amber-500" />
            Send a Direct Message
          </h2>

          {submitted ? (
            <div
              className={`p-6 rounded-2xl text-center space-y-3 border ${
                isDark
                  ? 'bg-amber-500/10 border-amber-500/30 text-slate-200'
                  : 'bg-amber-50 border-amber-200 text-slate-800'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto ${
                  isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-100 text-amber-800'
                }`}
              >
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Thank You for Your Feedback!
              </h3>
              <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Your message has been received by our editorial and technical team. We typically respond within 24–48 business hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className={`mt-2 text-xs font-bold hover:underline cursor-pointer ${
                  isDark ? 'text-amber-400' : 'text-amber-800'
                }`}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-400 focus:outline-hidden border ${
                    isDark
                      ? 'bg-[#070a14] border-amber-500/30 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-amber-400 focus:outline-hidden border ${
                    isDark
                      ? 'bg-[#070a14] border-amber-500/30 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Inquiry Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full text-xs rounded-xl px-3.5 py-2.5 border ${
                    isDark
                      ? 'bg-[#070a14] border-amber-500/30 text-slate-200'
                      : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}
                >
                  <option value="Feedback / Suggestion">Feedback / Suggestion</option>
                  <option value="Tool Bug Report">Tool Bug Report</option>
                  <option value="Feature Request">Request New Tool</option>
                  <option value="Advertising / RevBid / Partnerships">Advertising / Business Partnerships</option>
                  <option value="Editorial Question">Editorial Question</option>
                </select>
              </div>

              {/* Error Alert */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-950/40 border border-rose-500/40 rounded-xl text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Anti-spam honeypot field (hidden from humans) */}
              <div className="hidden" aria-hidden="true" style={{ display: 'none' }}>
                <label htmlFor="website_url">Website Url</label>
                <input
                  id="website_url"
                  type="text"
                  name="website_url"
                  tabIndex={-1}
                  autoComplete="off"
                  value={botTrap}
                  onChange={(e) => setBotTrap(e.target.value)}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className={`w-full text-xs rounded-xl p-3 focus:ring-2 focus:ring-amber-400 focus:outline-hidden leading-relaxed border ${
                    isDark
                      ? 'bg-[#070a14] border-amber-500/30 text-white placeholder:text-slate-500'
                      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-105 active:scale-99 rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                {isSending ? 'Sending Message...' : 'Submit Inquiry'}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div
            className={`rounded-3xl p-6 space-y-4 border transition-colors duration-200 ${
              isDark
                ? 'bg-[#0c101d] border-amber-500/25 shadow-xl'
                : 'bg-white border-slate-200/90 shadow-sm'
            }`}
          >
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Direct Contact Channels
            </h3>

            <div className={`space-y-3 text-xs ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Official Support Email
                  </span>
                  <a
                    href="mailto:info@toolcrest.site"
                    className={`underline font-semibold ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-800 hover:text-amber-950'}`}
                  >
                    info@toolcrest.site
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Phone / WhatsApp Support
                  </span>
                  <a
                    href="tel:+9230305881136"
                    className={`underline font-semibold ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-800 hover:text-amber-950'}`}
                  >
                    +9230305881136
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Support Hours
                  </span>
                  <span>Monday – Friday, 9:00 AM – 6:00 PM (EST / GMT)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    International Reach
                  </span>
                  <span>United States, United Kingdom, Pakistan &amp; Global Users</span>
                </div>
              </div>
            </div>
          </div>

          <div
            className={`rounded-3xl p-6 space-y-2 border transition-colors duration-200 ${
              isDark
                ? 'bg-amber-500/10 border-amber-500/25 text-slate-200'
                : 'bg-amber-50/70 border-amber-200/80 text-slate-800 shadow-xs'
            }`}
          >
            <div className={`flex items-center gap-2 font-bold text-xs ${isDark ? 'text-amber-300' : 'text-amber-900'}`}>
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Looking for Quick Answers?</span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              Check our extensive FAQ sections on individual tool pages and our comprehensive Privacy Policy for information regarding client-side data safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
