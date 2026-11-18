import React, { useState, useEffect } from 'react';
import { 
  Database, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  Globe,
  ArrowRight,
  ShieldCheck,
  Sparkles
} from '../components/icons';
import { AnimatePresence, motion } from 'motion/react';
import { auth, saveFirebaseConfig, isSandboxMode } from '../firebase/config';

interface LoginProps {
  onLoginSuccess: () => void;
  lang: 'ID' | 'EN';
  onLangChange: (lang: 'ID' | 'EN') => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, lang, onLangChange }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configText, setConfigText] = useState('');
  const [configError, setConfigError] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showConfigModal) setShowConfigModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showConfigModal]);

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setIsSubmitting(true);
    try {
      await auth.signInWithGoogle();
      onLoginSuccess();
    } catch (e: any) {
      console.error('Google Sign In Error', e);
      const errorCode = e?.code || '';
      const errorMessage = e?.message || String(e);
      if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
        setLoginError('auth/unauthorized-domain');
      } else {
        setLoginError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSandboxLogin = () => {
    localStorage.setItem('WILLOW_FORCE_SANDBOX', 'true');
    localStorage.setItem('WILLOW_SANDBOX_USER', JSON.stringify({
      uid: 'sandbox_user_demo',
      displayName: lang === 'ID' ? 'Tamu Demo' : 'Guest Demo',
      email: 'demo@willowwallet.local',
      photoURL: null
    }));
    window.location.reload();
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

  // Secure JSON-only parser without dynamic new Function eval
  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let cleaned = configText.trim();
      cleaned = cleaned.replace(/^(const|let|var|export default)\s+\w+\s*=\s*/, '');
      cleaned = cleaned.replace(/;$/, '');
      
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        setConfigError(lang === 'ID' 
          ? 'Format tidak valid. Pastikan JSON Firebase config benar (JSON murni).' 
          : 'Invalid format. Please ensure valid JSON Firebase config.');
        return;
      }

      if (parsed && parsed.apiKey && parsed.databaseURL) {
        saveFirebaseConfig(parsed);
        setShowConfigModal(false);
        setConfigError('');
      } else {
        setConfigError(lang === 'ID' 
          ? 'Konfigurasi harus berisi minimal "apiKey" dan "databaseURL".' 
          : 'Config must contain at least "apiKey" and "databaseURL".');
      }
    } catch {
      setConfigError(lang === 'ID' 
        ? 'Format tidak valid. Pastikan format JSON Firebase config benar.' 
        : 'Invalid format. Please ensure valid JSON Firebase config.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0F2D21] text-white flex flex-col justify-between items-center relative overflow-hidden font-sans select-none px-6 py-6 sm:py-8">
      
      {/* Background Radial Glow */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[520px] h-[520px] rounded-full bg-[#18533C]/40 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[380px] h-[380px] rounded-full bg-[#2E7A5A]/20 blur-[100px] pointer-events-none" />

      {/* Top Header: Step Indicator & Skip / Language */}
      <header className="w-full max-w-sm flex items-center justify-between z-10 pt-2">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider text-white/90">01 / 03</span>
          <div className="flex items-center gap-1 w-20">
            <div className="h-1 flex-1 bg-white rounded-full"></div>
            <div className="h-1 flex-1 bg-white/25 rounded-full"></div>
            <div className="h-1 flex-1 bg-white/25 rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLangChange(lang === 'ID' ? 'EN' : 'ID')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 transition-all border border-white/15"
            title="Ganti Bahasa / Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang}</span>
          </button>
          
          <button
            type="button"
            onClick={handleSandboxLogin}
            className="text-xs font-medium text-white/80 hover:text-white px-2 py-1 transition-colors"
          >
            {lang === 'ID' ? 'Lewati' : 'Skip'}
          </button>
        </div>
      </header>

      {/* Center Hero: Title & 3D Leather Wallet Visual */}
      <main className="w-full max-w-sm flex flex-col items-center text-center z-10 my-auto py-4">
        
        {/* Title */}
        <div className="space-y-1 mb-2">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Your Money <br />
            <span className="text-[#88E5A7] font-semibold italic">Better Days</span>
          </h1>
          <p className="text-white/80 text-sm max-w-xs mx-auto pt-2 leading-relaxed font-normal">
            {lang === 'ID' 
              ? 'Kelola, rencanakan, dan kembangkan keuanganmu di satu tempat yang mudah.'
              : 'Save, spend, and grow your wealth — all in one simple place.'}
          </p>
        </div>

        {/* 3D Realistic Leather Wallet on Podium (Crafted Vector Art) */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-4 flex items-center justify-center">
          
          {/* Ambient Platform Shadow */}
          <div className="absolute bottom-6 w-56 h-12 bg-black/45 rounded-full blur-xl pointer-events-none" />

          {/* Stepped Pedestal Podiums */}
          <div className="absolute bottom-6 w-52 h-14 bg-gradient-to-b from-[#184433] to-[#0D241A] rounded-full border border-white/10 shadow-lg"></div>
          <div className="absolute bottom-10 w-44 h-11 bg-gradient-to-b from-[#215A44] to-[#123628] rounded-full border border-white/15 shadow-inner"></div>

          {/* Floating Leather Wallet with Card */}
          <div className="relative -rotate-12 hover:rotate-0 transition-transform duration-500 ease-out z-10 cursor-pointer drop-shadow-2xl">
            
            {/* Credit Card Popping Out */}
            <div className="absolute -top-12 left-6 w-36 h-24 bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#0A0F1D] rounded-xl border border-white/20 shadow-xl p-2.5 flex flex-col justify-between overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="w-6 h-4.5 bg-gradient-to-tr from-amber-300 to-amber-500 rounded-sm border border-amber-200/50 flex items-center justify-center">
                  <div className="w-4 h-2.5 border-t border-b border-black/30"></div>
                </div>
                <div className="flex -space-x-1">
                  <div className="w-3.5 h-3.5 rounded-full bg-red-500/90"></div>
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400/90"></div>
                </div>
              </div>
              <div className="text-[8px] font-mono tracking-widest text-white/70">
                •••• 4820
              </div>
            </div>

            {/* Dark Green Stitched Leather Wallet Body */}
            <div className="w-44 h-36 bg-gradient-to-br from-[#1A4B37] via-[#123628] to-[#0A2017] rounded-3xl border-2 border-[#2C7557] shadow-2xl relative p-3 flex flex-col justify-between overflow-hidden">
              
              {/* Stitching Lines (Dotted White) */}
              <div className="absolute inset-1.5 border border-dashed border-white/25 rounded-2xl pointer-events-none"></div>

              {/* Wallet Top Opening */}
              <div className="w-full h-2.5 bg-[#091D15] rounded-full opacity-80 shadow-inner"></div>

              {/* Wallet Flap & Hardware */}
              <div className="absolute bottom-4 left-3 right-3 flex items-center justify-between">
                <div className="w-10 h-7 bg-[#153E2E] rounded-xl border border-white/20 shadow-md flex items-center justify-center">
                  {/* Brass Snap Button */}
                  <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] shadow-md border border-amber-100 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-900/60"></div>
                  </div>
                </div>
                <span className="text-[9px] font-bold tracking-widest text-white/40 uppercase">WILLOW</span>
              </div>
            </div>

          </div>
        </div>

        {/* Error message if any */}
        {loginError && (
          <div className="w-full p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs mb-3 text-left flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{lang === 'ID' ? 'Gagal Masuk Akun' : 'Login Failed'}</p>
              <p className="text-[11px] text-red-300 mt-0.5">{loginError}</p>
            </div>
          </div>
        )}

      </main>

      {/* Bottom CTA Button: White Pill "Get Started ->" */}
      <footer className="w-full max-w-sm flex flex-col items-center gap-3 z-10 pb-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-full bg-white text-[#123628] font-bold text-base shadow-xl shadow-black/25 hover:bg-[#F3FAF5] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer group"
        >
          <span>{isSubmitting ? (lang === 'ID' ? 'Menghubungkan...' : 'Connecting...') : (lang === 'ID' ? 'Mulai Sekarang' : 'Get Started')}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <div className="flex items-center justify-between w-full px-2 text-xs text-white/70">
          <button
            type="button"
            onClick={handleSandboxLogin}
            className="hover:text-white transition-colors underline underline-offset-4"
          >
            {lang === 'ID' ? 'Coba Mode Tamu (Demo)' : 'Try Demo Mode'}
          </button>

          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <Database className="w-3.5 h-3.5" />
            <span>Firebase Config</span>
          </button>
        </div>
      </footer>

      {/* Firebase Configuration Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#123628] border border-white/20 rounded-3xl p-6 w-full max-w-md shadow-2xl text-left"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#88E5A7]" />
                  <h3 className="font-bold text-white text-base">Konfigurasi Firebase Pribadi</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveConfig} className="space-y-4">
                <p className="text-xs text-white/80 leading-relaxed">
                  Tempel objek konfigurasi Firebase (JSON) Anda untuk menggunakan Realtime Database sendiri:
                </p>

                <textarea
                  value={configText}
                  onChange={(e) => setConfigText(e.target.value)}
                  placeholder={`{\n  "apiKey": "AIzaSy...",\n  "databaseURL": "https://..."\n}`}
                  rows={5}
                  className="w-full bg-[#0A2017] border border-white/15 rounded-xl p-3 text-xs font-mono text-white placeholder-white/40 focus:outline-none focus:border-[#88E5A7]"
                />

                {configError && (
                  <p className="text-xs text-rose-300 bg-rose-500/20 p-2.5 rounded-lg border border-rose-500/30">
                    {configError}
                  </p>
                )}

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowConfigModal(false)}
                    className="px-4 py-2 rounded-xl text-xs text-white/70 hover:text-white"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#88E5A7] text-[#123628] font-bold text-xs hover:bg-[#A3EDB9] transition-all"
                  >
                    Simpan & Terapkan
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
