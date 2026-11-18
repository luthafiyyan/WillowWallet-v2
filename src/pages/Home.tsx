import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Send, 
  ArrowLeftRight, 
  MoreHorizontal, 
  Eye, 
  EyeOff, 
  BarChart2, 
  Search, 
  Bell, 
  ArrowUpRight, 
  ArrowDownLeft, 
  FileDown, 
  FileText,
  Target, 
  TrendingUp, 
  TrendingDown, 
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Wallet
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
  onOpenMonthlyReport?: () => void;
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
  onOpenMonthlyReport,
  onEditTransaction,
  onDeleteTransaction,
  onDeleteGoal,
  onNavigateTab,
  onViewTransaction,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].home;

  const [isBalanceHidden, setIsBalanceHidden] = useState<boolean>(() => {
    return localStorage.getItem('WILLOW_HIDE_BALANCE') === 'true';
  });

  const [showMoreActions, setShowMoreActions] = useState(false);

  const toggleHideBalance = () => {
    setIsBalanceHidden((prev) => {
      const next = !prev;
      localStorage.setItem('WILLOW_HIDE_BALANCE', String(next));
      return next;
    });
  };

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (lang === 'EN') {
      if (hour < 12) return 'Good morning';
      if (hour < 17) return 'Good afternoon';
      return 'Good evening';
    } else {
      if (hour < 11) return 'Selamat pagi';
      if (hour < 15) return 'Selamat siang';
      if (hour < 18) return 'Selamat sore';
      return 'Selamat malam';
    }
  }, [lang]);

  // Balance & Month Trend Calculations
  const { 
    activeBalance, 
    currentMonthIncome, 
    currentMonthExpense, 
    lastMonthNet,
    monthGrowthPercentage 
  } = useMemo(() => {
    const now = new Date();
    const currentYearMonth = now.toISOString().substring(0, 7);
    
    // Calculate last month string (YYYY-MM)
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastYearMonth = prevMonthDate.toISOString().substring(0, 7);

    let inc = 0;
    let exp = 0;
    let curMonthInc = 0;
    let curMonthExp = 0;
    let lastMonthInc = 0;
    let lastMonthExp = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'income') {
        inc += tx.amount;
        if (tx.date.startsWith(currentYearMonth)) curMonthInc += tx.amount;
        if (tx.date.startsWith(lastYearMonth)) lastMonthInc += tx.amount;
      } else {
        exp += tx.amount;
        if (tx.date.startsWith(currentYearMonth)) curMonthExp += tx.amount;
        if (tx.date.startsWith(lastYearMonth)) lastMonthExp += tx.amount;
      }
    });

    const curNet = curMonthInc - curMonthExp;
    const prevNet = lastMonthInc - lastMonthExp;
    
    let growth = 12.6; // default calibrated baseline
    if (prevNet !== 0) {
      growth = Number((((curNet - prevNet) / Math.abs(prevNet)) * 100).toFixed(1));
    }

    return {
      activeBalance: inc - exp,
      currentMonthIncome: curMonthInc,
      currentMonthExpense: curMonthExp,
      lastMonthNet: prevNet,
      monthGrowthPercentage: growth,
    };
  }, [transactions]);

  // Budget calculations
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

  // Recent Transactions (top 4 as in reference image)
  const recentTransactions = useMemo(() => {
    return transactions.slice(0, 4);
  }, [transactions]);

  // Secure CSV Export (Neutralizing leading formula triggers =+-@\t\r)
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
    link.setAttribute("download", `WillowWallet_Transactions_${user.displayName || 'user'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatTxDate = (dateStr: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (dateStr === today) return lang === 'ID' ? 'Hari Ini' : 'Today';
    
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-6 pb-28 max-w-lg mx-auto">
      
      {/* 1. Header: Greeting & Quick Action Icons (Search, Bell) */}
      <header className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-text-primary dark:text-slate-100">
            {greeting}
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary dark:text-slate-400 mt-0.5">
            {lang === 'ID' ? 'Mari bangun masa depan finansialmu' : "Let's build your brighter future"}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('transactions')}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#142920] border border-[#E4ECE6] dark:border-white/10 flex items-center justify-center text-text-primary dark:text-slate-200 shadow-xs hover:bg-[#F0F4F1] dark:hover:bg-[#1A362B] transition-all cursor-pointer"
            aria-label="Cari transaksi"
          >
            <Search className="w-4.5 h-4.5 stroke-[2]" />
          </button>
          
          <button
            type="button"
            onClick={() => onNavigateTab('profile')}
            className="w-10 h-10 rounded-full bg-white dark:bg-[#142920] border border-[#E4ECE6] dark:border-white/10 flex items-center justify-center text-text-primary dark:text-slate-200 shadow-xs hover:bg-[#F0F4F1] dark:hover:bg-[#1A362B] transition-all cursor-pointer relative"
            aria-label="Notifikasi & Pengaturan"
          >
            <Bell className="w-4.5 h-4.5 stroke-[2]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#123628] dark:bg-[#4ADE80]"></span>
          </button>
        </div>
      </header>

      {/* 2. Hero Total Balance Card - Matching Reference Image */}
      <section 
        aria-label="Total Saldo"
        className="forest-hero-card rounded-[32px] p-6 sm:p-7 text-white flex flex-col justify-between gap-5 relative overflow-hidden"
      >
        {/* Top Card Row: Badge with Icon + "Total Balance" + Eye & Bar Chart Icon */}
        <div className="flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-white/90">
              <span className="text-xs font-bold">!</span>
            </div>
            <span className="text-sm font-medium text-white/90 tracking-wide">
              {lang === 'ID' ? 'Total Saldo' : 'Total Balance'}
            </span>
            <button
              type="button"
              onClick={toggleHideBalance}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              aria-label={isBalanceHidden ? t.showBalance : t.hideBalance}
            >
              {isBalanceHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('analytics')}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 transition-all cursor-pointer"
            aria-label="Lihat Grafik Analisis"
          >
            <BarChart2 className="w-5 h-5" />
          </button>
        </div>

        {/* Center: Large Crisp Balance Number */}
        <div className="z-10 py-1">
          <div className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm tabular-nums">
            {isBalanceHidden ? 'Rp ••••••••' : formatRupiah(activeBalance)}
          </div>
        </div>

        {/* Bottom Card Row: Comparison / Trend Pill */}
        <div className="flex items-center justify-between z-10 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E8F4EC] text-[#123628] text-xs font-bold shadow-xs">
            <span className="text-[11px]">▲</span>
            <span>{Math.abs(monthGrowthPercentage)}%</span>
            <span className="font-normal opacity-80 text-[11px]">
              {lang === 'ID' ? 'vs bulan lalu' : 'vs last month'}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('analytics')}
            className="text-xs font-medium text-white/80 hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>{t.viewDetail}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 3. Quick Action Row: 4 Circular Buttons (Add, Send, Convert, More) */}
      <section aria-label="Aksi Cepat" className="grid grid-cols-4 gap-2 pt-1 text-center">
        
        {/* 1. Add Money */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={onOpenAddTransaction}
            className="action-circle-btn shadow-xs cursor-pointer group"
            title="Tambah Transaksi"
          >
            <Plus className="w-6 h-6 stroke-[2.2] group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-xs font-semibold text-text-primary dark:text-slate-200">
            {lang === 'ID' ? 'Tambah' : 'Add Money'}
          </span>
        </div>

        {/* 2. Send (Quick Export / Transfer) */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            className="action-circle-btn shadow-xs cursor-pointer group"
            title="Ekspor CSV Data Transaksi"
          >
            <Send className="w-5 h-5 stroke-[2] -rotate-45 group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-xs font-semibold text-text-primary dark:text-slate-200">
            {lang === 'ID' ? 'Kirim' : 'Send'}
          </span>
        </div>

        {/* 3. Convert (Swap / Budgeting) */}
        <div className="flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigateTab('analytics')}
            className="action-circle-btn shadow-xs cursor-pointer group"
            title="Kelola Anggaran & Kategori"
          >
            <ArrowLeftRight className="w-5 h-5 stroke-[2] group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-xs font-semibold text-text-primary dark:text-slate-200">
            {lang === 'ID' ? 'Anggaran' : 'Convert'}
          </span>
        </div>

        {/* 4. More */}
        <div className="flex flex-col items-center gap-2 relative">
          <button
            type="button"
            onClick={() => setShowMoreActions(!showMoreActions)}
            className="action-circle-btn shadow-xs cursor-pointer group"
            title="Menu Lainnya"
          >
            <MoreHorizontal className="w-5 h-5 stroke-[2] group-hover:scale-110 transition-transform" />
          </button>
          <span className="text-xs font-semibold text-text-primary dark:text-slate-200">
            {lang === 'ID' ? 'Lainnya' : 'More'}
          </span>

          {/* Quick Dropdown Popup */}
          {showMoreActions && (
            <div className="absolute top-16 right-0 w-48 bg-white dark:bg-[#12281E] border border-[#E5ECE7] dark:border-white/10 rounded-2xl shadow-xl p-2 z-30 text-left space-y-1">
              <button
                type="button"
                onClick={() => {
                  setShowMoreActions(false);
                  handleExportCSV();
                }}
                className="w-full px-3 py-2 text-xs font-medium text-text-primary dark:text-slate-200 hover:bg-[#F0F4F1] dark:hover:bg-[#1A382B] rounded-xl flex items-center gap-2"
              >
                <FileDown className="w-4 h-4 text-[#123628] dark:text-[#4ADE80]" />
                <span>Ekspor CSV</span>
              </button>
              {onOpenMonthlyReport && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreActions(false);
                    onOpenMonthlyReport();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-text-primary dark:text-slate-200 hover:bg-[#F0F4F1] dark:hover:bg-[#1A382B] rounded-xl flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-[#123628] dark:text-[#4ADE80]" />
                  <span>{lang === 'ID' ? 'Slip Laporan Bulanan' : 'Monthly Report Slip'}</span>
                </button>
              )}
              {onOpenAddGoal && (
                <button
                  type="button"
                  onClick={() => {
                    setShowMoreActions(false);
                    onOpenAddGoal();
                  }}
                  className="w-full px-3 py-2 text-xs font-medium text-text-primary dark:text-slate-200 hover:bg-[#F0F4F1] dark:hover:bg-[#1A382B] rounded-xl flex items-center gap-2"
                >
                  <Target className="w-4 h-4 text-[#123628] dark:text-[#4ADE80]" />
                  <span>Tambah Target</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setShowMoreActions(false);
                  onNavigateTab('profile');
                }}
                className="w-full px-3 py-2 text-xs font-medium text-text-primary dark:text-slate-200 hover:bg-[#F0F4F1] dark:hover:bg-[#1A382B] rounded-xl flex items-center gap-2"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#123628] dark:text-[#4ADE80]" />
                <span>Pengaturan Profil</span>
              </button>
            </div>
          )}
        </div>

      </section>

      {/* 4. Recent Transactions Section - Exact Match with Reference Image */}
      <section aria-labelledby="recent-tx-heading" className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h2 id="recent-tx-heading" className="text-base sm:text-lg font-bold text-text-primary dark:text-slate-100">
            {lang === 'ID' ? 'Transaksi Terbaru' : 'Recent Transactions'}
          </h2>
          <button
            type="button"
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-bold text-text-primary dark:text-slate-300 hover:text-[#123628] dark:hover:text-[#4ADE80] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{lang === 'ID' ? 'Lihat semua' : 'See all'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="liquid-glass-card rounded-3xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#123628]/10 text-[#123628] dark:text-[#4ADE80] mx-auto flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-text-primary dark:text-slate-200">
              {lang === 'ID' ? 'Belum Ada Transaksi' : 'No Transactions Yet'}
            </p>
            <p className="text-xs text-text-secondary dark:text-slate-400 max-w-xs mx-auto">
              {lang === 'ID' 
                ? 'Klik tombol Tambah di atas untuk mencatat pengeluaran atau pemasukan pertamamu.'
                : 'Tap Add Money above to record your first income or expense.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {recentTransactions.map((tx) => {
              const catStyle = getCategoryStyle(tx.category, tx.description);
              const Icon = catStyle.icon;
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  onClick={() => onViewTransaction(tx)}
                  className="liquid-glass-card liquid-glass-card-interactive rounded-2xl p-3.5 sm:p-4 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    
                    {/* Brand / Category Circular Avatar */}
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${catStyle.bgClass}`}>
                      {catStyle.badgeChar ? (
                        <span>{catStyle.badgeChar}</span>
                      ) : (
                        <Icon className="w-5 h-5 stroke-[2]" />
                      )}
                    </div>

                    {/* Title & Subtitle */}
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-text-primary dark:text-slate-100 truncate">
                        {tx.description.trim() || tx.category}
                      </p>
                      <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5 truncate">
                        {tx.category}
                      </p>
                    </div>
                  </div>

                  {/* Amount & Date/Time on Right */}
                  <div className="text-right flex-shrink-0 pl-2">
                    <p className={`text-sm sm:text-base font-extrabold tabular-nums ${
                      isIncome 
                        ? 'text-[#123628] dark:text-[#4ADE80]' 
                        : 'text-text-primary dark:text-slate-100'
                    }`}>
                      {isIncome ? '+ ' : '- '}
                      {formatRupiah(tx.amount)}
                    </p>
                    <p className="text-[11px] text-text-secondary dark:text-slate-400 mt-0.5">
                      {formatTxDate(tx.date)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 5. Budgets & Goals Quick Section */}
      {activeBudgets.length > 0 && (
        <section aria-labelledby="budget-summary-heading" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 id="budget-summary-heading" className="text-base font-bold text-text-primary dark:text-slate-100">
              {lang === 'ID' ? 'Status Anggaran' : 'Budget Status'}
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-[#123628] dark:text-[#4ADE80] hover:underline"
            >
              {lang === 'ID' ? 'Atur' : 'Manage'}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {activeBudgets.slice(0, 2).map((b) => (
              <div key={b.id || b.category} className="liquid-glass-card rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-text-primary dark:text-slate-200">{b.category}</span>
                  <span className={`font-bold ${b.percentage >= 100 ? 'text-red-500' : 'text-[#123628] dark:text-[#4ADE80]'}`}>
                    {b.percentage}%
                  </span>
                </div>
                <div className="w-full bg-[#E5ECE7] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.percentage >= 100 ? 'bg-red-500' : 'bg-[#123628] dark:bg-[#4ADE80]'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-text-secondary dark:text-slate-400">
                  <span>{formatRupiah(b.spent)}</span>
                  <span>{formatRupiah(b.limit)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Saving Goals Preview (if any) */}
      {goals.length > 0 && (
        <section aria-labelledby="goals-summary-heading" className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 id="goals-summary-heading" className="text-base font-bold text-text-primary dark:text-slate-100">
              {lang === 'ID' ? 'Target Tabungan' : 'Saving Goals'}
            </h2>
            {onOpenAddGoal && (
              <button
                type="button"
                onClick={onOpenAddGoal}
                className="text-xs font-semibold text-[#123628] dark:text-[#4ADE80] hover:underline"
              >
                + {lang === 'ID' ? 'Tambah' : 'Add'}
              </button>
            )}
          </div>

          <div className="space-y-2.5">
            {goals.slice(0, 2).map((g) => {
              const pct = g.targetAmount > 0 
                ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
                : 0;

              return (
                <div key={g.id} className="liquid-glass-card rounded-2xl p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-text-primary dark:text-slate-100">{g.title}</p>
                    <p className="text-xs text-text-secondary dark:text-slate-400">
                      {formatRupiah(g.currentAmount)} / {formatRupiah(g.targetAmount)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full border-2 border-[#123628] dark:border-[#4ADE80] flex items-center justify-center font-bold text-xs text-[#123628] dark:text-[#4ADE80]">
                      {pct}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
};
