import React, { useState } from 'react';
import { Wallet, LogIn, Database, Sparkles, AlertCircle, ArrowRight, X } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { auth, saveFirebaseConfig, clearFirebaseConfig, isSandboxMode } from '../firebase/config';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configText, setConfigText] = useState('');
  const [configError, setConfigError] = useState('');
  
  // Mock login inputs
  const [mockName, setMockName] = useState('Dika Pratama');
  const [mockEmail, setMockEmail] = useState('dika@willow.com');

  const handleGoogleLogin = async () => {
    try {
      await auth.signInWithGoogle();
      onLoginSuccess();
    } catch (e) {
      console.error('Google Sign In Error', e);
    }
  };

  const handleMockLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await auth.signInWithMock(mockName, mockEmail);
      onLoginSuccess();
    } catch (e) {
      console.error('Mock Sign In Error', e);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Find the JS object or JSON inside the pasted text
      let cleaned = configText.trim();
      // Remove any variable assignment like 'const firebaseConfig = ' or 'export default'
      cleaned = cleaned.replace(/^(const|let|var|export default)\s+\w+\s*=\s*/, '');
      // Remove trailing semicolon if present
      cleaned = cleaned.replace(/;$/, '');
      
      // Attempt to parse
      // We can use a relaxed parser or standard JSON parser
      let parsed;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        // If strict JSON fails, try evaluating safely or parse key-value
        // Let's replace unquoted keys or JS style strings
        // Since JSON.parse is safer, we suggest JSON format
        // Let's do a simple eval-like parsing just for object notation
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
    <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B1224] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Decorative gradient circles */}
      <div className="absolute top-[-20%] right-[-10%] w-[350px] h-[350px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[350px] h-[350px] rounded-full bg-primary/15 blur-[120px] pointer-events-none" />

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-md bg-surface dark:bg-slate-800 rounded-[32px] shadow-medium p-8 relative border border-border-custom dark:border-slate-700/80 z-10"
      >
        {/* App Logo */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-soft mb-4">
            <Wallet className="w-9 h-9 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary dark:text-slate-100">
            WillowWallet <span className="text-secondary">v2</span>
          </h1>
          <p className="text-sm text-text-secondary dark:text-slate-400 mt-1.5 max-w-xs">
            Atur anggaran, lacak pengeluaran, dan kelola keuangan harian dengan antarmuka premium mobile banking.
          </p>
        </div>

        {/* State Badge */}
        <div className="mb-6 flex justify-center">
          {isSandboxMode ? (
            <div className="bg-amber-500/10 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 text-xs px-4 py-2 rounded-full font-medium flex items-center gap-1.5 border border-amber-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Sandbox Mode (Offline Simulasi)
            </div>
          ) : (
            <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs px-4 py-2 rounded-full font-medium flex items-center gap-1.5 border border-emerald-500/20">
              <Database className="w-3.5 h-3.5" />
              Firebase Realtime DB Terkoneksi
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-4">
          
          {/* Main Google Login Trigger */}
          <button
            onClick={handleGoogleLogin}
            className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-2xl text-base font-semibold shadow-soft hover:shadow-medium transition-all active:scale-98 flex items-center justify-center gap-3 cursor-pointer"
          >
            <LogIn className="w-5 h-5 stroke-[2.5]" />
            Masuk dengan Google
          </button>

          {/* Sandbox login section if active */}
          {isSandboxMode && (
            <div className="pt-4 border-t border-dashed border-border-custom dark:border-slate-700 mt-4">
              <p className="text-xs font-semibold text-text-secondary dark:text-slate-400 text-center uppercase tracking-wider mb-3">
                Atau Simulasikan Sandbox Instan
              </p>
              
              <form onSubmit={handleMockLogin} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Pengguna"
                    required
                    value={mockName}
                    onChange={(e) => setMockName(e.target.value)}
                    className="bg-brand-bg dark:bg-slate-900/40 px-3 py-3 rounded-xl text-xs font-medium focus:outline-none border border-transparent focus:border-primary text-text-primary dark:text-slate-100"
                  />
                  <input
                    type="email"
                    placeholder="Alamat Email"
                    required
                    value={mockEmail}
                    onChange={(e) => setMockEmail(e.target.value)}
                    className="bg-brand-bg dark:bg-slate-900/40 px-3 py-3 rounded-xl text-xs font-medium focus:outline-none border border-transparent focus:border-primary text-text-primary dark:text-slate-100"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-brand-bg dark:bg-slate-700/60 text-text-primary dark:text-slate-200 hover:bg-border-custom dark:hover:bg-slate-700 py-3 rounded-xl text-xs font-semibold transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  Simulasikan Akun
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Connect Real Firebase Trigger */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={() => setShowConfigModal(true)}
              className="text-xs text-text-secondary dark:text-slate-400 hover:text-primary dark:hover:text-secondary underline flex items-center gap-1 cursor-pointer"
            >
              <Database className="w-3.5 h-3.5" />
              {isSandboxMode ? 'Hubungkan ke Firebase Sendiri' : 'Ganti Kredensial Firebase'}
            </button>
          </div>

        </div>
      </motion.div>

      {/* Footer Info */}
      <p className="text-[11px] text-text-secondary dark:text-slate-500 mt-6 max-w-sm text-center">
        WillowWallet v2 mematuhi standardisasi database Firebase Realtime DB persis. Semua data tersimpan aman secara terenkripsi.
      </p>

      {/* Firebase Config Modal Sheet */}
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
                className="bg-surface dark:bg-slate-800 rounded-3xl p-6 shadow-medium max-w-md w-full pointer-events-auto border border-border-custom dark:border-slate-700 flex flex-col gap-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    <h4 className="text-base font-bold text-text-primary dark:text-slate-100">
                      Konfigurasi Firebase
                    </h4>
                  </div>
                  <button
                    onClick={() => setShowConfigModal(false)}
                    className="p-1 rounded-full hover:bg-brand-bg dark:hover:bg-slate-700 text-text-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-text-secondary dark:text-slate-300 leading-relaxed">
                  Tempelkan objek konfigurasi Web Firebase SDK Anda dari Firebase Console di bawah ini. Pastikan menyertakan <code className="bg-brand-bg dark:bg-slate-900 px-1 py-0.5 rounded text-primary">databaseURL</code> untuk Realtime Database Anda.
                </p>

                <form onSubmit={handleSaveConfig} className="space-y-4">
                  <div>
                    <textarea
                      required
                      placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "willowwallet.firebaseapp.com",\n  "databaseURL": "https://willowwallet.firebaseio.com",\n  "projectId": "willowwallet",\n  ...\n}`}
                      value={configText}
                      onChange={(e) => setConfigText(e.target.value)}
                      rows={8}
                      className="w-full bg-brand-bg dark:bg-slate-900 font-mono text-xs p-3 rounded-xl border border-transparent focus:border-primary focus:outline-none text-text-primary dark:text-slate-200 placeholder:text-slate-400"
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
                        // Clear config to restore sandbox
                        clearFirebaseConfig();
                      }}
                      className="flex-1 py-3 text-xs font-semibold rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all active:scale-98"
                    >
                      Reset ke Sandbox
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 text-xs font-semibold rounded-xl bg-primary hover:bg-secondary text-white transition-all active:scale-98"
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
