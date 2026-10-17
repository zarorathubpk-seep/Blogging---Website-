import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
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
  Eye,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';
import { sanitizeFileName, ensureFileExtension } from '../../utils/fileNaming';

interface QrGeneratorToolProps {
  onNavigate: (path: string) => void;
}

type QrType = 'url' | 'text' | 'email' | 'wifi' | 'phone' | 'sms';

export const QrGeneratorTool: React.FC<QrGeneratorToolProps> = ({ onNavigate }) => {
  const toolItem = TOOLS_DATA.find((t) => t.id === 'qr-generator') || {
    id: 'qr-generator',
    name: 'QR Code Generator',
    slug: 'qr-generator',
    category: 'qr' as const,
    categoryLabel: 'QR & Barcode',
    shortDesc: 'Create customizable high-resolution QR codes for websites, WiFi, and contacts.',
    longDesc: 'Generate crisp, scannable QR codes with custom colors, high error correction, and instant PNG or vector SVG export.',
    iconName: 'QrCode',
    keywords: ['qr', 'code', 'generator'],
  };

  const [qrType, setQrType] = useState<QrType>('url');

  // Input states
  const [urlVal, setUrlVal] = useState('https://toolcrest.site');
  const [textVal, setTextVal] = useState('Welcome to ToolCrest online tools suite!');
  const [emailTo, setEmailTo] = useState('info@toolcrest.site');
  const [emailSubject, setEmailSubject] = useState('Support Inquiry');
  const [emailBody, setEmailBody] = useState('Hello ToolCrest team, I scanned your QR code.');
  const [wifiSsid, setWifiSsid] = useState('Office_Guest_WiFi');
  const [wifiPass, setWifiPass] = useState('ToolCrestSecure2026');
  const [wifiEnc, setWifiEnc] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [phoneVal, setPhoneVal] = useState('+9230305881136');
  const [smsPhone, setSmsPhone] = useState('+9230305881136');
  const [smsBody, setSmsBody] = useState('Hi ToolCrest!');

  // Styling customization states
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState<number>(400);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Custom File Naming
  const [customFileName, setCustomFileName] = useState('toolcrest_qrcode');
  const [dataUrl, setDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement | null>(null);

  // Compute actual payload based on type
  const getPayload = () => {
    switch (qrType) {
      case 'url':
        return urlVal.trim() || 'https://toolcrest.site';
      case 'text':
        return textVal.trim() || 'ToolCrest Free Tools';
      case 'wifi':
        return `WIFI:T:${wifiEnc};S:${wifiSsid};P:${wifiPass};;`;
      case 'email':
        return `mailto:${emailTo}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
      case 'phone':
        return `tel:${phoneVal.replace(/\s+/g, '')}`;
      case 'sms':
        return `smsto:${smsPhone.replace(/\s+/g, '')}:${smsBody}`;
      default:
        return urlVal || 'https://toolcrest.site';
    }
  };

  // Generate QR Code data URL dynamically
  useEffect(() => {
    const payload = getPayload();
    QRCode.toDataURL(payload, {
      width: size,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
      errorCorrectionLevel: errorCorrection,
    })
      .then((url) => {
        setDataUrl(url);
      })
      .catch((err) => {
        console.error('QR Generation failed:', err);
      });
  }, [qrType, urlVal, textVal, emailTo, emailSubject, emailBody, wifiSsid, wifiPass, wifiEnc, phoneVal, smsPhone, smsBody, fgColor, bgColor, size, errorCorrection]);

  // Clean sanitized filenames
  const cleanBase = sanitizeFileName(customFileName, 'toolcrest_qrcode');
  const finalPngName = ensureFileExtension(cleanBase, 'png');
  const finalSvgName = ensureFileExtension(cleanBase, 'svg');

  // Download High-Res PNG
  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = finalPngName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download Vector SVG
  const handleDownloadSvg = () => {
    const payload = getPayload();
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
      .then((svgString) => {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = finalSvgName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.error(err));
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getPayload());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrFaqs = [
    {
      q: 'Do ToolCrest QR codes ever expire or have scan limits?',
      a: 'No. All QR codes generated here are static and direct. Because the encoded information (URL, Wi-Fi keys, or text) is embedded directly into the pixels, they never expire and have unlimited scans forever.',
    },
    {
      q: 'Which format should I download for printing on physical signs?',
      a: 'For print materials (brochures, posters, packaging, business cards), download Vector SVG. SVG files scale infinitely without pixelation or blurriness.',
    },
    {
      q: 'Is my data or Wi-Fi password kept private?',
      a: 'Yes, 100%. The QR generation engine runs purely inside your browser using client-side JavaScript. Your text and Wi-Fi credentials are never sent to remote servers.',
    },
    {
      q: 'What is Error Correction and which level should I choose?',
      a: 'Error Correction allows QR codes to be scanned even if partially smudged or covered. Medium (15%) is great for digital screens, while High (30%) is ideal for outdoor printed materials.',
    },
  ];

  return (
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-100 animate-fadeIn">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* 2. MAIN TOOL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Data Input & Styling Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Type Selector */}
          <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs flex items-center justify-center font-black">
                1
              </span>
              <span>Choose Content Type</span>
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'url', label: 'URL / Link', icon: Globe },
                { id: 'text', label: 'Plain Text', icon: FileText },
                { id: 'wifi', label: 'Wi-Fi', icon: Wifi },
                { id: 'email', label: 'Email', icon: Mail },
                { id: 'phone', label: 'Call', icon: Phone },
                { id: 'sms', label: 'SMS', icon: MessageSquare },
              ].map((item) => {
                const Icon = item.icon;
                const active = qrType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setQrType(item.id as QrType)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-bold cursor-pointer ${
                      active
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-lg shadow-amber-500/20 border-amber-300'
                        : 'bg-[#070a14] border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-400/50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-slate-950' : 'text-amber-400/80'}`} />
                    <span className="text-[11px] truncate w-full text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Inputs Based on Type */}
            <div className="pt-2 space-y-3">
              {qrType === 'url' && (
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">
                    Website or Destination URL
                  </label>
                  <input
                    type="url"
                    value={urlVal}
                    onChange={(e) => setUrlVal(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition"
                  />
                </div>
              )}

              {qrType === 'text' && (
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">
                    Text Content
                  </label>
                  <textarea
                    rows={3}
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    placeholder="Enter any text, notes, or product code..."
                    className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition resize-y"
                  />
                </div>
              )}

              {qrType === 'wifi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHomeWiFi"
                      className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">
                      Wi-Fi Password
                    </label>
                    <input
                      type="text"
                      value={wifiPass}
                      onChange={(e) => setWifiPass(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition font-mono"
                    />
                  </div>
                </div>
              )}

              {qrType === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">Recipient Email</label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">Subject</label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">Body Text</label>
                    <textarea
                      rows={2}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition"
                    />
                  </div>
                </div>
              )}

              {qrType === 'phone' && (
                <div>
                  <label className="block text-xs font-bold text-amber-200 mb-1">
                    Phone Number (with Country Code)
                  </label>
                  <input
                    type="tel"
                    value={phoneVal}
                    onChange={(e) => setPhoneVal(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition"
                  />
                </div>
              )}

              {qrType === 'sms' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-amber-200 mb-1">
                      Default Message
                    </label>
                    <input
                      type="text"
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      className="w-full text-sm font-medium text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden transition"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Styling & Customization */}
          <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 shadow-2xl space-y-4">
            <h2 className="font-bold text-sm text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs flex items-center justify-center font-black">
                2
              </span>
              <span>Design & Appearance Settings</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-amber-200">
                  QR Pattern Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-amber-500/30 bg-[#0c101d] p-0.5"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="font-mono text-xs text-amber-300 uppercase font-semibold bg-[#0c101d] border border-amber-500/30 rounded-lg px-2 py-1 w-24"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-amber-200">
                  Background Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-amber-500/30 bg-[#0c101d] p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="font-mono text-xs text-amber-300 uppercase font-semibold bg-[#0c101d] border border-amber-500/30 rounded-lg px-2 py-1 w-24"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-200 mb-1">
                  <span>Dimension Size</span>
                  <span className="font-mono text-amber-400">{size}px</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="1000"
                  step="50"
                  value={size}
                  onChange={(e) => setSize(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-200 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e) => setErrorCorrection(e.target.value as any)}
                  className="w-full text-xs font-bold text-white bg-[#070a14] border border-amber-500/30 rounded-xl px-3 py-2 focus:border-amber-400"
                >
                  <option value="L">Low (7% recovery - Best for small codes)</option>
                  <option value="M">Medium (15% recovery - Standard)</option>
                  <option value="Q">Quartile (25% recovery - High resilience)</option>
                  <option value="H">High (30% recovery - Best for print & logos)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Preview & Download Section (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-400" />
                <span>Live QR Code Preview</span>
              </h3>
              <span className="text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                Auto-Updating
              </span>
            </div>

            {/* QR Canvas Box */}
            <div className="p-6 bg-[#070a14] border border-amber-500/25 rounded-2xl flex flex-col items-center justify-center min-h-[280px]">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Generated QR Code"
                  className="rounded-xl shadow-lg transition duration-300 max-w-full h-auto bg-white p-2 border border-amber-500/30"
                  style={{ width: Math.min(size, 260), height: Math.min(size, 260) }}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}

              <p className="text-[11px] text-slate-400 mt-3 text-center max-w-xs truncate">
                Payload: <span className="font-mono font-semibold text-amber-300">{getPayload()}</span>
              </p>
            </div>

            {/* Custom Output File Name Input */}
            <div className="p-4 bg-[#070a14] border border-amber-500/30 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-amber-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Output File Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="Enter custom file name..."
                  className="w-full text-xs sm:text-sm font-semibold text-white bg-[#0c101d] border border-amber-500/40 rounded-xl px-3.5 py-2.5 focus:border-amber-400 focus:outline-hidden"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                <span>
                  PNG: <strong className="font-mono text-amber-300">{finalPngName}</strong>
                </span>
                <span>
                  SVG: <strong className="font-mono text-amber-300">{finalSvgName}</strong>
                </span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="w-full py-3 px-4 text-xs sm:text-sm font-black text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-98 rounded-xl shadow-lg shadow-amber-500/25 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 stroke-[2.5]" />
                <span>Download High-Res PNG ({size}px)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="w-full py-2.5 px-4 text-xs font-bold text-amber-300 bg-[#070a14] hover:bg-slate-800 border border-amber-500/30 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Vector SVG (Print Ready)</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-400 hover:text-amber-300 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{copied ? 'Raw Payload Copied!' : 'Copy Raw Text Content'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. HOW TO USE THIS TOOL */}
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 text-slate-100">
        <h3 className="font-black text-base sm:text-lg text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>How to Create Custom QR Codes on ToolCrest</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs flex items-center justify-center shadow-xs">
              1
            </span>
            <h4 className="font-bold text-sm text-white">Select Content Type</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Choose between Website URL, Wi-Fi credentials, plain text, email template, or phone call.
            </p>
          </div>

          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs flex items-center justify-center shadow-xs">
              2
            </span>
            <h4 className="font-bold text-sm text-white">Customize Colors & Size</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Pick your brand foreground and background colors, adjust pixel size, and choose error recovery.
            </p>
          </div>

          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-black text-xs flex items-center justify-center shadow-xs">
              3
            </span>
            <h4 className="font-bold text-sm text-white">Name & Download</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enter your preferred custom file name and download crisp PNG or infinite vector SVG formats.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FREQUENTLY ASKED QUESTIONS */}
      <FaqSection
        title="Frequently Asked Questions: QR Generator"
        subtitle="Learn about QR code lifespan, vector formats, and scanning security."
        faqs={qrFaqs}
      />

      {/* 5. RELATED TOOLS SUGGESTIONS */}
      <RelatedToolsSection
        currentToolSlug="qr-generator"
        category="qr"
        onNavigate={onNavigate}
      />
    </div>
  );
};
