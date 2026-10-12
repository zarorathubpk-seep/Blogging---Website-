import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Copy,
  Check,
  Globe,
  FileText,
  Mail,
  Wifi,
  Phone,
  MessageSquare,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface QrGeneratorToolProps {
  onNavigate: (path: string) => void;
}

type QrType = 'url' | 'text' | 'email' | 'wifi' | 'phone' | 'sms';

export const QrGeneratorTool: React.FC<QrGeneratorToolProps> = ({ onNavigate }) => {
  const [qrType, setQrType] = useState<QrType>('url');

  // Input states
  const [urlVal, setUrlVal] = useState('https://toolcrest.site');
  const [textVal, setTextVal] = useState('Welcome to ToolCrest online tools!');
  const [emailTo, setEmailTo] = useState('info@toolcrest.site');
  const [emailSubject, setEmailSubject] = useState('Hello ToolCrest Support');
  const [emailBody, setEmailBody] = useState('I am reaching out via your QR code.');
  const [wifiSsid, setWifiSsid] = useState('MyOfficeGuest');
  const [wifiPass, setWifiPass] = useState('SuperSecretPass');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [phoneVal, setPhoneVal] = useState('+9230305881136');
  const [smsPhone, setSmsPhone] = useState('+9230305881136');
  const [smsBody, setSmsBody] = useState('Hi ToolCrest!');

  // Customization
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState<number>(300);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Preview & outputs
  const [dataUrl, setDataUrl] = useState<string>('');
  const [svgString, setSvgString] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Compute raw payload based on type
  const getPayload = (): string => {
    switch (qrType) {
      case 'url':
        return urlVal.startsWith('http://') || urlVal.startsWith('https://')
          ? urlVal
          : `https://${urlVal}`;
      case 'text':
        return textVal;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'wifi':
        return `WIFI:S:${wifiSsid};T:${wifiEnc};P:${wifiPass};;`;
      case 'phone':
        return `tel:${phoneVal.replace(/\s+/g, '')}`;
      case 'sms':
        return `smsto:${smsPhone.replace(/\s+/g, '')}:${smsBody}`;
      default:
        return urlVal;
    }
  };

  useEffect(() => {
    const payload = getPayload();
    if (!payload.trim()) return;

    // Generate PNG Data URL
    QRCode.toDataURL(payload, {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then((url) => setDataUrl(url))
      .catch((err) => console.error(err));

    // Generate SVG string
    QRCode.toString(payload, {
      type: 'svg',
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then((svg) => setSvgString(svg))
      .catch((err) => console.error(err));
  }, [
    qrType,
    urlVal,
    textVal,
    emailTo,
    emailSubject,
    emailBody,
    wifiSsid,
    wifiPass,
    wifiEnc,
    phoneVal,
    smsPhone,
    smsBody,
    fgColor,
    bgColor,
    size,
    errorCorrection,
  ]);

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = `toolcrest-qrcode-${qrType}.png`;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `toolcrest-qrcode-${qrType}.svg`;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleCopy = () => {
    if (!dataUrl) return;
    navigator.clipboard.writeText(getPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="hover:text-emerald-700 transition"
        >
          Tools
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-700 font-semibold">QR Code Generator</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-bold shadow-2xs">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  QR Code Generator
                </h1>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  High Resolution
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                Create custom QR codes for websites, Wi-Fi networks, emails, and contacts with instant preview and vector downloads.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Free • PNG & SVG Output</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Settings & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left column: Type Selector & Content Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
          {/* QR Type Pills */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              Select QR Type
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'url', label: 'URL', icon: Globe },
                { id: 'text', label: 'Text', icon: FileText },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
                { id: 'phone', label: 'Phone', icon: Phone },
                { id: 'sms', label: 'SMS', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                const isActive = qrType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setQrType(item.id as QrType)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type-Specific Inputs */}
          <div className="space-y-4 pt-1">
            {qrType === 'url' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Website URL / Link
                </label>
                <input
                  type="url"
                  value={urlVal}
                  onChange={(e) => setUrlVal(e.target.value)}
                  placeholder="https://example.com"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            )}

            {qrType === 'text' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Plain Text Content
                </label>
                <textarea
                  rows={4}
                  value={textVal}
                  onChange={(e) => setTextVal(e.target.value)}
                  placeholder="Enter message, note, or instructions..."
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden leading-relaxed"
                />
              </div>
            )}

            {qrType === 'email' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Recipient Email
                  </label>
                  <input
                    type="email"
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="contact@company.com"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Inquiry"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Body Message
                  </label>
                  <textarea
                    rows={2}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>
            )}

            {qrType === 'wifi' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Network Name (SSID)
                  </label>
                  <input
                    type="text"
                    value={wifiSsid}
                    onChange={(e) => setWifiSsid(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <input
                    type="text"
                    value={wifiPass}
                    onChange={(e) => setWifiPass(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Encryption
                  </label>
                  <select
                    value={wifiEnc}
                    onChange={(e: any) => setWifiEnc(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                  >
                    <option value="WPA">WPA / WPA2 / WPA3</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">None (Open Network)</option>
                  </select>
                </div>
              </div>
            )}

            {qrType === 'phone' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phoneVal}
                  onChange={(e) => setPhoneVal(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                />
              </div>
            )}

            {qrType === 'sms' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={smsPhone}
                    onChange={(e) => setSmsPhone(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    SMS Message
                  </label>
                  <textarea
                    rows={2}
                    value={smsBody}
                    onChange={(e) => setSmsBody(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Color & Styling Controls */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Style & Colors
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  QR Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-xs text-slate-700">{fgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Background
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-8 h-8 rounded-lg cursor-pointer border border-slate-200"
                  />
                  <span className="font-mono text-xs text-slate-700">{bgColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Size ({size}px)
                </label>
                <input
                  type="range"
                  min="160"
                  max="600"
                  step="20"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 mt-2"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Error Correction
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e: any) => setErrorCorrection(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 mt-0.5"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%)</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Live QR Preview & Downloads (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-center">
          <h3 className="font-bold text-sm text-slate-900 flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Live QR Code Preview
          </h3>

          {/* QR Canvas Box */}
          <div className="p-6 bg-slate-50/70 border border-slate-200 rounded-3xl inline-flex items-center justify-center shadow-inner mx-auto">
            {dataUrl ? (
              <img
                src={dataUrl}
                alt="Generated QR Code"
                className="rounded-xl shadow-2xs transition duration-300 max-w-full h-auto"
                style={{ width: Math.min(size, 260), height: Math.min(size, 260) }}
              />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                Generating QR...
              </div>
            )}
          </div>

          {/* Action Download Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="w-full py-2.5 px-4 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-99 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" /> Download High-Res PNG
            </button>

            <button
              type="button"
              onClick={handleDownloadSvg}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-99 rounded-xl transition flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-600" /> Download Vector SVG
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="w-full py-2 px-3 text-xs font-medium text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-slate-400" />
              )}
              {copied ? 'Payload Copied!' : 'Copy Raw Text Content'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
