// ================================
// TYPES PRINCIPAUX DE L'APPLICATION
// ================================

export interface SaleExpense {
  id: string;
  category: string;
  amount: number;
}

export interface Sale {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  productName: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  expenses: SaleExpense[];
  // Calculated fields (stored for performance)
  revenue: number;       // quantity * unitPrice
  totalCost: number;     // quantity * unitCost
  totalExpenses: number; // sum of expenses
  netProfit: number;     // revenue - totalCost - totalExpenses
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  buyPrice: number;
  sellPrice: number;
  // Calculated
  margin: number; // sellPrice - buyPrice
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  date: string; // ISO date string YYYY-MM-DD
  category: string;
  description: string;
  amount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  isDefault: boolean;
  color?: string;
  createdAt: string;
}

export type DashboardCardType =
  | "revenue"
  | "sales_count"
  | "quantity_sold"
  | "total_cost"
  | "total_expenses"
  | "net_profit"
  | "profit_margin"
  | "custom_category";

export interface DashboardCard {
  id: string;
  type: DashboardCardType;
  label: string;
  categoryId?: string; // for custom_category type
  position: number;
  isFixed: boolean;
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  customCards: DashboardCard[];
  theme: "dark";
}

// ================================
// TYPES DE PÉRIODE / FILTRES
// ================================

export type PeriodFilter =
  | "today"
  | "yesterday"
  | "last7days"
  | "last30days"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "all"
  | "custom";

export interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

export interface ActivePeriod {
  filter: PeriodFilter;
  customRange?: DateRange;
}

// ================================
// TYPES DE STATISTIQUES
// ================================

export interface DashboardStats {
  revenue: number;
  salesCount: number;
  quantitySold: number;
  totalCost: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  categoryTotals: Record<string, number>;
}

// ================================
// TYPES D'EXPORT/IMPORT
// ================================

export interface BackupData {
  version: string;
  exportDate: string;
  sales: Sale[];
  products: Product[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  settings: AppSettings;
}
