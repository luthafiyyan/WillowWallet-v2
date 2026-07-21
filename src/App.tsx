import { useState, useEffect, useMemo } from 'react';
import { AppUser, Transaction, Budget } from './types';
import { auth, isSandboxMode } from './firebase/config';
import { 
  subscribeToTransactions, 
  subscribeToBudgets, 
  subscribeToCategories,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  saveBudget,
  deleteBudget
} from './services/db';
import { ToastProvider, useToast } from './components/Toast';
import { BottomNav, TabId } from './components/BottomNav';
import { BottomSheet } from './components/BottomSheet';
import { ConfirmationDialog } from './components/ConfirmationDialog';
import { TransactionDetailModal } from './components/TransactionDetailModal';
import { SplashScreen } from './components/SplashScreen';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { Loader2, Sparkles, Database, RefreshCw } from 'lucide-react';
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

  // Database states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  // PWA & Connection states
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [swUpdateRegistration, setSwUpdateRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Navigation states
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Modals & Sheets
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'transaction' | 'budget' | null>(null);
  const [detailTransaction, setDetailTransaction] = useState<Transaction | null>(null);

  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('WILLOW_THEME') === 'dark';
  });

  const [lang, setLang] = useState<'ID' | 'EN'>(() => {
    return (localStorage.getItem('WILLOW_LANG') as 'ID' | 'EN') || 'ID';
  });

  // Keep language synced
  useEffect(() => {
    localStorage.setItem('WILLOW_LANG', lang);
  }, [lang]);

  const t = APP_TRANSLATIONS[lang];
  const gt = t.global;

  // Set dark/light theme
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('WILLOW_THEME', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('WILLOW_THEME', 'light');
    }
  }, [darkMode]);

  // PWA Service Worker & Install Listener Registration
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
        setIsOffline(offline);
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


  // 1. Listen for Authentication status
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
      }
    });
    return unsub;
  }, []);

  // 2. Load data from Realtime Database when authenticated
  useEffect(() => {
    if (!user) return;
    
    setDbLoading(true);
    let unsubTxs = () => {};
    let unsubBudgets = () => {};
    let unsubCategories = () => {};

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
    } catch (e) {
      console.error('Database Subscription Error', e);
      showToast(lang === 'ID' ? 'Gagal memuat database realtime' : 'Failed to load realtime database', 'error');
      setDbLoading(false);
    }

    return () => {
      unsubTxs();
      unsubBudgets();
      unsubCategories();
    };
  }, [user]);

  // Handle addition/edit submission from the bottom sheet
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
        // Edit Mode
        await updateTransaction(user.uid, editingTransaction.id, data);
        showToast(gt.txUpdateSuccess, 'success');
      } else {
        // Create Mode
        await addTransaction(user.uid, data);
        showToast(gt.txSaveSuccess, 'success');
      }
    } catch (error) {
      console.error('Error saving transaction', error);
      showToast(gt.txSaveError, 'error');
    }
    setEditingTransaction(null);
  };

  // Open sheet for editing
  const handleEditTransactionClick = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsSheetOpen(true);
  };

  // Open confirm modal for deleting transaction
  const handleDeleteTransactionClick = (id: string) => {
    setDeleteId(id);
    setDeleteType('transaction');
  };

  // Open confirm modal for deleting a budget
  const handleDeleteBudgetClick = (id: string) => {
    setDeleteId(id);
    setDeleteType('budget');
  };

  // Handle actual deletions when confirmed
  const handleConfirmDelete = async () => {
    if (!user || !deleteId || !deleteType) return;

    try {
      if (deleteType === 'transaction') {
        await deleteTransaction(user.uid, deleteId);
        showToast(gt.txDeleteSuccess, 'success');
      } else if (deleteType === 'budget') {
        await deleteBudget(user.uid, deleteId);
        showToast(gt.budgetDeleteSuccess, 'success');
      }
    } catch (error) {
      console.error('Error deleting record', error);
      showToast(lang === 'ID' ? 'Gagal menghapus data' : 'Failed to delete data', 'error');
    }
    
    setDeleteId(null);
    setDeleteType(null);
  };

  // Create or Update a budget limit
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

  const handleLogout = async () => {
    try {
      await auth.signOut();
      showToast(lang === 'ID' ? 'Berhasil keluar sesi' : 'Logged out successfully', 'info');
      setActiveTab('home');
    } catch (e) {
      showToast(gt.logoutError, 'error');
    }
  };

  // 1. Loading Splash Screen
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // 2. Auth Loading state fallback (if splash finishes before auth, which is extremely rare)
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B1224] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary mt-3">
          {lang === 'ID' ? 'Memuat sistem WillowWallet v2...' : 'Loading WillowWallet v2...'}
        </p>
      </div>
    );
  }

  // If not authenticated, render Login Page
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
    <div className="min-h-screen bg-slate-100 dark:bg-[#060B18] md:py-8 flex justify-center items-center p-0 md:p-4">
      {/* Centered Modern Responsive Container */}
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl min-h-screen md:min-h-[85vh] md:max-h-[90vh] md:rounded-[36px] bg-brand-bg dark:bg-[#0B1224] shadow-medium md:border border-border-custom dark:border-slate-800/80 flex flex-col relative overflow-hidden transition-all duration-300">
        
        {/* Sandbox Indicator Strip */}
        <div className="px-6 py-2.5 bg-surface dark:bg-slate-800 border-b border-border-custom dark:border-slate-700/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-bold tracking-wider text-text-secondary uppercase">
              WillowWallet v2
            </span>
          </div>
        </div>

        {/* Scrollable View Area */}
        <div className="flex-grow overflow-y-auto px-6 pt-5 no-scrollbar">
          
          {/* Lazy DB loading spinner overlay */}
          {dbLoading && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-surface/90 dark:bg-slate-800/90 shadow-soft border border-border-custom dark:border-slate-700/50 rounded-full py-1.5 px-3 flex items-center gap-2 text-[10px] font-semibold text-text-secondary">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              {gt.syncingData}
            </div>
          )}

          {/* Subpage Router Switch */}
          {activeTab === 'home' && (
            <Home 
              user={user}
              transactions={transactions}
              budgets={budgets}
              onOpenAddTransaction={() => {
                setEditingTransaction(null);
                setIsSheetOpen(true);
              }}
              onEditTransaction={handleEditTransactionClick}
              onDeleteTransaction={handleDeleteTransactionClick}
              onNavigateTab={(tab) => {
                if (tab === 'analytics') {
                  // If navigating to analytics, stay or direct to specific tab
                  setActiveTab('analytics');
                } else {
                  setActiveTab(tab);
                }
              }}
              onViewTransaction={setDetailTransaction}
              lang={lang}
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions 
              transactions={transactions}
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
              lang={lang}
            />
          )}

          {activeTab === 'profile' && (
            <Profile 
              user={user}
              transactions={transactions}
              budgets={budgets}
              onLogout={handleLogout}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(prev => !prev)}
              lang={lang}
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

        </div>

        {/* Floating Action Button & Bottom Navigation Panel */}
        <BottomNav 
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          onOpenAddTransaction={() => {
            setEditingTransaction(null);
            setIsSheetOpen(true);
          }}
          lang={lang}
        />

        {/* Add/Edit Bottom Sheet Modal */}
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

        {/* Transaction Detail Viewer Modal */}
        <TransactionDetailModal 
          isOpen={detailTransaction !== null}
          onClose={() => setDetailTransaction(null)}
          transaction={detailTransaction}
          onEdit={handleEditTransactionClick}
          onDelete={handleDeleteTransactionClick}
          lang={lang}
        />

        {/* Confirm Delete Modals */}
        <ConfirmationDialog 
          isOpen={deleteId !== null}
          onClose={() => {
            setDeleteId(null);
            setDeleteType(null);
          }}
          onConfirm={handleConfirmDelete}
          title={deleteType === 'transaction' ? (lang === 'ID' ? 'Hapus Catatan' : 'Delete Record') : (lang === 'ID' ? 'Hapus Anggaran' : 'Delete Budget')}
          message={
            deleteType === 'transaction' 
              ? (lang === 'ID' ? 'Apakah Anda yakin ingin menghapus catatan transaksi ini? Tindakan ini tidak dapat dibatalkan.' : 'Are you sure you want to delete this transaction record? This action cannot be undone.') 
              : (lang === 'ID' ? 'Apakah Anda yakin ingin mematikan limit anggaran untuk kategori ini?' : 'Are you sure you want to turn off the budget limit for this category?')
          }
          lang={lang}
        />

        {/* Custom Install Prompt Dialog */}
        <AnimatePresence>
          {showInstallPrompt && !localStorage.getItem('WILLOW_INSTALL_DISMISSED') && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-96 z-40 bg-surface/95 dark:bg-slate-800/95 backdrop-blur-md p-5 rounded-3xl border border-border-custom dark:border-slate-700/60 shadow-medium flex flex-col gap-4 font-sans pointer-events-auto"
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <div className="flex-grow">
                  <h4 className="text-xs font-bold text-text-primary dark:text-slate-100">
                    {lang === 'ID' ? 'Pasang WillowWallet' : 'Install WillowWallet'}
                  </h4>
                  <p className="text-[10px] text-text-secondary dark:text-slate-400 mt-1 leading-normal">
                    {lang === 'ID' 
                      ? 'Nikmati pengalaman seperti aplikasi native dengan performa cepat dan akses offline.' 
                      : 'Enjoy a native-like experience with fast performance and offline access.'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2.5">
                <button
                  onClick={() => {
                    localStorage.setItem('WILLOW_INSTALL_DISMISSED', 'true');
                    setShowInstallPrompt(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-border-custom dark:border-slate-700 text-xs font-semibold text-text-secondary dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition-all cursor-pointer text-center"
                >
                  {lang === 'ID' ? 'Nanti' : 'Later'}
                </button>
                <button
                  onClick={async () => {
                    const accepted = await triggerInstallPrompt();
                    if (accepted) {
                      showToast(lang === 'ID' ? 'Terima kasih telah memasang aplikasi!' : 'Thank you for installing the app!', 'success');
                      setShowInstallPrompt(false);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-emerald-600 text-xs font-semibold text-white transition-all cursor-pointer text-center shadow-soft"
                >
                  {lang === 'ID' ? 'Pasang' : 'Install'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Custom Update Service Worker Snackbar */}
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
