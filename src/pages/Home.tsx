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
          className="w-10 h-10 rounded-full overflow-hidden border border-[#E8EDF4] dark:border-slate-700/85 hover:scale-105 transition-transform p-0.5"
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
          {/* Modern Active Balance Card - Clean Minimalism */}
          <div className="bg-[#1B8A5A] p-7 rounded-[32px] text-white shadow-xl shadow-[#1B8A5A]/20 flex justify-between items-end relative overflow-hidden transition-all duration-300">
            {/* Subtle geometric circle shape pattern from the design */}
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <svg className="w-32 h-32 text-white" viewBox="0 0 200 200" fill="currentColor">
                <circle cx="100" cy="100" r="80"/>
              </svg>
            </div>
            
            <div className="relative z-10">
              <p className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-1">{t.activeBalance}</p>
              <h2 className="text-3xl font-bold tracking-tight">{formatRupiah(activeBalance)}</h2>
              <div className="mt-5 flex gap-2.5">
                <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-medium">
                  {activeBalance >= 0 ? t.surplus : t.deficit}
                </span>
                <span className="px-2.5 py-1 bg-white/20 rounded-full text-[10px] font-medium underline cursor-pointer" onClick={() => onNavigateTab('analytics')}>
                  {t.viewDetail}
                </span>
              </div>
            </div>

            <div className="relative z-10 text-right">
              <div className="w-11 h-11 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center mb-8 ml-auto">
                <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <p className="text-[10px] text-white/70 tracking-widest font-mono">**** {user.uid ? user.uid.substring(user.uid.length - 4).toUpperCase() : '4829'}</p>
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
                className="text-xs text-[#1B8A5A] font-bold hover:underline flex items-center gap-0.5"
              >
                {t.viewAll}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="bg-white dark:bg-slate-800 p-8 rounded-[32px] border border-dashed border-[#E8EDF4] dark:border-slate-700 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#F5F7FB] dark:bg-slate-700 flex items-center justify-center text-[#64748B] mb-2">
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
              <div className="grid grid-cols-1 gap-3">
                {recentTransactions.map((tx) => {
                  const style = getCategoryStyle(tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <div 
                      key={tx.id}
                      onClick={() => onViewTransaction(tx)}
                      className="bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-2xl border border-[#E8EDF4] dark:border-slate-700/60 shadow-sm flex items-center justify-between gap-3 sm:gap-4 group hover:shadow-md hover:bg-slate-50/50 dark:hover:bg-slate-750/30 hover:-translate-y-[1px] transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${style.bgClass} ${style.textClass} flex items-center justify-center flex-shrink-0`}>
                          <style.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs sm:text-sm font-bold text-[#1E293B] dark:text-slate-100 line-clamp-1">
                            {tx.description || getLocalizedCategoryName(tx.category)}
                          </h5>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] font-semibold text-[#64748B] dark:text-slate-400">
                              {getLocalizedCategoryName(tx.category)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-[#E8EDF4] dark:bg-slate-700" />
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
                            className="p-1.5 sm:p-2 rounded-xl bg-[#F5F7FB] dark:bg-slate-700 text-[#64748B] hover:text-[#1B8A5A] hover:bg-[#1B8A5A]/10 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(tx.id);
                            }}
                            className="p-1.5 sm:p-2 rounded-xl bg-[#F5F7FB] dark:bg-slate-700 text-[#64748B] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-all cursor-pointer"
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
            <div className="grid grid-cols-4 gap-3">
              
              {/* Add Transaction */}
              <button 
                onClick={onOpenAddTransaction}
                className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex flex-col items-center text-center gap-2 border border-[#E8EDF4] dark:border-slate-700/60 shadow-sm hover:bg-[#F1F5F9] dark:hover:bg-slate-700/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#1B8A5A]/10 text-[#1B8A5A] flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#1E293B] dark:text-slate-200">
                  {t.quickAdd}
                </span>
              </button>

              {/* Budget Baru Shortcut */}
              <button 
                onClick={() => onNavigateTab('analytics')}
                className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex flex-col items-center text-center gap-2 border border-[#E8EDF4] dark:border-slate-700/60 shadow-sm hover:bg-[#F1F5F9] dark:hover:bg-slate-700/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#F59E0B]/10 text-[#F59E0B] flex items-center justify-center">
                  <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-[10px] font-bold text-[#1E293B] dark:text-slate-200">
                  {t.quickBudget}
                </span>
              </button>

              {/* Analytics Shortcut */}
              <button 
                onClick={() => onNavigateTab('analytics')}
                className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex flex-col items-center text-center gap-2 border border-[#E8EDF4] dark:border-slate-700/60 shadow-sm hover:bg-[#F1F5F9] dark:hover:bg-slate-700/50 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#3AA772]/10 text-[#3AA772] flex items-center justify-center">
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
                className="bg-white dark:bg-slate-800 p-4 rounded-3xl flex flex-col items-center text-center gap-2 border border-[#E8EDF4] dark:border-slate-700/60 shadow-sm hover:bg-[#F1F5F9] dark:hover:bg-slate-700/50 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-55 disabled:pointer-events-none cursor-pointer"
              >
                <div className="w-10 h-10 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
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
                className="text-xs text-[#1B8A5A] font-bold hover:underline flex items-center gap-0.5"
              >
                {t.manage}
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-[32px] border border-[#E8EDF4] dark:border-slate-700/60 shadow-sm space-y-5">
              {activeBudgets.length === 0 ? (
                <div className="text-center py-4 flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-[#64748B]/60" />
                  <p className="text-xs text-[#64748B] dark:text-slate-400">
                    {t.noBudgetTitle}
                  </p>
                  <button 
                    onClick={() => onNavigateTab('analytics')}
                    className="text-xs bg-[#1B8A5A]/10 text-[#1B8A5A] px-4 py-2 rounded-xl font-bold hover:bg-[#1B8A5A]/20 transition-all mt-1"
                  >
                    {t.setBudgetBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {activeBudgets.slice(0, 3).map((b) => {
                    // Determine bar color based on limits
                    const barColorClass = b.percentage >= 100 
                      ? 'bg-[#EF4444]' 
                      : b.percentage >= 75 
                        ? 'bg-[#F59E0B]' 
                        : 'bg-[#3AA772]';

                    return (
                      <div key={b.id} className="space-y-2">
                        <div className="flex justify-between items-center text-xs font-semibold text-[#1E293B] dark:text-slate-100">
                          <span>{getLocalizedCategoryName(b.category)}</span>
                          <span className="font-bold">{b.percentage}%</span>
                        </div>
                        <div className="w-full h-3 bg-[#F1F5F9] dark:bg-slate-700 rounded-full overflow-hidden">
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
              <div className="bg-[#F5F7FB] dark:bg-slate-900/40 p-4 rounded-2xl border border-dashed border-[#1B8A5A]/30 flex items-center gap-3">
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
