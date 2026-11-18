import React from 'react';
import { Home, BarChart2, ArrowLeftRight, User, Plus } from 'lucide-react';
import { APP_TRANSLATIONS } from '../utils/lang';

export type TabId = 'home' | 'analytics' | 'transactions' | 'profile';

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
    <nav 
      aria-label={lang === 'ID' ? 'Navigasi utama' : 'Main navigation'}
      className="fixed bottom-0 left-0 right-0 z-40 pb-safe pointer-events-none"
    >
      <div className="max-w-md mx-auto px-4 pb-3 sm:pb-4 pointer-events-auto">
        <div className="liquid-glass-dock rounded-[28px] sm:rounded-[32px] px-3 py-2 flex items-center justify-between transition-all duration-300">
          
          {/* 1. Home */}
          <button
            type="button"
            onClick={() => onChangeTab('home')}
            aria-current={activeTab === 'home' ? 'page' : undefined}
            aria-label={t.home}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#123628] dark:text-[#4ADE80] font-bold'
                : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'home' ? 'bg-[#123628]/10 dark:bg-[#4ADE80]/15' : ''}`}>
              <Home className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'home' ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{t.home}</span>
          </button>

          {/* 2. Analytics */}
          <button
            type="button"
            onClick={() => onChangeTab('analytics')}
            aria-current={activeTab === 'analytics' ? 'page' : undefined}
            aria-label={t.analytics}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'analytics'
                ? 'text-[#123628] dark:text-[#4ADE80] font-bold'
                : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'analytics' ? 'bg-[#123628]/10 dark:bg-[#4ADE80]/15' : ''}`}>
              <BarChart2 className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'analytics' ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{t.analytics}</span>
          </button>

          {/* 3. Center Action Floating Button (Dark Forest Green Signature Button) */}
          <div className="px-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={onOpenAddTransaction}
              className="w-12 h-12 rounded-full bg-[#123628] dark:bg-[#1E4E3B] text-white flex items-center justify-center shadow-lg shadow-[#123628]/35 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white/30 dark:border-white/15 cursor-pointer group"
              aria-label={lang === 'ID' ? 'Catat Transaksi Baru' : 'Record New Transaction'}
              title={lang === 'ID' ? 'Catat Transaksi Baru' : 'Record New Transaction'}
            >
              <Plus className="w-6 h-6 stroke-[2.8] group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* 4. Transactions / Cards */}
          <button
            type="button"
            onClick={() => onChangeTab('transactions')}
            aria-current={activeTab === 'transactions' ? 'page' : undefined}
            aria-label={t.transactions}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'transactions'
                ? 'text-[#123628] dark:text-[#4ADE80] font-bold'
                : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'transactions' ? 'bg-[#123628]/10 dark:bg-[#4ADE80]/15' : ''}`}>
              <ArrowLeftRight className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'transactions' ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">
              {lang === 'ID' ? 'Riwayat' : 'Cards'}
            </span>
          </button>

          {/* 5. Profile */}
          <button
            type="button"
            onClick={() => onChangeTab('profile')}
            aria-current={activeTab === 'profile' ? 'page' : undefined}
            aria-label={t.profile}
            className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
              activeTab === 'profile'
                ? 'text-[#123628] dark:text-[#4ADE80] font-bold'
                : 'text-text-secondary hover:text-text-primary dark:hover:text-slate-200'
            }`}
          >
            <div className={`p-1 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-[#123628]/10 dark:bg-[#4ADE80]/15' : ''}`}>
              <User className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'profile' ? 'scale-110 stroke-[2.4px]' : 'stroke-[1.8]'}`} />
            </div>
            <span className="text-[10px] tracking-tight mt-0.5">{t.profile}</span>
          </button>

        </div>
      </div>
    </nav>
  );
};
