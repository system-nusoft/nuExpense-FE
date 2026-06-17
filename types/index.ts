export interface User {
  id: string;
  email: string;
  name?: string;
  homeCurrency: string;
  isPremium: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  sortOrder: number;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId?: string;
  vendor: string;
  amount: string;
  currency: string;
  date: string;
  receiptImageUrl?: string;
  notes?: string;
  rawAiResponse?: unknown;
  createdAt: string;
}

export interface ExpenseDraft {
  vendor: string;
  amount: string;
  currency: string;
  date: string;
  suggestedCategoryId?: string;
  receiptImageKey?: string;
  confidence?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
