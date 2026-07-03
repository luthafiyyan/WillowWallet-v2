import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { APP_TRANSLATIONS } from '../utils/lang';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  lang?: 'ID' | 'EN';
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].components.dialog;
  const resolvedCancel = cancelText || t.cancelBtn;
  const resolvedConfirm = confirmText || t.confirmBtn;

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
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          />

          {/* Dialog Card */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-surface dark:bg-slate-800 rounded-3xl p-6 shadow-medium max-w-sm w-full pointer-events-auto border border-border-custom dark:border-slate-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center text-rose-500">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-bold text-text-primary dark:text-slate-100">
                  {title}
                </h4>
              </div>

              <p className="text-sm text-text-secondary dark:text-slate-300 mb-6 leading-relaxed">
                {message}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 text-sm font-semibold rounded-2xl bg-brand-bg dark:bg-slate-700 text-text-secondary hover:text-text-primary dark:hover:text-slate-100 transition-all active:scale-98"
                >
                  {resolvedCancel}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className="flex-1 py-3 text-sm font-semibold rounded-2xl bg-rose-500 hover:bg-rose-600 text-white shadow-soft hover:shadow-md transition-all active:scale-98 flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  {resolvedConfirm}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
