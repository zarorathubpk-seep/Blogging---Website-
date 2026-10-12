import React, { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, ChevronRight, Clock, MapPin, ShieldCheck } from 'lucide-react';

interface ContactUsPageProps {
  onNavigate: (path: string) => void;
}

export const ContactUsPage: React.FC<ContactUsPageProps> = ({ onNavigate }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('Feedback / Suggestion');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setSubmitted(true);
  };

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
        <span className="text-slate-700 font-semibold">Contact Us</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs">
            <Mail className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Contact & Support
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Have a tool feature request, question, partnership inquiry, or editorial feedback? We’d love to hear from you.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Form & Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Form (7 cols) */}
        <div className="md:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            Send a Direct Message
          </h2>

          {submitted ? (
            <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Thank You for Your Feedback!</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your message has been received by our editorial and technical team. We typically respond within 24–48 business hours.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setMessage('');
                }}
                className="mt-2 text-xs font-bold text-emerald-700 hover:underline"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Jane Doe"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Inquiry Topic
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800"
                >
                  <option value="Feedback / Suggestion">Feedback / Suggestion</option>
                  <option value="Tool Bug Report">Tool Bug Report</option>
                  <option value="Feature Request">Request New Tool</option>
                  <option value="Advertising / RevBid / Partnerships">Advertising / Business Partnerships</option>
                  <option value="Editorial Question">Editorial Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="How can we help you?"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-99 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" /> Submit Inquiry
              </button>
            </form>
          )}
        </div>

        {/* Contact Info (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900">Direct Contact Channels</h3>

            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Official Support Email</span>
                  <a href="mailto:info@toolcrest.site" className="hover:text-emerald-700 underline font-semibold text-emerald-700">
                    info@toolcrest.site
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Phone / WhatsApp Support</span>
                  <a href="tel:+9230305881136" className="hover:text-emerald-700 underline font-semibold text-emerald-700">
                    +9230305881136
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">Support Hours</span>
                  <span>Monday – Friday, 9:00 AM – 6:00 PM (EST / GMT)</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <span className="font-bold text-slate-800 block">International Reach</span>
                  <span>United States, United Kingdom, Pakistan & Global Users</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 shadow-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-950">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Looking for Quick Answers?</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Check our extensive FAQ sections on individual tool pages and our comprehensive Privacy Policy for information regarding client-side data safety.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
