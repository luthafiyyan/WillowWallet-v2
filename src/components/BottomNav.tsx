import React from 'react';
import { Home, ArrowLeftRight, Plus, BarChart3, User } from 'lucide-react';
import { APP_TRANSLATIONS } from '../utils/lang';

export type TabId = 'home' | 'transactions' | 'analytics' | 'profile';

interface BottomNavProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  onOpenAddTransaction: () => void;
  lang?: 'ID' | 'EN';
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  onOpenAddTransaction,
  lang = 'ID',
}) => {
  const t = APP_TRANSLATIONS[lang].nav;

  return (
    <div className="fixed bottom-3 sm:bottom-5 left-3 sm:left-4 right-3 sm:right-4 max-w-lg mx-auto z-40 pb-safe pointer-events-none">
      {/* Floating Island Dock with Liquid Frosted Glass */}
      <div className="liquid-glass-dock rounded-[28px] sm:rounded-[32px] px-2 sm:px-3 py-1.5 sm:py-2 flex items-center justify-between pointer-events-auto transition-all duration-300">
        
        {/* Home Tab */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'home'
              ? 'bg-emerald-500/12 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'home' ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">{t.home}</span>
        </button>

        {/* Transactions Tab */}
        <button
          onClick={() => onChangeTab('transactions')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'transactions'
              ? 'bg-emerald-500/12 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
          }`}
        >
          <ArrowLeftRight className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'transactions' ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">{t.transactions}</span>
        </button>

        {/* Center Glowing Action Button */}
        <div className="px-1.5 flex-shrink-0">
          <button
            onClick={onOpenAddTransaction}
            className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#1B8A5A] to-[#34D399] dark:from-[#10B981] dark:to-[#059669] text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:shadow-xl hover:shadow-emerald-600/40 hover:scale-105 active:scale-90 transition-all duration-200 border border-white/40 cursor-pointer"
            aria-label="Tambah Transaksi"
            title={lang === 'ID' ? 'Catat Transaksi Baru' : 'Add New Transaction'}
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Analytics Tab */}
        <button
          onClick={() => onChangeTab('analytics')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-emerald-500/12 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
          }`}
        >
          <BarChart3 className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'analytics' ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">{t.analytics}</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-emerald-500/12 dark:bg-emerald-400/15 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
          }`}
        >
          <User className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'profile' ? 'scale-110 stroke-[2.5px]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] tracking-tight mt-0.5">{t.profile}</span>
        </button>

      </div>
    </div>
  );
};
