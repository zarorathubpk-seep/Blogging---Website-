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
  Sliders,
  Palette,
  Eye,
  CheckCircle2,
  Share2,
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

  // Customization
  const [fgColor, setFgColor] = useState('#0f172a');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState<number>(320);
  const [errorCorrection, setErrorCorrection] = useState<'L' | 'M' | 'Q' | 'H'>('M');

  // Custom File Name
  const [customFileName, setCustomFileName] = useState('toolcrest_qrcode');

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
  }, [qrType, urlVal, textVal, emailTo, emailSubject, emailBody, wifiSsid, wifiPass, wifiEnc, phoneVal, smsPhone, smsBody, fgColor, bgColor, size, errorCorrection]);

  const sanitizedBaseName = sanitizeFileName(customFileName, 'toolcrest_qrcode');
  const finalPngName = ensureFileExtension(sanitizedBaseName, 'png');
  const finalSvgName = ensureFileExtension(sanitizedBaseName, 'svg');

  const handleDownloadPng = () => {
    if (!dataUrl) return;
    const link = document.createElement('a');
    link.download = finalPngName;
    link.href = dataUrl;
    link.click();
  };

  const handleDownloadSvg = () => {
    if (!svgString) return;
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = finalSvgName;
    link.href = url;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
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
    <div className="py-8 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* 2. MAIN TOOL WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Data Input & Styling Settings (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section A: Type Selector */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
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
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition text-xs font-semibold ${
                      active
                        ? 'bg-emerald-50/90 border-emerald-500 text-emerald-900 shadow-2xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span className="text-[11px] truncate w-full text-center">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Dynamic Inputs Based on Type */}
            <div className="pt-2 space-y-3">
              {qrType === 'url' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Website or Destination URL
                  </label>
                  <input
                    type="url"
                    value={urlVal}
                    onChange={(e) => setUrlVal(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                  />
                </div>
              )}

              {qrType === 'text' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Text Content
                  </label>
                  <textarea
                    rows={3}
                    value={textVal}
                    onChange={(e) => setTextVal(e.target.value)}
                    placeholder="Enter any text, notes, or product code..."
                    className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition resize-y"
                  />
                </div>
              )}

              {qrType === 'wifi' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Network Name (SSID)
                    </label>
                    <input
                      type="text"
                      value={wifiSsid}
                      onChange={(e) => setWifiSsid(e.target.value)}
                      placeholder="MyHomeWiFi"
                      className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Password
                      </label>
                      <input
                        type="text"
                        value={wifiPass}
                        onChange={(e) => setWifiPass(e.target.value)}
                        placeholder="Network password"
                        className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Encryption
                      </label>
                      <select
                        value={wifiEnc}
                        onChange={(e: any) => setWifiEnc(e.target.value)}
                        className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None (Open)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {qrType === 'email' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Recipient Email
                    </label>
                    <input
                      type="email"
                      value={emailTo}
                      onChange={(e) => setEmailTo(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject Line
                    </label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={(e) => setEmailSubject(e.target.value)}
                      className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Pre-filled Body
                    </label>
                    <textarea
                      rows={2}
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition resize-y"
                    />
                  </div>
                </div>
              )}

              {qrType === 'phone' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phone Number (with country code)
                  </label>
                  <input
                    type="tel"
                    value={phoneVal}
                    onChange={(e) => setPhoneVal(e.target.value)}
                    placeholder="+9230305881136"
                    className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                  />
                </div>
              )}

              {qrType === 'sms' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={smsPhone}
                      onChange={(e) => setSmsPhone(e.target.value)}
                      placeholder="+9230305881136"
                      className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Default Message
                    </label>
                    <input
                      type="text"
                      value={smsBody}
                      onChange={(e) => setSmsBody(e.target.value)}
                      className="w-full text-sm font-medium text-slate-900 bg-slate-50/60 border border-slate-300 rounded-xl px-3.5 py-2.5 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden transition"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section B: Styling & Customization */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
                2
              </span>
              <span>Design & Appearance Settings</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  QR Pattern Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="font-mono text-xs text-slate-800 uppercase font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 w-24"
                  />
                </div>
              </div>

              <div className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-2xl space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  Background Color
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-9 h-9 rounded-xl cursor-pointer border border-slate-300 bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="font-mono text-xs text-slate-800 uppercase font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 w-24"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                  <span>Dimension Size</span>
                  <span className="font-mono text-emerald-700 font-bold">{size} × {size} px</span>
                </div>
                <input
                  type="range"
                  min="200"
                  max="640"
                  step="20"
                  value={size}
                  onChange={(e) => setSize(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Error Correction Level
                </label>
                <select
                  value={errorCorrection}
                  onChange={(e: any) => setErrorCorrection(e.target.value)}
                  className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="L">Low (7% recovery) • Smallest pixels</option>
                  <option value="M">Medium (15% recovery) • Recommended</option>
                  <option value="Q">Quartile (25% recovery) • High reliability</option>
                  <option value="H">High (30% recovery) • Best for printed signs</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live QR Preview & Download Section (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-600" />
                <span>Live QR Code Preview</span>
              </h3>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200/80">
                Auto-Updating
              </span>
            </div>

            {/* QR Canvas Box */}
            <div className="p-6 bg-slate-50/80 border border-slate-200/90 rounded-2xl flex flex-col items-center justify-center min-h-[280px]">
              {dataUrl ? (
                <img
                  src={dataUrl}
                  alt="Generated QR Code"
                  className="rounded-xl shadow-xs transition duration-300 max-w-full h-auto bg-white p-2 border border-slate-100"
                  style={{ width: Math.min(size, 260), height: Math.min(size, 260) }}
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                  Generating QR...
                </div>
              )}

              <p className="text-[11px] text-slate-500 mt-3 text-center max-w-xs truncate">
                Payload: <span className="font-mono font-semibold text-slate-700">{getPayload()}</span>
              </p>
            </div>

            {/* Custom Output File Name Input */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-200/90 rounded-2xl space-y-2">
              <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Output File Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="Enter custom file name..."
                  className="w-full text-xs sm:text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <span>
                  PNG: <strong className="font-mono text-emerald-800">{finalPngName}</strong>
                </span>
                <span>
                  SVG: <strong className="font-mono text-emerald-800">{finalSvgName}</strong>
                </span>
              </div>
            </div>

            {/* Download Buttons */}
            <div className="space-y-2.5 pt-1">
              <button
                type="button"
                onClick={handleDownloadPng}
                className="w-full py-3 px-4 text-xs sm:text-sm font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-99 rounded-xl shadow-xs transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download High-Res PNG ({size}px)</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                className="w-full py-2.5 px-4 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 active:scale-99 rounded-xl transition flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4 text-slate-600" />
                <span>Download Vector SVG (Print Ready)</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="w-full py-2 px-3 text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center justify-center gap-1.5"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
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
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-600" />
          <span>How to Create Custom QR Codes on ToolCrest</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              1
            </span>
            <h4 className="font-bold text-sm text-slate-900">Select Content Type</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Choose between Website URL, Wi-Fi credentials, plain text, email template, or phone call.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              2
            </span>
            <h4 className="font-bold text-sm text-slate-900">Customize Colors & Size</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pick your brand foreground and background colors, adjust pixel size, and choose error recovery.
            </p>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
              3
            </span>
            <h4 className="font-bold text-sm text-slate-900">Name & Download</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
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
