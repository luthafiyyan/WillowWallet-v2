import React from 'react';
import { 
  X, 
  Calendar, 
  Tag, 
  FileText, 
  Clock, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History 
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Transaction } from '../types';
import { formatRupiah, getCategoryStyle } from '../utils/helpers';
import { APP_TRANSLATIONS } from '../utils/lang';

interface TransactionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  lang?: 'ID' | 'EN';
}

export const TransactionDetailModal: React.FC<TransactionDetailModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onEdit,
  onDelete,
  lang = 'ID',
}) => {
  if (!transaction) return null;

  const t = APP_TRANSLATIONS[lang].components.detailModal;
  const isIncome = transaction.type === 'income';
  const categoryStyle = getCategoryStyle(transaction.category);
  const CategoryIcon = categoryStyle.icon;

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

  // Format Local Date
  const formatLocalDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat(lang === 'ID' ? 'id-ID' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (e) {
      return dateStr;
    }
  };

  // Format timestamp to readable string
  const formatTimestamp = (timestamp: number) => {
    if (!timestamp) return '-';
    try {
      const date = new Date(timestamp);
      return new Intl.DateTimeFormat(lang === 'ID' ? 'id-ID' : 'en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).format(date);
    } catch (e) {
      return new Date(timestamp).toLocaleString();
    }
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 15 }}
              transition={{ type: 'spring', damping: 26, stiffness: 340 }}
              className="liquid-glass-modal rounded-[32px] w-full max-w-md overflow-hidden pointer-events-auto flex flex-col"
            >
              
              {/* Modal Header Bar */}
              <div className="px-6 pt-5 pb-3 flex items-center justify-between border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-xl ${isIncome ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/15 text-rose-500 border border-rose-500/20'} flex items-center justify-center`}>
                    {isIncome ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownLeft className="w-4 h-4" />}
                  </div>
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-widest">
                    {isIncome ? t.titleIncome : t.titleExpense}
                  </span>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-slate-100/80 dark:hover:bg-slate-700/60 text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-5">
                
                {/* Big Amount Typography */}
                <div className="text-center py-4 bg-slate-100/70 dark:bg-slate-800/80 rounded-2xl border border-black/5 dark:border-white/10">
                  <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block mb-1">
                    {t.txAmount}
                  </span>
                  <h3 className={`text-2xl font-bold tracking-tight ${isIncome ? 'text-[#16A34A] dark:text-emerald-400' : 'text-[#EF4444] dark:text-rose-400'}`}>
                    {isIncome ? '+' : '-'} {formatRupiah(transaction.amount)}
                  </h3>
                </div>

                {/* Metadata Grid */}
                <div className="space-y-4">
                  
                  {/* Description / Keterangan */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                        {t.description}
                      </span>
                      <p className="text-xs font-semibold text-text-primary dark:text-slate-200 leading-relaxed break-words">
                        {transaction.description || t.noDescription}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg ${categoryStyle.bgClass} ${categoryStyle.textClass} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                      <CategoryIcon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                        {t.category}
                      </span>
                      <p className="text-xs font-bold text-text-primary dark:text-slate-200">
                        {getLocalizedCategoryName(transaction.category)}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-text-secondary flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider block">
                        {t.date}
                      </span>
                      <p className="text-xs font-semibold text-text-primary dark:text-slate-200">
                        {formatLocalDate(transaction.date)}
                      </p>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="border-t border-border-custom dark:border-slate-700/50 pt-3.5 mt-2 space-y-2.5">
                    
                    {/* Created At */}
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-text-secondary flex items-center gap-1.5 font-medium">
                        <Clock className="w-3.5 h-3.5 text-text-secondary/60" />
                        {t.loggedAt}
                      </span>
                      <span className="font-semibold text-text-primary dark:text-slate-300">
                        {formatTimestamp(transaction.createdAt)}
                      </span>
                    </div>

                    {/* Updated At */}
                    {transaction.updatedAt && transaction.updatedAt !== transaction.createdAt && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-text-secondary flex items-center gap-1.5 font-medium">
                          <History className="w-3.5 h-3.5 text-text-secondary/60" />
                          {t.lastEdited}
                        </span>
                        <span className="font-semibold text-text-primary dark:text-slate-300">
                          {formatTimestamp(transaction.updatedAt)}
                        </span>
                      </div>
                    )}

                  </div>

                </div>

              </div>

              {/* Modal Footer Controls */}
              <div className="p-6 pt-0 flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onEdit(transaction);
                  }}
                  className="flex-1 py-3 text-xs font-bold rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  {t.editBtn}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onDelete(transaction.id);
                  }}
                  className="flex-1 py-3 text-xs font-bold rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20 transition-all active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  {t.deleteBtn}
                </button>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
