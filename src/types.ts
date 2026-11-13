export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
}

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  category?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  categories: {
    list: string[];
  };
}

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface BackupData {
  app: string;
  exportedAt: string;
  user: {
    uid: string;
    displayName: string | null;
    email: string | null;
  };
  data: {
    transactions: Transaction[];
    budgets: Budget[];
    categories: string[];
    goals?: SavingGoal[];
  };
}
