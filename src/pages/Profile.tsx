import React, { useState, useEffect, useMemo } from 'react';
import { 
  Mail, 
  Moon, 
  Sun, 
  FileJson, 
  FileSpreadsheet,
  LogOut, 
  ChevronRight,
  Sparkles,
  Globe,
  Tag,
  Plus,
  Receipt,
  Scale,
  TrendingUp,
  TrendingDown,
  Activity
} from 'lucide-react';
import { AppUser, Transaction, Budget } from '../types';
import { formatRupiah } from '../utils/helpers';
import { APP_TRANSLATIONS } from '../utils/lang';

interface ProfileProps {
  user: AppUser;
  transactions: Transaction[];
  budgets: Budget[];
  categories?: string[];
  onLogout: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  lang?: 'ID' | 'EN';
  onSelectLanguage?: (lang: 'ID' | 'EN') => void;
  onAddCategory?: (category: string) => Promise<void> | void;
  showInstallBtn?: boolean;
  onTriggerInstall?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  transactions,
  budgets,
  categories = [],
  onLogout,
  darkMode: propDarkMode,
  onToggleDarkMode,
  lang = 'ID',
  onSelectLanguage,
  onAddCategory,
  showInstallBtn = false,
  onTriggerInstall,
}) => {
  const t = APP_TRANSLATIONS[lang].profile;

  const [localDarkMode, setLocalDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('WILLOW_THEME') === 'dark';
  });

  const darkMode = propDarkMode !== undefined ? propDarkMode : localDarkMode;

  const [newCategoryName, setNewCategoryName] = useState('');

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

  // Compute all-time income and expense stats
  const { totalAllIncome, totalAllExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        inc += tx.amount;
      } else {
        exp += tx.amount;
      }
    });
    return {
      totalAllIncome: inc,
      totalAllExpense: exp,
    };
  }, [transactions]);

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
        budgets,
        categories
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

  // Export transactions to CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Type', 'Category', 'Amount', 'Date', 'Description', 'CreatedAt'];
    const rows = transactions.map(t => [
      t.id,
      t.type,
      t.category,
      t.amount,
      t.date,
      t.description.replace(/"/g, '""'),
      new Date(t.createdAt).toISOString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `WillowWallet_Transactions_${user.displayName || 'user'}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Add category handler
  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (onAddCategory) {
      onAddCategory(newCategoryName.trim());
    }
    setNewCategoryName('');
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
        
        {/* Left Column: Avatar Summary & Financial Activity Stats (Takes 5/12 cols) */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Profile Card Summary */}
          <div className="bg-surface dark:bg-slate-800 p-6 rounded-[28px] border border-border-custom dark:border-slate-700/60 shadow-soft flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-[28px] overflow-hidden border-2 border-primary/20 dark:border-slate-700/80 mb-4 p-0.5">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.displayName}`} 
                alt="User Avatar" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[24px]" 
              />
            </div>

            <h3 className="text-base font-bold text-text-primary dark:text-slate-100">
              {user.displayName || t.appUser}
            </h3>
            
            <div className="flex items-center gap-1.5 text-xs text-text-secondary dark:text-slate-400 mt-1">
              <Mail className="w-3.5 h-3.5" />
              <span className="break-all">{user.email || 'user@willow.app'}</span>
            </div>
          </div>

          {/* Account Activity Stats Card */}
          <div className="bg-surface dark:bg-slate-800 p-5 rounded-[28px] border border-border-custom dark:border-slate-700/60 shadow-soft space-y-4">
            <h4 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" />
              {t.accountStats}
            </h4>

            <div className="grid grid-cols-2 gap-3">
              {/* Total Transactions */}
              <div className="bg-brand-bg dark:bg-slate-900/40 p-3.5 rounded-2xl border border-border-custom/50 dark:border-slate-700/40">
                <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-semibold uppercase">
                  <Receipt className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.totalTx}</span>
                </div>
                <h5 className="text-base font-bold text-text-primary dark:text-slate-100 mt-1">
                  {transactions.length}
                </h5>
              </div>

              {/* Active Budgets */}
              <div className="bg-brand-bg dark:bg-slate-900/40 p-3.5 rounded-2xl border border-border-custom/50 dark:border-slate-700/40">
                <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-semibold uppercase">
                  <Scale className="w-3.5 h-3.5 text-purple-500" />
                  <span>{t.activeBudgetsCount}</span>
                </div>
                <h5 className="text-base font-bold text-text-primary dark:text-slate-100 mt-1">
                  {budgets.length}
                </h5>
              </div>

              {/* Total Income */}
              <div className="bg-brand-bg dark:bg-slate-900/40 p-3.5 rounded-2xl border border-border-custom/50 dark:border-slate-700/40">
                <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-semibold uppercase">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.allTimeIncome}</span>
                </div>
                <h5 className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                  {formatRupiah(totalAllIncome)}
                </h5>
              </div>

              {/* Total Expense */}
              <div className="bg-brand-bg dark:bg-slate-900/40 p-3.5 rounded-2xl border border-border-custom/50 dark:border-slate-700/40">
                <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-semibold uppercase">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.allTimeExpense}</span>
                </div>
                <h5 className="text-xs sm:text-sm font-bold text-rose-500 dark:text-rose-400 mt-1 truncate">
                  {formatRupiah(totalAllExpense)}
                </h5>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: App Settings, Data Center & Category Manager (Takes 7/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* App Settings Group */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
              {t.appSettings}
            </h4>

            <div className="bg-surface dark:bg-slate-800 rounded-[24px] border border-border-custom dark:border-slate-700/60 shadow-soft overflow-hidden divide-y divide-border-custom dark:divide-slate-700/50">
              
              {/* Language Switcher Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                      {t.languageTitle}
                    </span>
                    <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                      {t.languageDesc}
                    </p>
                  </div>
                </div>

                {/* Segmented language pill buttons */}
                <div className="flex bg-brand-bg dark:bg-slate-900/60 p-1 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectLanguage && onSelectLanguage('ID')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      lang === 'ID'
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                    }`}
                  >
                    🇮🇩 ID
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectLanguage && onSelectLanguage('EN')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      lang === 'EN'
                        ? 'bg-primary text-white shadow-soft'
                        : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                    }`}
                  >
                    🇬🇧 EN
                  </button>
                </div>
              </div>

              {/* Dark Mode Row */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                    {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                      {t.darkModeTitle || t.darkMode}
                    </span>
                    <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                      {t.darkModeDesc}
                    </p>
                  </div>
                </div>

                {/* iOS style toggle */}
                <button
                  type="button"
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

            </div>
          </div>

          {/* Data & Export Center Group */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
              {t.dataCenterTitle}
            </h4>

            <div className="bg-surface dark:bg-slate-800 rounded-[24px] border border-border-custom dark:border-slate-700/60 shadow-soft overflow-hidden divide-y divide-border-custom dark:divide-slate-700/50">
              
              {/* Export CSV Row */}
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={transactions.length === 0}
                className="w-full p-4 flex items-center justify-between hover:bg-brand-bg dark:hover:bg-slate-700/40 transition-colors cursor-pointer text-left disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                      {t.exportCsvTitle}
                    </span>
                    <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                      {t.exportCsvDesc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>

              {/* Backup Database Row (JSON) */}
              <button
                type="button"
                onClick={handleFullBackup}
                disabled={transactions.length === 0}
                className="w-full p-4 flex items-center justify-between hover:bg-brand-bg dark:hover:bg-slate-700/40 transition-colors cursor-pointer text-left disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
                    <FileJson className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                      {t.backupTitle || t.downloadBackup}
                    </span>
                    <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                      {t.backupDesc || t.downloadBackupDesc}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-text-secondary" />
              </button>

              {/* Install PWA App Row (if supported) */}
              {showInstallBtn && (
                <button
                  type="button"
                  onClick={onTriggerInstall}
                  className="w-full p-4 flex items-center justify-between hover:bg-brand-bg dark:hover:bg-slate-700/40 transition-colors cursor-pointer text-left font-sans"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                        {lang === 'ID' ? 'Pasang Aplikasi' : 'Install App'}
                      </span>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                        {lang === 'ID' ? 'Dapatkan pengalaman seluler penuh secara offline' : 'Get full app experience offline'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                </button>
              )}

            </div>
          </div>

          {/* Category Management Group */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pl-1">
              <h4 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary" />
                {t.categoryTitle}
              </h4>
              <span className="text-[10px] font-semibold text-text-secondary">
                {categories.length} {t.categoryCount}
              </span>
            </div>

            <div className="bg-surface dark:bg-slate-800 p-4.5 rounded-[24px] border border-border-custom dark:border-slate-700/60 shadow-soft space-y-3">
              {/* Add Category Form */}
              <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t.inputCategoryPlaceholder}
                  className="flex-1 bg-brand-bg dark:bg-slate-900/40 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-primary text-text-primary dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2.5 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t.addCategoryBtn}</span>
                </button>
              </form>

              {/* Category Pills Preview */}
              <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto no-scrollbar">
                {categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-lg bg-brand-bg dark:bg-slate-900/50 text-text-secondary dark:text-slate-300 text-[10px] font-bold border border-border-custom/50 dark:border-slate-700/50"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Logout button */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white py-4 rounded-2xl text-xs font-bold shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
            {t.logoutBtn}
          </button>

          {/* Profile Page Footer credit */}
          <div className="pt-2 text-center text-xs text-text-secondary dark:text-slate-500 font-semibold space-y-1">
            <p className="text-[10px] opacity-75 font-mono">{t.appVersion}</p>
            <p>
              © 2026 WillowWallet. Developed by{' '}
              <a 
                href="https://www.instagram.com/luthafiyyan_/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-primary hover:underline font-bold transition-all"
              >
                Luthafiyyan
              </a>
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
