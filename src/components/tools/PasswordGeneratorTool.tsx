import React, { useState, useEffect, useCallback } from 'react';
import {
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  Sliders,
  History,
  Lock,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { TOOLS_DATA } from '../../data/toolsData';
import { ToolHeader } from './ToolHeader';
import { RelatedToolsSection } from './RelatedToolsSection';
import { FaqSection } from '../FaqSection';

interface PasswordGeneratorToolProps {
  onNavigate: (path: string) => void;
}

export const PasswordGeneratorTool: React.FC<PasswordGeneratorToolProps> = ({ onNavigate }) => {
  const toolItem = TOOLS_DATA.find((t) => t.id === 'password-generator') || {
    id: 'password-generator',
    name: 'Secure Password Generator',
    slug: 'password-generator',
    category: 'productivity' as const,
    categoryLabel: 'Productivity',
    shortDesc: 'Create cryptographically strong random passwords and memorable passphrases.',
    longDesc: 'Generate high-entropy passwords with custom character sets, ambiguous exclusion, entropy meters, and local clipboard copy.',
    iconName: 'KeyRound',
    keywords: ['password', 'generator', 'security', 'crypto', 'passphrase', 'random'],
  };

  const [mode, setMode] = useState<'random' | 'passphrase'>('random');
  const [length, setLength] = useState<number>(18);
  const [includeUpper, setIncludeUpper] = useState<boolean>(true);
  const [includeLower, setIncludeLower] = useState<boolean>(true);
  const [includeNumbers, setIncludeNumbers] = useState<boolean>(true);
  const [includeSymbols, setIncludeSymbols] = useState<boolean>(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState<boolean>(true);

  // Passphrase settings
  const [wordCount, setWordCount] = useState<number>(4);
  const [separator, setSeparator] = useState<string>('-');

  // Generated state
  const [password, setPassword] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<string[]>([]);

  // Cryptographically secure random integer
  const getRandomInt = (max: number): number => {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return array[0] % max;
  };

  const generatePassword = useCallback(() => {
    if (mode === 'random') {
      let uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
      let numberChars = '0123456789';
      let symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

      if (excludeAmbiguous) {
        uppercaseChars = uppercaseChars.replace(/[IO]/g, '');
        lowercaseChars = lowercaseChars.replace(/[lo]/g, '');
        numberChars = numberChars.replace(/[01]/g, '');
        symbolChars = symbolChars.replace(/[|`'"]/g, '');
      }

      let charPool = '';
      const guaranteedChars: string[] = [];

      if (includeUpper) {
        charPool += uppercaseChars;
        guaranteedChars.push(uppercaseChars[getRandomInt(uppercaseChars.length)]);
      }
      if (includeLower) {
        charPool += lowercaseChars;
        guaranteedChars.push(lowercaseChars[getRandomInt(lowercaseChars.length)]);
      }
      if (includeNumbers) {
        charPool += numberChars;
        guaranteedChars.push(numberChars[getRandomInt(numberChars.length)]);
      }
      if (includeSymbols) {
        charPool += symbolChars;
        guaranteedChars.push(symbolChars[getRandomInt(symbolChars.length)]);
      }

      if (!charPool) {
        charPool = lowercaseChars;
        guaranteedChars.push(lowercaseChars[0]);
      }

      const remainingLength = Math.max(0, length - guaranteedChars.length);
      const remainingChars: string[] = [];
      for (let i = 0; i < remainingLength; i++) {
        remainingChars.push(charPool[getRandomInt(charPool.length)]);
      }

      // Shuffle
      const allChars = [...guaranteedChars, ...remainingChars];
      for (let i = allChars.length - 1; i > 0; i--) {
        const j = getRandomInt(i + 1);
        [allChars[i], allChars[j]] = [allChars[j], allChars[i]];
      }

      const result = allChars.join('');
      setPassword(result);
      setHistory((prev) => [result, ...prev.filter((p) => p !== result)].slice(0, 5));
    } else {
      // Passphrase mode with clean vocabulary
      const wordList = [
        'apple', 'bridge', 'cobalt', 'desert', 'eagle', 'forest', 'galaxy', 'harbor',
        'island', 'jungle', 'kinetic', 'lunar', 'meadow', 'nebula', 'ocean', 'planet',
        'quantum', 'river', 'solar', 'timber', 'umbrella', 'valley', 'winter', 'zenith',
        'beacon', 'canyon', 'falcon', 'glacier', 'horizon', 'matrix', 'summit', 'vortex',
      ];
      const chosenWords: string[] = [];
      for (let i = 0; i < wordCount; i++) {
        chosenWords.push(wordList[getRandomInt(wordList.length)]);
      }
      const result = chosenWords.join(separator);
      setPassword(result);
      setHistory((prev) => [result, ...prev.filter((p) => p !== result)].slice(0, 5));
    }
  }, [mode, length, includeUpper, includeLower, includeNumbers, includeSymbols, excludeAmbiguous, wordCount, separator]);

  useEffect(() => {
    generatePassword();
  }, [generatePassword]);

  const handleCopy = async (strToCopy?: string) => {
    const textToCopy = strToCopy || password;
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  // Calculate Password Strength Score (0 to 100)
  const strengthInfo = useCallback(() => {
    if (!password) return { score: 0, label: 'None', color: 'bg-slate-200', text: 'text-slate-400' };

    let pool = 0;
    if (/[a-z]/.test(password)) pool += 26;
    if (/[A-Z]/.test(password)) pool += 26;
    if (/[0-9]/.test(password)) pool += 10;
    if (/[^a-zA-Z0-9]/.test(password)) pool += 32;

    const entropy = password.length * Math.log2(Math.max(2, pool));

    if (entropy < 40) {
      return { score: 25, label: 'Weak', color: 'bg-rose-500', text: 'text-rose-600' };
    }
    if (entropy < 65) {
      return { score: 55, label: 'Medium', color: 'bg-amber-500', text: 'text-amber-600' };
    }
    if (entropy < 90) {
      return { score: 85, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
    }
    return { score: 100, label: 'Very Strong', color: 'bg-emerald-600', text: 'text-emerald-700' };
  }, [password]);

  const strength = strengthInfo();

  const passwordFaqs = [
    {
      q: 'Are passwords generated using true cryptography?',
      a: 'Yes. ToolCrest uses the Web Cryptography API (window.crypto.getRandomValues), which draws from hardware entropy on your device rather than pseudo-random math.',
    },
    {
      q: 'Are generated passwords saved or sent across the internet?',
      a: 'Never. Passwords exist exclusively in client browser RAM and vanish when you close the tab. ToolCrest has zero tracking or remote storage.',
    },
    {
      q: 'Why choose a passphrase over a random string?',
      a: 'Passphrases (e.g., "cobalt-galaxy-timber-harbor") offer high entropy due to length while remaining easy to remember and type on mobile devices.',
    },
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-slate-100 animate-fadeIn">
      {/* 1. UNIFIED TOOL HEADER */}
      <ToolHeader tool={toolItem} onNavigate={onNavigate} />

      {/* 2. MAIN TOOL WORKSPACE */}
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        {/* Mode Segmented Switch */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/20 flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-[#070a14] border border-amber-500/30 p-1 rounded-xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setMode('random')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                mode === 'random'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              Random Password
            </button>
            <button
              type="button"
              onClick={() => setMode('passphrase')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                mode === 'passphrase'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black shadow-xs'
                  : 'text-slate-400 hover:text-amber-200'
              }`}
            >
              Memorable Passphrase
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Entropy Strength:</span>
            <span className={`text-xs font-black uppercase px-2 py-0.5 rounded-md ${
              strength.score >= 85
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : strength.score >= 55
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
            }`}>
              {strength.label}
            </span>
          </div>
        </div>

        {/* Primary Password Display Card */}
        <div className="p-5 sm:p-6 bg-[#070a14] border border-amber-500/35 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-inner">
          <div className="flex-1 overflow-hidden">
            <div className="font-mono text-lg sm:text-2xl font-black text-amber-300 tracking-wider break-all select-all">
              {password}
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden mt-3 border border-amber-500/20">
              <div
                className={`h-full transition-all duration-300 ${
                  strength.score >= 85
                    ? 'bg-gradient-to-r from-amber-400 to-yellow-500'
                    : strength.score >= 55
                    ? 'bg-amber-500'
                    : 'bg-rose-500'
                }`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={generatePassword}
              className="p-3 bg-[#0e1424] hover:bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded-xl transition shadow-xs hover:rotate-180 cursor-pointer"
              title="Regenerate password"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => handleCopy()}
              className="px-5 py-3 bg-gradient-to-r from-amber-400 to-yellow-500 hover:brightness-110 active:scale-98 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950 stroke-[2.5]" /> : <Copy className="w-4 h-4 text-slate-950 stroke-[2.5]" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Password'}</span>
            </button>
          </div>
        </div>

        {/* Settings & Sliders Section */}
        {mode === 'random' ? (
          <div className="space-y-5 pt-2">
            {/* Length Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <label>Password Length ({length} characters)</label>
                <span className="font-mono text-amber-400 font-bold">{length}</span>
              </div>
              <input
                type="range"
                min="8"
                max="64"
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Checkbox Options Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <label className="flex items-center gap-2.5 p-3 bg-[#070a14] border border-amber-500/20 rounded-xl text-xs font-bold text-slate-200 cursor-pointer hover:border-amber-400/50 transition">
                <input
                  type="checkbox"
                  checked={includeUpper}
                  onChange={(e) => setIncludeUpper(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Uppercase (A-Z)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-[#070a14] border border-amber-500/20 rounded-xl text-xs font-bold text-slate-200 cursor-pointer hover:border-amber-400/50 transition">
                <input
                  type="checkbox"
                  checked={includeLower}
                  onChange={(e) => setIncludeLower(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Lowercase (a-z)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-[#070a14] border border-amber-500/20 rounded-xl text-xs font-bold text-slate-200 cursor-pointer hover:border-amber-400/50 transition">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(e) => setIncludeNumbers(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Numbers (0-9)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-[#070a14] border border-amber-500/20 rounded-xl text-xs font-bold text-slate-200 cursor-pointer hover:border-amber-400/50 transition">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(e) => setIncludeSymbols(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Symbols (!@#$)</span>
              </label>

              <label className="flex items-center gap-2.5 p-3 bg-[#070a14] border border-amber-500/20 rounded-xl text-xs font-bold text-slate-200 cursor-pointer hover:border-amber-400/50 transition sm:col-span-2">
                <input
                  type="checkbox"
                  checked={excludeAmbiguous}
                  onChange={(e) => setExcludeAmbiguous(e.target.checked)}
                  className="w-4 h-4 accent-amber-500 rounded"
                />
                <span>Exclude Ambiguous Characters (l, 1, I, O, 0)</span>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-5 pt-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <label>Number of Words ({wordCount})</label>
                <span className="font-mono text-amber-400 font-bold">{wordCount}</span>
              </div>
              <input
                type="range"
                min="3"
                max="8"
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value, 10))}
                className="w-full accent-amber-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-slate-300">Word Separator:</label>
              <div className="flex items-center gap-2">
                {['-', '_', '.', ' '].map((sep) => (
                  <button
                    key={sep}
                    type="button"
                    onClick={() => setSeparator(sep)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold border transition cursor-pointer ${
                      separator === sep
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black border-amber-300'
                        : 'bg-[#070a14] border-amber-500/20 text-slate-300 hover:text-amber-200'
                    }`}
                  >
                    {sep === ' ' ? 'Space' : sep}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Session History */}
        {history.length > 1 && (
          <div className="pt-4 border-t border-amber-500/20 space-y-2.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <History className="w-3.5 h-3.5 text-amber-400" />
              <span>Recent Passwords in Session</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.slice(1).map((histPass, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleCopy(histPass)}
                  className="px-3 py-1 bg-[#070a14] hover:bg-amber-500/10 border border-amber-500/25 rounded-lg text-xs font-mono text-amber-200 transition flex items-center gap-1.5 truncate max-w-xs cursor-pointer"
                  title="Click to copy"
                >
                  <Copy className="w-3 h-3 text-amber-400" />
                  <span className="truncate">{histPass}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. HOW TO USE GUIDE */}
      <div className="bg-[#0c101d] border border-amber-500/25 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
        <h3 className="font-extrabold text-base sm:text-lg text-white flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <span>Best Practices for Password Security</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-2">
          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              1
            </span>
            <h4 className="font-bold text-sm text-amber-200">Minimum 16 Characters</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Modern brute-force hardware can crack 8-character passwords in minutes. Always use 16+ characters for critical accounts.
            </p>
          </div>

          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              2
            </span>
            <h4 className="font-bold text-sm text-amber-200">Unique Per Account</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never reuse passwords across email, banking, and social accounts. A breach on one site shouldn't expose your whole identity.
            </p>
          </div>

          <div className="p-4 bg-[#070a14] border border-amber-500/20 rounded-2xl space-y-2">
            <span className="w-7 h-7 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs">
              3
            </span>
            <h4 className="font-bold text-sm text-amber-200">Store in a Vault</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Save your generated passwords in a reputable password manager so you only ever have to remember one strong master passphrase.
            </p>
          </div>
        </div>
      </div>

      {/* 4. FAQS */}
      <FaqSection
        title="Frequently Asked Questions: Password Generator"
        subtitle="Security standards, cryptographic randomness, and privacy guarantees."
        faqs={passwordFaqs}
      />

      {/* 5. RELATED TOOLS */}
      <RelatedToolsSection
        currentToolSlug="password-generator"
        category="productivity"
        onNavigate={onNavigate}
      />
    </div>
  );
};
