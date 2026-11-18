import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, MessageSquare, Check } from './icons';
import { AnimatePresence, motion } from 'motion/react';
import { Transaction, TransactionType } from '../types';
import { APP_TRANSLATIONS } from '../utils/lang';
import { getCategoryStyle } from '../utils/helpers';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    category: string;
    date: string;
    description: string;
  }) => void;
  categories: string[];
  editingTransaction?: Transaction | null;
  lang?: 'ID' | 'EN';
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  editingTransaction,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].components.bottomSheet;
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const yesterdayStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, []);

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
      'Perawatan Diri': 'Self Care',
      'Pendidikan': 'Education',
      'Lainnya': 'Others',
      'Gaji': 'Salary',
      'Investasi': 'Investment',
      'Sampingan': 'Side Hustle'
    };
    return catMap[catName] || catName;
  };

  const filteredCategories = useMemo(() => {
    if (type === 'income') {
      const incomeSpecific = categories.filter(c => ['Gaji', 'Investasi', 'Sampingan', 'Pendapatan', 'Bonus', 'Salary', 'Investment', 'Side Hustle'].includes(c));
      return incomeSpecific.length > 0 ? incomeSpecific : categories;
    } else {
      const expenseSpecific = categories.filter(c => !['Gaji', 'Investasi', 'Sampingan', 'Pendapatan', 'Bonus', 'Salary', 'Investment', 'Side Hustle'].includes(c));
      return expenseSpecific.length > 0 ? expenseSpecific : categories;
    }
  }, [categories, type]);

  const handleAddAmount = (addVal: number) => {
    const current = parseFloat(amount.replace(/[^0-9.]/g, '')) || 0;
    setAmount((current + addVal).toString());
  };

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(editingTransaction.amount.toString());
        setCategory(editingTransaction.category);
        setDate(editingTransaction.date);
        setDescription(editingTransaction.description || '');
      } else {
        setType('expense');
        setAmount('');
        setCategory(categories[0] || 'Lainnya');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
      }
    }
  }, [isOpen, editingTransaction, categories]);

  useEffect(() => {
    if (!editingTransaction && isOpen && categories.length > 0) {
      if (type === 'income') {
        const defaultIncome = categories.find(c => ['Gaji', 'Investasi', 'Sampingan', 'Pendapatan'].includes(c));
        if (defaultIncome) setCategory(defaultIncome);
      } else {
        const defaultExpense = categories.find(c => !['Gaji', 'Investasi', 'Sampingan', 'Pendapatan'].includes(c));
        if (defaultExpense) setCategory(defaultExpense);
      }
    }
  }, [type, editingTransaction, isOpen, categories]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return;
    }
    onSubmit({
      type,
      amount: parsedAmount,
      category: category || 'Lainnya',
      date: date || new Date().toISOString().split('T')[0],
      description,
    });
    onClose();
  };

  const formatPreview = (val: string) => {
    const num = parseFloat(val);
    if (isNaN(num)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-end"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="bottomsheet-title"
            className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none flex justify-center"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="w-full max-w-md liquid-glass-modal rounded-t-[36px] overflow-hidden flex flex-col max-h-[92vh] pb-safe pointer-events-auto border border-black/5 dark:border-white/10"
            >
              <div className="w-12 h-1.5 bg-black/15 dark:bg-white/20 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />

              <div className="flex items-center justify-between px-6 py-3 border-b border-black/5 dark:border-white/10 flex-shrink-0">
                <h3 id="bottomsheet-title" className="text-lg font-bold text-text-primary dark:text-slate-100">
                  {editingTransaction ? t.editTitle : t.addTitle}
                </h3>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={lang === 'ID' ? 'Tutup form transaksi' : 'Close transaction form'}
                  className="p-1.5 rounded-full bg-slate-100/80 dark:bg-slate-700/60 text-text-secondary hover:text-text-primary dark:hover:text-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSave} className="flex-grow overflow-y-auto px-6 py-4 space-y-5">
                <div className="bg-slate-100/80 dark:bg-slate-900/60 p-1 rounded-2xl flex gap-1 border border-black/5 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      type === 'expense'
                        ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/25'
                        : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                    }`}
                  >
                    {t.expense}
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                      type === 'income'
                        ? 'bg-[#123628] text-white shadow-md shadow-[#123628]/25'
                        : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                    }`}
                  >
                    {t.income}
                  </button>
                </div>

                <div className="space-y-2">
                  <label htmlFor="tx-amount" className="block text-xs font-semibold tracking-wide text-text-secondary uppercase">
                    {t.amount}
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-text-secondary">
                      Rp
                    </span>
                    <input
                      id="tx-amount"
                      type="number"
                      inputMode="numeric"
                      required
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-100/70 dark:bg-slate-800/80 pl-12 pr-4 py-3.5 rounded-2xl text-xl font-bold border border-black/5 dark:border-white/10 focus:border-primary focus:outline-none transition-all text-text-primary dark:text-slate-100 tabular-nums"
                    />
                  </div>

                  {/* Quick amount chips */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                    {[10000, 20000, 50000, 100000, 500000].map((quickVal) => (
                      <button
                        key={quickVal}
                        type="button"
                        onClick={() => handleAddAmount(quickVal)}
                        className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-text-secondary hover:text-text-primary dark:hover:text-slate-200 hover:border-primary transition-all whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        +{quickVal >= 1000 ? `${quickVal / 1000}rb` : quickVal}
                      </button>
                    ))}
                    {amount && (
                      <button
                        type="button"
                        onClick={() => setAmount('')}
                        className="px-2.5 py-1 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 text-xs font-bold hover:bg-rose-500/20 transition-all whitespace-nowrap cursor-pointer active:scale-95"
                      >
                        {t.resetAmount || 'Hapus'}
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-text-secondary italic pl-1">
                    Preview: {formatPreview(amount)}
                  </p>
                </div>

                {/* Visual Category Selector Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold tracking-wide text-text-secondary uppercase">
                      {t.category}
                    </label>
                    <span className="text-xs font-bold text-primary dark:text-emerald-400">
                      {getLocalizedCategoryName(category)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1">
                    {filteredCategories.map((cat) => {
                      const isSelected = category === cat;
                      const catStyle = getCategoryStyle(cat);
                      const IconComp = catStyle.icon;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`group p-2.5 rounded-2xl flex flex-col items-center justify-center gap-1.5 text-center transition-all cursor-pointer border ${
                            isSelected
                              ? 'bg-[#123628]/10 border-[#123628] text-[#123628] dark:bg-[#4ADE80]/20 dark:text-[#4ADE80] dark:border-[#4ADE80] font-bold shadow-xs scale-[1.02]'
                              : 'bg-slate-100/70 dark:bg-slate-800/80 border-slate-200/80 dark:border-slate-700/80 text-text-secondary hover:border-slate-300 dark:hover:border-slate-600 hover:scale-[1.02] active:scale-[0.98]'
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-full ${catStyle.bgClass} ${catStyle.textClass} flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                            <IconComp className="w-5 h-5" />
                          </div>
                          <span className="text-xs leading-tight line-clamp-1 font-medium">
                            {getLocalizedCategoryName(cat)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Date selection with Today / Yesterday shortcuts */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label htmlFor="tx-date" className="block text-xs font-semibold tracking-wide text-text-secondary uppercase">
                      {t.date}
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setDate(todayStr)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          date === todayStr
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-text-secondary border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t.todayOption || 'Hari Ini'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDate(yesterdayStr)}
                        className={`px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          date === yesterdayStr
                            ? 'bg-primary text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-text-secondary border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {t.yesterdayOption || 'Kemarin'}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                    <input
                      id="tx-date"
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-100/70 dark:bg-slate-800/80 pl-12 pr-4 py-3 rounded-2xl text-sm font-medium border border-black/5 dark:border-white/10 focus:border-primary focus:outline-none transition-all text-text-primary dark:text-slate-100 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="tx-desc" className="block text-xs font-semibold tracking-wide text-text-secondary uppercase">
                    {t.description}
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4.5 w-5 h-5 text-text-secondary pointer-events-none" />
                    <textarea
                      id="tx-desc"
                      placeholder={t.descPlaceholder}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full bg-slate-100/70 dark:bg-slate-800/80 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium border border-black/5 dark:border-white/10 focus:border-primary focus:outline-none transition-all text-text-primary dark:text-slate-100 min-h-[80px]"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!amount || parseFloat(amount) <= 0}
                  className="w-full bg-[#123628] hover:bg-[#1C4D3A] text-white py-4 rounded-2xl text-base font-bold shadow-lg shadow-[#123628]/25 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none mt-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                  <span>{editingTransaction ? (lang === 'ID' ? 'Simpan Perubahan' : 'Save Changes') : t.saveBtn}</span>
                </button>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
