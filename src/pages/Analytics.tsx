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
  AlertTriangle
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

interface AnalyticsProps {
  transactions: Transaction[];
  budgets: Budget[];
  categories: string[];
  onSaveBudget: (category: string, limit: number) => void;
  onDeleteBudget: (id: string) => void;
}

export const Analytics: React.FC<AnalyticsProps> = ({
  transactions,
  budgets,
  categories,
  onSaveBudget,
  onDeleteBudget,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'trends' | 'budgets'>('trends');
  
  // State for setting budgets
  const [budgetCategory, setBudgetCategory] = useState(categories[0] || 'Lainnya');
  const [budgetLimit, setBudgetLimit] = useState('');
  const [showAddBudget, setShowAddBudget] = useState(false);

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
  const currentMonthPrefix = useMemo(() => new Date().toISOString().substring(0, 7), []);

  const stats = useMemo(() => {
    let inc = 0;
    let exp = 0;
    
    // Monthly statistics
    let monthInc = 0;
    let monthExp = 0;

    // Daily average calculation (for current month)
    const dailySpendMap: Record<string, number> = {};
    const categorySpendMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      const isCurrentMonth = tx.date.startsWith(currentMonthPrefix);
      if (tx.type === 'income') {
        inc += tx.amount;
        if (isCurrentMonth) monthInc += tx.amount;
      } else {
        exp += tx.amount;
        if (isCurrentMonth) {
          monthExp += tx.amount;
          dailySpendMap[tx.date] = (dailySpendMap[tx.date] || 0) + tx.amount;
          categorySpendMap[tx.category] = (categorySpendMap[tx.category] || 0) + tx.amount;
        }
      }
    });

    const activeDays = Object.keys(dailySpendMap).length || 1;
    const averageDailySpending = monthExp / Math.max(1, new Date().getDate()); // Average based on past days of current month

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
  }, [transactions, currentMonthPrefix]);

  // Compute category budget maps
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

  // Chart Data: Monthly Cashflow (Last 6 Months)
  const monthlyChartData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const map: Record<string, { income: number; expense: number; monthName: string }> = {};

    // Get last 6 months boundaries
    const last6MonthsKeys: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().substring(0, 7); // "YYYY-MM"
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
      Pemasukan: map[k].income,
      Pengeluaran: map[k].expense,
      Cashflow: map[k].income - map[k].expense
    }));
  }, [transactions]);

  // Chart Data: Category Breakdown Pie Chart
  const categoryChartData = useMemo(() => {
    const COLORS = ['#1B8A5A', '#3AA772', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#3B82F6', '#14B8A6'];
    const list = Object.keys(stats.categorySpendMap).map((cat, i) => ({
      name: cat,
      value: stats.categorySpendMap[cat],
      color: COLORS[i % COLORS.length]
    }));
    list.sort((a, b) => b.value - a.value);
    return list;
  }, [stats.categorySpendMap]);

  // --- DYNAMIC AI INSIGHTS ENGINE ---
  const automatedInsights = useMemo(() => {
    const list: string[] = [];

    // Rule 1: Saving Rate Assessment
    if (stats.savingRate >= 40) {
      list.push(`Laju Menabung Anda sangat prima (${stats.savingRate}%). Anda mengamankan sebagian besar pendapatan bulan ini.`);
    } else if (stats.savingRate > 15) {
      list.push(`Tingkat tabungan Anda aman di angka ${stats.savingRate}%. Pertahankan kestabilan pengeluaran Anda.`);
    } else if (stats.monthIncome > 0 && stats.savingRate <= 10) {
      list.push(`Saving rate Anda di bawah target ideal (${stats.savingRate}%). Coba batasi pengeluaran non-prioritas.`);
    }

    // Rule 2: Budget Warnings
    const overBudgets = activeBudgets.filter(b => b.spent > b.limit);
    const nearOverBudgets = activeBudgets.filter(b => b.spent >= b.limit * 0.8 && b.spent <= b.limit);

    if (overBudgets.length > 0) {
      const names = overBudgets.map(b => b.category).join(', ');
      list.push(`Anggaran jebol! Kategori [${names}] telah melampaui limit batas yang Anda tentukan.`);
    }
    if (nearOverBudgets.length > 0) {
      const names = nearOverBudgets.map(b => b.category).join(', ');
      list.push(`Waspada: Pengeluaran [${names}] hampir melampaui 80% dari limit anggaran Anda.`);
    }

    // Rule 3: Largest category spending
    if (stats.largestAmount > 0) {
      list.push(`Kategori pengeluaran terbesar Anda bulan ini adalah [${stats.largestCategory}] sebesar ${formatRupiah(stats.largestAmount)}.`);
    }

    // Default if no data
    if (list.length === 0) {
      list.push("Mulailah mencatat transaksi untuk memunculkan analisis keuangan pintar.");
    }

    return list;
  }, [stats, activeBudgets]);

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      
      {/* Upper Segmented Controller */}
      <div className="bg-surface dark:bg-slate-800 p-1.5 rounded-2xl border border-border-custom dark:border-slate-700/60 shadow-soft flex">
        <button
          onClick={() => setActiveSubTab('trends')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'trends'
              ? 'bg-primary text-white shadow-soft'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4 stroke-[2.2]" />
          Analisis Tren
        </button>
        <button
          onClick={() => setActiveSubTab('budgets')}
          className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'budgets'
              ? 'bg-primary text-white shadow-soft'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-4 h-4 stroke-[2.2]" />
          Kelola Anggaran
        </button>
      </div>

      {/* --- TRENDS ANALYTICS VIEW --- */}
      {activeSubTab === 'trends' && (
        <div className="space-y-6">
          
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Saving Rate Card */}
            <div className="bg-surface dark:bg-slate-800 p-4 rounded-2xl border border-border-custom dark:border-slate-700/60 shadow-soft flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Saving Rate (Bulan Ini)
                </span>
                <h4 className="text-xl font-bold text-primary mt-1">
                  {stats.savingRate}%
                </h4>
              </div>
              <div className="w-full h-1.5 bg-brand-bg dark:bg-slate-700 rounded-full overflow-hidden mt-3">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-300" 
                  style={{ width: `${stats.savingRate}%` }} 
                />
              </div>
            </div>

            {/* Average Daily Spending */}
            <div className="bg-surface dark:bg-slate-800 p-4 rounded-2xl border border-border-custom dark:border-slate-700/60 shadow-soft flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                  Rata-rata Harian
                </span>
                <h4 className="text-lg font-bold text-text-primary dark:text-slate-100 mt-1 line-clamp-1">
                  {formatRupiah(stats.averageDailySpending)}
                </h4>
              </div>
              <p className="text-[9px] text-text-secondary font-semibold uppercase mt-3">
                Bulan berjalan
              </p>
            </div>

          </div>

          {/* Desktop and Tablet Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Visual Charts (Takes 7/12 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Income vs Expense Graph Card */}
              <div className="bg-surface dark:bg-slate-800 p-5 rounded-[28px] border border-border-custom dark:border-slate-700/60 shadow-soft space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-text-primary dark:text-slate-100">
                    Arus Kas Bulanan
                  </h4>
                  <p className="text-[10px] text-text-secondary">
                    Perbandingan pemasukan dan pengeluaran 6 bulan terakhir.
                  </p>
                </div>

                {transactions.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-xs text-text-secondary">
                    Belum ada data untuk dirender
                  </div>
                ) : (
                  <div className="h-56 w-full text-xs">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyChartData} margin={{ top: 10, right: 0, left: -10, bottom: 0 }}>
                        <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                        <Tooltip 
                          formatter={(value: any) => [formatRupiah(Number(value)), '']}
                          contentStyle={{ background: '#1E293B', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '11px' }}
                        />
                        <Bar dataKey="Pemasukan" fill="#1B8A5A" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Pengeluaran" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Category Breakdown (Pie-Chart & List) */}
              <div className="bg-surface dark:bg-slate-800 p-5 rounded-[28px] border border-border-custom dark:border-slate-700/60 shadow-soft space-y-4">
                <div>
                  <h4 className="text-sm font-bold text-text-primary dark:text-slate-100">
                    Proporsi Kategori Pengeluaran
                  </h4>
                  <p className="text-[10px] text-text-secondary">
                    Alokasi pembagian pengeluaran utama Anda bulan ini.
                  </p>
                </div>

                {categoryChartData.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-text-secondary">
                    Belum ada pengeluaran dicatat
                  </div>
                ) : (
                  <div className="grid grid-cols-5 gap-4 items-center">
                    
                    {/* Mini Pie chart */}
                    <div className="col-span-2 h-32 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={25}
                            outerRadius={45}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Progress rows of categories */}
                    <div className="col-span-3 space-y-2 max-h-40 overflow-y-auto no-scrollbar pr-1">
                      {categoryChartData.slice(0, 4).map((item) => {
                        const style = getCategoryStyle(item.name);
                        const totalVal = categoryChartData.reduce((acc, curr) => acc + curr.value, 0);
                        const percent = totalVal > 0 ? Math.round((item.value / totalVal) * 100) : 0;

                        return (
                          <div key={item.name} className="space-y-1">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-text-primary dark:text-slate-200 line-clamp-1">
                                {item.name}
                              </span>
                              <span className="font-semibold text-text-secondary dark:text-slate-400">
                                {percent}%
                              </span>
                            </div>
                            <div className="w-full h-1 bg-brand-bg dark:bg-slate-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full" 
                                style={{ width: `${percent}%`, backgroundColor: item.color }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                )}
              </div>

            </div>

            {/* Right Column: AI Insights & Quick Stats (Takes 5/12 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* AI Automated Smart Insights */}
              <div className="bg-emerald-950/5 dark:bg-emerald-500/5 p-5 rounded-[28px] border border-primary/20 shadow-soft space-y-3">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h4 className="text-sm font-bold text-primary dark:text-secondary">
                    Insight Keuangan Pintar
                  </h4>
                </div>

                <div className="space-y-2">
                  {automatedInsights.map((insight, i) => (
                    <div key={i} className="flex gap-2.5 items-start text-xs leading-relaxed text-text-primary dark:text-slate-200 font-medium">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
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
                  Anggaran Kategori Pengeluaran
                </h4>
                <p className="text-[10px] text-text-secondary">
                  Tentukan limit pengeluaran bulanan Anda untuk menghindari pemborosan.
                </p>
              </div>
              
              <button
                onClick={() => setShowAddBudget(!showAddBudget)}
                className="lg:hidden px-4 py-2 bg-primary hover:bg-secondary text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                {showAddBudget ? 'Tutup' : 'Atur Limit'}
              </button>
            </div>

            {/* Budget List Grid */}
            {activeBudgets.length === 0 ? (
              <div className="bg-surface dark:bg-slate-800 p-10 rounded-[28px] border border-dashed border-border-custom dark:border-slate-700 text-center flex flex-col items-center gap-2">
                <Scale className="w-10 h-10 text-text-secondary/60 mb-1" />
                <p className="text-xs text-text-secondary dark:text-slate-400 font-medium">
                  Belum ada anggaran yang ditentukan.
                </p>
                <p className="text-[10px] text-text-secondary/50 max-w-xs">
                  Mulai atur limit keuangan per kategori di form untuk membiasakan hidup hemat!
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
                      className="bg-surface dark:bg-slate-800 p-4 rounded-2xl border border-border-custom dark:border-slate-700/60 shadow-soft relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-2.5">
                        <div className="flex items-center gap-2">
                          <div className={`w-8.5 h-8.5 rounded-lg ${style.bgClass} ${style.textClass} flex items-center justify-center flex-shrink-0`}>
                            <style.icon className="w-5 h-5 stroke-[2.2]" />
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-text-primary dark:text-slate-100">
                              {b.category}
                            </h5>
                            <p className="text-[9px] text-text-secondary">
                              Limit: {formatRupiah(b.limit)}
                            </p>
                          </div>
                        </div>

                        {/* Delete limit button */}
                        <button
                          onClick={() => onDeleteBudget(b.id)}
                          className="p-1.5 rounded-lg bg-brand-bg dark:bg-slate-700 hover:bg-rose-500/10 text-text-secondary hover:text-rose-500 transition-all cursor-pointer"
                          title="Hapus Anggaran"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Progress tracking information */}
                      <div className="space-y-1">
                        <div className="w-full h-2 bg-brand-bg dark:bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-300 ${
                              isOver 
                                ? 'bg-rose-500' 
                                : isNear 
                                  ? 'bg-amber-500' 
                                  : 'bg-primary'
                            }`}
                            style={{ width: `${b.percentage}%` }}
                          />
                        </div>
                        
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-text-secondary uppercase">
                            {b.percentage}% Terpakai ({formatRupiah(b.spent)})
                          </span>
                          
                          {isOver ? (
                            <span className="text-rose-500 flex items-center gap-1 uppercase">
                              <AlertTriangle className="w-3 h-3" />
                              Over Rp {formatRupiah(b.spent - b.limit)}!
                            </span>
                          ) : (
                            <span className="text-emerald-600 dark:text-emerald-400 uppercase">
                              Sisa Rp {formatRupiah(b.remaining)}
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
            <form onSubmit={handleSetBudgetSubmit} className="bg-surface dark:bg-slate-800 p-5 rounded-2xl border border-primary/20 shadow-soft space-y-4 animate-slide-up">
              <h5 className="text-xs font-bold text-text-primary dark:text-slate-100 uppercase tracking-wider">
                Atur Limit Anggaran
              </h5>
              
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">
                    Pilih Kategori
                  </label>
                  <select
                    value={budgetCategory}
                    onChange={(e) => setBudgetCategory(e.target.value)}
                    className="w-full bg-brand-bg dark:bg-slate-900/40 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-primary text-text-primary dark:text-slate-100 appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      backgroundSize: '12px'
                    }}
                  >
                    {expenseCategoriesOnly.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-text-secondary uppercase">
                    Limit Bulanan (Rp)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Contoh: 1500000"
                    value={budgetLimit}
                    onChange={(e) => setBudgetLimit(e.target.value)}
                    className="w-full bg-brand-bg dark:bg-slate-900/40 px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none border border-transparent focus:border-primary text-text-primary dark:text-slate-100"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!budgetLimit}
                className="w-full bg-primary hover:bg-secondary text-white py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
              >
                Simpan Limit Anggaran
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
};
