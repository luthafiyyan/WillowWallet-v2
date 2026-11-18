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
    localStorage.removeItem('WILLOW_FORCE_SANDBOX');
    localStorage.removeItem('WILLOW_SANDBOX_USER');
    try {
      await auth.signInWithGoogle();
      onLoginSuccess();
    } catch (e: any) {
      console.error('Google Sign In Error', e);
      const errorCode = e?.code || '';
      const errorMessage = e?.message || String(e);
      if (errorCode === 'auth/unauthorized-domain' || errorMessage.includes('unauthorized-domain')) {
        setLoginError(
          lang === 'ID'
            ? 'Domain ini belum diotorisasi di Firebase Authentication. Pastikan domain aplikasi ini sudah ditambahkan di Firebase Console > Authentication > Settings > Authorized domains.'
            : 'This domain is not authorized in Firebase Authentication.'
        );
      } else if (errorCode === 'auth/popup-closed-by-user' || errorMessage.includes('popup-closed')) {
        setLoginError(null);
      } else {
        setLoginError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/90 transition-all border border-white/15 cursor-pointer"
            title="Ganti Bahasa / Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang}</span>
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

      {/* Bottom CTA Button: White Pill "Mulai Sekarang dengan Google" */}
      <footer className="w-full max-w-sm flex flex-col items-center gap-3 z-10 pb-2">
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-full bg-white text-[#123628] font-bold text-base shadow-xl shadow-black/25 hover:bg-[#F3FAF5] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-80"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-[#123628] border-t-transparent rounded-full animate-spin flex-shrink-0" />
          ) : (
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          )}
          <span>
            {isSubmitting
              ? (lang === 'ID' ? 'Menghubungkan...' : 'Connecting...')
              : (lang === 'ID' ? 'Mulai Sekarang dengan Google' : 'Continue with Google')}
          </span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-auto text-[#123628]/70" />
        </button>

        <div className="flex items-center justify-center w-full px-2 text-xs text-white/70 pt-1">
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="hover:text-white transition-colors flex items-center gap-1.5 opacity-60 hover:opacity-100 cursor-pointer text-[11px]"
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
