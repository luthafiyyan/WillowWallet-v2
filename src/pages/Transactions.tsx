import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  HelpCircle,
  TrendingUp,
  TrendingDown,
  Calendar,
  X,
  Edit3,
  Trash2,
  CalendarCheck
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatRupiah, getCategoryStyle } from '../utils/helpers';
import { motion } from 'motion/react';
import { APP_TRANSLATIONS } from '../utils/lang';

interface TransactionsProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewTransaction: (tx: Transaction) => void;
  lang?: 'ID' | 'EN';
}

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';
type TypeFilter = 'all' | 'income' | 'expense';

export const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
  onViewTransaction,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].transactions;
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

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

  // Filter calculations
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    // 1. Text Search Filter
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (t) => 
          (t.description || '').toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q)
      );
    }

    // 2. Type Filter
    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter);
    }

    // 3. Time Filter
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    // Get date boundaries
    const getWeekStartDate = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };

    const currentMonthPrefix = now.toISOString().substring(0, 7); // "YYYY-MM"
    const currentYearPrefix = now.toISOString().substring(0, 4); // "YYYY"

    if (timeFilter === 'today') {
      result = result.filter((t) => t.date === todayStr);
    } else if (timeFilter === 'week') {
      const weekStart = getWeekStartDate();
      result = result.filter((t) => t.date >= weekStart && t.date <= todayStr);
    } else if (timeFilter === 'month') {
      result = result.filter((t) => t.date.startsWith(currentMonthPrefix));
    } else if (timeFilter === 'year') {
      result = result.filter((t) => t.date.startsWith(currentYearPrefix));
    }

    return result;
  }, [transactions, search, timeFilter, typeFilter]);

  // Aggregate stats of filtered transactions
  const { filteredIncome, filteredExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') {
        inc += t.amount;
      } else {
        exp += t.amount;
      }
    });
    return {
      filteredIncome: inc,
      filteredExpense: exp,
    };
  }, [filteredTransactions]);

  const clearFilters = () => {
    setSearch('');
    setTimeFilter('all');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-5 pb-28">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-text-primary dark:text-slate-100">
          {t.title}
        </h2>
        <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
          {t.subtitle}
        </p>
      </div>

      {/* Realtime Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full liquid-glass-input rounded-2xl pl-12 pr-10 py-3.5 text-sm font-medium focus:border-primary focus:outline-none transition-all text-text-primary dark:text-slate-100 placeholder:text-slate-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-text-secondary hover:text-text-primary cursor-pointer transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Responsive Filter & List Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Filter Tools & Aggregates (Takes 4/12 cols on desktop) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Time-Range Filter Tabs */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider pl-1">
              {t.timeRange}
            </h5>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:flex lg:flex-col gap-1.5 liquid-glass-card p-1.5 sm:p-2 rounded-2xl">
              <button
                onClick={() => setTimeFilter('all')}
                className={`text-center lg:text-left px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-bold sm:font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'all'
                    ? 'liquid-pill-active'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                {t.allRanges}
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`text-center lg:text-left px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-bold sm:font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'today'
                    ? 'liquid-pill-active'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                {t.today}
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`text-center lg:text-left px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-bold sm:font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'week'
                    ? 'liquid-pill-active'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                {t.thisWeek}
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`text-center lg:text-left px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-bold sm:font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'month'
                    ? 'liquid-pill-active'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                {t.thisMonth}
              </button>
              <button
                onClick={() => setTimeFilter('year')}
                className={`text-center lg:text-left px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-bold sm:font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'year'
                    ? 'liquid-pill-active'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                {t.thisYear}
              </button>
            </div>
          </div>

          {/* Transaction Type Filters */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider pl-1">
              {t.flowType}
            </h5>
            <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`w-full py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-slate-200/90 dark:bg-slate-700 text-text-primary dark:text-slate-100 shadow-xs'
                    : 'liquid-glass-card text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                {t.allTypes}
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`w-full py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'liquid-glass-card text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                {t.income}
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`w-full py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                    : 'liquid-glass-card text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                {t.expense}
              </button>
            </div>
          </div>

          {/* Sums overview of active filters */}
          <div className="grid grid-cols-2 gap-3 liquid-glass-card p-4 rounded-2xl">
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                {t.filterIncome}
              </p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{formatRupiah(filteredIncome)}
              </p>
            </div>
            <div className="border-l border-black/5 dark:border-white/10 pl-4">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                {t.filterExpense}
              </p>
              <p className="text-sm font-bold text-rose-500 dark:text-rose-400 mt-0.5">
                -{formatRupiah(filteredExpense)}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Results Card list (Takes 8/12 cols on desktop) */}
        <div className="lg:col-span-8 space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="liquid-glass-card p-12 rounded-[28px] border border-dashed border-slate-300 dark:border-slate-700/80 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center text-text-secondary mb-1">
                <SlidersHorizontal className="w-6 h-6 text-text-secondary/60" />
              </div>
              <h4 className="text-sm font-bold text-text-primary dark:text-slate-100">
                {t.noTxTitle}
              </h4>
              <p className="text-xs text-text-secondary dark:text-slate-400 max-w-xs leading-relaxed">
                {t.noTxDesc}
              </p>
              <button
                onClick={clearFilters}
                className="text-xs liquid-pill-active px-5 py-2.5 rounded-xl font-semibold cursor-pointer mt-2"
              >
                {t.resetFiltersBtn}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
              {filteredTransactions.map((tx) => {
                const style = getCategoryStyle(tx.category);
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
                        <h5 className="text-xs sm:text-sm font-bold text-text-primary dark:text-slate-100 line-clamp-1">
                          {tx.description || getLocalizedCategoryName(tx.category)}
                        </h5>
                        <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] font-semibold text-text-secondary dark:text-slate-400">
                            {getLocalizedCategoryName(tx.category)}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                          <span className="text-[10px] text-text-secondary dark:text-slate-400 font-medium whitespace-nowrap">
                            {tx.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right hand layout for Amount and controls - stacked on mobile, row on desktop */}
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 flex-shrink-0">
                      <span className={`text-xs sm:text-sm font-extrabold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </span>
                      
                      <div className="flex gap-1">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTransaction(tx);
                          }}
                          className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 border border-black/5 dark:border-white/5 text-text-secondary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTransaction(tx.id);
                          }}
                          className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 border border-black/5 dark:border-white/5 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
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

    </div>
  );
};
