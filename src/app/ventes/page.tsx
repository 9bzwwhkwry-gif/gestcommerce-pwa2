"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  Edit3,
  ChevronRight,
  X,
  Filter,
} from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { formatCurrency, formatDate } from "@/lib/utils";
import PeriodFilter from "@/components/ui/PeriodFilter";
import EmptyState from "@/components/ui/EmptyState";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import SaleForm from "@/components/sales/SaleForm";
import type { Sale } from "@/types";

export default function VentesPage() {
  const { filteredSales, removeSale, activePeriod, setActivePeriod, settings } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);

  const displayedSales = filteredSales
    .filter((s) =>
      s.productName.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalRevenue = displayedSales.reduce((sum, s) => sum + s.revenue, 0);
  const totalProfit = displayedSales.reduce((sum, s) => sum + s.netProfit, 0);

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeSale(deletingId);
    setDeletingId(null);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingSale(null);
  };

  return (
    <div className="pb-4 max-w-screen-sm mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">Ventes</h1>
            <p className="text-xs text-slate-500">
              {displayedSales.length} vente{displayedSales.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { setEditingSale(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-400 transition-colors text-sm shadow-lg shadow-green-500/20"
          >
            <Plus size={18} />
            Nouvelle vente
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Rechercher un produit..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-white text-sm placeholder:text-slate-500 focus:border-green-500 outline-none"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
              >
                <X size={13} />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowFilter(!showFilter)}
            className={`p-2.5 rounded-xl border transition-colors ${
              showFilter
                ? "bg-green-500/10 border-green-500/30 text-green-400"
                : "bg-slate-800 border-slate-700 text-slate-400"
            }`}
          >
            <Filter size={16} />
          </button>
        </div>

        {showFilter && (
          <div className="mt-2">
            <PeriodFilter value={activePeriod} onChange={setActivePeriod} compact />
          </div>
        )}
      </div>

      {/* Summary bar */}
      {displayedSales.length > 0 && (
        <div className="mx-4 mt-3 p-3 bg-slate-800/50 border border-slate-700/50 rounded-2xl flex items-center justify-between">
          <div className="text-center flex-1">
            <p className="text-xs text-slate-500">Chiffre d&apos;affaires</p>
            <p className="text-sm font-bold text-green-400">
              {formatCurrency(totalRevenue, settings.currencySymbol)}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center flex-1">
            <p className="text-xs text-slate-500">Bénéfice net</p>
            <p className={`text-sm font-bold ${totalProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
              {formatCurrency(totalProfit, settings.currencySymbol)}
            </p>
          </div>
          <div className="w-px h-8 bg-slate-700" />
          <div className="text-center flex-1">
            <p className="text-xs text-slate-500">Ventes</p>
            <p className="text-sm font-bold text-blue-400">{displayedSales.length}</p>
          </div>
        </div>
      )}

      {/* Sales list */}
      <div className="px-4 mt-3 space-y-2">
        {displayedSales.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Aucune vente"
            description="Enregistrez votre première vente en appuyant sur le bouton."
            actionLabel="Nouvelle vente"
            onAction={() => setShowForm(true)}
          />
        ) : (
          displayedSales.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              currencySymbol={settings.currencySymbol}
              onEdit={() => handleEdit(sale)}
              onDelete={() => setDeletingId(sale.id)}
            />
          ))
        )}
      </div>

      {/* Sale Form Modal */}
      {showForm && (
        <SaleForm
          isOpen={showForm}
          onClose={handleCloseForm}
          editingSale={editingSale}
        />
      )}

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        title="Supprimer la vente"
        message="Cette action est irréversible. La vente sera définitivement supprimée."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

// ---- Sale Card ----
function SaleCard({
  sale,
  currencySymbol,
  onEdit,
  onDelete,
}: {
  sale: Sale;
  currencySymbol: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl overflow-hidden">
      {/* Main row */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setShowDetails(!showDetails)}
      >
        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
          <ShoppingCart size={18} className="text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {sale.productName}
          </p>
          <p className="text-xs text-slate-500">
            {formatDate(sale.date)} · {sale.quantity} unité{sale.quantity > 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold text-green-400">
            {formatCurrency(sale.revenue, currencySymbol)}
          </p>
          <p
            className={`text-xs font-medium ${
              sale.netProfit >= 0 ? "text-green-400/70" : "text-red-400/70"
            }`}
          >
            {sale.netProfit >= 0 ? "+" : ""}
            {formatCurrency(sale.netProfit, currencySymbol)}
          </p>
        </div>
        <ChevronRight
          size={16}
          className={`text-slate-600 transition-transform flex-shrink-0 ${
            showDetails ? "rotate-90" : ""
          }`}
        />
      </div>

      {/* Details */}
      {showDetails && (
        <div className="px-4 pb-4 border-t border-slate-700/50 pt-3 space-y-2">
          <DetailRow
            label="Qté × Prix"
            value={`${sale.quantity} × ${formatCurrency(sale.unitPrice, currencySymbol)}`}
          />
          <DetailRow
            label="Coût d'achat"
            value={formatCurrency(sale.totalCost, currencySymbol)}
            valueColor="text-yellow-400"
          />
          {sale.expenses.length > 0 && (
            <>
              <div className="border-t border-slate-700/30 pt-2 mt-2">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                  Dépenses liées
                </p>
                {sale.expenses.map((exp, i) => (
                  <DetailRow
                    key={i}
                    label={exp.category}
                    value={formatCurrency(exp.amount, currencySymbol)}
                    valueColor="text-red-400"
                  />
                ))}
              </div>
            </>
          )}
          <div className="border-t border-slate-700/30 pt-2 mt-2">
            <DetailRow
              label="Bénéfice net"
              value={formatCurrency(sale.netProfit, currencySymbol)}
              valueColor={sale.netProfit >= 0 ? "text-green-400" : "text-red-400"}
              bold
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={onEdit}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 text-sm font-medium transition-colors"
            >
              <Edit3 size={14} />
              Modifier
            </button>
            <button
              onClick={onDelete}
              className="flex items-center justify-center gap-2 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 text-sm font-medium transition-colors"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({
  label,
  value,
  valueColor = "text-slate-300",
  bold = false,
}: {
  label: string;
  value: string;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-500">{label}</span>
      <span className={`text-xs ${valueColor} ${bold ? "font-bold" : "font-medium"}`}>
        {value}
      </span>
    </div>
  );
}
