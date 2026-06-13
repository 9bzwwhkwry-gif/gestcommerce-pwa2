"use client";

import { useState, useEffect, useCallback, createContext, useContext } from "react";
import type React from "react";
import type {
  Sale,
  Product,
  Expense,
  ExpenseCategory,
  AppSettings,
  ActivePeriod,
  DashboardStats,
  DashboardCard,
} from "@/types";
import {
  getSales,
  addSale,
  updateSale,
  deleteSale,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpenseCategories,
  addExpenseCategory,
  deleteExpenseCategory,
  getAppSettings,
  saveAppSettings,
  exportAllData,
  importAllData,
  clearAllData,
} from "@/lib/db";
import { getDateRangeForPeriod, isInRange } from "@/lib/utils";

// ================================
// CONTEXT TYPE
// ================================

interface AppStore {
  // Data
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  categories: ExpenseCategory[];
  settings: AppSettings;

  // Period
  activePeriod: ActivePeriod;
  setActivePeriod: (p: ActivePeriod) => void;

  // Filtered data
  filteredSales: Sale[];
  filteredExpenses: Expense[];
  stats: DashboardStats;

  // Loading
  isLoading: boolean;

  // Sales actions
  createSale: (data: Omit<Sale, "id" | "revenue" | "totalCost" | "totalExpenses" | "netProfit" | "createdAt" | "updatedAt">) => Promise<Sale>;
  editSale: (id: string, data: Partial<Sale>) => Promise<Sale>;
  removeSale: (id: string) => Promise<void>;

  // Products actions
  createProduct: (data: Omit<Product, "id" | "margin" | "createdAt" | "updatedAt">) => Promise<Product>;
  editProduct: (id: string, data: Partial<Product>) => Promise<Product>;
  removeProduct: (id: string) => Promise<void>;

  // Expenses actions
  createExpense: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<Expense>;
  editExpense: (id: string, data: Partial<Expense>) => Promise<Expense>;
  removeExpense: (id: string) => Promise<void>;

  // Categories actions
  createCategory: (name: string, color?: string) => Promise<ExpenseCategory>;
  removeCategory: (id: string) => Promise<void>;

  // Settings
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;

  // Dashboard cards
  addDashboardCard: (card: DashboardCard) => Promise<void>;
  removeDashboardCard: (id: string) => Promise<void>;

  // Backup
  exportBackup: () => Promise<unknown>;
  importBackup: (data: unknown) => Promise<void>;
  resetAll: () => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

// ================================
// DEFAULT SETTINGS
// ================================

const defaultSettings: AppSettings = {
  currency: "FCFA",
  currencySymbol: "FCFA",
  customCards: [],
  theme: "dark",
};

// ================================
// CONTEXT
// ================================

const AppContext = createContext<AppStore | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState<ActivePeriod>({
    filter: "thisMonth",
  });

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [s, p, e, c, st] = await Promise.all([
        getSales(),
        getProducts(),
        getExpenses(),
        getExpenseCategories(),
        getAppSettings(),
      ]);
      setSales(s);
      setProducts(p);
      setExpenses(e);
      setCategories(c);
      setSettings(st);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ---- Filtered data ----
  const range = getDateRangeForPeriod(activePeriod);

  const filteredSales = sales.filter((s) => isInRange(s.date, range));
  const filteredExpenses = expenses.filter((e) => isInRange(e.date, range));

  // ---- Stats calculation ----
  const stats: DashboardStats = (() => {
    const revenue = filteredSales.reduce((sum, s) => sum + s.revenue, 0);
    const salesCount = filteredSales.length;
    const quantitySold = filteredSales.reduce((sum, s) => sum + s.quantity, 0);
    const totalCost = filteredSales.reduce((sum, s) => sum + s.totalCost, 0);
    const saleExpenses = filteredSales.reduce((sum, s) => sum + s.totalExpenses, 0);
    const standaloneExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalExpenses = saleExpenses + standaloneExpenses;
    const netProfit = revenue - totalCost - totalExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    // Category totals (from standalone expenses)
    const categoryTotals: Record<string, number> = {};
    for (const exp of filteredExpenses) {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    }
    // Also from sale expenses
    for (const sale of filteredSales) {
      for (const exp of sale.expenses) {
        categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
      }
    }

    return {
      revenue,
      salesCount,
      quantitySold,
      totalCost,
      totalExpenses,
      netProfit,
      profitMargin,
      categoryTotals,
    };
  })();

  // ---- Sales actions ----
  const createSale = useCallback(async (data: Parameters<typeof addSale>[0]) => {
    const sale = await addSale(data);
    setSales((prev) => [sale, ...prev]);
    return sale;
  }, []);

  const editSale = useCallback(async (id: string, data: Partial<Sale>) => {
    const sale = await updateSale(id, data);
    setSales((prev) => prev.map((s) => (s.id === id ? sale : s)));
    return sale;
  }, []);

  const removeSale = useCallback(async (id: string) => {
    await deleteSale(id);
    setSales((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // ---- Products actions ----
  const createProduct = useCallback(async (data: Parameters<typeof addProduct>[0]) => {
    const product = await addProduct(data);
    setProducts((prev) => [product, ...prev]);
    return product;
  }, []);

  const editProduct = useCallback(async (id: string, data: Partial<Product>) => {
    const product = await updateProduct(id, data);
    setProducts((prev) => prev.map((p) => (p.id === id ? product : p)));
    return product;
  }, []);

  const removeProduct = useCallback(async (id: string) => {
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ---- Expenses actions ----
  const createExpense = useCallback(async (data: Parameters<typeof addExpense>[0]) => {
    const expense = await addExpense(data);
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const editExpense = useCallback(async (id: string, data: Partial<Expense>) => {
    const expense = await updateExpense(id, data);
    setExpenses((prev) => prev.map((e) => (e.id === id ? expense : e)));
    return expense;
  }, []);

  const removeExpense = useCallback(async (id: string) => {
    await deleteExpense(id);
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  }, []);

  // ---- Categories actions ----
  const createCategory = useCallback(async (name: string, color?: string) => {
    const cat = await addExpenseCategory(name, color);
    setCategories((prev) => [...prev, cat]);
    return cat;
  }, []);

  const removeCategory = useCallback(async (id: string) => {
    await deleteExpenseCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  // ---- Settings ----
  const updateSettings = useCallback(async (s: Partial<AppSettings>) => {
    await saveAppSettings(s);
    setSettings((prev) => ({ ...prev, ...s }));
  }, []);

  // ---- Dashboard cards ----
  const addDashboardCard = useCallback(async (card: DashboardCard) => {
    const newCards = [...(settings.customCards || []), card];
    await saveAppSettings({ customCards: newCards });
    setSettings((prev) => ({ ...prev, customCards: newCards }));
  }, [settings.customCards]);

  const removeDashboardCard = useCallback(async (id: string) => {
    const newCards = (settings.customCards || []).filter((c) => c.id !== id);
    await saveAppSettings({ customCards: newCards });
    setSettings((prev) => ({ ...prev, customCards: newCards }));
  }, [settings.customCards]);

  // ---- Backup ----
  const exportBackup = useCallback(async () => {
    return await exportAllData();
  }, []);

  const importBackup = useCallback(async (data: unknown) => {
    await importAllData(data as Parameters<typeof importAllData>[0]);
    await loadAll();
  }, [loadAll]);

  const resetAll = useCallback(async () => {
    await clearAllData();
    await loadAll();
  }, [loadAll]);

  const value: AppStore = {
    sales,
    products,
    expenses,
    categories,
    settings,
    activePeriod,
    setActivePeriod,
    filteredSales,
    filteredExpenses,
    stats,
    isLoading,
    createSale,
    editSale,
    removeSale,
    createProduct,
    editProduct,
    removeProduct,
    createExpense,
    editExpense,
    removeExpense,
    createCategory,
    removeCategory,
    updateSettings,
    addDashboardCard,
    removeDashboardCard,
    exportBackup,
    importBackup,
    resetAll,
    refresh: loadAll,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppStore {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
