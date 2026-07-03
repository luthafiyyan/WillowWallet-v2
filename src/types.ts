export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string; // Format: YYYY-MM-DD
  category: string;
  description: string;
  createdAt: number;
  updatedAt: number;
}

export interface Budget {
  id: string; // budgetId
  category: string;
  limit: number;
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
