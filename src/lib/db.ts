import { openDB, DBSchema, IDBPDatabase, IDBPUpgradeDB } from "idb";
import type {
  Sale,
  Product,
  Expense,
  ExpenseCategory,
  AppSettings,
  DashboardCard,
} from "@/types";

// ================================
// DB SCHEMA
// ================================

interface EcommerceDB extends DBSchema {
  sales: {
    key: string;
    value: Sale;
    indexes: {
      "by-date": string;
      "by-product": string;
    };
  };
  products: {
    key: string;
    value: Product;
    indexes: {
      "by-name": string;
    };
  };
  expenses: {
    key: string;
    value: Expense;
    indexes: {
      "by-date": string;
      "by-category": string;
    };
  };
  expenseCategories: {
    key: string;
    value: ExpenseCategory;
  };
  settings: {
    key: string;
    value: { key: string; value: unknown };
  };
}

const DB_NAME = "ecommerce-pwa-db";
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<EcommerceDB> | null = null;

// ================================
// INITIALIZATION
// ================================

export async function getDB(): Promise<IDBPDatabase<EcommerceDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<EcommerceDB>(DB_NAME, DB_VERSION, {
    upgrade(db: IDBPUpgradeDB<EcommerceDB>) {
      // Sales store
      if (!db.objectStoreNames.contains("sales")) {
        const salesStore = db.createObjectStore("sales", { keyPath: "id" });
        salesStore.createIndex("by-date", "date");
        salesStore.createIndex("by-product", "productName");
      }

      // Products store
      if (!db.objectStoreNames.contains("products")) {
        const productsStore = db.createObjectStore("products", { keyPath: "id" });
        productsStore.createIndex("by-name", "name");
      }

      // Expenses store
      if (!db.objectStoreNames.contains("expenses")) {
        const expensesStore = db.createObjectStore("expenses", { keyPath: "id" });
        expensesStore.createIndex("by-date", "date");
        expensesStore.createIndex("by-category", "category");
      }

      // Expense categories store
      if (!db.objectStoreNames.contains("expenseCategories")) {
        db.createObjectStore("expenseCategories", { keyPath: "id" });
      }

      // Settings store
      if (!db.objectStoreNames.contains("settings")) {
        db.createObjectStore("settings", { keyPath: "key" });
      }
    },
  });

  // Seed default categories if empty
  await seedDefaultCategories(dbInstance);

  return dbInstance;
}

async function seedDefaultCategories(db: IDBPDatabase<EcommerceDB>) {
  const existing = await db.getAll("expenseCategories");
  if (existing.length > 0) return;

  const defaults: ExpenseCategory[] = [
    {
      id: "cat-livraison",
      name: "Frais de livraison",
      isDefault: true,
      color: "#3b82f6",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-pub",
      name: "Dépenses publicitaires",
      isDefault: true,
      color: "#8b5cf6",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-assistants",
      name: "Frais assistants",
      isDefault: true,
      color: "#f59e0b",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-achat",
      name: "Dépenses achat",
      isDefault: true,
      color: "#ef4444",
      createdAt: new Date().toISOString(),
    },
    {
      id: "cat-autres",
      name: "Autres dépenses",
      isDefault: true,
      color: "#64748b",
      createdAt: new Date().toISOString(),
    },
  ];

  for (const cat of defaults) {
    await db.put("expenseCategories", cat);
  }
}

// ================================
// ID GENERATOR
// ================================

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ================================
// SALES CRUD
// ================================

export async function getSales(): Promise<Sale[]> {
  const db = await getDB();
  return db.getAll("sales");
}

export async function getSaleById(id: string): Promise<Sale | undefined> {
  const db = await getDB();
  return db.get("sales", id);
}

export async function addSale(
  data: Omit<Sale, "id" | "revenue" | "totalCost" | "totalExpenses" | "netProfit" | "createdAt" | "updatedAt">
): Promise<Sale> {
  const db = await getDB();
  const now = new Date().toISOString();

  const revenue = data.quantity * data.unitPrice;
  const totalCost = data.quantity * data.unitCost;
  const totalExpenses = data.expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = revenue - totalCost - totalExpenses;

  const sale: Sale = {
    ...data,
    id: generateId(),
    revenue,
    totalCost,
    totalExpenses,
    netProfit,
    createdAt: now,
    updatedAt: now,
  };

  await db.put("sales", sale);
  return sale;
}

export async function updateSale(
  id: string,
  data: Partial<Omit<Sale, "id" | "createdAt">>
): Promise<Sale> {
  const db = await getDB();
  const existing = await db.get("sales", id);
  if (!existing) throw new Error("Vente introuvable");

  const updated = {
    ...existing,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };

  // Recalculate
  updated.revenue = updated.quantity * updated.unitPrice;
  updated.totalCost = updated.quantity * updated.unitCost;
  updated.totalExpenses = updated.expenses.reduce((sum: number, e: { amount: number }) => sum + e.amount, 0);
  updated.netProfit = updated.revenue - updated.totalCost - updated.totalExpenses;

  await db.put("sales", updated);
  return updated;
}

export async function deleteSale(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("sales", id);
}

// ================================
// PRODUCTS CRUD
// ================================

export async function getProducts(): Promise<Product[]> {
  const db = await getDB();
  return db.getAll("products");
}

export async function addProduct(
  data: Omit<Product, "id" | "margin" | "createdAt" | "updatedAt">
): Promise<Product> {
  const db = await getDB();
  const now = new Date().toISOString();

  const product: Product = {
    ...data,
    id: generateId(),
    margin: data.sellPrice - data.buyPrice,
    createdAt: now,
    updatedAt: now,
  };

  await db.put("products", product);
  return product;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>
): Promise<Product> {
  const db = await getDB();
  const existing = await db.get("products", id);
  if (!existing) throw new Error("Produit introuvable");

  const updated = {
    ...existing,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };
  updated.margin = updated.sellPrice - updated.buyPrice;

  await db.put("products", updated);
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("products", id);
}

// ================================
// EXPENSES CRUD
// ================================

export async function getExpenses(): Promise<Expense[]> {
  const db = await getDB();
  return db.getAll("expenses");
}

export async function addExpense(
  data: Omit<Expense, "id" | "createdAt" | "updatedAt">
): Promise<Expense> {
  const db = await getDB();
  const now = new Date().toISOString();

  const expense: Expense = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  };

  await db.put("expenses", expense);
  return expense;
}

export async function updateExpense(
  id: string,
  data: Partial<Omit<Expense, "id" | "createdAt">>
): Promise<Expense> {
  const db = await getDB();
  const existing = await db.get("expenses", id);
  if (!existing) throw new Error("Dépense introuvable");

  const updated = {
    ...existing,
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  };

  await db.put("expenses", updated);
  return updated;
}

export async function deleteExpense(id: string): Promise<void> {
  const db = await getDB();
  await db.delete("expenses", id);
}

// ================================
// EXPENSE CATEGORIES CRUD
// ================================

export async function getExpenseCategories(): Promise<ExpenseCategory[]> {
  const db = await getDB();
  return db.getAll("expenseCategories");
}

export async function addExpenseCategory(
  name: string,
  color?: string
): Promise<ExpenseCategory> {
  const db = await getDB();

  const category: ExpenseCategory = {
    id: generateId(),
    name,
    isDefault: false,
    color: color || "#64748b",
    createdAt: new Date().toISOString(),
  };

  await db.put("expenseCategories", category);
  return category;
}

export async function deleteExpenseCategory(id: string): Promise<void> {
  const db = await getDB();
  const cat = await db.get("expenseCategories", id);
  if (cat?.isDefault) throw new Error("Impossible de supprimer une catégorie par défaut");
  await db.delete("expenseCategories", id);
}

// ================================
// SETTINGS
// ================================

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  const db = await getDB();
  const record = await db.get("settings", key);
  return record ? (record.value as T) : defaultValue;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put("settings", { key, value });
}

export async function getAppSettings(): Promise<AppSettings> {
  const currency = await getSetting<string>("currency", "FCFA");
  const currencySymbol = await getSetting<string>("currencySymbol", "FCFA");
  const customCards = await getSetting<DashboardCard[]>("customCards", []);

  return { currency, currencySymbol, customCards, theme: "dark" };
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<void> {
  if (settings.currency !== undefined) await setSetting("currency", settings.currency);
  if (settings.currencySymbol !== undefined) await setSetting("currencySymbol", settings.currencySymbol);
  if (settings.customCards !== undefined) await setSetting("customCards", settings.customCards);
}

// ================================
// BACKUP / RESTORE
// ================================

export async function exportAllData() {
  const [sales, products, expenses, expenseCategories, settings] = await Promise.all([
    getSales(),
    getProducts(),
    getExpenses(),
    getExpenseCategories(),
    getAppSettings(),
  ]);

  return {
    version: "1.0.0",
    exportDate: new Date().toISOString(),
    sales,
    products,
    expenses,
    expenseCategories,
    settings,
  };
}

export async function importAllData(data: {
  sales?: Sale[];
  products?: Product[];
  expenses?: Expense[];
  expenseCategories?: ExpenseCategory[];
  settings?: AppSettings;
}): Promise<void> {
  const db = await getDB();

  if (data.sales) {
    const tx = db.transaction("sales", "readwrite");
    await tx.store.clear();
    for (const sale of data.sales) await tx.store.put(sale);
    await tx.done;
  }

  if (data.products) {
    const tx = db.transaction("products", "readwrite");
    await tx.store.clear();
    for (const product of data.products) await tx.store.put(product);
    await tx.done;
  }

  if (data.expenses) {
    const tx = db.transaction("expenses", "readwrite");
    await tx.store.clear();
    for (const expense of data.expenses) await tx.store.put(expense);
    await tx.done;
  }

  if (data.expenseCategories) {
    const tx = db.transaction("expenseCategories", "readwrite");
    await tx.store.clear();
    for (const cat of data.expenseCategories) await tx.store.put(cat);
    await tx.done;
  }

  if (data.settings) {
    await saveAppSettings(data.settings);
  }
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  await db.clear("sales");
  await db.clear("products");
  await db.clear("expenses");
  const tx = db.transaction("expenseCategories", "readwrite");
  await tx.store.clear();
  await tx.done;
  // Re-seed default categories
  await seedDefaultCategories(db);
}
