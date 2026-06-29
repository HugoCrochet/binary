import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ============================================
// Types
// ============================================
export type TransactionType = 'INCOME' | 'EXPENSE' | 'INVESTMENT';

export interface Transaction {
  id: string;
  categoryId: string;
  name: string;
  amount: number;
  date: string;
  type: TransactionType;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  items: Transaction[];
  icon?: string;
}

export interface BudgetState {
  // Revenus
  incomeCategories: Category[];
  // Dépenses
  expenseCategories: Category[];
  // Investissements
  investmentCategories: Category[];

  // Actions
  addIncomeCategory: (name: string) => void;
  addExpenseCategory: (name: string) => void;
  addInvestmentCategory: (name: string) => void;

  addTransaction: (categoryId: string, name: string, amount: number, type: TransactionType) => void;
  removeTransaction: (categoryId: string, transactionId: string) => void;
  updateTransaction: (categoryId: string, transactionId: string, name: string, amount: number) => void;

  updateCategoryAmount: (categoryId: string, amount: number, type: TransactionType) => void;
  removeCategory: (categoryId: string, type: TransactionType) => void;

  // Calculs
  totalIncome: number;
  totalExpenses: number;
  totalInvestments: number;
  savingsRate: number;
  possibleSavingsRate: number;
}

// ============================================
// Initial State
// ============================================
const generateId = () => Math.random().toString(36).substring(2, 9);
const INITIAL_DATE = '2026-06-01T00:00:00.000Z';

const INITIAL_INCOME_CATEGORIES: Category[] = [
  {
    id: 'cat-income-1',
    name: 'Salaire',
    type: 'INCOME',
    amount: 3800,
    items: [
      { id: 'txn-1', categoryId: 'cat-income-1', name: 'Salaire net', amount: 3800, date: INITIAL_DATE, type: 'INCOME' },
    ],
    icon: 'salary',
  },
];

const INITIAL_INVESTMENT_CATEGORIES: Category[] = [
  {
    id: 'cat-inv-1',
    name: 'PEA',
    type: 'INVESTMENT',
    amount: 500,
    items: [
      { id: 'txn-inv-1', categoryId: 'cat-inv-1', name: 'Investissement mensuel', amount: 500, date: INITIAL_DATE, type: 'INVESTMENT' },
    ],
    icon: 'pea',
  },
  {
    id: 'cat-inv-2',
    name: 'Livret A',
    type: 'INVESTMENT',
    amount: 200,
    items: [
      { id: 'txn-inv-2', categoryId: 'cat-inv-2', name: 'Épargne liquide', amount: 200, date: INITIAL_DATE, type: 'INVESTMENT' },
    ],
    icon: 'savings',
  },
];

const INITIAL_EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'cat-exp-1',
    name: 'Logement',
    type: 'EXPENSE',
    amount: 1200,
    items: [
      { id: 'txn-exp-1', categoryId: 'cat-exp-1', name: 'Loyer', amount: 950, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-2', categoryId: 'cat-exp-1', name: 'Charges', amount: 150, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-3', categoryId: 'cat-exp-1', name: 'Électricité', amount: 100, date: INITIAL_DATE, type: 'EXPENSE' },
    ],
    icon: 'housing',
  },
  {
    id: 'cat-exp-2',
    name: 'Vie Quotidienne',
    type: 'EXPENSE',
    amount: 600,
    items: [
      { id: 'txn-exp-4', categoryId: 'cat-exp-2', name: 'Courses', amount: 350, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-5', categoryId: 'cat-exp-2', name: 'Restaurants', amount: 100, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-6', categoryId: 'cat-exp-2', name: 'Snacks', amount: 50, date: INITIAL_DATE, type: 'EXPENSE' },
    ],
    icon: 'food',
  },
  {
    id: 'cat-exp-3',
    name: 'Abonnements',
    type: 'EXPENSE',
    amount: 150,
    items: [
      { id: 'txn-exp-7', categoryId: 'cat-exp-3', name: 'Internet', amount: 45, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-8', categoryId: 'cat-exp-3', name: 'Mobile', amount: 32, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-9', categoryId: 'cat-exp-3', name: 'Netflix', amount: 18, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-10', categoryId: 'cat-exp-3', name: 'Gym', amount: 55, date: INITIAL_DATE, type: 'EXPENSE' },
    ],
    icon: 'subscriptions',
  },
  {
    id: 'cat-exp-4',
    name: 'Transport',
    type: 'EXPENSE',
    amount: 100,
    items: [
      { id: 'txn-exp-11', categoryId: 'cat-exp-4', name: 'Essence', amount: 60, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-12', categoryId: 'cat-exp-4', name: 'Transports', amount: 40, date: INITIAL_DATE, type: 'EXPENSE' },
    ],
    icon: 'transport',
  },
  {
    id: 'cat-exp-5',
    name: 'Loisirs',
    type: 'EXPENSE',
    amount: 150,
    items: [
      { id: 'txn-exp-13', categoryId: 'cat-exp-5', name: 'Cinéma', amount: 40, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-14', categoryId: 'cat-exp-5', name: 'Culture', amount: 60, date: INITIAL_DATE, type: 'EXPENSE' },
      { id: 'txn-exp-15', categoryId: 'cat-exp-5', name: 'Vacances', amount: 50, date: INITIAL_DATE, type: 'EXPENSE' },
    ],
    icon: 'leisure',
  },
];

// ============================================
// Store
// ============================================
export const useBudgetStore = create<BudgetState>()(
  persist(
    (set, get) => ({
      incomeCategories: INITIAL_INCOME_CATEGORIES,
      expenseCategories: INITIAL_EXPENSE_CATEGORIES,
      investmentCategories: INITIAL_INVESTMENT_CATEGORIES,

      // Add category
      addIncomeCategory: (name) => {
        const newCategory: Category = {
          id: `cat-income-${generateId()}`,
          name,
          type: 'INCOME',
          amount: 0,
          items: [],
          icon: 'salary',
        };
        set((state) => ({ incomeCategories: [...state.incomeCategories, newCategory] }));
      },

      addExpenseCategory: (name) => {
        const newCategory: Category = {
          id: `cat-exp-${generateId()}`,
          name,
          type: 'EXPENSE',
          amount: 0,
          items: [],
          icon: 'food',
        };
        set((state) => ({ expenseCategories: [...state.expenseCategories, newCategory] }));
      },

      addInvestmentCategory: (name) => {
        const newCategory: Category = {
          id: `cat-inv-${generateId()}`,
          name,
          type: 'INVESTMENT',
          amount: 0,
          items: [],
          icon: 'pea',
        };
        set((state) => ({ investmentCategories: [...state.investmentCategories, newCategory] }));
      },

      // Add transaction
      addTransaction: (categoryId, name, amount, type) => {
        const newTransaction: Transaction = {
          id: `txn-${generateId()}`,
          categoryId,
          name,
          amount,
          date: new Date().toISOString(),
          type,
        };

        set((state) => {
          const categories = state.expenseCategories.map((c) =>
            c.id === categoryId ? { ...c, amount: c.amount + amount, items: [...c.items, newTransaction] } : c
          );
          const incomeCategories = state.incomeCategories.map((c) =>
            c.id === categoryId ? { ...c, amount: c.amount + amount, items: [...c.items, newTransaction] } : c
          );
          const investmentCategories = state.investmentCategories.map((c) =>
            c.id === categoryId ? { ...c, amount: c.amount + amount, items: [...c.items, newTransaction] } : c
          );

          return { expenseCategories: categories, incomeCategories, investmentCategories };
        });
      },

      // Remove transaction
      removeTransaction: (categoryId, transactionId) => {
        set((state) => {
          const findAndRemove = (categories: Category[]) =>
            categories.map((c) => {
              if (c.id !== categoryId) return c;
              const transaction = c.items.find((t) => t.id === transactionId);
              if (!transaction) return c;
              return {
                ...c,
                amount: c.amount - transaction.amount,
                items: c.items.filter((t) => t.id !== transactionId),
              };
            });

          return {
            expenseCategories: findAndRemove(state.expenseCategories),
            incomeCategories: findAndRemove(state.incomeCategories),
            investmentCategories: findAndRemove(state.investmentCategories),
          };
        });
      },

      // Update transaction
      updateTransaction: (categoryId, transactionId, name, amount) => {
        set((state) => {
          const findAndUpdate = (categories: Category[]) =>
            categories.map((c) => {
              if (c.id !== categoryId) return c;
              const transaction = c.items.find((t) => t.id === transactionId);
              if (!transaction) return c;
              const diff = amount - transaction.amount;
              return {
                ...c,
                amount: c.amount + diff,
                items: c.items.map((t) => (t.id === transactionId ? { ...t, name, amount } : t)),
              };
            });

          return {
            expenseCategories: findAndUpdate(state.expenseCategories),
            incomeCategories: findAndUpdate(state.incomeCategories),
            investmentCategories: findAndUpdate(state.investmentCategories),
          };
        });
      },

      // Update category amount (reset all items to match)
      updateCategoryAmount: (categoryId, amount, type) => {
        set((state) => {
          if (type === 'INCOME') {
            return {
              incomeCategories: state.incomeCategories.map((c) =>
                c.id === categoryId ? { ...c, amount } : c
              ),
            };
          }
          if (type === 'EXPENSE') {
            return {
              expenseCategories: state.expenseCategories.map((c) =>
                c.id === categoryId ? { ...c, amount } : c
              ),
            };
          }
          return {
            investmentCategories: state.investmentCategories.map((c) =>
              c.id === categoryId ? { ...c, amount } : c
            ),
          };
        });
      },

      // Remove category
      removeCategory: (categoryId, type) => {
        set((state) => {
          if (type === 'INCOME') {
            return { incomeCategories: state.incomeCategories.filter((c) => c.id !== categoryId) };
          }
          if (type === 'EXPENSE') {
            return { expenseCategories: state.expenseCategories.filter((c) => c.id !== categoryId) };
          }
          return { investmentCategories: state.investmentCategories.filter((c) => c.id !== categoryId) };
        });
      },

      // Calculs
      get totalIncome() {
        return get().incomeCategories.reduce((sum, c) => sum + c.amount, 0);
      },

      get totalExpenses() {
        return get().expenseCategories.reduce((sum, c) => sum + c.amount, 0);
      },

      get totalInvestments() {
        return get().investmentCategories.reduce((sum, c) => sum + c.amount, 0);
      },

      get savingsRate() {
        const totalIncome = get().totalIncome;
        const totalInvestments = get().totalInvestments;
        if (totalIncome === 0) return 0;
        return (totalInvestments / totalIncome) * 100;
      },

      get possibleSavingsRate() {
        const totalIncome = get().totalIncome;
        const fixedExpenses = 1500; // Dépenses fixes estimées
        if (totalIncome === 0) return 0;
        return ((totalIncome - fixedExpenses) / totalIncome) * 100;
      },
    }),
    {
      name: 'budget-store',
    }
  )
);
