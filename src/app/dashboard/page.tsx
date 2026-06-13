"use client";

import { useState } from "react";
import {
  ShoppingCart,
  Package,
  Receipt,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { formatCurrency, formatPercent } from "@/lib/utils";
import PeriodFilter from "@/components/ui/PeriodFilter";
import StatCard from "@/components/ui/StatCard";
import Modal from "@/components/ui/Modal";
import type { DashboardCard, ExpenseCategory } from "@/types";
import { generateId } from "@/lib/db";

export default function DashboardPage() {
  const {
    stats,
    activePeriod,
    setActivePeriod,
    settings,
    categories,
    addDashboardCard,
    removeDashboardCard,
    isLoading,
  } = useApp();

  const [showAddCard, setShowAddCard] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  const currencySymbol = settings.currencySymbol;

  // Fixed cards
  const fixedCards = [
    {
      id: "revenue",
      label: "Chiffre d'affaires",
      value: stats.revenue,
      color: "green" as const,
      format: "currency" as const,
      trend: stats.revenue > 0 ? "positive" as const : "neutral" as const,
    },
    {
      id: "sales_count",
      label: "Nombre de ventes",
      value: stats.salesCount,
      color: "blue" as const,
      format: "number" as const,
      trend: "positive" as const,
    },
    {
      id: "quantity_sold",
      label: "Quantité vendue",
      value: stats.quantitySold,
      color: "purple" as const,
      format: "number" as const,
      trend: "positive" as const,
    },
    {
      id: "total_cost",
      label: "Coût d'achat total",
      value: stats.totalCost,
      color: "yellow" as const,
      format: "currency" as const,
      trend: "neutral" as const,
    },
    {
      id: "total_expenses",
      label: "Dépenses totales",
      value: stats.totalExpenses,
      color: "red" as const,
      format: "currency" as const,
      trend: stats.totalExpenses > 0 ? "negative" as const : "neutral" as const,
    },
    {
      id: "net_profit",
      label: "Bénéfice net",
      value: stats.netProfit,
      color: stats.netProfit >= 0 ? "green" as const : "red" as const,
      format: "currency" as const,
      trend: stats.netProfit > 0 ? "positive" as const : stats.netProfit < 0 ? "negative" as const : "neutral" as const,
      size: "large" as const,
    },
    {
      id: "profit_margin",
      label: "Marge bénéficiaire",
      value: stats.profitMargin,
      color: stats.profitMargin >= 20 ? "green" as const : "yellow" as const,
      format: "percent" as const,
      trend: stats.profitMargin > 0 ? "positive" as const : "neutral" as const,
    },
  ];

  const handleAddCustomCard = (categoryId: string, categoryName: string) => {
    const card: DashboardCard = {
      id: generateId(),
      type: "custom_category",
      label: categoryName,
      categoryId,
      position: (settings.customCards?.length || 0) + 1,
      isFixed: false,
    };
    addDashboardCard(card);
    setShowAddCard(false);
  };

  const availableCategories = categories.filter(
    (cat) =>
      !settings.customCards?.some((card) => card.categoryId === cat.id)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 pt-5 pb-4 max-w-screen-sm mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-white">Tableau de bord</h1>
          <p className="text-xs text-slate-500 mt-0.5">Vue d&apos;ensemble</p>
        </div>
        <button
          onClick={() => setShowSearch(!showSearch)}
          className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700"
        >
          {showSearch ? <X size={18} /> : <Search size={18} />}
        </button>
      </div>

      {/* Search */}
      {showSearch && (
        <div className="mb-4">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </div>
      )}

      {/* Period Filter */}
      <div className="mb-5">
        <PeriodFilter value={activePeriod} onChange={setActivePeriod} />
      </div>

      {/* Fixed Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {fixedCards.map((card) => (
          <div
            key={card.id}
            className={card.size === "large" ? "col-span-2" : ""}
          >
            <StatCard
              label={card.label}
              value={card.value}
              format={card.format}
              symbol={currencySymbol}
              trend={card.trend}
              color={card.color}
              size={card.size}
            />
          </div>
        ))}
      </div>

      {/* Custom Cards */}
      {settings.customCards && settings.customCards.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-3">
          {settings.customCards.map((card) => {
            const value = stats.categoryTotals[
              categories.find((c) => c.id === card.categoryId)?.name || ""
            ] || 0;
            return (
              <StatCard
                key={card.id}
                label={card.label}
                value={value}
                format="currency"
                symbol={currencySymbol}
                color="gray"
                trend="neutral"
                onRemove={() => removeDashboardCard(card.id)}
              />
            );
          })}
        </div>
      )}

      {/* Add card button */}
      <button
        onClick={() => setShowAddCard(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 hover:border-green-500/50 hover:text-green-400 transition-colors text-sm font-medium"
      >
        <Plus size={18} />
        Ajouter un indicateur
      </button>

      {/* Add Card Modal */}
      <Modal
        isOpen={showAddCard}
        onClose={() => setShowAddCard(false)}
        title="Ajouter un indicateur"
        size="md"
      >
        <div className="p-5">
          {availableCategories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400 text-sm">
                Toutes les catégories sont déjà affichées.
              </p>
              <p className="text-slate-500 text-xs mt-2">
                Créez de nouvelles catégories dans les Paramètres.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold mb-3">
                Catégories de dépenses
              </p>
              {availableCategories.map((cat: ExpenseCategory) => (
                <button
                  key={cat.id}
                  onClick={() => handleAddCustomCard(cat.id, cat.name)}
                  className="w-full flex items-center gap-3 p-4 bg-slate-800 hover:bg-slate-700 rounded-2xl border border-slate-700 transition-colors text-left"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color || "#64748b" }}
                  />
                  <span className="text-white text-sm font-medium">
                    {cat.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Search Results */}
      {showSearch && searchTerm && (
        <SearchResults query={searchTerm} />
      )}
    </div>
  );
}

// ---- Search Bar ----
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <Search
        size={16}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <input
        type="text"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        placeholder="Rechercher ventes, produits, dépenses..."
        autoFocus
        className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm placeholder:text-slate-500 focus:border-green-500 outline-none"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// ---- Search Results ----
function SearchResults({ query }: { query: string }) {
  const { sales, products, expenses } = useApp();
  const q = query.toLowerCase();

  const matchedSales = sales
    .filter((s) => s.productName.toLowerCase().includes(q))
    .slice(0, 5);

  const matchedProducts = products
    .filter((p) => p.name.toLowerCase().includes(q))
    .slice(0, 5);

  const matchedExpenses = expenses
    .filter(
      (e) =>
        e.category.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q)
    )
    .slice(0, 5);

  const total = matchedSales.length + matchedProducts.length + matchedExpenses.length;

  return (
    <div className="mt-4">
      {total === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400 text-sm">Aucun résultat pour &quot;{query}&quot;</p>
        </div>
      ) : (
        <div className="space-y-4">
          {matchedSales.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Ventes ({matchedSales.length})
              </p>
              {matchedSales.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700 mb-2"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart size={14} className="text-blue-400" />
                    <span className="text-sm text-white">{s.productName}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-400">
                    {formatCurrency(s.revenue)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {matchedProducts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Produits ({matchedProducts.length})
              </p>
              {matchedProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700 mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-purple-400" />
                    <span className="text-sm text-white">{p.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-green-400">
                    {formatCurrency(p.sellPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}

          {matchedExpenses.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Dépenses ({matchedExpenses.length})
              </p>
              {matchedExpenses.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700 mb-2"
                >
                  <div className="flex items-center gap-2">
                    <Receipt size={14} className="text-red-400" />
                    <div>
                      <p className="text-sm text-white">{e.category}</p>
                      {e.description && (
                        <p className="text-xs text-slate-500">{e.description}</p>
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-red-400">
                    {formatCurrency(e.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
