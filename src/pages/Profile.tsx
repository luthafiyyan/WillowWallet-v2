import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Moon, 
  Sun, 
  FileJson, 
  LogOut, 
  Code,
  ShieldAlert,
  ChevronRight,
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import { AppUser, Transaction, Budget } from '../types';
import { auth, isSandboxMode, clearFirebaseConfig } from '../firebase/config';
import { APP_TRANSLATIONS } from '../utils/lang';

interface ProfileProps {
  user: AppUser;
  transactions: Transaction[];
  budgets: Budget[];
  onLogout: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  lang?: 'ID' | 'EN';
  showInstallBtn?: boolean;
  onTriggerInstall?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  transactions,
  budgets,
  onLogout,
  darkMode: propDarkMode,
  onToggleDarkMode,
  lang = 'ID',
  showInstallBtn = false,
  onTriggerInstall,
}) => {
  const t = APP_TRANSLATIONS[lang].profile;
  const [localDarkMode, setLocalDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('WILLOW_THEME') === 'dark';
  });

  const darkMode = propDarkMode !== undefined ? propDarkMode : localDarkMode;

  // Keep dark mode synced if local fallback is used
  useEffect(() => {
    if (propDarkMode !== undefined) return;
    if (localDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('WILLOW_THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('WILLOW_THEME', 'light');
    }
  }, [localDarkMode, propDarkMode]);

  const toggleDarkMode = () => {
    if (onToggleDarkMode) {
      onToggleDarkMode();
    } else {
      setLocalDarkMode(!localDarkMode);
    }
  };

  // Full Database backup (JSON)
  const handleFullBackup = () => {
    const backupData = {
      app: 'WillowWallet v2',
      exportedAt: new Date().toISOString(),
      user: {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email
      },
      data: {
        transactions,
        budgets
      }
    };

    const str = JSON.stringify(backupData, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WillowWallet_Backup_${user.displayName || 'user'}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDisconnectFirebase = () => {
    if (confirm('Apakah Anda yakin ingin memutuskan koneksi Firebase? Aplikasi akan dimuat ulang ke Sandbox offline.')) {
      clearFirebaseConfig();
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-text-primary dark:text-slate-100">
          {t.title}
        </h2>
        <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
          {t.subtitle}
        </p>
      </div>

      {/* Responsive Grid Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Avatar Summary & Firebase Status (Takes 5/12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Profile Card Summary */}
          <div className="bg-surface dark:bg-slate-800 p-6 rounded-[28px] border border-border-custom dark:border-slate-700/60 shadow-soft flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-[28px] overflow-hidden border-2 border-primary/20 dark:border-slate-700/80 mb-4 p-0.5">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.displayName}`} 
                alt="Google Avatar" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[24px]" 
              />
            </div>

            <h3 className="text-base font-bold text-text-primary dark:text-slate-100">
              {user.displayName || t.appUser}
            </h3>
            
            <div className="flex items-center gap-1 text-xs text-text-secondary dark:text-slate-400 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span className="break-all">{user.email || 'offline-sandbox@willow.com'}</span>
            </div>
          </div>

        </div>

        {/* Right Column: App Settings & Actions (Takes 7/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Visual Settings Menu Group */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
              {t.appSettings}
            </h4>

            <div className="bg-surface dark:bg-slate-800 rounded-[24px] border border-border-custom dark:border-slate-700/60 shadow-soft overflow-hidden divide-y divide-border-custom dark:divide-slate-700/50">
              
              {/* Dark Mode Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                      {t.darkModeTitle}
                    </span>
                    <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                      {t.darkModeDesc}
                    </p>
                  </div>
                </div>

                {/* iOS style toggle */}
                <button
                  onClick={toggleDarkMode}
                  id="profile-darkmode-toggle"
                  className={`w-11 h-6 rounded-full p-0.5 transition-colors duration-300 focus:outline-none cursor-pointer ${
                    darkMode ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-soft transform transition-transform duration-300 ${
                      darkMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Backup Database Row */}
              <button
                onClick={handleFullBackup}
                disabled={transactions.length === 0}
                className="w-full p-4 flex items-center justify-between hover:bg-brand-bg dark:hover:bg-slate-700/40 transition-colors cursor-pointer text-left disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                      {t.backupTitle}
                    </span>
                    <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                      {t.backupDesc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>

              {/* Install PWA App Row */}
              {showInstallBtn && (
                <button
                  onClick={onTriggerInstall}
                  className="w-full p-4 flex items-center justify-between hover:bg-brand-bg dark:hover:bg-slate-700/40 transition-colors cursor-pointer text-left font-sans"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                        {lang === 'ID' ? 'Pasang Aplikasi' : 'Install App'}
                      </span>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                        {lang === 'ID' ? 'Dapatkan pengalaman seluler penuh secara offline' : 'Get full mobile banking experience offline'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                </button>
              )}

            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={onLogout}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl text-xs font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
            {t.logoutBtn}
          </button>

          {/* Profile Page Footer credit */}
          <div className="pt-6 text-center text-xs text-text-secondary dark:text-slate-500 font-semibold">
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

      </div>

    </div>
  );
};
