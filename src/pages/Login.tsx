import React, { useState } from 'react';
import { 
  Wallet, 
  Database, 
  Sparkles, 
  AlertCircle, 
  X, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight, 
  Globe 
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { auth, saveFirebaseConfig, clearFirebaseConfig, isSandboxMode } from '../firebase/config';

interface LoginProps {
  onLoginSuccess: () => void;
  lang: 'ID' | 'EN';
  onLangChange: (lang: 'ID' | 'EN') => void;
}

const TRANSLATIONS = {
  ID: {
    tagline: "WillowWallet",
    titleLine1: "Halo kembali!",
    titleLine2: "Kelola keuangan dengan bijak.",
    description: "Catat pemasukan, pantau pengeluaran, dan capai tujuan keuanganmu dengan asisten manajemen finansial.",
    continueWithGoogle: "Lanjutkan dengan Google",
    connectOwnFirebase: "Hubungkan ke Firebase Sendiri",
    connectOwnFirebaseSubtitle: "Gunakan Realtime DB pribadi",
    changeFirebaseCreds: "Ganti Kredensial Firebase",
    unauthorizedDomain: "Domain Belum Diotorisasi di Firebase",
    loginFailed: "Gagal Masuk Akun",
    unauthorizedHelpTitle: "Cara Mengatasi (Hanya Butuh 1 Menit):",
    unauthorizedHelp1: "Buka",
    unauthorizedHelp2: "Pilih menu Authentication > tab Settings.",
    unauthorizedHelp3: "Cari bagian Authorized Domains (Domain yang disetujui), lalu tambahkan domain berikut:",
    unauthorizedNote: "* Setelah menambahkan domain tersebut ke Firebase Console, coba klik login lagi di atas.",
    genericErrorHelp: "Pastikan konfigurasi Firebase Anda benar dan koneksi internet stabil.",
    slogan: "Sistem Keuangan Mandiri & Aman",
    copyright: "© 2026 WillowWallet. Seluruh hak cipta dilindungi undang-undang.",
    encryptionInfo: "Keamanan Enkripsi Firebase Realtime DB & SSL"
  },
  EN: {
    tagline: "WillowWallet",
    titleLine1: "Welcome back!",
    titleLine2: "Manage finances wisely.",
    description: "Record income, track expenses, and achieve your financial goals with a financial management assistant.",
    continueWithGoogle: "Continue with Google",
    connectOwnFirebase: "Connect Your Own Firebase",
    changeFirebaseCreds: "Change Firebase Credentials",
    unauthorizedDomain: "Domain Unauthorized in Firebase",
    loginFailed: "Login Failed",
    unauthorizedHelpTitle: "How to Resolve (Takes Only 1 Minute):",
    unauthorizedHelp1: "Open",
    unauthorizedHelp2: "Select Authentication menu > Settings tab.",
    unauthorizedHelp3: "Find Authorized Domains section, then add the following domains:",
    unauthorizedNote: "* After adding these domains to Firebase Console, try logging in again above.",
    genericErrorHelp: "Make sure your Firebase config is correct and your internet connection is stable.",
    slogan: "Self-Sovereign & Secure Financial System",
    copyright: "© 2026 WillowWallet. All rights reserved.",
    encryptionInfo: "Firebase Realtime DB & SSL Encryption Security"
  }
};

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, lang, onLangChange }) => {
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configText, setConfigText] = useState('');
  const [configError, setConfigError] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [copiedDomain, setCopiedDomain] = useState<string | null>(null);

  const t = TRANSLATIONS[lang];

  const handleGoogleLogin = async () => {
    setLoginError(null);
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
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDomain(text);
    setTimeout(() => setCopiedDomain(null), 2000);
  };

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
        const fn = new Function(`return ${cleaned};`);
        parsed = fn();
      }

      if (parsed && parsed.apiKey && parsed.databaseURL) {
        saveFirebaseConfig(parsed);
        setShowConfigModal(false);
        setConfigError('');
      } else {
        setConfigError('Config must contain at least "apiKey" and "databaseURL".');
      }
    } catch (err: any) {
      setConfigError('Format tidak valid. Pastikan JSON atau object Firebase config benar.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFBFD] dark:bg-[#060B18] text-slate-800 dark:text-slate-100 flex flex-col justify-between items-center relative overflow-hidden font-sans select-none">
      
      {/* Background Gradient Blobs mimicking reference image perfectly */}
      <div className="absolute top-[-10%] left-[-10%] w-[380px] h-[380px] rounded-full bg-[#FEF3C7]/45 dark:bg-[#FEF3C7]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-15%] w-[450px] h-[450px] rounded-full bg-[#EEF2FF]/60 dark:bg-[#E0E7FF]/5 blur-[130px] pointer-events-none" />
      {/* Floating Orange Accent Dot */}
      <div className="absolute top-[28%] left-[44%] w-4.5 h-4.5 rounded-full bg-[#F59E0B] opacity-80 animate-pulse pointer-events-none hidden md:block" />

      {/* 1. Header Bar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between z-20">
        {/* Brand Logo Card */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl shadow-soft border border-[#E8EDF4] dark:border-slate-700/60 flex items-center justify-center p-2">
            <img 
              src="https://i.postimg.cc/15M87QGM/Willow-Wallet-icon.png" 
              alt="Willow Wallet Icon" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-[#111827] dark:text-slate-200">WillowWallet</span>
          </div>
        </div>

        {/* Language Selection Dropdown Button */}
        <div className="flex items-center gap-2">
          
          <div className="relative">
            <button 
              type="button"
              onClick={() => setShowLangDropdown(!showLangDropdown)}
              className="bg-white dark:bg-slate-800 border border-[#E8EDF4] dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-soft px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold text-[#111827] dark:text-slate-200 cursor-pointer active:scale-95 transition-all"
            >
              {lang === 'ID' ? (
                <>
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-200 flex flex-col flex-shrink-0">
                    <div className="h-1/2 bg-[#FF0000]" />
                    <div className="h-1/2 bg-[#FFFFFF]" />
                  </div>
                  <span>ID</span>
                </>
              ) : (
                <>
                  <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-200 flex flex-col justify-between flex-shrink-0 relative bg-white">
                    <div className="h-[2px] bg-[#B31942] w-full" />
                    <div className="h-[2px] bg-white w-full" />
                    <div className="h-[2px] bg-[#B31942] w-full" />
                    <div className="h-[2px] bg-white w-full" />
                    <div className="h-[2px] bg-[#B31942] w-full" />
                    <div className="h-[2px] bg-white w-full" />
                    <div className="h-[2px] bg-[#B31942] w-full" />
                    <div className="absolute top-0 left-0 w-[7px] h-[9px] bg-[#0A3161] flex flex-wrap p-[0.5px] items-center justify-center content-center gap-[0.2px]">
                      <div className="w-0.5 h-0.5 bg-white rounded-full scale-[0.7]" />
                      <div className="w-0.5 h-0.5 bg-white rounded-full scale-[0.7]" />
                      <div className="w-0.5 h-0.5 bg-white rounded-full scale-[0.7]" />
                      <div className="w-0.5 h-0.5 bg-white rounded-full scale-[0.7]" />
                    </div>
                  </div>
                  <span>EN</span>
                </>
              )}
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
 
            {/* Dropdown Menu Portal */}
            <AnimatePresence>
              {showLangDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-30" 
                    onClick={() => setShowLangDropdown(false)} 
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-[#E8EDF4] dark:border-slate-700 rounded-2xl shadow-large z-40 p-1.5 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onLangChange('ID');
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${lang === 'ID' ? 'bg-[#10B981]/10 text-[#10B981]' : 'hover:bg-slate-50 dark:hover:bg-slate-750 text-text-primary dark:text-slate-200'}`}
                    >
                      <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-200 flex flex-col flex-shrink-0">
                        <div className="h-1/2 bg-[#FF0000]" />
                        <div className="h-1/2 bg-[#FFFFFF]" />
                      </div>
                      Bahasa Indonesia
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onLangChange('EN');
                        setShowLangDropdown(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 text-xs font-bold rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer ${lang === 'EN' ? 'bg-[#10B981]/10 text-[#10B981]' : 'hover:bg-slate-50 dark:hover:bg-slate-750 text-text-primary dark:text-slate-200'}`}
                    >
                      <div className="w-4 h-4 rounded-full overflow-hidden border border-slate-200 flex flex-col justify-between flex-shrink-0 relative bg-white">
                        <div className="h-[2px] bg-[#B31942] w-full" />
                        <div className="h-[2px] bg-white w-full" />
                        <div className="h-[2px] bg-[#B31942] w-full" />
                        <div className="h-[2px] bg-white w-full" />
                        <div className="h-[2px] bg-[#B31942] w-full" />
                        <div className="h-[2px] bg-white w-full" />
                        <div className="h-[2px] bg-[#B31942] w-full" />
                        <div className="absolute top-0 left-0 w-[7px] h-[9px] bg-[#0A3161] flex flex-wrap p-[0.5px] items-center justify-center content-center gap-[0.2px]">
                          <div className="w-0.5 h-0.5 bg-white rounded-full scale-[0.7]" />
                          <div className="w-0.5 h-0.5 bg-white rounded-full scale-[0.7]" />
                          <div className="w-0.5 h-0.5 bg-white rounded-full scale-[0.7]" />
                          <div className="w-0.5 h-0.5 bg-white rounded-full scale-[0.7]" />
                        </div>
                      </div>
                      English (US)
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </header>

      {/* 2. Main Responsive Split Layout */}
      <main className="w-full max-w-6xl mx-auto px-6 flex-grow flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-16 z-10 py-4">
        
        {/* Left Column: Typography and Gorgeous 3D Wallet & Coins Illustration */}
        <div className="w-full md:w-1/2 flex flex-col md:items-start text-left space-y-6 md:pr-4">
          <div className="space-y-3.5 max-w-lg">
            <span className="text-xs font-bold text-[#10B981] dark:text-emerald-400 tracking-widest uppercase">
              {t.tagline}
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold tracking-tight text-[#111827] dark:text-slate-100 leading-[1.15]">
              {t.titleLine1}<br />{t.titleLine2.split(' ')[0]} <span className="text-[#10B981] dark:text-emerald-400 font-extrabold">{t.titleLine2.split(' ')[1]}</span> {t.titleLine2.split(' ').slice(2).join(' ')}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {t.description}
            </p>
          </div>

          {/* Interactive CSS 3D Wallet & Coins Section */}
          <div className="relative w-full h-56 sm:h-64 flex items-center justify-center md:justify-start pt-4 select-none">
            
            {/* Soft backdrop glow */}
            <div className="absolute left-10 w-44 h-44 rounded-full bg-emerald-300/30 dark:bg-emerald-600/10 blur-2xl pointer-events-none -z-10" />

            {/* Micro leaves background elements */}
            <div className="absolute top-[20%] left-[5%] w-8 h-8 rounded-tr-3xl rounded-bl-3xl bg-emerald-400/20 rotate-45 pointer-events-none" />
            <div className="absolute bottom-[25%] left-[45%] w-6 h-6 rounded-tr-3xl rounded-bl-3xl bg-emerald-400/30 -rotate-12 pointer-events-none" />

            <div className="relative flex items-center">
              
              {/* Green Wallet Container */}
              <motion.div
                animate={{ 
                  y: [0, -6, 0],
                  rotate: [1, -1, 1]
                }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut"
                }}
                className="relative w-48 h-36 bg-gradient-to-br from-[#10B981] via-[#059669] to-[#047857] rounded-[32px] shadow-large border-t border-emerald-300/40 p-5 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Shiny highlight lines across the wallet */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                
                {/* Gold Button snap */}
                <div className="absolute right-5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-[#F59E0B] border-2 border-emerald-100 flex items-center justify-center shadow-md">
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-700/30" />
                </div>

                {/* Stitched seam effect */}
                <div className="absolute inset-2.5 rounded-[22px] border border-dashed border-emerald-400/40 pointer-events-none" />

                {/* Embossed Logo monogram */}
                <div className="flex items-center gap-2 z-10">
                  <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white stroke-[2.2]" />
                  </div>
                  <span className="text-white text-[11px] font-extrabold tracking-widest uppercase">
                    WILLOW
                  </span>
                </div>

                <div className="z-10">
                  <div className="h-1.5 w-16 bg-[#10B981]/40 rounded-full mb-1.5" />
                  <div className="text-[10px] text-white/70 font-semibold tracking-wider font-mono">
                    RP **** ****
                  </div>
                </div>
              </motion.div>

              {/* Gold Coin 1 (Front Left, Large) */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 3,
                  delay: 0.2,
                  ease: "easeInOut"
                }}
                className="absolute -top-10 left-32 w-16 h-16 rounded-full bg-gradient-to-br from-[#FBDF5F] via-[#F59E0B] to-[#D97706] shadow-md border-2 border-[#FEF3C7] flex items-center justify-center cursor-pointer select-none"
              >
                {/* 3D embossed circle border */}
                <div className="w-[84%] h-[84%] rounded-full border border-amber-600/30 flex items-center justify-center font-bold text-amber-900 text-sm">
                  Rp
                </div>
              </motion.div>

              {/* Gold Coin 2 (Back Left, Medium) */}
              <motion.div
                animate={{ y: [0, -16, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 3.5,
                  delay: 0.8,
                  ease: "easeInOut"
                }}
                className="absolute -top-16 left-8 w-12 h-12 rounded-full bg-gradient-to-br from-[#FBDF5F] via-[#F59E0B] to-[#D97706] shadow-sm border-2 border-[#FEF3C7] flex items-center justify-center select-none"
              >
                <div className="w-[80%] h-[80%] rounded-full border border-amber-600/30 flex items-center justify-center font-bold text-amber-900 text-xs">
                  Rp
                </div>
              </motion.div>

              {/* Gold Coin 3 (Side Right, Small) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 2.8,
                  delay: 1.4,
                  ease: "easeInOut"
                }}
                className="absolute top-20 left-[180px] w-9 h-9 rounded-full bg-gradient-to-br from-[#FBDF5F] via-[#F59E0B] to-[#D97706] shadow-sm border border-[#FEF3C7] flex items-center justify-center select-none"
              >
                <div className="w-[80%] h-[80%] rounded-full border border-amber-600/20 flex items-center justify-center font-bold text-amber-900 text-[10px]">
                  Rp
                </div>
              </motion.div>

            </div>
          </div>
        </div>

        {/* Right Column: High Fidelity Login Cards and Action Panel */}
        <div className="w-full md:w-1/2 max-w-md flex flex-col justify-center space-y-6">
          
          <div className="bg-white dark:bg-slate-800/80 backdrop-blur-md rounded-[32px] p-6.5 sm:p-8 border border-[#E8EDF4] dark:border-slate-700/60 shadow-medium flex flex-col gap-5">
            
            {/* Google Authentication Trigger Card */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleGoogleLogin}
              className="w-full bg-white dark:bg-slate-900 border border-[#E8EDF4] dark:border-slate-700 hover:border-[#10B981]/50 dark:hover:border-emerald-500/50 p-5 rounded-2xl flex items-center justify-between shadow-soft transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                {/* Colored Google G Icon using custom HTML vectors */}
                <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 shadow-inner">
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24">
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
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#111827] dark:text-slate-100">
                  {t.continueWithGoogle}
                </span>
              </div>
              <ChevronRight className="w-4.5 h-4.5 text-slate-400" />
            </motion.button>

            {/* Error Message Handler */}
            {loginError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-4 space-y-3 text-left text-xs text-[#111827] dark:text-slate-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-2 text-rose-500 font-bold">
                    <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {loginError === 'auth/unauthorized-domain' 
                        ? t.unauthorizedDomain
                        : t.loginFailed}
                    </span>
                  </div>
                  <button 
                    onClick={() => setLoginError(null)}
                    className="p-1 rounded-md hover:bg-rose-500/10 text-rose-500 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {loginError === 'auth/unauthorized-domain' ? (
                  <div className="space-y-3 text-[11px] leading-relaxed">
                    <p className="text-slate-500 dark:text-slate-300">
                      Firebase menolak login karena domain aplikasi saat ini belum didaftarkan di setelan Authorized Domains proyek Firebase Anda.
                    </p>
                    
                    <div className="space-y-2 bg-white dark:bg-slate-900 p-3 rounded-xl border border-rose-500/20">
                      <p className="font-bold text-[#111827] dark:text-slate-200">
                        {t.unauthorizedHelpTitle}
                      </p>
                      <ol className="list-decimal list-inside space-y-1.5 text-slate-500 dark:text-slate-400 pl-1">
                        <li>
                          {t.unauthorizedHelp1}{' '}
                          <a 
                            href="https://console.firebase.google.com/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[#10B981] hover:underline font-bold inline-flex items-center gap-0.5"
                          >
                            Firebase Console →
                          </a>
                        </li>
                        <li>
                          {t.unauthorizedHelp2}
                        </li>
                        <li>
                          {t.unauthorizedHelp3}
                        </li>
                      </ol>

                      <div className="space-y-1.5 mt-3 pt-2.5 border-t border-[#E8EDF4] dark:border-slate-850">
                        {/* Domain 1: Current Hostname */}
                        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-[#E8EDF4] dark:border-slate-700">
                          <code className="font-mono text-[10px] text-[#10B981] truncate">
                            {window.location.hostname}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyText(window.location.hostname)}
                            className="p-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 transition-all flex items-center gap-1 cursor-pointer text-[9px] font-bold"
                          >
                            {copiedDomain === window.location.hostname ? (
                              <>
                               <Check className="w-3 h-3 text-emerald-500" />
                                Tersalin
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Salin
                              </>
                            )}
                          </button>
                        </div>

                        {/* Domain 2: localhost */}
                        <div className="flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-lg border border-[#E8EDF4] dark:border-slate-700">
                          <code className="font-mono text-[10px] text-[#10B981]">
                            localhost
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyText('localhost')}
                            className="p-1 rounded bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-500 transition-all flex items-center gap-1 cursor-pointer text-[9px] font-bold"
                          >
                            {copiedDomain === 'localhost' ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                Tersalin
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                Salin
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-400 italic">
                      {t.unauthorizedNote}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 text-[11px]">
                    <p className="text-slate-500 dark:text-slate-300 leading-relaxed break-words">
                      {loginError}
                    </p>
                    <p className="text-slate-400">
                      {t.genericErrorHelp}
                    </p>
                  </div>
                )}
              </motion.div>
            )}

          </div>

          {/* Slogan Text under Card */}
          <div className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500">
            {t.slogan}
          </div>

          {/* Carousel indicators showing progress dots */}
          <div className="flex justify-center items-center gap-1.5 pt-1">
            <span className="w-5 h-1.5 rounded-full bg-[#10B981] dark:bg-emerald-400" />
            <span className="w-3.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
            <span className="w-3.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-800" />
          </div>

        </div>

      </main>

      {/* 3. Global Footer copyright info */}
      <footer className="w-full text-center py-6 text-xs text-text-secondary dark:text-slate-500 font-semibold border-t border-[#E8EDF4]/40 dark:border-slate-800/40 z-10 bg-white/20 dark:bg-transparent backdrop-blur-xs">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-center">
          <div>
            © 2026 WillowWallet. Developed by{' '}
            <a 
              href="https://www.instagram.com/luthafiyyan_/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-primary hover:underline font-bold transition-all"
            >
              Luthafiyyan
            </a>
          </div>
        </div>
      </footer>

      {/* Firebase manual credential overrides modal sheets */}
      <AnimatePresence>
        {showConfigModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
            />
            
            {/* Modal Box */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
              <motion.div
                initial={{ scale: 0.94, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.94, opacity: 0 }}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-large max-w-md w-full pointer-events-auto border border-[#E8EDF4] dark:border-slate-700 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-[#10B981]" />
                    <h4 className="text-base font-extrabold text-[#111827] dark:text-slate-100">
                      Konfigurasi Firebase
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-medium">
                  Tempelkan objek konfigurasi Web Firebase SDK Anda dari Firebase Console di bawah ini. Pastikan menyertakan <code className="bg-slate-50 dark:bg-slate-900 px-1 py-0.5 rounded text-[#10B981] font-mono">databaseURL</code> untuk Realtime Database Anda.
                </p>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <textarea
                      required
                      placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "willowwallet.firebaseapp.com",\n  "databaseURL": "https://willowwallet.firebaseio.com",\n  "projectId": "willowwallet",\n  ...\n}`}
                      value={configText}
                      onChange={(e) => setConfigText(e.target.value)}
                      rows={8}
                      className="w-full bg-slate-50 dark:bg-slate-900 font-mono text-xs p-3.5 rounded-xl border border-transparent focus:border-[#10B981] focus:outline-none text-[#111827] dark:text-slate-200 placeholder:text-slate-400"
                    />
                  </div>

                  {configError && (
                    <div className="bg-rose-500/10 text-rose-500 text-xs p-3 rounded-xl flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{configError}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        clearFirebaseConfig();
                      }}
                      className="flex-1 py-3.5 text-xs font-bold rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all active:scale-98 cursor-pointer"
                    >
                      Reset ke Sandbox
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3.5 text-xs font-bold rounded-xl bg-[#10B981] hover:bg-[#059669] text-white transition-all active:scale-98 cursor-pointer shadow-soft"
                    >
                      Terapkan & Hubungkan
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
