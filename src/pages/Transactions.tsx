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

interface TransactionsProps {
  transactions: Transaction[];
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

type TimeFilter = 'today' | 'week' | 'month' | 'year' | 'all';
type TypeFilter = 'all' | 'income' | 'expense';

export const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  const [search, setSearch] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');

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
          Riwayat Transaksi
        </h2>
        <p className="text-xs text-text-secondary dark:text-slate-400 mt-0.5">
          Cari, saring, dan kelola seluruh catatan transaksi Anda secara realtime.
        </p>
      </div>

      {/* Realtime Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
        <input
          type="text"
          placeholder="Cari deskripsi atau kategori..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-surface dark:bg-slate-800 border border-border-custom dark:border-slate-700/60 rounded-2xl pl-12 pr-10 py-3.5 text-sm font-medium focus:border-primary focus:bg-surface focus:outline-none shadow-soft transition-all text-text-primary dark:text-slate-100 placeholder:text-slate-400"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full bg-brand-bg dark:bg-slate-700 text-text-secondary"
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
              Rentang Waktu
            </h5>
            <div className="flex flex-wrap lg:flex-col gap-1.5 bg-surface dark:bg-slate-800 p-2 rounded-2xl border border-border-custom dark:border-slate-700/60">
              <button
                onClick={() => setTimeFilter('all')}
                className={`flex-grow text-center lg:text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'all'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                Semua Rentang
              </button>
              <button
                onClick={() => setTimeFilter('today')}
                className={`flex-grow text-center lg:text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'today'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setTimeFilter('week')}
                className={`flex-grow text-center lg:text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'week'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => setTimeFilter('month')}
                className={`flex-grow text-center lg:text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'month'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                Bulan Ini
              </button>
              <button
                onClick={() => setTimeFilter('year')}
                className={`flex-grow text-center lg:text-left px-4 py-2.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  timeFilter === 'year'
                    ? 'bg-primary text-white shadow-soft'
                    : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                Tahun Ini
              </button>
            </div>
          </div>

          {/* Transaction Type Filters */}
          <div className="space-y-2">
            <h5 className="text-[10px] font-bold text-text-secondary dark:text-slate-400 uppercase tracking-wider pl-1">
              Jenis Aliran
            </h5>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setTypeFilter('all')}
                className={`w-full py-2.5 text-xs font-bold border rounded-xl transition-all cursor-pointer ${
                  typeFilter === 'all'
                    ? 'bg-slate-200 dark:bg-slate-700 text-text-primary dark:text-slate-100 border-transparent'
                    : 'bg-surface dark:bg-slate-800 border-border-custom dark:border-slate-700/60 text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                Semua Jenis
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`w-full py-2.5 text-xs font-bold border rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  typeFilter === 'income'
                    ? 'bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                    : 'bg-surface dark:bg-slate-800 border-border-custom dark:border-slate-700/60 text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
                Pemasukan
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`w-full py-2.5 text-xs font-bold border rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  typeFilter === 'expense'
                    ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    : 'bg-surface dark:bg-slate-800 border-border-custom dark:border-slate-700/60 text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
                Pengeluaran
              </button>
            </div>
          </div>

          {/* Sums overview of active filters */}
          <div className="grid grid-cols-2 gap-3 bg-brand-bg dark:bg-slate-900/40 p-4 rounded-2xl border border-border-custom dark:border-slate-700/40">
            <div>
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Filter Masuk
              </p>
              <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                +{formatRupiah(filteredIncome)}
              </p>
            </div>
            <div className="border-l border-border-custom dark:border-slate-700/50 pl-4">
              <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">
                Filter Keluar
              </p>
              <p className="text-sm font-bold text-rose-500 mt-0.5">
                -{formatRupiah(filteredExpense)}
              </p>
            </div>
          </div>

        </div>

        {/* Right Side: Results Card list (Takes 8/12 cols on desktop) */}
        <div className="lg:col-span-8 space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="bg-surface dark:bg-slate-800 p-12 rounded-[28px] border border-dashed border-border-custom dark:border-slate-700 text-center flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-brand-bg dark:bg-slate-700 flex items-center justify-center text-text-secondary mb-1">
                <SlidersHorizontal className="w-6 h-6 text-text-secondary/60" />
              </div>
              <h4 className="text-sm font-bold text-text-primary dark:text-slate-100">
                Transaksi tidak ditemukan
              </h4>
              <p className="text-xs text-text-secondary dark:text-slate-400 max-w-xs leading-relaxed">
                Coba ganti kata kunci pencarian atau bersihkan filter saringan Anda untuk melihat hasil.
              </p>
              <button
                onClick={clearFilters}
                className="text-xs bg-primary text-white px-5 py-2.5 rounded-xl font-semibold shadow-soft hover:bg-secondary transition-all cursor-pointer mt-2"
              >
                Reset Saringan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredTransactions.map((tx) => {
                const style = getCategoryStyle(tx.category);
                return (
                  <div 
                    key={tx.id}
                    className="bg-surface dark:bg-slate-800 p-4 rounded-2xl border border-border-custom dark:border-slate-700/60 shadow-soft flex items-center justify-between group hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl ${style.bgClass} ${style.textClass} flex items-center justify-center flex-shrink-0`}>
                        <style.icon className="w-5.5 h-5.5 stroke-[2.2]" />
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-text-primary dark:text-slate-100 line-clamp-1">
                          {tx.description || tx.category}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-semibold text-text-secondary dark:text-slate-400">
                            {tx.category}
                          </span>
                          <span className="w-1 h-1 rounded-full bg-border-custom dark:bg-slate-700" />
                          <span className="text-[10px] text-text-secondary dark:text-slate-500 font-medium">
                            {tx.date}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right hand layout for Amount and controls */}
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
                        {tx.type === 'income' ? '+' : '-'} {formatRupiah(tx.amount)}
                      </span>
                      
                      <div className="flex gap-1">
                        <button 
                          onClick={() => onEditTransaction(tx)}
                          className="p-1.5 rounded-lg bg-brand-bg dark:bg-slate-700 text-text-secondary hover:text-primary hover:bg-primary/10 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button 
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg bg-brand-bg dark:bg-slate-700 text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Hapus"
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
