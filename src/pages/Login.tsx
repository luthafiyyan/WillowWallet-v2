import React, { useState } from 'react';
import { AlertCircle, Globe, ArrowRight } from '../components/icons';
import { auth } from '../firebase/config';
import { motion } from 'motion/react';

interface LoginProps {
  onLoginSuccess: () => void;
  lang: 'ID' | 'EN';
  onLangChange: (lang: 'ID' | 'EN') => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess, lang, onLangChange }) => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0B2519] via-[#081F15] to-[#04120B] text-white flex flex-col justify-between items-center relative overflow-hidden font-sans select-none px-6 py-5 sm:py-7">
      
      {/* Subtle Specular Ambient Lighting (Calm & Balanced) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-72 bg-gradient-to-b from-[#18533C]/25 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header: Step Indicator & Language Switcher */}
      <header className="w-full max-w-sm flex items-center justify-between z-10 pt-1">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold tracking-wider text-white/90">01 / 03</span>
          <div className="flex items-center gap-1.5 w-20">
            <div className="h-1 flex-1 bg-white rounded-full"></div>
            <div className="h-1 flex-1 bg-white/25 rounded-full"></div>
            <div className="h-1 flex-1 bg-white/25 rounded-full"></div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onLangChange(lang === 'ID' ? 'EN' : 'ID')}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 hover:bg-white/15 text-xs font-semibold text-white/90 transition-all border border-white/15 cursor-pointer backdrop-blur-xs"
            title="Ganti Bahasa / Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{lang}</span>
          </button>
        </div>
      </header>

      {/* Center Hero: Title & 3D Tactile Leather Wallet on Pedestal */}
      <main className="w-full max-w-sm flex flex-col items-center text-center z-10 my-auto py-2">
        
        {/* Title & Subtitle */}
        <div className="space-y-1 mb-1">
          <h1 className="text-4xl sm:text-[44px] font-extrabold tracking-tight text-white leading-[1.12]">
            Your Money <br />
            <span className="text-[#86EFAC] font-serif italic font-medium">Better Days</span>
          </h1>
          <p className="text-white/75 text-sm max-w-[280px] sm:max-w-xs mx-auto pt-2 leading-relaxed font-normal">
            {lang === 'ID' 
              ? 'Kelola, rencanakan, dan kembangkan keuanganmu di satu tempat yang mudah.'
              : 'Save, spend, and grow your wealth — all in one simple place.'}
          </p>
        </div>

        {/* 3D Realistic Handcrafted Vector Leather Wallet on Pedestal */}
        <motion.div 
          initial={{ y: 0 }}
          animate={{ y: [-3, 3, -3] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center cursor-pointer select-none"
        >
          <svg 
            viewBox="0 0 320 320" 
            className="w-full h-full drop-shadow-[0_20px_35px_rgba(0,0,0,0.6)]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Pedestal Gradients */}
              <linearGradient id="pedestalBase" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0B261A" />
                <stop offset="100%" stopColor="#05140E" />
              </linearGradient>
              <linearGradient id="pedestalTop" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1C523B" />
                <stop offset="100%" stopColor="#0E2B1E" />
              </linearGradient>
              
              {/* Wallet Leather Gradients */}
              <linearGradient id="walletLeather" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1E543D" />
                <stop offset="45%" stopColor="#143D2C" />
                <stop offset="100%" stopColor="#0A2218" />
              </linearGradient>
              <linearGradient id="walletFlap" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1C4E37" />
                <stop offset="100%" stopColor="#103223" />
              </linearGradient>

              {/* Credit Card Gradient */}
              <linearGradient id="cardGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1F2937" />
                <stop offset="60%" stopColor="#111827" />
                <stop offset="100%" stopColor="#090D16" />
              </linearGradient>

              {/* Gold Chip Gradient */}
              <linearGradient id="goldChip" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#F59E0B" />
                <stop offset="100%" stopColor="#D97706" />
              </linearGradient>

              {/* Metallic Brass Button Gradient */}
              <radialGradient id="brassOuter" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FFFBEB" />
                <stop offset="35%" stopColor="#FBBF24" />
                <stop offset="70%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </radialGradient>
              <radialGradient id="brassInner" cx="40%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#FDE68A" />
                <stop offset="50%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#78350F" />
              </radialGradient>

              {/* Drop Shadow Filter */}
              <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* 1. Ambient Floor Shadows */}
            <ellipse cx="160" cy="282" rx="115" ry="18" fill="black" opacity="0.45" />
            <ellipse cx="160" cy="278" rx="80" ry="10" fill="black" opacity="0.6" />

            {/* 2. Lower Pedestal Tier */}
            <path d="M 52,258 Q 160,274 268,258 L 268,272 Q 160,288 52,272 Z" fill="url(#pedestalBase)" />
            <ellipse cx="160" cy="258" rx="108" ry="17" fill="url(#pedestalTop)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

            {/* 3. Upper Pedestal Tier */}
            <path d="M 74,242 Q 160,256 246,242 L 246,254 Q 160,268 74,254 Z" fill="url(#pedestalBase)" />
            <ellipse cx="160" cy="242" rx="86" ry="13.5" fill="url(#pedestalTop)" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />

            {/* 4. Tilted Floating Leather Wallet Group */}
            <g transform="rotate(-11 160 170)">
              
              {/* Behind Wallet: Dark Titanium Credit Card Popping Out */}
              <g transform="translate(0, -6)">
                {/* Card Body */}
                <rect 
                  x="96" 
                  y="70" 
                  width="128" 
                  height="82" 
                  rx="10" 
                  fill="url(#cardGradient)" 
                  stroke="rgba(255,255,255,0.22)" 
                  strokeWidth="1" 
                />
                
                {/* Subtle Card Magnetic Strip / Gloss Sheen */}
                <path d="M 96,82 L 224,82" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />

                {/* Gold EMV Chip */}
                <rect x="110" y="90" width="22" height="17" rx="3.5" fill="url(#goldChip)" stroke="#B45309" strokeWidth="0.5" />
                <path d="M 110,98 L 132,98 M 121,90 L 121,107" stroke="rgba(120,53,15,0.6)" strokeWidth="0.75" />

                {/* Mastercard Dual Circles */}
                <circle cx="198" cy="98" r="9" fill="#EF4444" opacity="0.95" />
                <circle cx="210" cy="98" r="9" fill="#F59E0B" opacity="0.92" />
                <path d="M 204,91.5 A 9 9 0 0 1 204,104.5 A 9 9 0 0 1 204,91.5" fill="#F97316" />

                {/* Card Number Mask */}
                <text x="110" y="128" fill="rgba(255,255,255,0.7)" fontSize="8" fontFamily="monospace" letterSpacing="2">•••• 8420</text>
              </g>

              {/* Wallet Main Body (Folded Leather) */}
              <rect 
                x="80" 
                y="114" 
                width="160" 
                height="126" 
                rx="24" 
                fill="url(#walletLeather)" 
                stroke="#2B6B4E" 
                strokeWidth="1.5" 
              />

              {/* Wallet Subtle Specular Top Highlight */}
              <path d="M 92,116 Q 160,114 228,116" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" fill="none" />

              {/* Leather Perimeter White Stitching */}
              <rect 
                x="86" 
                y="120" 
                width="148" 
                height="114" 
                rx="18" 
                fill="none" 
                stroke="rgba(255,255,255,0.28)" 
                strokeWidth="1.2" 
                strokeDasharray="4.5 3.5" 
              />

              {/* Top Wallet Slot Opening */}
              <path 
                d="M 94,128 Q 160,125 226,128" 
                stroke="#06140D" 
                strokeWidth="4" 
                strokeLinecap="round" 
              />

              {/* Leather Tongue / Snap Closure Flap */}
              <path 
                d="M 88,176 L 118,176 A 14 14 0 0 1 118,204 L 88,204 Z" 
                fill="url(#walletFlap)" 
                stroke="#255E44" 
                strokeWidth="1" 
              />
              <path 
                d="M 89,180 L 116,180 A 10 10 0 0 1 116,200 L 89,200" 
                fill="none" 
                stroke="rgba(255,255,255,0.22)" 
                strokeWidth="1" 
                strokeDasharray="3 2.5" 
              />

              {/* Metallic Brass Snap Button */}
              <circle cx="106" cy="190" r="7" fill="url(#brassOuter)" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
              <circle cx="106" cy="190" r="4.2" fill="url(#brassInner)" />
              <circle cx="104.5" cy="188.5" r="1.5" fill="#FFFBEB" opacity="0.75" />

              {/* Embossed Brand Wordmark */}
              <text 
                x="180" 
                y="218" 
                fill="rgba(255,255,255,0.32)" 
                fontSize="8.5" 
                fontWeight="800" 
                letterSpacing="2.8" 
                fontFamily="system-ui, sans-serif"
              >
                WILLOW
              </text>
            </g>
          </svg>
        </motion.div>

        {/* Error Notification if Google Auth Fails */}
        {loginError && (
          <div className="w-full p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs mb-2 text-left flex items-start gap-2.5 backdrop-blur-xs">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{lang === 'ID' ? 'Gagal Masuk Akun' : 'Login Failed'}</p>
              <p className="text-[11px] text-red-300 mt-0.5 leading-relaxed">{loginError}</p>
            </div>
          </div>
        )}

      </main>

      {/* Bottom CTA Button & Requested Developer Footer */}
      <footer className="w-full max-w-sm flex flex-col items-center gap-3.5 z-10 pb-2">
        
        {/* Primary CTA Button: White Pill "Mulai Sekarang dengan Google" */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-full bg-white text-[#0A261A] font-bold text-base shadow-xl shadow-black/35 hover:bg-[#F0FDF4] hover:shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer group disabled:opacity-80"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-[#0A261A] border-t-transparent rounded-full animate-spin flex-shrink-0" />
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
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform ml-auto text-[#0A261A]/70" />
        </button>

        {/* User Requested Footer Copyright & Threads Link */}
        <p className="text-[11px] text-white/55 text-center tracking-wide font-normal">
          © 2026 WillowWallet. Developed by{' '}
          <a
            href="https://www.threads.com/@luthafiyyan_"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/85 hover:text-[#86EFAC] underline underline-offset-2 transition-colors font-medium"
          >
            Luthafiyyan
          </a>
        </p>

      </footer>

    </div>
  );
};
