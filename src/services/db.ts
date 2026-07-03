import { onValue, dbPush, dbSet, dbUpdate, dbRemove } from '../firebase/config';
import { Transaction, Budget } from '../types';

export const DEFAULT_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Pendidikan',
  'Gaji',
  'Investasi',
  'Sampingan',
  'Lainnya'
];

// Subscribe to transactions
export const subscribeToTransactions = (uid: string, callback: (txs: Transaction[]) => void) => {
  const path = `users/${uid}/transactions`;
  return onValue(path, (snapshot) => {
    const data = snapshot.val();
    const txs: Transaction[] = [];
    if (data) {
      Object.keys(data).forEach((key) => {
        const item = data[key];
        txs.push({
          id: key,
          type: item.type || 'expense',
          amount: Number(item.amount) || 0,
          date: item.date || new Date().toISOString().split('T')[0],
          category: item.category || 'Lainnya',
          description: item.description || '',
          createdAt: item.createdAt || Date.now(),
          updatedAt: item.updatedAt || Date.now()
        });
      });
    }
    // Sort transactions by date descending, then by createdAt descending
    txs.sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      if (timeB !== timeA) {
        return timeB - timeA;
      }
      return b.createdAt - a.createdAt;
    });
    callback(txs);
  });
};

// Subscribe to budgets
export const subscribeToBudgets = (uid: string, callback: (budgets: Budget[]) => void) => {
  const path = `users/${uid}/budgets`;
  return onValue(path, (snapshot) => {
    const data = snapshot.val();
    const budgetsList: Budget[] = [];
    if (data) {
      Object.keys(data).forEach((key) => {
        const item = data[key];
        budgetsList.push({
          id: key,
          category: item.category || key,
          limit: Number(item.limit) || 0
        });
      });
    }
    callback(budgetsList);
  });
};

// Subscribe to categories list with automatic bootstrapping if empty
export const subscribeToCategories = (uid: string, callback: (categories: string[]) => void) => {
  const path = `users/${uid}/settings/categories/list`;
  return onValue(path, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      if (Array.isArray(data)) {
        callback(data);
      } else if (typeof data === 'object') {
        callback(Object.values(data));
      } else {
        callback(DEFAULT_CATEGORIES);
      }
    } else {
      // Bootstrap with default categories if empty
      dbSet(path, DEFAULT_CATEGORIES)
        .then(() => callback(DEFAULT_CATEGORIES))
        .catch(() => callback(DEFAULT_CATEGORIES));
    }
  });
};

// Add new transaction
export const addTransaction = async (
  uid: string,
  tx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const path = `users/${uid}/transactions`;
  const timestamp = Date.now();
  const payload = {
    ...tx,
    amount: Number(tx.amount),
    createdAt: timestamp,
    updatedAt: timestamp
  };
  return dbPush(path, payload);
};

// Update existing transaction
export const updateTransaction = async (
  uid: string,
  txId: string,
  tx: Partial<Omit<Transaction, 'id' | 'createdAt'>>
) => {
  const path = `users/${uid}/transactions/${txId}`;
  const payload = {
    ...tx,
    updatedAt: Date.now()
  };
  return dbUpdate(path, payload);
};

// Delete transaction
export const deleteTransaction = async (uid: string, txId: string) => {
  const path = `users/${uid}/transactions/${txId}`;
  return dbRemove(path);
};

// Create or Update Budget
export const saveBudget = async (uid: string, category: string, limit: number) => {
  // Use category name with safe character filtering as key, or a simple id
  const budgetId = category.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `users/${uid}/budgets/${budgetId}`;
  const payload = {
    category,
    limit: Number(limit)
  };
  return dbSet(path, payload);
};

// Delete Budget
export const deleteBudget = async (uid: string, budgetId: string) => {
  const path = `users/${uid}/budgets/${budgetId}`;
  return dbRemove(path);
};

// Update Categories list
export const saveCategories = async (uid: string, list: string[]) => {
  const path = `users/${uid}/settings/categories/list`;
  return dbSet(path, list);
};
