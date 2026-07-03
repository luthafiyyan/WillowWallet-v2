import React, { useState, useEffect } from 'react';
import { X, Calendar, MessageSquare, Plus, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Transaction, TransactionType } from '../types';
import { APP_TRANSLATIONS } from '../utils/lang';

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

  // Handle defaults and editing pre-fills
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
        // Pick first category or default
        setCategory(categories[0] || 'Lainnya');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
      }
    }
  }, [isOpen, editingTransaction, categories]);

  // Adjust default category based on type (pemasukan vs pengeluaran standard filters can also be applied if wanted, but having standard dynamic dropdown works)
  useEffect(() => {
    if (!editingTransaction && isOpen && categories.length > 0) {
      // Find suitable default category
      if (type === 'income') {
        const defaultIncome = categories.find(c => ['Gaji', 'Investasi', 'Sampingan', 'Pendapatan'].includes(c));
        if (defaultIncome) setCategory(defaultIncome);
      } else {
        const defaultExpense = categories.find(c => !['Gaji', 'Investasi', 'Sampingan', 'Pendapatan'].includes(c));
        if (defaultExpense) setCategory(defaultExpense);
      }
    }
  }, [type, editingTransaction, isOpen, categories]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      return; // Validation handled in parent or here
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

  // Helper to format currency preview inside the sheet input
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-end"
          />

          {/* Bottom Sheet Container */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-surface dark:bg-slate-800 rounded-t-[32px] shadow-medium max-w-md mx-auto overflow-hidden flex flex-col max-h-[92vh] pb-safe"
          >
            {/* Header notch */}
            <div className="w-12 h-1.5 bg-border-custom dark:bg-slate-700 rounded-full mx-auto mt-4 mb-2 flex-shrink-0" />

            {/* Header title */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border-custom dark:border-slate-700 flex-shrink-0">
              <h3 className="text-lg font-bold text-text-primary dark:text-slate-100">
                {editingTransaction ? t.editTitle : t.addTitle}
              </h3>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full bg-brand-bg dark:bg-slate-700 text-text-secondary hover:text-text-primary dark:hover:text-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Scrollable Section */}
            <form onSubmit={handleSave} className="flex-grow overflow-y-auto px-6 py-4 space-y-6">
              
              {/* Type Toggle Segmented Control */}
              <div className="bg-brand-bg dark:bg-slate-900/60 p-1 rounded-2xl flex gap-1">
                <button
                  type="button"
                  onClick={() => setType('expense')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${
                    type === 'expense'
                      ? 'bg-rose-500 text-white shadow-soft'
                      : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                  }`}
                >
                  {t.expense}
                </button>
                <button
                  type="button"
                  onClick={() => setType('income')}
                  className={`flex-1 py-3 text-sm font-semibold rounded-xl transition-all ${
                    type === 'income'
                      ? 'bg-emerald-600 text-white shadow-soft'
                      : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
                  }`}
                >
                  {t.income}
                </button>
              </div>

              {/* Amount Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
                  {t.amount}
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-text-secondary">
                    Rp
                  </span>
                  <input
                    type="number"
                    inputMode="numeric"
                    required
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-brand-bg dark:bg-slate-900/40 pl-12 pr-4 py-4 rounded-2xl text-xl font-bold border border-transparent focus:border-primary focus:bg-surface dark:focus:bg-slate-800 focus:outline-none transition-all text-text-primary dark:text-slate-100"
                  />
                </div>
                <p className="text-xs text-text-secondary italic pl-1">
                  Preview: {formatPreview(amount)}
                </p>
              </div>

              {/* Category Dropdown */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
                  {t.category}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-brand-bg dark:bg-slate-900/40 px-4 py-3.5 rounded-2xl text-sm font-medium border border-transparent focus:border-primary focus:bg-surface dark:focus:bg-slate-800 focus:outline-none transition-all text-text-primary dark:text-slate-100 appearance-none"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 16px center',
                    backgroundSize: '16px'
                  }}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {lang === 'EN' && cat === 'Makanan' ? 'Food & Drink' :
                       lang === 'EN' && cat === 'Transportasi' ? 'Transportation' :
                       lang === 'EN' && cat === 'Belanja' ? 'Shopping' :
                       lang === 'EN' && cat === 'Hiburan' ? 'Entertainment' :
                       lang === 'EN' && cat === 'Tagihan' ? 'Bills & Utilities' :
                       lang === 'EN' && cat === 'Lainnya' ? 'Others' :
                       lang === 'EN' && cat === 'Gaji' ? 'Salary' :
                       lang === 'EN' && cat === 'Investasi' ? 'Investment' :
                       lang === 'EN' && cat === 'Sampingan' ? 'Side Hustle' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
                  {t.date}
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-brand-bg dark:bg-slate-900/40 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium border border-transparent focus:border-primary focus:bg-surface dark:focus:bg-slate-800 focus:outline-none transition-all text-text-primary dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold tracking-wide text-text-secondary uppercase">
                  {t.description}
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-4 top-4.5 w-5 h-5 text-text-secondary" />
                  <textarea
                    placeholder={t.descPlaceholder}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-brand-bg dark:bg-slate-900/40 pl-12 pr-4 py-3.5 rounded-2xl text-sm font-medium border border-transparent focus:border-primary focus:bg-surface dark:focus:bg-slate-800 focus:outline-none transition-all text-text-primary dark:text-slate-100 min-h-[80px]"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!amount || parseFloat(amount) <= 0}
                className="w-full bg-primary hover:bg-secondary text-white py-4 rounded-2xl text-base font-semibold shadow-medium hover:shadow-lg hover:-translate-y-0.5 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none mt-4 flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                {editingTransaction ? (lang === 'ID' ? 'Simpan Perubahan' : 'Save Changes') : t.saveBtn}
              </button>

            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
