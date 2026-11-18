import React, { useState, useEffect } from 'react';
import { X, Target, Plus, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SavingGoal } from '../types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goal: {
    id?: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
  }) => void;
  editingGoal?: SavingGoal | null;
  lang?: 'ID' | 'EN';
}

export const GoalModal: React.FC<GoalModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingGoal,
  lang = 'ID',
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (editingGoal) {
        setTitle(editingGoal.title);
        setTargetAmount(editingGoal.targetAmount.toString());
        setCurrentAmount(editingGoal.currentAmount.toString());
        setDeadline(editingGoal.deadline || '');
      } else {
        setTitle('');
        setTargetAmount('');
        setCurrentAmount('0');
        setDeadline('');
      }
    }
  }, [isOpen, editingGoal]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedTarget = parseFloat(targetAmount.replace(/[^0-9.]/g, ''));
    const parsedCurrent = parseFloat(currentAmount.replace(/[^0-9.]/g, '')) || 0;
    if (!title.trim() || isNaN(parsedTarget) || parsedTarget <= 0) return;

    onSubmit({
      id: editingGoal ? editingGoal.id : undefined,
      title: title.trim(),
      targetAmount: parsedTarget,
      currentAmount: parsedCurrent,
      deadline: deadline || undefined,
    });
    onClose();
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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-center items-end sm:items-center p-0 sm:p-4"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="goal-modal-title"
            className="fixed inset-0 z-50 flex justify-center items-end sm:items-center p-0 sm:p-4 pointer-events-none"
          >
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 50, opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 24, stiffness: 240 }}
              className="liquid-glass-modal rounded-t-[32px] sm:rounded-[32px] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto pointer-events-auto border border-black/5 dark:border-white/10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/5 dark:border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-[#1B8A5A] dark:text-emerald-400 flex items-center justify-center">
                    <Target className="w-4.5 h-4.5" />
                  </div>
                  <h3 id="goal-modal-title" className="text-base font-bold text-text-primary dark:text-slate-100">
                    {editingGoal
                      ? (lang === 'ID' ? 'Edit Target Tabungan' : 'Edit Savings Goal')
                      : (lang === 'ID' ? 'Target Tabungan Baru' : 'New Savings Goal')}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label={lang === 'ID' ? 'Tutup dialog' : 'Close dialog'}
                  className="p-1.5 rounded-full bg-slate-100/80 dark:bg-slate-700/60 text-text-secondary hover:text-text-primary dark:hover:text-slate-100 transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label htmlFor="goal-title" className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">
                    {lang === 'ID' ? 'Nama Target (contoh: Dana Darurat, Beli Laptop)' : 'Goal Name (e.g. Emergency Fund, Laptop)'}
                  </label>
                  <input
                    id="goal-title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder={lang === 'ID' ? 'Masukkan nama target' : 'Enter goal title'}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary dark:text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="goal-target" className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">
                    {lang === 'ID' ? 'Nominal Sasaran (Rp)' : 'Target Amount (Rp)'}
                  </label>
                  <input
                    id="goal-target"
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    placeholder="0"
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary dark:text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="goal-current" className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">
                    {lang === 'ID' ? 'Terkumpul Saat Ini (Rp)' : 'Current Accumulated (Rp)'}
                  </label>
                  <input
                    id="goal-current"
                    type="number"
                    min="0"
                    step="1000"
                    value={currentAmount}
                    onChange={(e) => setCurrentAmount(e.target.value)}
                    placeholder="0"
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary dark:text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label htmlFor="goal-deadline" className="block text-xs font-semibold text-text-secondary dark:text-slate-400 mb-1">
                    {lang === 'ID' ? 'Tenggat Waktu (Opsional)' : 'Target Date (Optional)'}
                  </label>
                  <input
                    id="goal-deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full liquid-glass-input rounded-xl px-3.5 py-2.5 text-xs font-semibold text-text-primary dark:text-slate-100 focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-750 text-xs font-bold text-text-secondary hover:text-text-primary transition-all cursor-pointer"
                  >
                    {lang === 'ID' ? 'Batal' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl forest-pill-active text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{editingGoal ? (lang === 'ID' ? 'Simpan' : 'Save') : (lang === 'ID' ? 'Buat Target' : 'Create Goal')}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
