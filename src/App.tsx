import { useState, useEffect } from 'react';
import { AppUser, Transaction, Budget, SavingGoal, BackupData } from './types';
import { auth } from './firebase/config';
import { 
  subscribeToTransactions, 
  subscribeToBudgets, 
  subscribeToCategories,
  subscribeToGoals,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  saveBudget,
  deleteBudget,
  saveCategories,
  deleteCategory,
  saveGoal,
  deleteGoal,
  restoreFullBackup
} from './services/db';
import { ToastProvider, useToast } from './components/Toast';
import { BottomNav, TabId } from './components/BottomNav';
import { BottomSheet } from './components/BottomSheet';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { GoalModal } from './components/GoalModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { SplashScreen } from './components/SplashScreen';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { Loader2, RefreshCw } from './components/icons';
import { APP_TRANSLATIONS } from './utils/lang';
import { 
  registerServiceWorker, 
  initInstallPromptListener, 
  triggerInstallPrompt 
} from './services/pwa';
import { AnimatePresence, motion } from 'motion/react';

function AppContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [swUpdateRegistration, setSwUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>('home');

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportSelectedMonth, setReportSelectedMonth] = useState(() => new Date().toISOString().substring(0, 7));

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'transaction' | 'budget' | 'goal' | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('WILLOW_THEME') === 'dark';
  });

  const [lang, setLang] = useState<'ID' | 'EN'>(() => {
    return (localStorage.getItem('WILLOW_LANG') as 'ID' | 'EN') || 'ID';
  });

  useEffect(() => {
    localStorage.setItem('WILLOW_LANG', lang);
  }, [lang]);

  const t = APP_TRANSLATIONS[lang];
  const gt = t.global;

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('WILLOW_THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('WILLOW_THEME', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    registerServiceWorker({
      onUpdateAvailable: (registration) => {
        setSwUpdateRegistration(registration);
        showToast(
          lang === 'ID' 
            ? 'Versi baru tersedia! Silakan perbarui.' 
            : 'A new version is available! Please update.', 
          'info'
        );
      },
      onInstalled: () => {
        showToast(
          lang === 'ID' 
            ? 'WillowWallet siap digunakan offline!' 
            : 'WillowWallet is ready for offline use!', 
          'success'
        );
      },
      onOfflineStatusChange: (offline) => {
        if (offline) {
          showToast(
            lang === 'ID'
              ? 'Koneksi internet terputus. Menggunakan mode offline.'
              : 'Connection lost. Working offline.',
            'warning'
          );
        } else {
          showToast(
            lang === 'ID'
              ? 'Koneksi kembali online! Menyinkronkan...'
              : 'Connection restored! Syncing...',
            'success'
          );
        }
      }
    });

    initInstallPromptListener(() => {
      setShowInstallPrompt(true);
    });
  }, [lang, showToast]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((firebaseUser) => {
      setAuthLoading(false);
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || 'Pengguna',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
        setTransactions([]);
        setBudgets([]);
        setCategories([]);
        setGoals([]);
      }
    });
    return unsub;
  }, []);

  useEffect(() => {
    if (!user) return;
    
    setDbLoading(true);
    let unsubTxs = () => {};
    let unsubBudgets = () => {};
    let unsubCategories = () => {};
    let unsubGoals = () => {};

    try {
      unsubTxs = subscribeToTransactions(user.uid, (txList) => {
        setTransactions(txList);
        setDbLoading(false);
      });

      unsubBudgets = subscribeToBudgets(user.uid, (budgetList) => {
        setBudgets(budgetList);
      });

      unsubCategories = subscribeToCategories(user.uid, (catList) => {
        setCategories(catList);
      });

      unsubGoals = subscribeToGoals(user.uid, (goalList) => {
        setGoals(goalList);
      });
    } catch (e) {
      console.error('Database Subscription Error', e);
      showToast(lang === 'ID' ? 'Gagal memuat database realtime' : 'Failed to load realtime database', 'error');
      setDbLoading(false);
    }

    return () => {
      unsubTxs();
      unsubBudgets();
      unsubCategories();
      unsubGoals();
    };
  }, [user]);

  const handleSheetSubmit = async (data: {
    type: 'income' | 'expense';
    amount: number;
    category: string;
    date: string;
    description: string;
  }) => {
    if (!user) return;

    try {
      if (editingTransaction) {
        await updateTransaction(user.uid, editingTransaction.id, data);
        showToast(gt.txUpdateSuccess, 'success');
      } else {
        await addTransaction(user.uid, data);
        showToast(gt.txSaveSuccess, 'success');
      }
    } catch (error) {
      console.error('Error saving transaction', error);
      showToast(gt.txSaveError, 'error');
    }
    setEditingTransaction(null);
  };

  const handleEditTransactionClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsSheetOpen(true);
  };

  const handleDeleteTransactionClick = (id: string) => {
    setDeleteId(id);
    setDeleteType('transaction');
  };

  const handleDeleteBudgetClick = (id: string) => {
    setDeleteId(id);
    setDeleteType('budget');
  };

  const handleDeleteGoalClick = (id: string) => {
    setDeleteId(id);
    setDeleteType('goal');
  };

  const handleConfirmDelete = async () => {
    if (!user || !deleteId || !deleteType) return;

    try {
      if (deleteType === 'transaction') {
        await deleteTransaction(user.uid, deleteId);
        showToast(gt.txDeleteSuccess, 'success');
      } else if (deleteType === 'budget') {
        await deleteBudget(user.uid, deleteId);
        showToast(gt.budgetDeleteSuccess, 'success');
      } else if (deleteType === 'goal') {
        await deleteGoal(user.uid, deleteId);
        showToast(gt.goalDeleteSuccess, 'success');
      }
    } catch (error) {
      console.error('Error deleting record', error);
      showToast(lang === 'ID' ? 'Gagal menghapus data' : 'Failed to delete data', 'error');
    }
    
    setDeleteId(null);
    setDeleteType(null);
  };

  const handleSaveBudget = async (category: string, limit: number) => {
    if (!user) return;
    try {
      await saveBudget(user.uid, category, limit);
      showToast(lang === 'ID' ? `Anggaran ${category} berhasil disimpan!` : `Budget for ${category} successfully saved!`, 'success');
    } catch (e) {
      console.error('Error saving budget', e);
      showToast(gt.budgetError, 'error');
    }
  };

  const handleSaveGoal = async (data: {
    id?: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
  }) => {
    if (!user) return;
    try {
      await saveGoal(user.uid, data);
      showToast(gt.goalSaveSuccess, 'success');
      setIsGoalModalOpen(false);
      setEditingGoal(null);
    } catch (e) {
      console.error('Error saving goal', e);
      showToast(lang === 'ID' ? 'Gagal menyimpan target' : 'Failed to save goal', 'error');
    }
  };

  const handleRestoreBackup = async (backup: BackupData) => {
    if (!user) return;
    try {
      await restoreFullBackup(user.uid, backup);
      showToast(gt.restoreSuccess, 'success');
    } catch (e) {
      console.error('Error restoring backup', e);
      showToast(gt.restoreError, 'error');
    }
  };

  const handleDeleteCategory = async (catToDelete: string) => {
    if (!user) return;
    try {
      await deleteCategory(user.uid, categories, catToDelete);
      showToast(lang === 'ID' ? `Kategori "${catToDelete}" dihapus` : `Category "${catToDelete}" removed`, 'info');
    } catch (e) {
      console.error('Error removing category', e);
    }
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('WILLOW_FORCE_SANDBOX');
      localStorage.removeItem('WILLOW_SANDBOX_USER');
      await auth.signOut();
      showToast(lang === 'ID' ? 'Berhasil keluar sesi' : 'Logged out successfully', 'info');
      setActiveTab('home');
    } catch (e) {
      showToast(gt.logoutError, 'error');
    }
  };

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F0F4F8] dark:bg-[#060B14] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary mt-3">
          {lang === 'ID' ? 'Memuat sistem WillowWallet v2...' : 'Loading WillowWallet v2...'}
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Login 
        onLoginSuccess={() => showToast(lang === 'ID' ? 'Selamat datang kembali!' : 'Welcome back!', 'success')} 
        lang={lang}
        onLangChange={setLang}
      />
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F0F4F8] dark:bg-[#060B14] flex flex-col relative overflow-x-hidden">
      <div 
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none -z-10 bg-[radial-gradient(ellipse_at_top_left,rgba(27,138,90,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.06),transparent_50%)]" 
      />

      <main className="flex-grow w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 relative z-10">
        {dbLoading && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md shadow-soft border border-white/70 dark:border-slate-700/50 rounded-full py-1.5 px-3.5 flex items-center gap-2 text-[10px] font-semibold text-text-secondary">
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            {gt.syncingData}
          </div>
        )}

        {activeTab === 'home' && (
          <Home 
            user={user}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            onOpenAddTransaction={() => {
              setEditingTransaction(null);
              setIsSheetOpen(true);
            }}
            onOpenAddGoal={() => {
              setEditingGoal(null);
              setIsGoalModalOpen(true);
            }}
            onOpenMonthlyReport={() => {
              setReportSelectedMonth(new Date().toISOString().substring(0, 7));
              setIsReportModalOpen(true);
            }}
            onEditTransaction={handleEditTransactionClick}
            onDeleteTransaction={handleDeleteTransactionClick}
            onDeleteGoal={handleDeleteGoalClick}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onViewTransaction={setDetailTransaction}
            lang={lang}
          />
        )}

        {activeTab === 'transactions' && (
          <Transactions 
            transactions={transactions}
            categories={categories}
            onEditTransaction={handleEditTransactionClick}
            onDeleteTransaction={handleDeleteTransactionClick}
            onViewTransaction={setDetailTransaction}
            lang={lang}
          />
        )}

        {activeTab === 'analytics' && (
          <Analytics 
            transactions={transactions}
            budgets={budgets}
            categories={categories}
            onSaveBudget={handleSaveBudget}
            onDeleteBudget={handleDeleteBudgetClick}
            onNavigateTab={setActiveTab}
            onOpenMonthlyReport={(m) => {
              if (m) setReportSelectedMonth(m);
              setIsReportModalOpen(true);
            }}
            lang={lang}
          />
        )}

        {activeTab === 'profile' && (
          <Profile 
            user={user}
            transactions={transactions}
            budgets={budgets}
            goals={goals}
            categories={categories}
            onLogout={handleLogout}
            darkMode={darkMode}
            onToggleDarkMode={() => setDarkMode(prev => !prev)}
            lang={lang}
            onSelectLanguage={(newLang) => setLang(newLang)}
            onAddCategory={async (newCat) => {
              const trimmed = newCat.trim();
              if (!trimmed || categories.includes(trimmed)) return;
              const updated = [...categories, trimmed];
              setCategories(updated);
              if (user) {
                await saveCategories(user.uid, updated);
              }
              showToast(
                lang === 'ID' 
                  ? `Kategori "${trimmed}" berhasil ditambahkan!` 
                  : `Category "${trimmed}" added!`, 
                'success'
              );
            }}
            onDeleteCategory={handleDeleteCategory}
            onRestoreBackup={handleRestoreBackup}
            showInstallBtn={showInstallPrompt}
            onTriggerInstall={async () => {
              const accepted = await triggerInstallPrompt();
              if (accepted) {
                showToast(lang === 'ID' ? 'Aplikasi berhasil dipasang!' : 'Application installed successfully!', 'success');
                setShowInstallPrompt(false);
              }
            }}
          />
        )}
      </main>

      <BottomNav 
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenAddTransaction={() => {
          setEditingTransaction(null);
          setIsSheetOpen(true);
        }}
        lang={lang}
      />

      <BottomSheet 
        isOpen={isSheetOpen}
        onClose={() => {
          setIsSheetOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSheetSubmit}
        categories={categories}
        editingTransaction={editingTransaction}
        lang={lang}
      />

      <GoalModal
        isOpen={isGoalModalOpen}
        onClose={() => {
          setIsGoalModalOpen(false);
          setEditingGoal(null);
        }}
        onSubmit={handleSaveGoal}
        editingGoal={editingGoal}
        lang={lang}
      />

      <TransactionDetailModal 
        isOpen={detailTransaction !== null}
        onClose={() => setDetailTransaction(null)}
        transaction={detailTransaction}
        onEdit={handleEditTransactionClick}
        onDelete={handleDeleteTransactionClick}
        lang={lang}
      />

      <MonthlyReportModal 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        selectedMonth={reportSelectedMonth}
        transactions={transactions}
        budgets={budgets}
        userName={user.displayName || (lang === 'ID' ? 'Pengguna' : 'User')}
        lang={lang}
      />

      <ConfirmationDialog 
        isOpen={deleteId !== null}
        onClose={() => {
          setDeleteId(null);
          setDeleteType(null);
        }}
        onConfirm={handleConfirmDelete}
        title={
          deleteType === 'transaction' 
            ? (lang === 'ID' ? 'Hapus Catatan' : 'Delete Record') 
            : deleteType === 'budget'
              ? (lang === 'ID' ? 'Hapus Anggaran' : 'Delete Budget')
              : (lang === 'ID' ? 'Hapus Target Tabungan' : 'Delete Savings Goal')
        }
        message={
          deleteType === 'transaction' 
            ? (lang === 'ID' ? 'Apakah Anda yakin ingin menghapus catatan transaksi ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this transaction record? This action cannot be undone.') 
            : deleteType === 'budget'
              ? (lang === 'ID' ? 'Apakah Anda yakin ingin mematikan limit anggaran untuk kategori ini?' : 'Are you sure you want to turn off the budget limit for this category?')
              : (lang === 'ID' ? 'Apakah Anda yakin ingin menghapus target tabungan ini?' : 'Are you sure you want to delete this savings goal?')
        }
        lang={lang}
      />

      <AnimatePresence>
        {swUpdateRegistration && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-4 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-[400px] z-50 bg-primary text-white p-4 rounded-2xl shadow-medium flex items-center justify-between gap-3 backdrop-blur-sm pointer-events-auto"
          >
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
              <span className="text-xs font-bold leading-tight">
                {lang === 'ID' ? 'Versi baru tersedia!' : 'A new version is available!'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                swUpdateRegistration.waiting?.postMessage({ type: 'SKIP_WAITING' });
                window.location.reload();
              }}
              className="px-3 py-1.5 rounded-xl bg-white text-primary text-[10px] font-bold hover:bg-slate-100 transition-all cursor-pointer whitespace-nowrap shadow-soft"
            >
              {lang === 'ID' ? 'Update Sekarang' : 'Update Now'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
