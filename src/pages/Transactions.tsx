import React, { useState, useMemo } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  TrendingUp,
  TrendingDown,
  X,
  Edit3,
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatRupiah, getCategoryStyle } from '../utils/helpers';
import { APP_TRANSLATIONS } from '../utils/lang';

interface TransactionsProps {
  transactions: Transaction[];
  categories?: string[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onViewTransaction: (tx: Transaction) => void;
  lang?: 'ID' | 'EN';
}

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';
type TypeFilter = 'all' | 'income' | 'expense';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';

export const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  categories = [],
  onEditTransaction,
  onDeleteTransaction,
  onViewTransaction,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].transactions;
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOrder>('newest');

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

  const filteredTransactions = useMemo(() => {
    let result = [...transactions];

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (item) => 
          (item.description || '').toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
      );
    }

    if (typeFilter !== 'all') {
      result = result.filter((item) => item.type === typeFilter);
    }

    if (selectedCategory !== 'all') {
      result = result.filter((item) => item.category === selectedCategory);
    }

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const getWeekStartDate = () => {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      return new Date(d.setDate(diff)).toISOString().split('T')[0];
    };

    const currentMonthPrefix = now.toISOString().substring(0, 7);
    const currentYearPrefix = now.toISOString().substring(0, 4);

    if (timeFilter === 'today') {
      result = result.filter((item) => item.date === todayStr);
    } else if (timeFilter === 'week') {
      const weekStart = getWeekStartDate();
      result = result.filter((item) => item.date >= weekStart && item.date <= todayStr);
    } else if (timeFilter === 'month') {
      result = result.filter((item) => item.date.startsWith(currentMonthPrefix));
    } else if (timeFilter === 'year') {
      result = result.filter((item) => item.date.startsWith(currentYearPrefix));
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') {
        const timeDiff = new Date(b.date).getTime() - new Date(a.date).getTime();
        return timeDiff !== 0 ? timeDiff : b.createdAt - a.createdAt;
      }
      if (sortBy === 'oldest') {
        const timeDiff = new Date(a.date).getTime() - new Date(b.date).getTime();
        return timeDiff !== 0 ? timeDiff : a.createdAt - b.createdAt;
      }
      if (sortBy === 'highest') {
        return b.amount - a.amount;
      }
      if (sortBy === 'lowest') {
        return a.amount - b.amount;
      }
      return 0;
    });

    return result;
  }, [transactions, search, timeFilter, typeFilter, selectedCategory, sortBy]);

  const { filteredIncome, filteredExpense } = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((item) => {
      if (item.type === 'income') {
        inc += item.amount;
      } else {
        exp += item.amount;
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
    setSelectedCategory('all');
    setSortBy('newest');
  };

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    categories.forEach(c => set.add(c));
    transactions.forEach(t => set.add(t.category));
    return Array.from(set).sort();
  }, [categories, transactions]);

  return (
    <div className="space-y-5 pb-28">
      <div>
        <h2 className="text-xl font-bold text-text-primary dark:text-slate-100">
          {t.title}
        </h2>
        <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
          {t.subtitle}
        </p>
      </div>

      <div className="relative">
        <label htmlFor="tx-search-input" className="sr-only">
          {t.searchPlaceholder}
        </label>
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
        <input
          id="tx-search-input"
          type="text"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full liquid-glass-input rounded-2xl pl-12 pr-10 py-3.5 text-sm font-medium focus:border-primary focus:outline-none transition-all text-text-primary dark:text-slate-100 placeholder:text-slate-400"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            aria-label={lang === 'ID' ? 'Hapus kata pencarian' : 'Clear search text'}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-slate-200/60 dark:bg-slate-700/60 text-text-secondary hover:text-text-primary cursor-pointer transition-all"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label htmlFor="tx-category-filter" className="block text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider pl-1">
                {t.categoryFilter}
              </label>
              <select
                id="tx-category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-semibold text-text-primary dark:text-slate-100 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="all">{t.allCategories}</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>{getLocalizedCategoryName(c)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label htmlFor="tx-sort-select" className="block text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider pl-1">
                {t.sortBy}
              </label>
              <select
                id="tx-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOrder)}
                className="w-full liquid-glass-input rounded-xl px-3 py-2 text-xs font-semibold text-text-primary dark:text-slate-100 focus:outline-none focus:border-primary cursor-pointer"
              >
                <option value="newest">{t.sortNewest}</option>
                <option value="oldest">{t.sortOldest}</option>
                <option value="highest">{t.sortHighest}</option>
                <option value="lowest">{t.sortLowest}</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider pl-1">
              {t.timeRange}
            </span>
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:flex lg:flex-col gap-1.5 liquid-glass-card p-1.5 sm:p-2 rounded-2xl">
              {(['all', 'today', 'week', 'month', 'year'] as TimeFilter[]).map((range) => {
                const labelMap: Record<TimeFilter, string> = {
                  all: t.allRanges,
                  today: t.today,
                  week: t.thisWeek,
                  month: t.thisMonth,
                  year: t.thisYear
                };
                return (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeFilter(range)}
                    className={`text-center lg:text-left px-2 sm:px-4 py-2 text-[10px] sm:text-xs font-bold sm:font-semibold rounded-xl transition-all cursor-pointer ${
                      timeFilter === range
                        ? 'liquid-pill-active'
                        : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                    }`}
                  >
                    {labelMap[range]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <span className="block text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider pl-1">
              {t.flowType}
            </span>
            <div className="grid grid-cols-3 lg:flex lg:flex-col gap-2">
              <button
                type="button"
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
                type="button"
                onClick={() => setTypeFilter('income')}
                className={`w-full py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                    : 'liquid-glass-card text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.income}</span>
              </button>
              <button
                type="button"
                onClick={() => setTypeFilter('expense')}
                className={`w-full py-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-rose-500/15 text-rose-500 dark:text-rose-400 border border-rose-500/30'
                    : 'liquid-glass-card text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{t.expense}</span>
              </button>
            </div>
          </div>

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

        <div className="lg:col-span-8 space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="liquid-glass-card p-12 rounded-[28px] border border-dashed border-slate-300 dark:border-slate-700/80 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-750 flex items-center justify-center text-text-secondary mb-1">
                <SlidersHorizontal className="w-6 h-6 text-text-secondary/60" />
              </div>
              <h3 className="text-sm font-bold text-text-primary dark:text-slate-100">
                {t.noTxTitle}
              </h3>
              <p className="text-xs text-text-secondary dark:text-slate-400 max-w-xs leading-relaxed">
                {t.noTxDesc}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs liquid-pill-active px-5 py-2.5 rounded-xl font-semibold cursor-pointer mt-2"
              >
                {t.resetFiltersBtn}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2.5 sm:gap-3" role="list">
              {filteredTransactions.map((tx) => {
                const style = getCategoryStyle(tx.category);
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
                        <style.icon className="w-5 h-5 sm:w-5.5 sm:h-5.5 stroke-[2.2]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs sm:text-sm font-bold text-text-primary dark:text-slate-100 line-clamp-1">
                          {tx.description || getLocalizedCategoryName(tx.category)}
                        </h4>
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

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1.5 sm:gap-3 flex-shrink-0">
                      <span className={`text-xs sm:text-sm font-extrabold whitespace-nowrap ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </span>
                      
                      <div className="flex gap-1">
                        <button 
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditTransaction(tx);
                          }}
                          className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 border border-black/5 dark:border-white/5 text-text-secondary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
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
                          className="p-1.5 sm:p-2 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 border border-black/5 dark:border-white/5 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
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
        </div>
      </div>
    </div>
  );
};
