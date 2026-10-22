import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  ArrowRightLeft, 
  Calendar,
  Sparkles,
  HelpCircle,
  Plus,
  Trash2,
  Scale,
  Percent,
  CheckCircle2,
  AlertTriangle,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';
import { Transaction, Budget } from '../types';
import { formatRupiah, getCategoryStyle } from '../utils/helpers';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { APP_TRANSLATIONS } from '../utils/lang';

interface AnalyticsProps {
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[];
  onSaveBudget: (category: string, limit: number) => void;
  onDeleteBudget: (id: string) => void;
  lang?: 'ID' | 'EN';
}

export const Analytics: React.FC<AnalyticsProps> = ({
  transactions,
  budgets,
  categories,
  onSaveBudget,
  onDeleteBudget,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].analytics;
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'budgets'>('trends');
  
  // State for setting budgets
  const [budgetCategory, setBudgetCategory] = useState(categories[0] || 'Lainnya');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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

  // Filter categories for expenses vs income for budget form
  const expenseCategoriesOnly = useMemo(() => {
    // Only allow setting budgets on categories that are primarily expenses
    // Exclude Gaji, Investasi, Sampingan if possible, but keep it open
    return categories.filter(c => !['Gaji', 'Investasi', 'Sampingan'].includes(c));
  }, [categories]);

  // Handle setting a budget
  const handleSetBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(budgetLimit);
    if (!budgetCategory || isNaN(limit) || limit <= 0) return;
    onSaveBudget(budgetCategory, limit);
    setBudgetLimit('');
    setShowAddBudget(false);
  };

  // --- ANALYSIS ENGINE ---
  // Realtime current month prefix ("YYYY-MM")
  const currentMonthPrefix = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthPrefix);

  const isCurrentMonth = selectedMonth === currentMonthPrefix;

  // Compute all available months from transactions history + current month
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthPrefix);
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        set.add(tx.date.substring(0, 7));
      }
    });
    if (!set.has(selectedMonth)) {
      set.add(selectedMonth);
    }
    return Array.from(set).sort().reverse();
  }, [transactions, currentMonthPrefix, selectedMonth]);

  // Format month and year label (e.g. "Oktober 2026")
  const formatMonthLabel = (ym: string) => {
    try {
      const [yStr, mStr] = ym.split('-');
      const year = parseInt(yStr, 10);
      const monthIndex = parseInt(mStr, 10) - 1;
      const monthsID = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const monthsEN = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const name = lang === 'ID' ? monthsID[monthIndex] : monthsEN[monthIndex];
      return `${name} ${year}`;
    } catch {
      return ym;
    }
  };

  const [selectedYear, selectedMonthNumber] = useMemo(() => {
    const [y, m] = selectedMonth.split('-').map(Number);
    return [y, m];
  }, [selectedMonth]);

  const daysInSelectedMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonthNumber, 0).getDate();
  }, [selectedYear, selectedMonthNumber]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    const d = new Date(selectedYear, selectedMonthNumber - 1 - 1, 1);
    const newY = d.getFullYear();
    const newM = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleNextMonth = () => {
    const d = new Date(selectedYear, selectedMonthNumber - 1 + 1, 1);
    const newY = d.getFullYear();
    const newM = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newY}-${newM}`);
  };

  const handleResetMonth = () => {
    setSelectedMonth(currentMonthPrefix);
  };

  const stats = useMemo(() => {
    let inc = 0;
    let exp = 0;
    
    // Monthly statistics for selected period
    let monthInc = 0;
    let monthExp = 0;

    // Daily average calculation (for selected month)
    const dailySpendMap: Record<string, number> = {};
    const categorySpendMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      const isInSelectedMonth = tx.date.startsWith(selectedMonth);
      if (tx.type === 'income') {
        inc += tx.amount;
        if (isInSelectedMonth) monthInc += tx.amount;
      } else {
        exp += tx.amount;
        if (isInSelectedMonth) {
          monthExp += tx.amount;
          dailySpendMap[tx.date] = (dailySpendMap[tx.date] || 0) + tx.amount;
          categorySpendMap[tx.category] = (categorySpendMap[tx.category] || 0) + tx.amount;
        }
      }
    });

    // In current month, divide by days elapsed so far; in past month, divide by total days in that month
    const daysPassed = isCurrentMonth ? Math.max(1, new Date().getDate()) : Math.max(1, daysInSelectedMonth);
    const averageDailySpending = monthExp / daysPassed;

    const savingRate = monthInc > 0 ? Math.max(0, Math.round(((monthInc - monthExp) / monthInc) * 100)) : 0;

    // Largest category
    let largestCategory = 'Lainnya';
    let largestAmount = 0;
    Object.keys(categorySpendMap).forEach((cat) => {
      if (categorySpendMap[cat] > largestAmount) {
        largestAmount = categorySpendMap[cat];
        largestCategory = cat;
      }
    });

    return {
      totalIncome: inc,
      totalExpense: exp,
      monthIncome: monthInc,
      monthExpense: monthExp,
      savingRate,
      averageDailySpending,
      largestCategory,
      largestAmount,
      categorySpendMap
    };
  }, [transactions, selectedMonth, isCurrentMonth, daysInSelectedMonth]);

  // Compute category budget maps for selected month
  const activeBudgets = useMemo(() => {
    return budgets.map((b) => {
      const spent = stats.categorySpendMap[b.category] || 0;
      const percentage = b.limit > 0 ? Math.min(100, Math.round((spent / b.limit) * 100)) : 0;
      return {
        ...b,
        spent,
        percentage,
        remaining: Math.max(0, b.limit - spent),
      };
    });
  }, [budgets, stats.categorySpendMap]);

  // Dynamic financial health and ratio calculation
  const financialHealth = useMemo(() => {
    const rate = stats.savingRate;
    let label = 'Cukup Sehat';
    let enLabel = 'Good / Healthy';
    let score = 75;
    let colorClass = 'text-blue-500 dark:text-blue-400';
    let bgClass = 'bg-blue-500/10 dark:bg-blue-500/20';
    let advice = 'Keuangan Anda dalam kondisi sehat. Anda berhasil menyisihkan sebagian dana.';
    let enAdvice = 'Your finances are healthy. You successfully set aside some funds.';

    if (rate >= 45) {
      label = 'Sangat Sehat';
      enLabel = 'Excellent';
      score = 95;
      colorClass = 'text-emerald-500 dark:text-emerald-400';
      bgClass = 'bg-emerald-500/10 dark:bg-emerald-500/20';
      advice = 'Laju menabung Anda sangat prima. Pertahankan gaya hidup hemat ini!';
      enAdvice = 'Your saving rate is stellar. Maintain this high savings habit!';
    } else if (rate >= 20 && rate < 45) {
      label = 'Sehat';
      enLabel = 'Healthy';
      score = 80;
      colorClass = 'text-primary dark:text-secondary';
      bgClass = 'bg-emerald-500/10 dark:bg-emerald-500/20';
      advice = 'Keuangan Anda dalam kondisi sehat. Terus tingkatkan porsi tabungan Anda.';
      enAdvice = 'Your finances are in a healthy state. Keep increasing your savings share.';
    } else if (rate > 0 && rate < 20) {
      label = 'Perlu Perhatian';
      enLabel = 'Caution';
      score = 55;
      colorClass = 'text-amber-500 dark:text-amber-400';
      bgClass = 'bg-amber-500/10 dark:bg-amber-500/20';
      advice = 'Tabungan Anda tipis di periode ini. Coba batasi pengeluaran non-prioritas.';
      enAdvice = 'Your savings were thin in this period. Try limiting non-essential expenses.';
    } else if (rate <= 0) {
      label = 'Defisit Pengeluaran';
      enLabel = 'Critical / Deficit';
      score = 30;
      colorClass = 'text-rose-500 dark:text-rose-400';
      bgClass = 'bg-rose-500/10 dark:bg-rose-500/20';
      advice = 'Pengeluaran melampaui pendapatan di periode ini. Evaluasi pos pengeluaran Anda!';
      enAdvice = 'Spending exceeded income in this period. Evaluate your expenditure breakdown!';
    }

    return { label, enLabel, score, colorClass, bgClass, advice, enAdvice };
  }, [stats.savingRate]);

  const ratioAllocation = useMemo(() => {
    let needsSpent = 0;
    let wantsSpent = 0;
    transactions.forEach(tx => {
      if (tx.type === 'expense' && tx.date.startsWith(selectedMonth)) {
        const cat = tx.category.toLowerCase();
        if (
          cat.includes('makan') || cat.includes('food') || 
          cat.includes('trans') || cat.includes('mobil') || cat.includes('motor') ||
          cat.includes('tagihan') || cat.includes('listrik') || cat.includes('pulsa') || cat.includes('air') || cat.includes('internet') ||
          cat.includes('sehat') || cat.includes('obat') || cat.includes('dokter') ||
          cat.includes('didik') || cat.includes('sekolah')
        ) {
          needsSpent += tx.amount;
        } else {
          wantsSpent += tx.amount;
        }
      }
    });

    const totalExpense = needsSpent + wantsSpent || 1;
    const needsPercent = Math.round((needsSpent / totalExpense) * 100);
    const wantsPercent = Math.round((wantsSpent / totalExpense) * 100);

    return {
      needsSpent,
      wantsSpent,
      needsPercent,
      wantsPercent
    };
  }, [transactions, selectedMonth]);

  // Chart Data: Monthly Cashflow (Rolling 6 Months ending at selectedMonth)
  const monthlyChartData = useMemo(() => {
    const months = lang === 'ID' 
      ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
      : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const map: Record<string, { income: number; expense: number; monthName: string }> = {};

    // Get 6 months boundaries ending at selectedMonth
    const last6MonthsKeys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selectedYear, selectedMonthNumber - 1 - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const monthIndex = d.getMonth();
      const year = d.getFullYear().toString().substring(2);
      last6MonthsKeys.push(key);
      map[key] = {
        income: 0,
        expense: 0,
        monthName: `${months[monthIndex]} '${year}`
      };
    }

    transactions.forEach((tx) => {
      const key = tx.date.substring(0, 7);
      if (map[key]) {
        if (tx.type === 'income') {
          map[key].income += tx.amount;
        } else {
          map[key].expense += tx.amount;
        }
      }
    });

    return last6MonthsKeys.map(k => ({
      name: map[k].monthName,
      [lang === 'ID' ? 'Pemasukan' : 'Income']: map[k].income,
      [lang === 'ID' ? 'Pengeluaran' : 'Expense']: map[k].expense,
      Cashflow: map[k].income - map[k].expense
    }));
  }, [transactions, lang, selectedYear, selectedMonthNumber]);

  // Chart Data: Category Breakdown Pie Chart
  const categoryChartData = useMemo(() => {
    const COLORS = ['#1B8A5A', '#3AA772', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6'];
    const list = Object.keys(stats.categorySpendMap).map((cat, i) => ({
      name: getLocalizedCategoryName(cat),
      value: stats.categorySpendMap[cat],
      color: COLORS[i % COLORS.length]
    }));
    list.sort((a, b) => b.value - a.value);
    return list;
  }, [stats.categorySpendMap, lang]);

  // --- DYNAMIC AI INSIGHTS ENGINE ---
  const automatedInsights = useMemo(() => {
    const list: string[] = [];
    const periodLabel = isCurrentMonth 
      ? (lang === 'ID' ? 'bulan ini' : 'this month')
      : (lang === 'ID' ? `pada ${formatMonthLabel(selectedMonth)}` : `in ${formatMonthLabel(selectedMonth)}`);

    if (lang === 'EN') {
      // Rule 1: Saving Rate Assessment
      if (stats.savingRate >= 40) {
        list.push(`Your saving rate ${periodLabel} is excellent (${stats.savingRate}%). You secured a major part of your income.`);
      } else if (stats.savingRate > 15) {
        list.push(`Your savings rate ${periodLabel} was steady at ${stats.savingRate}%.`);
      } else if (stats.monthIncome > 0 && stats.savingRate <= 10) {
        list.push(`Your saving rate ${periodLabel} was below target (${stats.savingRate}%). Non-essential spending was high.`);
      }

      // Rule 2: Budget Warnings
      const overBudgets = activeBudgets.filter(b => b.spent > b.limit);
      const nearOverBudgets = activeBudgets.filter(b => b.spent >= b.limit * 0.8 && b.spent <= b.limit);

      if (overBudgets.length > 0) {
        const names = overBudgets.map(b => getLocalizedCategoryName(b.category)).join(', ');
        list.push(`Budget limit exceeded! Category [${names}] exceeded designated limit.`);
      }
      if (nearOverBudgets.length > 0) {
        const names = nearOverBudgets.map(b => getLocalizedCategoryName(b.category)).join(', ');
        list.push(`Warning: Expenses for [${names}] reached 80% or more of your budget limit.`);
      }

      // Rule 3: Largest category spending
      if (stats.largestAmount > 0) {
        list.push(`Your largest spending category ${periodLabel} was [${getLocalizedCategoryName(stats.largestCategory)}] totaling ${formatRupiah(stats.largestAmount)}.`);
      }

      if (list.length === 0) {
        list.push(stats.monthIncome === 0 && stats.monthExpense === 0 
          ? "No transactions recorded for this period." 
          : "Start recording transactions to see smart financial insights.");
      }
    } else {
      // Rule 1: Saving Rate Assessment
      if (stats.savingRate >= 40) {
        list.push(`Laju Menabung Anda ${periodLabel} sangat prima (${stats.savingRate}%). Anda berhasil mengamankan porsi besar pendapatan.`);
      } else if (stats.savingRate > 15) {
        list.push(`Tingkat tabungan Anda ${periodLabel} stabil di angka ${stats.savingRate}%.`);
      } else if (stats.monthIncome > 0 && stats.savingRate <= 10) {
        list.push(`Saving rate Anda ${periodLabel} di bawah target ideal (${stats.savingRate}%). Pengeluaran non-prioritas cukup dominan.`);
      }

      // Rule 2: Budget Warnings
      const overBudgets = activeBudgets.filter(b => b.spent > b.limit);
      const nearOverBudgets = activeBudgets.filter(b => b.spent >= b.limit * 0.8 && b.spent <= b.limit);

      if (overBudgets.length > 0) {
        const names = overBudgets.map(b => b.category).join(', ');
        list.push(`Anggaran jebol! Kategori [${names}] melampaui limit batas yang Anda tentukan.`);
      }
      if (nearOverBudgets.length > 0) {
        const names = nearOverBudgets.map(b => b.category).join(', ');
        list.push(`Waspada: Pengeluaran [${names}] mendekati atau melewati 80% dari batas anggaran.`);
      }

      // Rule 3: Largest category spending
      if (stats.largestAmount > 0) {
        list.push(`Kategori pengeluaran terbesar Anda ${periodLabel} adalah [${stats.largestCategory}] sebesar ${formatRupiah(stats.largestAmount)}.`);
      }

      if (list.length === 0) {
        list.push(stats.monthIncome === 0 && stats.monthExpense === 0 
          ? "Belum ada catatan transaksi pada periode bulan ini." 
          : "Mulailah mencatat transaksi untuk memunculkan analisis keuangan pintar.");
      }
    }

    return list;
  }, [stats, activeBudgets, lang, isCurrentMonth, selectedMonth]);

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      
      {/* Upper Segmented Controller */}
      <div className="liquid-glass-card p-1.5 rounded-2xl flex gap-1.5">
        <button
          onClick={() => setActiveSubTab('trends')}
          className={`flex-1 py-2.5 sm:py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'trends'
              ? 'liquid-pill-active'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 stroke-[2.2]" />
          {t.trendsTab}
        </button>
        <button
          onClick={() => setActiveSubTab('budgets')}
          className={`flex-1 py-2.5 sm:py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'budgets'
              ? 'liquid-pill-active'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 stroke-[2.2]" />
          {t.budgetsTab}
        </button>
      </div>

      {/* Month Filter Selector Bar */}
      <div className="liquid-glass-card p-2 sm:p-2.5 rounded-2xl flex items-center justify-between gap-2">
        {/* Prev Month Button */}
        <button
          type="button"
          onClick={handlePrevMonth}
          aria-label={t.prevMonthBtn}
          title={t.prevMonthBtn}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 border border-black/5 dark:border-white/5 text-text-secondary hover:text-text-primary dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-600 transition-all flex items-center gap-1 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline text-xs font-semibold">{t.prevMonthBtn}</span>
        </button>

        {/* Center: Month Display & Quick Dropdown Picker */}
        <div className="flex items-center gap-2">
          <div className="relative flex items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/80 border border-black/5 dark:border-white/10 hover:border-primary/50 transition-colors">
              <Calendar className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-text-primary dark:text-slate-100">
                {formatMonthLabel(selectedMonth)}
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isCurrentMonth 
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25' 
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25'
              }`}>
                {isCurrentMonth ? t.currentMonthLabel : t.historicalLabel}
              </span>
              
              {/* Overlay select for direct 1-click jump to any month */}
              <select
                aria-label={t.periodTitle}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              >
                {availableMonths.map((ym) => (
                  <option key={ym} value={ym} className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-100">
                    {formatMonthLabel(ym)} {ym === currentMonthPrefix ? `(${t.currentMonthLabel})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick reset to current month button if historical month is selected */}
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={handleResetMonth}
              title={t.resetToCurrentMonth}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-primary/10 text-primary dark:text-emerald-400 hover:bg-primary/20 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-primary/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{t.resetToCurrentMonth}</span>
            </button>
          )}
        </div>

        {/* Next Month Button */}
        <button
          type="button"
          onClick={handleNextMonth}
          aria-label={t.nextMonthBtn}
          title={t.nextMonthBtn}
          className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 border border-black/5 dark:border-white/5 text-text-secondary hover:text-text-primary dark:hover:text-slate-100 hover:bg-slate-200/60 dark:hover:bg-slate-600 transition-all flex items-center gap-1 cursor-pointer"
        >
          <span className="hidden sm:inline text-xs font-semibold">{t.nextMonthBtn}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* --- TRENDS ANALYTICS VIEW --- */}
      {activeSubTab === 'trends' && (
        <div className="space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Saving Rate Card */}
            <div className="liquid-glass-card p-4.5 rounded-[22px] flex items-center justify-between">
              <div className="space-y-1.5 flex-1">
                <span className="text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                  {t.savingRate}
                </span>
                <h4 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  {stats.savingRate}%
                </h4>
                <div className="w-24 h-1.5 bg-slate-200/80 dark:bg-slate-700/70 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.savingRate}%` }} 
                  />
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 ml-3">
                <TrendingUp className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
            </div>

            {/* This Month Expense Card */}
            <div className="liquid-glass-card p-4.5 rounded-[22px] flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider">
                  {isCurrentMonth ? (lang === 'ID' ? 'PENGELUARAN BULAN INI' : 'MONTH EXPENSES') : t.monthExpensesTitle}
                </span>
                <h4 className="text-lg font-bold text-rose-500 dark:text-rose-400 line-clamp-1">
                  {formatRupiah(stats.monthExpense)}
                </h4>
                <p className="text-[9px] text-text-secondary dark:text-slate-400 font-semibold uppercase">
                  {isCurrentMonth ? (lang === 'ID' ? 'Total bulan ini' : 'Total this month') : formatMonthLabel(selectedMonth)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/20 flex items-center justify-center flex-shrink-0 ml-3">
                <TrendingDown className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
            </div>

            {/* Average Daily Spending */}
            <div className="liquid-glass-card p-4.5 rounded-[22px] flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-text-secondary dark:text-slate-400 tracking-wider uppercase">
                  {t.avgDaily}
                </span>
                <h4 className="text-lg font-bold text-amber-600 dark:text-amber-400 line-clamp-1">
                  {formatRupiah(stats.averageDailySpending)}
                </h4>
                <p className="text-[9px] text-text-secondary dark:text-slate-400 font-semibold uppercase">
                  {isCurrentMonth ? t.avgDailySubtitle : (lang === 'ID' ? `Rerata per hari (${daysInSelectedMonth} hari)` : `Daily avg (${daysInSelectedMonth} days)`)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center flex-shrink-0 ml-3">
                <Calendar className="w-5.5 h-5.5 stroke-[2.2]" />
              </div>
            </div>

          </div>

          {/* Dynamic Scorecard and Ratio Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Financial Health Scorecard Card */}
            <div className="liquid-glass-card p-5 rounded-[24px] flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-5 h-5 ${financialHealth.colorClass}`} />
                  <h4 className="text-xs font-bold text-text-primary dark:text-slate-100 uppercase tracking-wider">
                    {lang === 'ID' ? 'Kesehatan Finansial' : 'Financial Health'}
                  </h4>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border border-black/5 dark:border-white/10 ${financialHealth.bgClass} ${financialHealth.colorClass}`}>
                  Score: {financialHealth.score}/100
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-base font-bold text-text-primary dark:text-slate-100 flex items-baseline gap-1.5">
                  <span>{lang === 'ID' ? financialHealth.label : financialHealth.enLabel}</span>
                </div>
                <p className="text-[11px] text-text-secondary dark:text-slate-400 leading-relaxed font-medium">
                  {lang === 'ID' ? financialHealth.advice : financialHealth.enAdvice}
                </p>
              </div>

              <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700/70 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    financialHealth.score >= 80 
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                      : financialHealth.score >= 50 
                        ? 'bg-gradient-to-r from-amber-500 to-orange-400' 
                        : 'bg-gradient-to-r from-rose-500 to-red-600'
                  }`}
                  style={{ width: `${financialHealth.score}%` }}
                />
              </div>
            </div>

            {/* Needs vs Wants allocation (50/30/20 Rule) */}
            <div className="liquid-glass-card p-5 rounded-[24px] flex flex-col justify-between space-y-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-primary" />
                <h4 className="text-xs font-bold text-text-primary dark:text-slate-100 uppercase tracking-wider">
                  {lang === 'ID' ? 'Rasio Alokasi Pengeluaran' : 'Expense Allocation Ratio'}
                </h4>
              </div>

              <div className="space-y-2">
                {/* Needs row */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-text-primary dark:text-slate-200">
                      {lang === 'ID' ? 'Kebutuhan (Needs - Ideal Max 50%)' : 'Needs (Ideal Max 50%)'}
                    </span>
                    <span className="text-blue-500">{ratioAllocation.needsPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700/70 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: `${ratioAllocation.needsPercent}%` }} 
                    />
                  </div>
                </div>

                {/* Wants row */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold">
                    <span className="text-text-primary dark:text-slate-200">
                      {lang === 'ID' ? 'Keinginan (Wants - Ideal Max 30%)' : 'Wants (Ideal Max 30%)'}
                    </span>
                    <span className="text-amber-500">{ratioAllocation.wantsPercent}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200/80 dark:bg-slate-700/70 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                    <div 
                      className="h-full bg-amber-500 rounded-full" 
                      style={{ width: `${ratioAllocation.wantsPercent}%` }} 
                    />
                  </div>
                </div>
              </div>

              <p className="text-[10px] text-text-secondary dark:text-slate-400 italic font-medium">
                {lang === 'ID' 
                  ? '* Analisis berbasis aturan 50-30-20 untuk membantu pengelolaan keuangan mandiri.'
                  : '* Analysis based on 50-30-20 rule to help autonomous financial management.'}
              </p>
            </div>

          </div>

          {/* Desktop and Tablet Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Visual Charts (Takes 7/12 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Income vs Expense Graph Card */}
              <div className="liquid-glass-card p-5 sm:p-6 rounded-[28px] space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-text-primary dark:text-slate-100">
                    {t.cashflowTitle}
                  </h4>
                  <p className="text-[10px] text-text-secondary">
                    {t.cashflowSubtitle} • {lang === 'ID' ? `6 bulan hingga ${formatMonthLabel(selectedMonth)}` : `6 months up to ${formatMonthLabel(selectedMonth)}`}
                  </p>
                </div>

                {transactions.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-text-secondary">
                    {t.noData}
                  </div>
                ) : (
                  <div className="h-56 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <Tooltip 
                          formatter={(value: any) => [formatRupiah(Number(value)), '']}
                          contentStyle={{ background: '#0F172A', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '11px', boxShadow: '0 8px 24px rgba(0,0,0,0.3)' }}
                        />
                        <Bar dataKey={lang === 'ID' ? 'Pemasukan' : 'Income'} fill="#1B8A5A" radius={[6, 6, 0, 0]} />
                        <Bar dataKey={lang === 'ID' ? 'Pengeluaran' : 'Expense'} fill="#EF4444" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Category Breakdown (Pie-Chart & List) */}
              <div className="liquid-glass-card p-5 sm:p-6 rounded-[28px] space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-text-primary dark:text-slate-100">
                    {t.proportionTitle}
                  </h4>
                  <p className="text-[10px] text-text-secondary">
                    {t.proportionSubtitle} • {formatMonthLabel(selectedMonth)}
                  </p>
                </div>

                {categoryChartData.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-text-secondary">
                    {t.noExpense}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-4 items-center">
                      
                      {/* Mini Pie chart */}
                      <div className="col-span-2 h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Tooltip
                              formatter={(value: any, name: any) => [formatRupiah(Number(value)), getLocalizedCategoryName(String(name))]}
                              contentStyle={{
                                background: '#0F172A',
                                borderRadius: '12px',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: '#fff',
                                fontSize: '11px',
                                padding: '6px 10px',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                              }}
                              itemStyle={{ color: '#fff', fontWeight: 600 }}
                            />
                            <Pie
                              data={categoryChartData}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={45}
                              paddingAngle={3}
                              dataKey="value"
                              nameKey="name"
                              onMouseEnter={(_, index) => setActiveCategory(categoryChartData[index]?.name)}
                              onMouseLeave={() => setActiveCategory(null)}
                              onClick={(_, index) => {
                                const catName = categoryChartData[index]?.name;
                                setActiveCategory(activeCategory === catName ? null : catName);
                              }}
                            >
                              {categoryChartData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color}
                                  stroke={activeCategory === entry.name ? '#ffffff' : 'none'}
                                  strokeWidth={activeCategory === entry.name ? 2 : 0}
                                  opacity={activeCategory && activeCategory !== entry.name ? 0.45 : 1}
                                  className="transition-all duration-200 cursor-pointer"
                                />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Progress rows of categories */}
                      <div className="col-span-3 space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
                        {categoryChartData.slice(0, 4).map((item) => {
                          const totalVal = categoryChartData.reduce((acc, curr) => acc + curr.value, 0);
                          const percent = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;
                          const isSelected = activeCategory === item.name;

                          return (
                            <div 
                              key={item.name} 
                              onClick={() => setActiveCategory(isSelected ? null : item.name)}
                              onMouseEnter={() => setActiveCategory(item.name)}
                              onMouseLeave={() => setActiveCategory(null)}
                              className={`group space-y-1 p-1.5 -mx-1.5 rounded-xl transition-all duration-200 cursor-pointer ${
                                isSelected 
                                  ? 'bg-primary/15 dark:bg-primary/25 ring-1 ring-primary/40' 
                                  : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/40'
                              }`}
                              title={`${getLocalizedCategoryName(item.name)}: ${formatRupiah(item.value)} (${percent}%)`}
                            >
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-text-primary dark:text-slate-200 line-clamp-1 flex items-center gap-1.5">
                                  <span 
                                    className="w-2 h-2 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: item.color }} 
                                  />
                                  {getLocalizedCategoryName(item.name)}
                                </span>
                                
                                <div className="flex items-center gap-1.5 font-semibold text-right flex-shrink-0">
                                  {/* Reveal Rupiah nominal on hover or tap */}
                                  <span className={`text-[10px] font-bold text-primary dark:text-emerald-400 transition-all duration-200 ${
                                    isSelected ? 'inline-block' : 'hidden group-hover:inline-block'
                                  }`}>
                                    {formatRupiah(item.value)}
                                  </span>
                                  
                                  <span className={`transition-colors duration-200 ${
                                    isSelected ? 'font-bold text-primary dark:text-emerald-400' : 'text-text-secondary dark:text-slate-400 font-semibold'
                                  }`}>
                                    {percent}%
                                  </span>
                                </div>
                              </div>

                              <div className="w-full h-1 bg-slate-200/80 dark:bg-slate-700/70 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                                <div 
                                  className={`h-full rounded-full transition-all duration-300 ${isSelected ? 'brightness-110 h-1.5' : ''}`} 
                                  style={{ width: `${percent}%`, backgroundColor: item.color }} 
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                    </div>

                    <p className="text-[9px] text-text-secondary/70 italic text-right">
                      {lang === 'ID' 
                        ? '* Sorot / ketuk kategori untuk melihat nominal Rupiah' 
                        : '* Hover / tap category to view Rupiah amount'}
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Right Column: AI Insights & Quick Stats (Takes 5/12 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* AI Automated Smart Insights */}
              <div className="liquid-glass-card p-5 rounded-[28px] border border-primary/25 space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-primary dark:text-emerald-400" />
                  <h4 className="text-sm font-bold text-primary dark:text-emerald-400">
                    {t.smartInsights}
                  </h4>
                </div>

                <div className="space-y-2">
                  {automatedInsights.map((insight, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs leading-relaxed text-text-primary dark:text-slate-200 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary dark:bg-emerald-400 mt-1.5 flex-shrink-0" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* --- BUDGET MANAGER VIEW --- */}
      {activeSubTab === 'budgets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: List of Categories with limits (Takes 7/12 cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-text-primary dark:text-slate-100">
                  {t.categoryBudgets}
                </h4>
                <p className="text-[10px] text-text-secondary">
                  {t.categoryBudgetsSubtitle} • {formatMonthLabel(selectedMonth)}
                </p>
              </div>
              
              <button
                onClick={() => setShowAddBudget(!showAddBudget)}
                className="lg:hidden px-4 py-2 liquid-pill-active rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                {showAddBudget ? t.closeBtn : t.setLimitBtn}
              </button>
            </div>

            {/* Budget List Grid */}
            {activeBudgets.length === 0 ? (
              <div className="liquid-glass-card p-10 rounded-[28px] border border-dashed border-slate-300 dark:border-slate-700/80 text-center flex flex-col items-center gap-2">
                <Scale className="w-10 h-10 text-text-secondary/60 mb-1" />
                <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
                  {t.noBudgetTitle}
                </p>
                <p className="text-[10px] text-text-secondary/50 max-w-xs">
                  {t.noBudgetDesc}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {activeBudgets.map((b) => {
                  const style = getCategoryStyle(b.category);
                  const isOver = b.spent > b.limit;
                  const isNear = b.spent >= b.limit * 0.8 && !isOver;

                  return (
                    <div 
                      key={b.id}
                      className="liquid-glass-card p-4 rounded-2xl relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8.5 h-8.5 rounded-lg ${style.bgClass} ${style.textClass} flex items-center justify-center flex-shrink-0 shadow-xs border border-white/40 dark:border-white/5`}>
                            <style.icon className="w-5 h-5 stroke-[2.2]" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-text-primary dark:text-slate-100">
                              {getLocalizedCategoryName(b.category)}
                            </h5>
                            <p className="text-[9px] text-text-secondary">
                              Limit: {formatRupiah(b.limit)}
                            </p>
                          </div>
                        </div>

                        {/* Delete limit button */}
                        <button
                          onClick={() => onDeleteBudget(b.id)}
                          className="p-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-700/60 hover:bg-rose-500/10 text-text-secondary hover:text-rose-500 transition-all cursor-pointer border border-black/5 dark:border-white/5"
                          title={lang === 'ID' ? 'Hapus Anggaran' : 'Delete Budget'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Progress tracking information */}
                      <div className="space-y-1">
                        <div className="w-full h-2 bg-slate-200/80 dark:bg-slate-700/70 rounded-full overflow-hidden border border-black/5 dark:border-white/5">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOver 
                                ? 'bg-gradient-to-r from-rose-500 to-red-600' 
                                : isNear 
                                  ? 'bg-gradient-to-r from-amber-500 to-orange-400' 
                                  : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`}
                            style={{ width: `${b.percentage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-text-secondary uppercase">
                            {lang === 'ID' 
                              ? `${b.percentage}% Terpakai (${formatRupiah(b.spent)})` 
                              : `${b.percentage}% Used (${formatRupiah(b.spent)})`}
                          </span>
                          
                          {isOver ? (
                            <span className="text-rose-500 flex items-center gap-1 uppercase font-bold">
                              <AlertTriangle className="w-3 h-3" />
                              {lang === 'ID' ? 'Over' : 'Over'} Rp {formatRupiah(b.spent - b.limit)}!
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 uppercase font-bold">
                              {lang === 'ID' ? 'Sisa' : 'Remaining'} Rp {formatRupiah(b.remaining)}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Always Visible budget configuration form on desktop, or collapsible on mobile (Takes 5/12 cols) */}
          <div className={`lg:col-span-5 space-y-4 ${showAddBudget ? 'block' : 'hidden lg:block'}`}>
            <form onSubmit={handleSetBudgetSubmit} className="liquid-glass-card p-5 rounded-2xl border border-primary/25 space-y-4 animate-slide-up">
              <h5 className="text-xs font-bold text-text-primary dark:text-slate-100 uppercase tracking-wider">
                {t.setBudgetFormTitle}
              </h5>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">
                    {t.selectCategory}
                  </label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full bg-slate-100/70 dark:bg-slate-800/80 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-black/5 dark:border-white/10 focus:border-primary text-text-primary dark:text-slate-100 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '12px'
                    }}
                  >
                    {expenseCategoriesOnly.map(c => (
                      <option key={c} value={c}>{getLocalizedCategoryName(c)}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">
                    {t.monthlyLimit}
                  </label>
                  <input
                    type="number"
                    required
                    placeholder={t.exampleLimit}
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="w-full bg-slate-100/70 dark:bg-slate-800/80 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-black/5 dark:border-white/10 focus:border-primary text-text-primary dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!budgetLimit}
                className="w-full liquid-pill-active py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                {t.saveBudgetBtn}
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
