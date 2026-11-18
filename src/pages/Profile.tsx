import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Mail, 
  Moon, 
  Sun, 
  FileJson, 
  FileSpreadsheet,
  LogOut, 
  ChevronRight,
  Globe, 
  Tag, 
  Plus, 
  Receipt, 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Smartphone,
  Upload,
  X
} from 'lucide-react';
import { AppUser, Transaction, Budget, SavingGoal, BackupData } from '../types';
import { formatRupiah } from '../utils/helpers';
import { APP_TRANSLATIONS } from '../utils/lang';

interface ProfileProps {
  user: AppUser;
  transactions: Transaction[];
  budgets: Budget[];
  goals?: SavingGoal[];
  categories?: string[];
  onLogout: () => void;
  darkMode?: boolean;
  onToggleDarkMode?: () => void;
  lang?: 'ID' | 'EN';
  onSelectLanguage?: (lang: 'ID' | 'EN') => void;
  onAddCategory?: (category: string) => Promise<void> | void;
  onDeleteCategory?: (category: string) => Promise<void> | void;
  onRestoreBackup?: (backup: BackupData) => Promise<void> | void;
  showInstallBtn?: boolean;
  onTriggerInstall?: () => void;
}

export const Profile: React.FC<ProfileProps> = ({
  user,
  transactions,
  budgets,
  goals = [],
  categories = [],
  onLogout,
  darkMode: propDarkMode,
  onToggleDarkMode,
  lang = 'ID',
  onSelectLanguage,
  onAddCategory,
  onDeleteCategory,
  onRestoreBackup,
  showInstallBtn = false,
  onTriggerInstall,
}) => {
  const t = APP_TRANSLATIONS[lang].profile;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [localDarkMode, setLocalDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark') || 
      localStorage.getItem('WILLOW_THEME') === 'dark';
  });

  const darkMode = propDarkMode !== undefined ? propDarkMode : localDarkMode;
  const [newCategoryName, setNewCategoryName] = useState('');

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

  const handleFullBackup = () => {
    const backupData: BackupData = {
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
        categories,
        goals
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

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Type', 'Category', 'Amount', 'Date', 'Description', 'CreatedAt'];
    
    const sanitizeCsvCell = (val: any) => {
      const s = String(val ?? '');
      if (/^[=\+\-@\t\r]/.test(s)) {
        return "'" + s.replace(/"/g, '""');
      }
      return s.replace(/"/g, '""');
    };

    const rows = transactions.map(item => [
      sanitizeCsvCell(item.id),
      sanitizeCsvCell(item.type),
      sanitizeCsvCell(item.category),
      sanitizeCsvCell(item.amount),
      sanitizeCsvCell(item.date),
      sanitizeCsvCell(item.description),
      sanitizeCsvCell(new Date(item.createdAt).toISOString())
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

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const raw = evt.target?.result as string;
        const parsed = JSON.parse(raw);
        if (onRestoreBackup) {
          await onRestoreBackup(parsed);
        }
      } catch (err) {
        console.error('Invalid backup JSON', err);
      } finally {
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    if (onAddCategory) {
      onAddCategory(newCategoryName.trim());
    }
    setNewCategoryName('');
  };

  return (
    <div className="space-y-6 pb-28">
      <div>
        <h2 className="text-xl font-bold text-text-primary dark:text-slate-100">
          {t.title}
        </h2>
        <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 space-y-5">
          <div className="liquid-glass-card p-6 rounded-[28px] flex flex-col items-center text-center relative overflow-hidden">
            <div className="w-20 h-20 rounded-[26px] overflow-hidden border-2 border-emerald-500/30 dark:border-emerald-500/20 mb-4 p-0.5 bg-white/50 dark:bg-white/5 shadow-xs">
              <img 
                src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.displayName || 'user'}`} 
                alt={user.displayName ? `${user.displayName} avatar` : 'User profile avatar'} 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[22px]" 
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

          <div className="liquid-glass-card p-5 rounded-[28px] space-y-4">
            <h3 className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary dark:text-emerald-400" />
              <span>{t.accountStats}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-100/70 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-semibold uppercase">
                  <Receipt className="w-3.5 h-3.5 text-blue-500" />
                  <span>{t.totalTx}</span>
                </div>
                <p className="text-base font-bold text-text-primary dark:text-slate-100 mt-1">
                  {transactions.length}
                </p>
              </div>

              <div className="bg-slate-100/70 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-semibold uppercase">
                  <Scale className="w-3.5 h-3.5 text-purple-500" />
                  <span>{t.activeBudgetsCount}</span>
                </div>
                <p className="text-base font-bold text-text-primary dark:text-slate-100 mt-1">
                  {budgets.length}
                </p>
              </div>

              <div className="bg-slate-100/70 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-semibold uppercase">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{t.allTimeIncome}</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
                  {formatRupiah(totalAllIncome)}
                </p>
              </div>

              <div className="bg-slate-100/70 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-black/5 dark:border-white/5">
                <div className="flex items-center gap-1.5 text-text-secondary text-[10px] font-semibold uppercase">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                  <span>{t.allTimeExpense}</span>
                </div>
                <p className="text-xs sm:text-sm font-bold text-rose-500 dark:text-rose-400 mt-1 truncate">
                  {formatRupiah(totalAllExpense)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <section aria-labelledby="profile-settings-heading" className="space-y-3">
            <h3 id="profile-settings-heading" className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
              {t.appSettings}
            </h3>

            <div className="liquid-glass-card rounded-[24px] overflow-hidden divide-y divide-black/5 dark:divide-white/10">
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

                <div className="flex bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-xl gap-1 border border-black/5 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => onSelectLanguage && onSelectLanguage('ID')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      lang === 'ID'
                        ? 'forest-pill-active'
                        : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                    }`}
                  >
                    ID
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectLanguage && onSelectLanguage('EN')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      lang === 'EN'
                        ? 'forest-pill-active'
                        : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
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

                <button
                  type="button"
                  onClick={toggleDarkMode}
                  id="profile-darkmode-toggle"
                  aria-label={lang === 'ID' ? 'Alihkan mode gelap' : 'Toggle dark mode'}
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
          </section>

          <section aria-labelledby="data-center-heading" className="space-y-3">
            <h3 id="data-center-heading" className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
              {t.dataCenterTitle}
            </h3>

            <div className="liquid-glass-card rounded-[24px] overflow-hidden divide-y divide-black/5 dark:divide-white/10">
              <button
                type="button"
                onClick={handleExportCSV}
                disabled={transactions.length === 0}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left disabled:opacity-50 disabled:pointer-events-none"
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

              <button
                type="button"
                onClick={handleFullBackup}
                disabled={transactions.length === 0}
                className="w-full p-4 flex items-center justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left disabled:opacity-50 disabled:pointer-events-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center flex-shrink-0">
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

              {onRestoreBackup && (
                <div className="p-4 flex items-center justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 flex items-center justify-center flex-shrink-0">
                      <Upload className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                        {t.restoreTitle}
                      </span>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                        {t.restoreDesc}
                      </p>
                    </div>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileInputChange}
                      className="hidden"
                      id="profile-restore-input"
                    />
                    <label
                      htmlFor="profile-restore-input"
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-750 text-xs font-bold text-primary dark:text-emerald-400 hover:bg-primary/10 transition-all cursor-pointer border border-black/5 dark:border-white/10"
                    >
                      {t.restoreBtn}
                    </label>
                  </div>
                </div>
              )}

              {showInstallBtn && (
                <button
                  type="button"
                  onClick={onTriggerInstall}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-100/60 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left font-sans"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-text-primary dark:text-slate-100">
                        {lang === 'ID' ? 'Pasang Aplikasi PWA' : 'Install PWA App'}
                      </span>
                      <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-0.5">
                        {lang === 'ID' ? 'Akses offline dan pengalaman layar penuh di perangkat Anda' : 'Offline access and fullscreen standalone experience'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-secondary" />
                </button>
              )}
            </div>
          </section>

          <section aria-labelledby="category-manager-heading" className="space-y-3">
            <div className="flex items-center justify-between pl-1">
              <h3 id="category-manager-heading" className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-primary dark:text-emerald-400" />
                <span>{t.categoryTitle}</span>
              </h3>
              <span className="text-[10px] font-semibold text-text-secondary">
                {categories.length} {t.categoryCount}
              </span>
            </div>

            <div className="liquid-glass-card p-4.5 rounded-[24px] space-y-3">
              <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={t.inputCategoryPlaceholder}
                  className="flex-1 bg-slate-100/70 dark:bg-slate-800/80 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-black/5 dark:border-white/10 focus:border-primary text-text-primary dark:text-slate-100"
                />
                <button
                  type="submit"
                  disabled={!newCategoryName.trim()}
                  className="px-4 py-2.5 forest-pill-active rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>{t.addCategoryBtn}</span>
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 pt-1 max-h-36 overflow-y-auto no-scrollbar">
                {categories.map((cat) => (
                  <div
                    key={cat}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/80 text-text-secondary dark:text-slate-300 text-[10px] font-bold border border-black/5 dark:border-white/10"
                  >
                    <span>{cat}</span>
                    {onDeleteCategory && categories.length > 3 && (
                      <button
                        type="button"
                        onClick={() => onDeleteCategory(cat)}
                        aria-label={lang === 'ID' ? `Hapus kategori ${cat}` : `Delete category ${cat}`}
                        className="hover:text-rose-500 transition-colors p-0.5 rounded cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white py-3.5 rounded-2xl text-xs font-bold shadow-lg shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-white/20"
          >
            <LogOut className="w-4.5 h-4.5 stroke-[2.2]" />
            <span>{t.logoutBtn}</span>
          </button>

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
