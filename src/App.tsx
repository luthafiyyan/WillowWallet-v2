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
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { Transactions } from './pages/Transactions';
import { Analytics } from './pages/Analytics';
import { Profile } from './pages/Profile';
import { Loader2, Sparkles, Database } from 'lucide-react';

function AppContent() {
  const { showToast } = useToast();
  const [user, setUser] = useState<AppUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Database states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [dbLoading, setDbLoading] = useState(false);

  // Navigation states
  const [activeTab, setActiveTab] = useState<TabId>('home');

  // Modals & Sheets
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'transaction' | 'budget' | null>(null);

  // Set dark/light theme at startup from storage
  useEffect(() => {
    const stored = localStorage.getItem('WILLOW_THEME');
    if (stored === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

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
      showToast('Gagal memuat database realtime', 'error');
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
        showToast('Transaksi berhasil diperbarui!', 'success');
      } else {
        // Create Mode
        await addTransaction(user.uid, data);
        showToast('Transaksi baru ditambahkan!', 'success');
      }
    } catch (error) {
      console.error('Error saving transaction', error);
      showToast('Gagal menyimpan transaksi', 'error');
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
        showToast('Transaksi berhasil dihapus!', 'success');
      } else if (deleteType === 'budget') {
        await deleteBudget(user.uid, deleteId);
        showToast('Limit anggaran berhasil dihapus!', 'success');
      }
    } catch (error) {
      console.error('Error deleting record', error);
      showToast('Gagal menghapus data', 'error');
    }
    
    setDeleteId(null);
    setDeleteType(null);
  };

  // Create or Update a budget limit
  const handleSaveBudget = async (category: string, limit: number) => {
    if (!user) return;
    try {
      await saveBudget(user.uid, category, limit);
      showToast(`Anggaran ${category} berhasil disimpan!`, 'success');
    } catch (e) {
      console.error('Error saving budget', e);
      showToast('Gagal mengatur limit anggaran', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      showToast('Berhasil keluar sesi', 'info');
      setActiveTab('home');
    } catch (e) {
      showToast('Gagal melakukan logout', 'error');
    }
  };

  // Loading Splash Screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F5F7FB] dark:bg-[#0B1224] flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-xs font-semibold text-text-secondary mt-3">
          Memuat sistem WillowWallet v2...
        </p>
      </div>
    );
  }

  // If not authenticated, render Login Page
  if (!user) {
    return <Login onLoginSuccess={() => showToast('Selamat datang kembali!', 'success')} />;
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
          
          {isSandboxMode ? (
            <div className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              Sandbox
            </div>
          ) : (
            <div className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Database className="w-2.5 h-2.5" />
              Realtime Sync
            </div>
          )}
        </div>

        {/* Scrollable View Area */}
        <div className="flex-grow overflow-y-auto px-6 pt-5 no-scrollbar">
          
          {/* Lazy DB loading spinner overlay */}
          {dbLoading && (
            <div className="absolute top-14 left-1/2 -translate-x-1/2 z-30 bg-surface/90 dark:bg-slate-800/90 shadow-soft border border-border-custom dark:border-slate-700/50 rounded-full py-1.5 px-3 flex items-center gap-2 text-[10px] font-semibold text-text-secondary">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
              Menyinkronkan data...
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
            />
          )}

          {activeTab === 'transactions' && (
            <Transactions 
              transactions={transactions}
              onEditTransaction={handleEditTransactionClick}
              onDeleteTransaction={handleDeleteTransactionClick}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics 
              transactions={transactions}
              budgets={budgets}
              categories={categories}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudgetClick}
            />
          )}

          {activeTab === 'profile' && (
            <Profile 
              user={user}
              transactions={transactions}
              budgets={budgets}
              onLogout={handleLogout}
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
        />

        {/* Confirm Delete Modals */}
        <ConfirmationDialog 
          isOpen={deleteId !== null}
          onClose={() => {
            setDeleteId(null);
            setDeleteType(null);
          }}
          onConfirm={handleConfirmDelete}
          title={deleteType === 'transaction' ? 'Hapus Catatan' : 'Hapus Anggaran'}
          message={
            deleteType === 'transaction' 
              ? 'Apakah Anda yakin ingin menghapus catatan transaksi ini? Tindakan ini tidak dapat dibatalkan.' 
              : 'Apakah Anda yakin ingin mematikan limit anggaran untuk kategori ini?'
          }
        />

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
