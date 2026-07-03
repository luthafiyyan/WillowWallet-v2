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
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-surface dark:bg-slate-800 border-t border-border-custom dark:border-slate-700 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] pb-safe">
      <div className="max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto h-20 px-6 flex items-center justify-between relative">
        
        {/* Home Tab */}
        <button
          onClick={() => onChangeTab('home')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors ${
            activeTab === 'home'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-300'
          }`}
        >
          <Home className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'home' ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-wide">{t.home}</span>
        </button>

        {/* Transactions Tab */}
        <button
          onClick={() => onChangeTab('transactions')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors ${
            activeTab === 'transactions'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-300'
          }`}
        >
          <ArrowLeftRight className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'transactions' ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-wide">{t.transactions}</span>
        </button>

        {/* Floating Add Button (FAB) Spacer */}
        <div className="flex-1 flex justify-center h-full relative -top-6">
          <button
            onClick={onOpenAddTransaction}
            className="w-15 h-15 bg-primary hover:bg-secondary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 active:scale-90 border-4 border-surface dark:border-slate-800 cursor-pointer"
            aria-label="Tambah Transaksi"
          >
            <Plus className="w-8 h-8 stroke-[3]" />
          </button>
        </div>

        {/* Analytics Tab */}
        <button
          onClick={() => onChangeTab('analytics')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors ${
            activeTab === 'analytics'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-300'
          }`}
        >
          <BarChart3 className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'analytics' ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-wide">{t.analytics}</span>
        </button>

        {/* Profile Tab */}
        <button
          onClick={() => onChangeTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 h-full gap-1.5 transition-colors ${
            activeTab === 'profile'
              ? 'text-primary'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-300'
          }`}
        >
          <User className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'profile' ? 'scale-110 stroke-[2.5px]' : 'stroke-2'}`} />
          <span className="text-[10px] font-medium tracking-wide">{t.profile}</span>
        </button>

      </div>
    </div>
  );
};
