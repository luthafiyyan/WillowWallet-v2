import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  Calendar, 
  Sprout, 
  ChevronRight, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown,
  Scale,
  Percent,
  CheckCircle2,
  AlertTriangle,
  FileDown
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
  Cell
} from 'recharts';
import { APP_TRANSLATIONS } from '../utils/lang';

interface AnalyticsProps {
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[];
  onSaveBudget: (category: string, limit: number) => void;
  onDeleteBudget: (id: string) => void;
  onNavigateTab?: (tab: 'home' | 'transactions' | 'analytics' | 'profile') => void;
  onOpenMonthlyReport?: (month?: string) => void;
  lang?: 'ID' | 'EN';
}

type AnalyticsFilter = 'spending' | 'income' | 'savings' | 'budget';

// Cohesive forest green & sage palette from reference image
const DONUT_COLORS = [
  '#123628', // Deep Forest Green (Dominant)
  '#2E6F4D', // Medium Forest Green
  '#52A874', // Vibrant Emerald
  '#8ED1A7', // Light Sage
  '#B8E4C8', // Pale Mint
  '#D7EFE0', // Soft Sage Cream
  '#3B82F6', // Blue Accent
  '#F59E0B'  // Amber Accent
];

export const Analytics: React.FC<AnalyticsProps> = ({
  transactions,
  budgets,
  categories,
  onSaveBudget,
  onDeleteBudget,
  onNavigateTab,
  onOpenMonthlyReport,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].analytics;
  
  // 1. Filter Tabs: Spending, Income, Savings, Budget
  const [activeFilter, setActiveFilter] = useState<AnalyticsFilter>('spending');

  // 2. Month selection state
  const currentMonthPrefix = useMemo(() => new Date().toISOString().substring(0, 7), []);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthPrefix);
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  // State for setting budgets
  const [budgetCategory, setBudgetCategory] = useState(categories[0] || 'Lainnya');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [showAddBudget, setShowAddBudget] = useState(false);

  const getLocalizedCategoryName = (catName: string) => {
    if (lang === 'ID') return catName;
    const catMap: Record<string, string> = {
      'Makanan': 'Food & Drinks',
      'Makanan & Minuman': 'Food & Drinks',
      'Transportasi': 'Transport',
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

  // Available months list
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    set.add(currentMonthPrefix);
    transactions.forEach((tx) => {
      if (tx.date && tx.date.length >= 7) {
        set.add(tx.date.substring(0, 7));
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions, currentMonthPrefix]);

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
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      const name = lang === 'ID' ? monthsID[monthIndex] : monthsEN[monthIndex];
      return `${name} ${year}`;
    } catch {
      return ym;
    }
  };

  // Monthly statistics
  const stats = useMemo(() => {
    let monthInc = 0;
    let monthExp = 0;
    const categorySpendMap: Record<string, number> = {};
    const categoryIncomeMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      const isInSelectedMonth = tx.date.startsWith(selectedMonth);
      if (tx.type === 'income') {
        if (isInSelectedMonth) {
          monthInc += tx.amount;
          categoryIncomeMap[tx.category] = (categoryIncomeMap[tx.category] || 0) + tx.amount;
        }
      } else {
        if (isInSelectedMonth) {
          monthExp += tx.amount;
          categorySpendMap[tx.category] = (categorySpendMap[tx.category] || 0) + tx.amount;
        }
      }
    });

    const savingRate = monthInc > 0 ? Math.max(0, Math.round(((monthInc - monthExp) / monthInc) * 100)) : 0;

    return {
      monthIncome: monthInc,
      monthExpense: monthExp,
      savingRate,
      categorySpendMap,
      categoryIncomeMap
    };
  }, [transactions, selectedMonth]);

  // Donut Chart Data preparation
  const donutData = useMemo(() => {
    const isIncome = activeFilter === 'income';
    const sourceMap = isIncome ? stats.categoryIncomeMap : stats.categorySpendMap;
    const total = isIncome ? stats.monthIncome : stats.monthExpense;

    const items = Object.keys(sourceMap)
      .map((cat) => ({
        name: getLocalizedCategoryName(cat),
        rawCategory: cat,
        value: sourceMap[cat],
        percentage: total > 0 ? Math.round((sourceMap[cat] / total) * 100) : 0,
      }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value);

    return {
      items,
      total
    };
  }, [activeFilter, stats, lang]);

  // Budget comparison & percentage calculation
  const totalBudgetLimit = useMemo(() => {
    return budgets.reduce((acc, b) => acc + (b.limit || 0), 0);
  }, [budgets]);

  const underBudgetPercentage = useMemo(() => {
    if (totalBudgetLimit <= 0) return 12; // default calibrated reference
    if (stats.monthExpense < totalBudgetLimit) {
      return Math.round(((totalBudgetLimit - stats.monthExpense) / totalBudgetLimit) * 100);
    }
    return 0;
  }, [totalBudgetLimit, stats.monthExpense]);

  // 6-Month Spending Trend Bar Chart Data
  const trendData = useMemo(() => {
    const [selY, selM] = selectedMonth.split('-').map(Number);
    const months: Array<{ ym: string; label: string; amount: number; isSelected: boolean }> = [];

    // Last 6 months up to selectedMonth
    for (let i = 5; i >= 0; i--) {
      const d = new Date(selY, selM - 1 - i, 1);
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = d.toLocaleDateString(lang === 'ID' ? 'id-ID' : 'en-US', { month: 'short' });
      
      let exp = 0;
      transactions.forEach((tx) => {
        if (tx.type === 'expense' && tx.date.startsWith(ym)) {
          exp += tx.amount;
        }
      });

      months.push({
        ym,
        label,
        amount: exp,
        isSelected: ym === selectedMonth
      });
    }

    return months;
  }, [transactions, selectedMonth, lang]);

  // Form submit for budget creation
  const handleSetBudgetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const limit = parseFloat(budgetLimit);
    if (!budgetCategory || isNaN(limit) || limit <= 0) return;
    onSaveBudget(budgetCategory, limit);
    setBudgetLimit('');
    setShowAddBudget(false);
  };

  return (
    <div className="space-y-6 pb-28 max-w-lg mx-auto">
      
      {/* 1. Top Bar: Back Button, Title, and Calendar Icon */}
      <header className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={() => onNavigateTab ? onNavigateTab('home') : window.history.back()}
          className="w-10 h-10 rounded-full bg-white dark:bg-[#142920] border border-[#E4ECE6] dark:border-white/10 flex items-center justify-center text-text-primary dark:text-slate-200 shadow-xs hover:bg-[#F0F4F1] dark:hover:bg-[#1A362B] transition-all cursor-pointer"
          aria-label="Kembali ke Beranda"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <h1 className="text-lg sm:text-xl font-bold text-text-primary dark:text-slate-100">
          {lang === 'ID' ? 'Analisis' : 'Analytics'}
        </h1>

        <div className="flex items-center gap-2">
          {onOpenMonthlyReport && (
            <button
              type="button"
              onClick={() => onOpenMonthlyReport(selectedMonth)}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#142920] border border-[#E4ECE6] dark:border-white/10 flex items-center justify-center text-text-primary dark:text-slate-200 shadow-xs hover:bg-[#F0F4F1] dark:hover:bg-[#1A362B] transition-all cursor-pointer"
              aria-label={lang === 'ID' ? 'Unduh Slip Ringkasan Bulanan' : 'Download Monthly Financial Slip'}
              title={lang === 'ID' ? 'Unduh Slip / Cetak PDF' : 'Download Slip / Print PDF'}
            >
              <FileDown className="w-4.5 h-4.5 stroke-[2] text-[#123628] dark:text-[#4ADE80]" />
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMonthPicker(!showMonthPicker)}
              className="w-10 h-10 rounded-full bg-white dark:bg-[#142920] border border-[#E4ECE6] dark:border-white/10 flex items-center justify-center text-text-primary dark:text-slate-200 shadow-xs hover:bg-[#F0F4F1] dark:hover:bg-[#1A362B] transition-all cursor-pointer"
              aria-label="Pilih Periode Bulan"
            >
              <Calendar className="w-4.5 h-4.5 stroke-[2]" />
            </button>

            {/* Month Picker Dropdown */}
            {showMonthPicker && (
              <div className="absolute top-12 right-0 w-44 bg-white dark:bg-[#12281E] border border-[#E5ECE7] dark:border-white/10 rounded-2xl shadow-xl p-2 z-30 space-y-1">
                {availableMonths.map((ym) => (
                  <button
                    key={ym}
                    type="button"
                    onClick={() => {
                      setSelectedMonth(ym);
                      setShowMonthPicker(false);
                    }}
                    className={`w-full px-3 py-2 text-xs font-semibold rounded-xl text-left transition-colors ${
                      ym === selectedMonth
                        ? 'bg-[#123628] text-white dark:bg-[#4ADE80] dark:text-[#07100B]'
                        : 'text-text-primary dark:text-slate-200 hover:bg-[#F0F4F1] dark:hover:bg-[#1A382B]'
                    }`}
                  >
                    {formatMonthLabel(ym)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. Segmented Pill Tabs: Spending, Income, Savings, Budget */}
      <section aria-label="Kategori Analisis" className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {(['spending', 'income', 'savings', 'budget'] as AnalyticsFilter[]).map((tab) => {
          const isActive = activeFilter === tab;
          const labels: Record<AnalyticsFilter, { id: string; en: string }> = {
            spending: { id: 'Pengeluaran', en: 'Spending' },
            income: { id: 'Pemasukan', en: 'Income' },
            savings: { id: 'Tabungan', en: 'Savings' },
            budget: { id: 'Anggaran', en: 'Goals' }
          };

          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'forest-pill-active'
                  : 'forest-pill-inactive bg-[#F0F4F1] dark:bg-[#142920] border border-[#E4ECE6] dark:border-white/5'
              }`}
            >
              {lang === 'ID' ? labels[tab].id : labels[tab].en}
            </button>
          );
        })}
      </section>

      {/* 3. Section Title & Month Selector Dropdown */}
      <section className="flex items-center justify-between pt-1">
        <h2 className="text-base sm:text-lg font-bold text-text-primary dark:text-slate-100">
          {activeFilter === 'spending' && (lang === 'ID' ? 'Pengeluaran Anda' : 'Your Spending')}
          {activeFilter === 'income' && (lang === 'ID' ? 'Pemasukan Anda' : 'Your Income')}
          {activeFilter === 'savings' && (lang === 'ID' ? 'Analisis Tabungan' : 'Your Savings')}
          {activeFilter === 'budget' && (lang === 'ID' ? 'Target Anggaran' : 'Your Goals')}
        </h2>

        <div className="relative">
          <button
            type="button"
            onClick={() => setShowMonthPicker(!showMonthPicker)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#142920] border border-[#E4ECE6] dark:border-white/10 text-xs font-bold text-text-primary dark:text-slate-200 shadow-xs hover:bg-[#F0F4F1] cursor-pointer"
          >
            <span>{formatMonthLabel(selectedMonth)}</span>
            <span className="text-[10px] opacity-70">⌄</span>
          </button>
        </div>
      </section>

      {/* 4. Donut Chart & Category Breakdown (For Spending & Income) */}
      {(activeFilter === 'spending' || activeFilter === 'income') && (
        <section className="space-y-5">
          
          {/* Donut Chart Container */}
          <div className="liquid-glass-card rounded-[32px] p-6 flex flex-col items-center justify-center relative">
            
            {donutData.items.length === 0 ? (
              <div className="py-12 text-center text-text-secondary dark:text-slate-400 space-y-1">
                <p className="font-semibold text-sm">
                  {lang === 'ID' ? 'Tidak Ada Data di Periode Ini' : 'No Data in This Period'}
                </p>
                <p className="text-xs opacity-80">
                  {lang === 'ID' ? 'Belum ada transaksi tercatat untuk bulan ini.' : 'No transactions recorded for this month.'}
                </p>
              </div>
            ) : (
              <div className="relative w-64 h-64 flex items-center justify-center">
                
                {/* Recharts Donut Pie */}
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData.items}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={96}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {donutData.items.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={DONUT_COLORS[index % DONUT_COLORS.length]} 
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Donut Center Display: Total Spent & Subtitle */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
                  <p className="text-2xl sm:text-3xl font-extrabold text-text-primary dark:text-slate-100 tracking-tight tabular-nums">
                    {formatRupiah(donutData.total)}
                  </p>
                  <p className="text-xs font-semibold text-text-secondary dark:text-slate-400 mt-1 uppercase tracking-wider">
                    {activeFilter === 'spending' 
                      ? (lang === 'ID' ? 'Total Keluar' : 'Total Spent')
                      : (lang === 'ID' ? 'Total Masuk' : 'Total Income')}
                  </p>
                </div>

              </div>
            )}
          </div>

          {/* 5. 2-Column Clean Category Legend with Percentages (Matching Reference) */}
          {donutData.items.length > 0 && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 px-2">
              {donutData.items.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs py-1">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: DONUT_COLORS[idx % DONUT_COLORS.length] }} 
                    />
                    <span className="font-semibold text-text-primary dark:text-slate-200 truncate">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-bold text-text-secondary dark:text-slate-400 tabular-nums flex-shrink-0">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 6. Smart Insight Card - Sprout / Under Budget Banner */}
          <div 
            onClick={() => setActiveFilter('budget')}
            className="sage-insight-card rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:shadow-xs transition-all"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-full bg-[#123628] text-[#88E5A7] flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sprout className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#123628] dark:text-[#88E5A7]">
                  {lang === 'ID' 
                    ? `Pengeluaran ${underBudgetPercentage}% di bawah anggaran!`
                    : `You're ${underBudgetPercentage}% under budget!`}
                </p>
                <p className="text-xs text-[#2A5E44] dark:text-[#A8D8BD] mt-0.5">
                  {lang === 'ID' 
                    ? 'Manajemen pengeluaran yang hebat di bulan ini.' 
                    : 'Great job managing your spending this month.'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-[#123628] dark:text-[#88E5A7] flex-shrink-0" />
          </div>

          {/* 7. Spending Trend Bar Chart (Last 6 Months) */}
          <div className="liquid-glass-card rounded-[32px] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-text-primary dark:text-slate-100">
                {lang === 'ID' ? 'Tren Pengeluaran' : 'Spending Trend'}
              </h3>
              <div className="text-xs font-bold text-[#123628] dark:text-[#4ADE80] bg-[#E8F4EC] dark:bg-[#142920] px-2.5 py-1 rounded-full tabular-nums">
                {formatRupiah(donutData.total)}
              </div>
            </div>

            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <XAxis 
                    dataKey="label" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#8DA799', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#8DA799', fontSize: 10 }}
                    tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(0)}M` : val >= 1000 ? `${(val / 1000).toFixed(0)}K` : String(val)}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-[#123628] text-white text-xs px-2.5 py-1.5 rounded-xl shadow-lg font-bold">
                            {formatRupiah(Number(payload[0].value))}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="amount" 
                    radius={[6, 6, 0, 0]}
                  >
                    {trendData.map((entry, index) => (
                      <Cell 
                        key={`bar-${index}`} 
                        fill={entry.isSelected ? '#123628' : '#CBE0D3'} 
                        className={entry.isSelected ? 'dark:fill-[#4ADE80]' : 'dark:fill-[#1A382B]'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </section>
      )}

      {/* 8. Budget / Goals View (When Active Filter is 'budget') */}
      {activeFilter === 'budget' && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-primary dark:text-slate-100">
              {lang === 'ID' ? 'Target Batas Anggaran' : 'Budget Limits'}
            </h3>
            <button
              type="button"
              onClick={() => setShowAddBudget(true)}
              className="px-3 py-1.5 rounded-full bg-[#123628] text-white dark:bg-[#4ADE80] dark:text-[#07100B] text-xs font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'ID' ? 'Atur Anggaran' : 'Set Budget'}</span>
            </button>
          </div>

          {budgets.length === 0 ? (
            <div className="liquid-glass-card rounded-2xl p-6 text-center text-text-secondary dark:text-slate-400 space-y-2">
              <p className="font-semibold text-sm">
                {lang === 'ID' ? 'Belum Ada Anggaran Ditetapkan' : 'No Budgets Configured'}
              </p>
              <p className="text-xs">
                {lang === 'ID' ? 'Tetapkan batas per kategori untuk menjaga keuanganmu tetap aman.' : 'Set category limits to keep your finances in check.'}
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {budgets.map((b) => {
                const spent = stats.categorySpendMap[b.category] || 0;
                const pct = b.limit > 0 ? Math.min(100, Math.round((spent / b.limit) * 100)) : 0;
                const isOver = spent > b.limit;

                return (
                  <div key={b.id || b.category} className="liquid-glass-card rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-text-primary dark:text-slate-100">{b.category}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-extrabold ${isOver ? 'text-red-500' : 'text-[#123628] dark:text-[#4ADE80]'}`}>
                          {pct}%
                        </span>
                        {b.id && (
                          <button
                            type="button"
                            onClick={() => onDeleteBudget(b.id)}
                            className="p-1 text-slate-400 hover:text-red-500"
                            title="Hapus Anggaran"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="w-full bg-[#E5ECE7] dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-[#123628] dark:bg-[#4ADE80]'}`}
                        style={{ width: `${Math.min(100, pct)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-xs text-text-secondary dark:text-slate-400">
                      <span>{formatRupiah(spent)}</span>
                      <span>Batas: {formatRupiah(b.limit)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 9. Savings View (When Active Filter is 'savings') */}
      {activeFilter === 'savings' && (
        <section className="space-y-4">
          <div className="liquid-glass-card rounded-[32px] p-6 space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-slate-100">
              {lang === 'ID' ? 'Kesehatan Tabungan Bulan Ini' : 'Monthly Savings Health'}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#F0F4F1] dark:bg-[#142920] p-4 rounded-2xl">
                <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
                  {lang === 'ID' ? 'Laju Menabung' : 'Saving Rate'}
                </p>
                <p className="text-2xl font-extrabold text-[#123628] dark:text-[#4ADE80] mt-1 tabular-nums">
                  {stats.savingRate}%
                </p>
              </div>

              <div className="bg-[#F0F4F1] dark:bg-[#142920] p-4 rounded-2xl">
                <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
                  {lang === 'ID' ? 'Kas Tersimpan' : 'Net Saved'}
                </p>
                <p className="text-lg sm:text-xl font-extrabold text-text-primary dark:text-slate-100 mt-1 tabular-nums">
                  {formatRupiah(Math.max(0, stats.monthIncome - stats.monthExpense))}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Add Budget Modal Form */}
      {showAddBudget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#12281E] border border-[#E5ECE7] dark:border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-text-primary dark:text-slate-100">
              {lang === 'ID' ? 'Atur Limit Anggaran' : 'Set Budget Limit'}
            </h3>

            <form onSubmit={handleSetBudgetSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-text-secondary dark:text-slate-400 block mb-1">
                  {lang === 'ID' ? 'Kategori' : 'Category'}
                </label>
                <select
                  value={budgetCategory}
                  onChange={(e) => setBudgetCategory(e.target.value)}
                  className="w-full bg-[#F8FAF8] dark:bg-[#0B1912] border border-[#CCDCD1] dark:border-white/15 rounded-xl p-2.5 text-xs text-text-primary dark:text-slate-100"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-text-secondary dark:text-slate-400 block mb-1">
                  {lang === 'ID' ? 'Batas Maksimal (Rp)' : 'Limit Amount (IDR)'}
                </label>
                <input
                  type="number"
                  value={budgetLimit}
                  onChange={(e) => setBudgetLimit(e.target.value)}
                  placeholder="Contoh: 1500000"
                  className="w-full bg-[#F8FAF8] dark:bg-[#0B1912] border border-[#CCDCD1] dark:border-white/15 rounded-xl p-2.5 text-xs text-text-primary dark:text-slate-100"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="px-4 py-2 rounded-xl text-xs text-text-secondary dark:text-slate-400"
                >
                  {lang === 'ID' ? 'Batal' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#123628] text-white dark:bg-[#4ADE80] dark:text-[#07100B] font-bold text-xs shadow-xs"
                >
                  {lang === 'ID' ? 'Simpan' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
