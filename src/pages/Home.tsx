import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  ArrowRight, 
  HelpCircle,
  FileDown,
  Edit3,
  Trash2,
  AlertCircle,
  Target,
  Eye,
  EyeOff,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Transaction, Budget, AppUser, SavingGoal } from '../types';
import { formatRupiah, getCategoryStyle } from '../utils/helpers';
import { APP_TRANSLATIONS } from '../utils/lang';

interface HomeProps {
  user: AppUser;
  transactions: Transaction[];
  budgets: Budget[];
  goals?: SavingGoal[];
  onOpenAddTransaction: () => void;
  onOpenAddGoal?: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onDeleteGoal?: (goalId: string) => void;
  onNavigateTab: (tab: 'home' | 'transactions' | 'analytics' | 'profile') => void;
  onViewTransaction: (tx: Transaction) => void;
  lang?: 'ID' | 'EN';
}

export const Home: React.FC<HomeProps> = ({
  user,
  transactions,
  budgets,
  goals = [],
  onOpenAddTransaction,
  onOpenAddGoal,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteGoal,
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
      'Makanan & Minuman': 'Food & Drink',
      'Transportasi': 'Transportation',
      'Belanja': 'Shopping',
      'Hiburan': 'Entertainment',
      'Tagihan': 'Bills & Utilities',
      'Tagihan & Utilitas': 'Bills & Utilities',
      'Kesehatan': 'Health',
      'Pendidikan': 'Education',
      'Lainnya': 'Others',
      'Gaji': 'Salary',
      'Investasi': 'Investment',
      'Sampingan': 'Side Hustle'
    };
    return catMap[catName] || catName;
  };

  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(() => {
    return localStorage.getItem('WILLOW_HIDE_BALANCE') === 'true';
  });

  const toggleHideBalance = () => {
    setIsBalanceHidden((prev) => {
      const next = !prev;
      localStorage.setItem('WILLOW_HIDE_BALANCE', String(next));
      return next;
    });
  };

  const { totalIncome, totalExpense, activeBalance, currentMonthIncome, currentMonthExpense } = useMemo(() => {
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    let inc = 0;
    let exp = 0;
    let monthInc = 0;
    let monthExp = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        inc += tx.amount;
        if (tx.date.startsWith(currentYearMonth)) {
          monthInc += tx.amount;
        }
      } else {
        exp += tx.amount;
        if (tx.date.startsWith(currentYearMonth)) {
          monthExp += tx.amount;
        }
      }
    });

    return {
      totalIncome: inc,
      totalExpense: exp,
      activeBalance: inc - exp,
      currentMonthIncome: monthInc,
      currentMonthExpense: monthExp,
    };
  }, [transactions]);

  const budgetSpent = useMemo(() => {
    const currentYearMonth = new Date().toISOString().substring(0, 7);
    const map: Record<string, number> = {};
    transactions.forEach((tx) => {
      if (tx.type === 'expense' && tx.date.startsWith(currentYearMonth)) {
        map[tx.category] = (map[tx.category] || 0) + tx.amount;
      }
    });
    return map;
  }, [transactions]);

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

  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  const handleExportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['ID', 'Type', 'Category', 'Amount', 'Date', 'Description', 'CreatedAt'];
    const rows = transactions.map(item => [
      item.id,
      item.type,
      item.category,
      item.amount,
      item.date,
      item.description.replace(/"/g, '""'),
      new Date(item.createdAt).toISOString()
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
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary dark:text-slate-400 text-xs font-semibold uppercase tracking-wider">
            {greeting}
          </p>
          <h1 className="text-2xl font-bold text-text-primary dark:text-slate-100 mt-1">
            {lang === 'ID' ? 'Halo' : 'Hello'}, {user.displayName || (lang === 'ID' ? 'Pengguna' : 'User')}
          </h1>
        </div>
        <button 
          type="button"
          onClick={() => onNavigateTab('profile')}
          className="w-11 h-11 rounded-full overflow-hidden border border-white/60 dark:border-white/15 bg-white/40 dark:bg-slate-800/40 backdrop-blur-md shadow-xs hover:scale-105 transition-transform p-0.5 focus-visible:ring-2 focus-visible:ring-primary"
          aria-label={lang === 'ID' ? 'Buka Pengaturan Profil' : 'Open Profile Settings'}
        >
          <img 
            src={user.photoURL || `https://api.dicebear.com/7.x/adventurer/svg?seed=${user.displayName || 'user'}`} 
            alt={user.displayName ? `${user.displayName} avatar` : 'User profile avatar'} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-full" 
          />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 space-y-6">
          <section aria-labelledby="balance-card-heading" className="liquid-glass-emerald p-6 sm:p-7 rounded-[32px] text-white flex flex-col justify-between relative overflow-hidden transition-all duration-300 gap-5">
            <div className="flex items-start justify-between relative z-10 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p id="balance-card-heading" className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                    {t.activeBalance}
                  </p>
                  <button
                    type="button"
                    onClick={toggleHideBalance}
                    className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label={isBalanceHidden ? t.showBalance : t.hideBalance}
                    title={isBalanceHidden ? t.showBalance : t.hideBalance}
                  >
                    {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-xs tabular-nums">
                  {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(activeBalance)}
                </h2>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-bold whitespace-nowrap">
                  {activeBalance >= 0 ? t.surplus : t.deficit}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigateTab('analytics')}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 border border-white/30 rounded-full text-xs font-semibold cursor-pointer transition-all focus-visible:ring-2 focus-visible:ring-white"
                >
                  {t.viewDetail}
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs text-white/90 relative z-10 flex-wrap gap-2">
              <span className="font-semibold text-white/80">
                {t.thisMonthNet}:
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                  <span className="text-[11px] text-white/80">{t.incomeShort}:</span>
                  <span className="font-bold tabular-nums">
                    {isBalanceHidden ? '••••••' : formatRupiah(currentMonthIncome)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingDown className="w-3.5 h-3.5 text-rose-200" />
                  <span className="text-[11px] text-white/80">{t.expenseShort}:</span>
                  <span className="font-bold tabular-nums">
                    {isBalanceHidden ? '••••••' : formatRupiah(currentMonthExpense)}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section aria-labelledby="recent-tx-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="recent-tx-heading" className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
                {t.recentTransactions}
              </h3>
              <button 
                type="button"
                onClick={() => onNavigateTab('transactions')} 
                className="text-xs text-[#1B8A5A] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-1 focus-visible:ring-primary rounded"
              >
                <span>{t.viewAll}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="liquid-glass-card p-8 rounded-[32px] border border-dashed border-slate-300 dark:border-slate-700/80 text-center flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-750 flex items-center justify-center text-text-secondary mb-1">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <p className="text-xs text-text-secondary dark:text-slate-300 font-semibold">
                  {t.noTxTitle}
                </p>
                <p className="text-[10px] text-text-secondary/70 max-w-xs">
                  {t.noTxDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:gap-3" role="list">
                {recentTransactions.map((tx) => {
                  const style = getCategoryStyle(tx.category);
                  const isIncome = tx.type === 'income';

                  return (
                    <div 
                      key={tx.id}
                      role="listitem"
                      tabIndex={0}
                      onClick={() => onViewTransaction(tx)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          onViewTransaction(tx);
                        }
                      }}
                      className="liquid-glass-card liquid-glass-card-interactive p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 sm:gap-4 group cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label={`${tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran'} ${formatRupiah(tx.amount)} ${tx.category}`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                        <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl ${style.bgClass} ${style.textClass} flex items-center justify-center flex-shrink-0 shadow-xs border border-white/40 dark:border-white/5`}>
                          <style.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="text-xs sm:text-sm font-bold text-text-primary dark:text-slate-100 line-clamp-1">
                            {tx.description || getLocalizedCategoryName(tx.category)}
                          </h4>
                          <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs font-semibold text-text-secondary dark:text-slate-400">
                              {getLocalizedCategoryName(tx.category)}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                            <span className="text-xs text-text-secondary dark:text-slate-400 font-medium whitespace-nowrap">
                              {tx.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 flex-shrink-0">
                        <span className={`text-xs sm:text-sm font-extrabold whitespace-nowrap tabular-nums ${isIncome ? 'text-[#16A34A] dark:text-emerald-400' : 'text-[#EF4444] dark:text-rose-400'}`}>
                          {isBalanceHidden 
                            ? (isIncome ? '+ Rp ••••••' : '- Rp ••••••')
                            : `${isIncome ? '+' : '-'} ${formatRupiah(tx.amount)}`}
                        </span>
                        
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditTransaction(tx);
                            }}
                            className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 text-text-secondary hover:text-[#1B8A5A] dark:hover:text-emerald-400 transition-all cursor-pointer"
                            aria-label={lang === 'ID' ? 'Edit transaksi' : 'Edit transaction'}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteTransaction(tx.id);
                            }}
                            className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 text-text-secondary hover:text-[#EF4444] transition-all cursor-pointer"
                            aria-label={lang === 'ID' ? 'Hapus transaksi' : 'Delete transaction'}
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
          </section>
        </div>

        <div className="lg:col-span-5 space-y-6">
          <section aria-labelledby="quick-service-heading" className="space-y-3">
            <h3 id="quick-service-heading" className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
              {t.quickService}
            </h3>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
              <button 
                type="button"
                onClick={onOpenAddTransaction}
                className="liquid-glass-card liquid-glass-card-interactive p-3 sm:p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-[#1B8A5A] dark:text-emerald-400 flex items-center justify-center">
                  <Plus className="w-5 h-5 stroke-[2.5]" />
                </div>
                <span className="text-xs font-bold text-text-primary dark:text-slate-200">
                  {t.quickAdd}
                </span>
              </button>

              <button 
                type="button"
                onClick={onOpenAddGoal || (() => onNavigateTab('home'))}
                className="liquid-glass-card liquid-glass-card-interactive p-3 sm:p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                  <Target className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-text-primary dark:text-slate-200">
                  {t.quickGoal || 'Target'}
                </span>
              </button>

              <button 
                type="button"
                onClick={() => onNavigateTab('transactions')}
                className="liquid-glass-card liquid-glass-card-interactive p-3 sm:p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-text-primary dark:text-slate-200">
                  {t.quickHistory || 'Riwayat'}
                </span>
              </button>

              <button 
                type="button"
                onClick={handleExportCSV}
                disabled={transactions.length === 0}
                className="liquid-glass-card liquid-glass-card-interactive p-3 sm:p-3.5 rounded-2xl flex flex-col items-center text-center gap-2 disabled:opacity-45 disabled:pointer-events-none cursor-pointer focus-visible:ring-2 focus-visible:ring-primary"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <FileDown className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xs font-bold text-text-primary dark:text-slate-200">
                  {t.quickExport}
                </span>
              </button>
            </div>
          </section>

          <section aria-labelledby="budget-progress-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="budget-progress-heading" className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
                {t.budgetProgress}
              </h3>
              <button 
                type="button"
                onClick={() => onNavigateTab('analytics')} 
                className="text-xs text-[#1B8A5A] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-1 focus-visible:ring-primary rounded"
              >
                <span>{t.manage}</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="liquid-glass-card p-6 rounded-[32px] space-y-4">
              {activeBudgets.length === 0 ? (
                <div className="text-center py-4 flex flex-col items-center gap-2">
                  <AlertCircle className="w-8 h-8 text-text-secondary/60" />
                  <p className="text-xs text-text-secondary dark:text-slate-400">
                    {t.noBudgetTitle}
                  </p>
                  <button 
                    type="button"
                    onClick={() => onNavigateTab('analytics')}
                    className="text-xs bg-[#1B8A5A]/10 text-[#1B8A5A] dark:text-emerald-400 px-4 py-2 rounded-xl font-bold hover:bg-[#1B8A5A]/20 transition-all mt-1 cursor-pointer"
                  >
                    {t.setBudgetBtn}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBudgets.slice(0, 3).map((b) => {
                    const barColorClass = b.percentage >= 100 
                      ? 'bg-rose-500' 
                      : b.percentage >= 75 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500';

                    return (
                      <div key={b.id} className="space-y-1.5">
                        <div className="flex justify-between items-center text-xs font-semibold text-text-primary dark:text-slate-100">
                          <span>{getLocalizedCategoryName(b.category)}</span>
                          <span className="font-bold">{b.percentage}%</span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-200/70 dark:bg-slate-700/60 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${barColorClass}`}
                            style={{ width: `${b.percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-text-secondary dark:text-slate-400 font-semibold tabular-nums">
                          {formatRupiah(b.spent)} / {formatRupiah(b.limit)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          <section aria-labelledby="saving-goal-heading" className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 id="saving-goal-heading" className="text-xs font-bold text-text-secondary dark:text-slate-400 uppercase tracking-widest pl-1">
                {t.savingGoalTitle}
              </h3>
              {onOpenAddGoal && (
                <button
                  type="button"
                  onClick={onOpenAddGoal}
                  className="text-xs text-[#1B8A5A] dark:text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer focus-visible:ring-1 focus-visible:ring-primary rounded"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addGoalBtn}</span>
                </button>
              )}
            </div>

            <div className="liquid-glass-card p-5 rounded-[32px] space-y-3">
              {goals.length === 0 ? (
                <div className="text-center py-4 flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Target className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-text-primary dark:text-slate-200">
                    {t.noGoalsTitle}
                  </p>
                  <p className="text-[10px] text-text-secondary dark:text-slate-400 max-w-xs">
                    {t.noGoalsDesc}
                  </p>
                  {onOpenAddGoal && (
                    <button
                      type="button"
                      onClick={onOpenAddGoal}
                      className="text-xs bg-[#1B8A5A]/10 text-[#1B8A5A] dark:text-emerald-400 px-3.5 py-1.5 rounded-xl font-bold hover:bg-[#1B8A5A]/20 transition-all cursor-pointer mt-1"
                    >
                      {t.addGoalBtn}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-3.5">
                  {goals.map((goal) => {
                    const pct = goal.targetAmount > 0
                      ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100))
                      : 0;

                    return (
                      <div 
                        key={goal.id} 
                        className="bg-emerald-500/8 dark:bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/20 space-y-2 relative"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="text-xs font-bold text-text-primary dark:text-slate-100">
                              {goal.title}
                            </h4>
                            {goal.deadline && (
                              <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
                                {t.deadline}: {goal.deadline}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-extrabold text-[#1B8A5A] dark:text-emerald-400 bg-white dark:bg-slate-800 px-2.5 py-0.5 rounded-full shadow-2xs tabular-nums">
                              {pct}%
                            </span>
                            {onDeleteGoal && (
                              <button
                                type="button"
                                onClick={() => onDeleteGoal(goal.id)}
                                className="p-1 text-text-secondary hover:text-rose-500 rounded transition-colors"
                                aria-label={lang === 'ID' ? `Hapus target ${goal.title}` : `Delete goal ${goal.title}`}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>

                        <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between items-center text-xs text-text-secondary dark:text-slate-400 font-semibold tabular-nums">
                          <span>{formatRupiah(goal.currentAmount)}</span>
                          <span>{t.target}: {formatRupiah(goal.targetAmount)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
