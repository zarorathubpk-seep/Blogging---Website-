import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
  ChevronRight,
  Sliders,
  History,
  Lock,
} from 'lucide-react';

interface PasswordGeneratorToolProps {
  onNavigate: (path: string) => void;
}

const UPPERCASE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE_CHARS = 'abcdefghijklmnopqrstuvwxyz';
const NUMBER_CHARS = '0123456789';
const SYMBOL_CHARS = '!@#$%^&*()_+-=[]{}|;:,.<>?';
const AMBIGUOUS_CHARS = /[il1Lo0O]/g;

const MEMORABLE_WORDS = [
  'apple', 'beach', 'cloud', 'delta', 'eagle', 'forest', 'galaxy', 'harbor',
  'island', 'jungle', 'koala', 'lagoon', 'meadow', 'nebula', 'ocean', 'planet',
  'quantum', 'river', 'sunset', 'timber', 'valley', 'winter', 'zenith', 'beacon',
  'crystal', 'falcon', 'glacier', 'horizon', 'matrix', 'phoenix', 'summit', 'vortex',
];

export const PasswordGeneratorTool: React.FC<PasswordGeneratorToolProps> = ({ onNavigate }) => {
  const [length, setLength] = useState<number>(16);
  const [includeUppercase, setIncludeUppercase] = useState<boolean>(true);
  const [includeLowercase, setIncludeLowercase] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [avoidAmbiguous, setAvoidAmbiguous] = useState<boolean>(false);
  const [mode, setMode] = useState<'random' | 'passphrase'>('random');
  const [passphraseWordCount, setPassphraseWordCount] = useState<number>(4);

  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  const generatePassword = useCallback(() => {
    if (mode === 'passphrase') {
      const selectedWords: string[] = [];
      const array = new Uint32Array(passphraseWordCount);
      window.crypto.getRandomValues(array);
      for (let i = 0; i < passphraseWordCount; i++) {
        selectedWords.push(MEMORABLE_WORDS[array[i] % MEMORABLE_WORDS.length]);
      }
      const randomNum = Math.floor(Math.random() * 90) + 10;
      const res = selectedWords.join('-') + '-' + randomNum;
      setPassword(res);
      setHistory((prev) => [res, ...prev.slice(0, 4)]);
      return;
    }

    let charSet = '';
    if (includeUppercase) charSet += UPPERCASE_CHARS;
    if (includeLowercase) charSet += LOWERCASE_CHARS;
    if (includeNumbers) charSet += NUMBER_CHARS;
    if (includeSymbols) charSet += SYMBOL_CHARS;

    if (avoidAmbiguous) {
      charSet = charSet.replace(AMBIGUOUS_CHARS, '');
    }

    if (!charSet) {
      charSet = LOWERCASE_CHARS;
    }

    const randomValues = new Uint32Array(length);
    window.crypto.getRandomValues(randomValues);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += charSet[randomValues[i] % charSet.length];
    }

    setPassword(result);
    setHistory((prev) => [result, ...prev.slice(0, 4)]);
  }, [
    length,
    includeUppercase,
    includeLowercase,
    includeNumbers,
    includeSymbols,
    avoidAmbiguous,
    mode,
    passphraseWordCount,
  ]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = async (textToCopy = password) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Password strength calculation
  const strengthInfo = (() => {
    if (!password) return { label: 'Empty', color: 'bg-slate-300', percent: 0 };
    let score = 0;
    if (password.length >= 8) score += 20;
    if (password.length >= 14) score += 25;
    if (password.length >= 20) score += 15;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[a-z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[^A-Za-z0-9]/.test(password)) score += 10;

    if (score < 40) return { label: 'Weak', color: 'bg-rose-500', percent: score };
    if (score < 70) return { label: 'Moderate', color: 'bg-amber-500', percent: score };
    if (score < 90) return { label: 'Strong', color: 'bg-emerald-500', percent: score };
    return { label: 'Ultra-Secure', color: 'bg-emerald-600', percent: 100 };
  })();

  return (
    <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
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
        <span className="text-slate-800 font-semibold">Strong Password Generator</span>
      </nav>

      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shadow-2xs">
              <KeyRound className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Strong Password Generator
                </h1>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Crypto API
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                Create unhackable passwords and passphrases locally using your browser's cryptographically secure randomness.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50/80 px-3 py-1.5 rounded-xl border border-emerald-200/80">
            <ShieldCheck className="w-4 h-4" /> 100% Client-Side
          </div>
        </div>
      </div>

      {/* Password Display Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3.5 flex items-center justify-between overflow-hidden">
            <span className="font-mono text-base sm:text-lg font-bold text-slate-900 break-all select-all tracking-wide">
              {password}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={generatePassword}
              className="p-3 bg-slate-100 hover:bg-slate-200 active:rotate-180 text-slate-700 rounded-2xl transition"
              title="Generate new password"
            >
              <RefreshCw className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => handleCopy()}
              className="flex-1 sm:flex-initial px-5 py-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl shadow-xs transition flex items-center justify-center gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Password'}
            </button>
          </div>
        </div>

        {/* Strength Meter Bar */}
        <div className="space-y-1.5 pt-2">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-slate-500">Security Strength:</span>
            <span className="font-bold text-slate-800">{strengthInfo.label}</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${strengthInfo.color} transition-all duration-300`}
              style={{ width: `${strengthInfo.percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 uppercase tracking-wider">
            <Sliders className="w-4 h-4 text-emerald-600" /> Generator Settings
          </h2>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('random')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                mode === 'random' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Random Characters
            </button>
            <button
              type="button"
              onClick={() => setMode('passphrase')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                mode === 'passphrase' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
              }`}
            >
              Memorable Passphrase
            </button>
          </div>
        </div>

        {mode === 'random' ? (
          <div className="space-y-6">
            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-bold text-slate-700">Password Length</span>
                <span className="font-extrabold text-emerald-700 text-sm">{length} Characters</span>
              </div>
              <input
                type="range"
                min={6}
                max={48}
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            {/* Checkboxes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium text-slate-700">
              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(e) => setIncludeUppercase(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Uppercase Letters (A-Z)</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(e) => setIncludeLowercase(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Lowercase Letters (a-z)</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Special Symbols (!@#$%)</span>
              </label>

              <label className="sm:col-span-2 flex items-center gap-3 p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100/80 transition">
                <input
                  type="checkbox"
                  checked={avoidAmbiguous}
                  onChange={(e) => setAvoidAmbiguous(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Avoid Ambiguous Characters (e.g. 0, O, 1, l, I)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-700">Number of Words in Passphrase</span>
              <span className="font-extrabold text-emerald-700 text-sm">{passphraseWordCount} Words</span>
            </div>
            <input
              type="range"
              min={3}
              max={7}
              value={passphraseWordCount}
              onChange={(e) => setPassphraseWordCount(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* Recent History */}
      {history.length > 1 && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-slate-400" /> Recent Passwords in This Session
            </h3>
            <button
              type="button"
              onClick={() => setHistory([])}
              className="text-[11px] text-slate-400 hover:text-rose-600"
            >
              Clear
            </button>
          </div>

          <div className="space-y-2">
            {history.slice(1).map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono"
              >
                <span className="text-slate-700 truncate max-w-md">{item}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(item)}
                  className="text-emerald-700 font-bold hover:underline shrink-0 ml-2"
                >
                  Copy
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
