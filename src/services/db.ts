import { onValue, dbPush, dbSet, dbUpdate, dbRemove } from '../firebase/config';
import { Transaction, Budget, SavingGoal, BackupData } from '../types';

export const DEFAULT_CATEGORIES = [
  'Makanan & Minuman',
  'Transportasi',
  'Belanja',
  'Tagihan & Utilitas',
  'Hiburan',
  'Kesehatan',
  'Perawatan Diri',
  'Pendidikan',
  'Gaji',
  'Investasi',
  'Sampingan',
  'Lainnya'
];

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

export const subscribeToGoals = (uid: string, callback: (goals: SavingGoal[]) => void) => {
  const path = `users/${uid}/goals`;
  return onValue(path, (snapshot) => {
    const data = snapshot.val();
    const goalsList: SavingGoal[] = [];
    if (data) {
      Object.keys(data).forEach((key) => {
        const item = data[key];
        goalsList.push({
          id: key,
          title: item.title || 'Target',
          targetAmount: Number(item.targetAmount) || 0,
          currentAmount: Number(item.currentAmount) || 0,
          deadline: item.deadline || '',
          category: item.category || '',
          createdAt: item.createdAt || Date.now(),
          updatedAt: item.updatedAt || Date.now()
        });
      });
    }
    goalsList.sort((a, b) => b.createdAt - a.createdAt);
    callback(goalsList);
  });
};

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
      dbSet(path, DEFAULT_CATEGORIES)
        .then(() => callback(DEFAULT_CATEGORIES))
        .catch(() => callback(DEFAULT_CATEGORIES));
    }
  });
};

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

export const deleteTransaction = async (uid: string, txId: string) => {
  const path = `users/${uid}/transactions/${txId}`;
  return dbRemove(path);
};

export const saveBudget = async (uid: string, category: string, limit: number) => {
  const budgetId = category.replace(/[^a-zA-Z0-9]/g, '_');
  const path = `users/${uid}/budgets/${budgetId}`;
  const payload = {
    category,
    limit: Number(limit)
  };
  return dbSet(path, payload);
};

export const deleteBudget = async (uid: string, budgetId: string) => {
  const path = `users/${uid}/budgets/${budgetId}`;
  return dbRemove(path);
};

export const saveGoal = async (
  uid: string,
  goal: {
    id?: string;
    title: string;
    targetAmount: number;
    currentAmount: number;
    deadline?: string;
  }
) => {
  const timestamp = Date.now();
  if (goal.id) {
    const path = `users/${uid}/goals/${goal.id}`;
    return dbUpdate(path, {
      title: goal.title.trim(),
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      deadline: goal.deadline || '',
      updatedAt: timestamp
    });
  } else {
    const path = `users/${uid}/goals`;
    return dbPush(path, {
      title: goal.title.trim(),
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount),
      deadline: goal.deadline || '',
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }
};

export const deleteGoal = async (uid: string, goalId: string) => {
  const path = `users/${uid}/goals/${goalId}`;
  return dbRemove(path);
};

export const contributeToGoal = async (
  uid: string,
  goalId: string,
  currentAmount: number,
  deltaAmount: number
) => {
  const path = `users/${uid}/goals/${goalId}`;
  const newAmount = Math.max(0, currentAmount + deltaAmount);
  return dbUpdate(path, {
    currentAmount: newAmount,
    updatedAt: Date.now()
  });
};

export const saveCategories = async (uid: string, list: string[]) => {
  const path = `users/${uid}/settings/categories/list`;
  return dbSet(path, list);
};

export const deleteCategory = async (uid: string, currentList: string[], categoryToDelete: string) => {
  const updated = currentList.filter(c => c !== categoryToDelete);
  return saveCategories(uid, updated);
};

export const restoreFullBackup = async (uid: string, backup: BackupData) => {
  if (!backup || !backup.data) {
    throw new Error('Format berkas cadangan tidak valid');
  }

  const basePath = `users/${uid}`;
  const { transactions, budgets, categories, goals } = backup.data;

  if (Array.isArray(categories) && categories.length > 0) {
    await dbSet(`${basePath}/settings/categories/list`, categories);
  }

  if (Array.isArray(budgets)) {
    const budgetMap: Record<string, { category: string; limit: number }> = {};
    budgets.forEach(b => {
      const bId = b.id || b.category.replace(/[^a-zA-Z0-9]/g, '_');
      budgetMap[bId] = { category: b.category, limit: Number(b.limit) || 0 };
    });
    await dbSet(`${basePath}/budgets`, budgetMap);
  }

  if (Array.isArray(transactions)) {
    const txMap: Record<string, Omit<Transaction, 'id'>> = {};
    transactions.forEach(t => {
      const tId = t.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      txMap[tId] = {
        type: t.type,
        amount: Number(t.amount) || 0,
        date: t.date,
        category: t.category,
        description: t.description || '',
        createdAt: t.createdAt || Date.now(),
        updatedAt: t.updatedAt || Date.now()
      };
    });
    await dbSet(`${basePath}/transactions`, txMap);
  }

  if (Array.isArray(goals)) {
    const goalsMap: Record<string, Omit<SavingGoal, 'id'>> = {};
    goals.forEach(g => {
      const gId = g.id || `goal_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
      goalsMap[gId] = {
        title: g.title,
        targetAmount: Number(g.targetAmount) || 0,
        currentAmount: Number(g.currentAmount) || 0,
        deadline: g.deadline || '',
        createdAt: g.createdAt || Date.now(),
        updatedAt: g.updatedAt || Date.now()
      };
    });
    await dbSet(`${basePath}/goals`, goalsMap);
  }
};
