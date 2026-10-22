import React, { useMemo } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  FileDown,
  ChevronRight,
  PieChart,
  Edit3,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Transaction, Budget, AppUser } from '../types';
import { formatRupiah, getCategoryStyle } from '../utils/helpers';
import { motion } from 'motion/react';
import { APP_TRANSLATIONS } from '../utils/lang';

interface HomeProps {
  user: AppUser;
  transactions: Transaction[];
  budgets: Budget[];
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onNavigateTab: (tab: 'home' | 'transactions' | 'analytics' | 'profile') => void;
  onViewTransaction: (tx: Transaction) => void;
  lang?: 'ID' | 'EN';
}

export const Home: React.FC<HomeProps> = ({
  user,
  transactions,
  budgets,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onNavigateTab,
  onViewTransaction,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].home;

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (lang === 'EN') {
      if (hour < 12) return 'Good Morning';
      if (hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    } else {
      if (hour < 11) return 'Selamat Pagi';
      if (hour < 15) return 'Selamat Siang';
      if (hour < 18) return 'Selamat Sore';
      return 'Selamat Malam';
    }
  }, [lang]);

  const getLocalizedCategoryName = (catName: string) => {
    if (lang === 'ID') return catName;
    const catMap: Record<string, string> = {
      'Makanan': 'Food & Drink',
      'Transportasi': 'Transportation',
      'Belanja': 'Shopping',
      'Hiburan': 'Entertainment',
      'Tagihan': 'Bills & Utilities',
      'Lainnya': 'Others',
      'Gaji': 'Salary',
      'Investasi': 'Investment',
      'Sampingan': 'Side Hustle'
    };
    return catMap[catName] || catName;
  };

  // Compute metrics
  const { totalIncome, totalExpense, activeBalance } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    transactions.forEach((t) => {
      if (t.type === 'income') {
        inc += t.amount;
      } else {
        exp += t.amount;
      }
    });
    return {
      totalIncome: inc,
      totalExpense: exp,
      activeBalance: inc - exp,
    };
  }, [transactions]);

  // Compute budget spent sums for current month
  const budgetSpent = useMemo(() => {
    const currentYearMonth = new Date().toISOString().substring(0, 7); // "YYYY-MM"
    const map: Record<string, number> = {};
    
    // Filter transactions from this month to check against budgets
    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date.startsWith(currentYearMonth)) {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    });
    return map;
  }, [transactions]);

  // Budget progress percentage computations
  const activeBudgets = useMemo(() => {
    return budgets.map((b) => {
      const spent = budgetSpent[b.category] || 0;
      const percentage = b.limit > 0 ? Math.min(100, Math.round((spent / b.limit) * 100)) : 0;
      return {
        ...b,
        spent,
        percentage,
        remaining: Math.max(0, b.limit - spent),
      };
    });
  }, [budgets, budgetSpent]);

  // Get 4 most recent transactions
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  // Quick export to CSV helper
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
    link.setAttribute("download", `WillowWallet_Transactions_${user.displayName || 'user'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-28">
      
      {/* Header Profile Section */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#64748B] dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {greeting}
          </p>
          <h1 className="text-2xl font-bold text-text-primary dark:text-slate-100 mt-1 flex items-center gap-1.5">
            {lang === 'ID' ? 'Halo' : 'Hello'}, {user.displayName || (lang === 'ID' ? 'Pengguna' : 'User')} 👋
          </h1>
        </div>
        <button 
          onClick={() => onNavigateTab('profile')}
          className="w-10 h-10 rounded-full overflow-hidden border border-white/60 dark:border-white/15 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md shadow-xs hover:scale-105 transition-transform p-0.5"
          title={lang === 'ID' ? 'Buka Profil' : 'Open Profile'}
        >
          <img 
            src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.displayName}`} 
            alt="Profile Avatar" 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full" 
          />
        </button>
      </div>

      {/* Responsive Grid Layout - Dual Column on desktop, single column on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Balance Card & Recent Transactions (Takes 7/12 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Liquid Glass Emerald Hero Card */}
          <div className="liquid-glass-emerald p-7 rounded-[32px] text-white flex justify-between items-end relative overflow-hidden transition-all duration-300">
            {/* Ambient internal glows and subtle specular pattern */}
            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 rounded-full bg-black/10 blur-xl pointer-events-none" />
            
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <svg className="w-32 h-32 text-white" viewBox="0 0 200 200" fill="currentColor">
                <circle cx="100" cy="100" r="80"/>
              </svg>
            </div>
            
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">{t.activeBalance}</p>
              <h2 className="text-3xl font-bold tracking-tight text-white drop-shadow-xs">{formatRupiah(activeBalance)}</h2>
              <div className="mt-5 flex gap-2.5">
                <span className="px-3 py-1 bg-white/20 hover:bg-white/25 border border-white/30 backdrop-blur-md rounded-full text-[10px] font-semibold transition-all">
                  {activeBalance >= 0 ? t.surplus : t.deficit}
                </span>
                <span className="px-3 py-1 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md rounded-full text-[10px] font-semibold cursor-pointer transition-all" onClick={() => onNavigateTab('analytics')}>
                  {t.viewDetail}
                </span>
              </div>
            </div>

            <div className="relative z-10 text-right">
              <div className="w-11 h-11 bg-white/20 rounded-2xl backdrop-blur-md border border-white/30 flex items-center justify-center mb-8 ml-auto shadow-xs">
                <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <p className="text-[10px] text-white/80 tracking-widest font-mono">**** {user.uid ? user.uid.substring(user.uid.length - 4).toUpperCase() : '4829'}</p>
            </div>
          </div>

          {/* Recent Transactions List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest pl-1">
                {t.recentTransactions}
              </h4>
              <button 
                onClick={() => onNavigateTab('transactions')} 
                className="text-xs text-[#1B8A5A] dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                {t.viewAll}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="liquid-glass-card p-8 rounded-[32px] border border-dashed border-slate-300 dark:border-slate-700/80 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-[#64748B] mb-2">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <p className="text-xs text-[#64748B] dark:text-slate-400 font-semibold">
                  {t.noTxTitle}
                </p>
                <p className="text-[10px] text-[#64748B]/60">
                  {t.noTxDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
                {recentTransactions.map((tx) => {
                  const style = getCategoryStyle(tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <div 
                      key={tx.id}
                      onClick={() => onViewTransaction(tx)}
                      className="liquid-glass-card liquid-glass-card-interactive p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 sm:gap-4 group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${style.bgClass} ${style.textClass} flex items-center justify-center flex-shrink-0 shadow-xs border border-white/40 dark:border-white/5`}>
                          <style.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs sm:text-sm font-bold text-[#0F172A] dark:text-slate-100 line-clamp-1">
                            {tx.description || getLocalizedCategoryName(tx.category)}
                          </h5>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400">
                              {getLocalizedCategoryName(tx.category)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium whitespace-nowrap">
                              {tx.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right hand layout for Amount and controls - stacked on mobile, row on desktop */}
                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 flex-shrink-0">
                        <span className={`text-xs sm:text-sm font-extrabold whitespace-nowrap ${isIncome ? 'text-[#16A34A] dark:text-emerald-400' : 'text-[#EF4444] dark:text-rose-400'}`}>
                          {isIncome ? '+' : '-'} {formatRupiah(tx.amount)}
                        </span>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTransaction(tx);
                            }}
                            className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 border border-black/5 dark:border-white/5 text-[#64748B] hover:text-[#1B8A5A] dark:hover:text-emerald-400 hover:bg-[#1B8A5A]/10 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(tx.id);
                            }}
                            className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 border border-black/5 dark:border-white/5 text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all cursor-pointer"
                            title={lang === 'ID' ? 'Hapus' : 'Delete'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Layanan Cepat & Budget Progress (Takes 5/12 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Action Bento Panel */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest pl-1">
              {t.quickService}
            </h4>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              
              {/* Add Transaction */}
              <button 
                onClick={onOpenAddTransaction}
                className="liquid-glass-card liquid-glass-card-interactive p-3.5 sm:p-4 rounded-3xl flex flex-col items-center text-center gap-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-[#1B8A5A] dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#1E293B] dark:text-slate-200">
                  {t.quickAdd}
                </span>
              </button>

              {/* Budget Baru Shortcut */}
              <button 
                onClick={() => onNavigateTab('analytics')}
                className="liquid-glass-card liquid-glass-card-interactive p-3.5 sm:p-4 rounded-3xl flex flex-col items-center text-center gap-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-[#F59E0B] dark:text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#1E293B] dark:text-slate-200">
                  {t.quickBudget}
                </span>
              </button>

              {/* Analytics Shortcut */}
              <button 
                onClick={() => onNavigateTab('analytics')}
                className="liquid-glass-card liquid-glass-card-interactive p-3.5 sm:p-4 rounded-3xl flex flex-col items-center text-center gap-2 cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-teal-500/10 dark:bg-teal-500/20 text-[#3AA772] dark:text-teal-400 border border-teal-500/20 flex items-center justify-center">
                  <PieChart className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#1E293B] dark:text-slate-200">
                  {t.quickInsights}
                </span>
              </button>

              {/* Export Data */}
              <button 
                onClick={handleExportCSV}
                disabled={transactions.length === 0}
                className="liquid-glass-card liquid-glass-card-interactive p-3.5 sm:p-4 rounded-3xl flex flex-col items-center text-center gap-2 disabled:opacity-45 disabled:pointer-events-none cursor-pointer"
              >
                <div className="w-10 h-10 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-[#3B82F6] dark:text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <FileDown className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#1E293B] dark:text-slate-200">
                  {t.quickExport}
                </span>
              </button>

            </div>
          </div>

          {/* Budget Progress Widget & Saving Goal */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#64748B] dark:text-slate-400 uppercase tracking-widest pl-1">
                {t.budgetProgress}
              </h4>
              <button 
                onClick={() => onNavigateTab('analytics')} 
                className="text-xs text-[#1B8A5A] dark:text-emerald-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                {t.manage}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="liquid-glass-card p-6 rounded-[32px] space-y-5">
              {activeBudgets.length === 0 ? (
                <div className="text-center py-4 flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-[#64748B]/60" />
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    {t.noBudgetTitle}
                  </p>
                  <button 
                    onClick={() => onNavigateTab('analytics')}
                    className="text-xs bg-[#1B8A5A]/10 text-[#1B8A5A] dark:text-emerald-400 px-4 py-2 rounded-xl font-bold hover:bg-[#1B8A5A]/20 transition-all mt-1 cursor-pointer"
                  >
                    {t.setBudgetBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {activeBudgets.slice(0, 3).map((b) => {
                    // Determine bar color based on limits
                    const barColorClass = b.percentage >= 100 
                      ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                      : b.percentage >= 75 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500' 
                        : 'bg-gradient-to-r from-emerald-500 to-teal-500';

                    return (
                      <div key={b.id} className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-[#1E293B] dark:text-slate-100">
                          <span>{getLocalizedCategoryName(b.category)}</span>
                          <span className="font-bold">{b.percentage}%</span>
                        </div>
                        <div className="w-full h-3 bg-slate-200/70 dark:bg-slate-700/60 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${barColorClass}`}
                            style={{ width: `${b.percentage}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-[#64748B] dark:text-slate-400 font-medium">
                          {formatRupiah(b.spent)} / {formatRupiah(b.limit)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Saving Goal Mini Card from the design spec */}
              <div className="bg-emerald-500/8 dark:bg-emerald-500/5 p-4 rounded-2xl border border-dashed border-emerald-500/25 flex items-center gap-3">
                <div className="text-2xl">⛰️</div>
                <div className="flex-grow">
                  <p className="text-[9px] text-[#64748B] dark:text-slate-400 font-bold uppercase tracking-tight">{t.savingGoalTitle}</p>
                  <p className="text-xs font-bold text-[#1E293B] dark:text-slate-200">{lang === 'ID' ? 'Liburan ke Bali' : 'Trip to Bali'}</p>
                  <p className="text-[10px] text-[#1B8A5A] dark:text-emerald-400 font-semibold mt-0.5">
                    {lang === 'ID' 
                      ? `${Math.min(100, Math.max(0, Math.round((activeBalance / 20000000) * 100)))}% tercapai (Target Rp 20jt)` 
                      : `${Math.min(100, Math.max(0, Math.round((activeBalance / 20000000) * 100)))}% reached (Target Rp 20M)`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
