"use client";

import { useState } from "react";
import {
  Plus,
  CreditCard,
  Search,
  Trash2,
  Edit3,
  X,
  Filter,
  ChevronDown,
} from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { formatCurrency, formatDate, todayString } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import PeriodFilter from "@/components/ui/PeriodFilter";
import type { Expense } from "@/types";

export default function DepensesPage() {
  const {
    filteredExpenses,
    createExpense,
    editExpense,
    removeExpense,
    categories,
    activePeriod,
    setActivePeriod,
    settings,
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [showFilter, setShowFilter] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("all");

  const displayed = filteredExpenses
    .filter((e) => {
      const matchSearch =
        e.category.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === "all" || e.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => b.date.localeCompare(a.date));

  const total = displayed.reduce((sum, e) => sum + e.amount, 0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeExpense(deletingId);
    setDeletingId(null);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  // Category breakdown
  const categoryTotals: Record<string, number> = {};
  for (const exp of displayed) {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  }

  return (
    <div className="pb-4 max-w-screen-sm mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">Dépenses</h1>
            <p className="text-xs text-slate-500">
              {displayed.length} dépense{displayed.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { setEditingExpense(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-400 transition-colors text-sm shadow-lg shadow-green-500/20"
          >
            <Plus size={18} />
            Nouvelle
          </button>
        </div>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-white text-sm placeholder:text-slate-500 focus:border-green-500 outline-none"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
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
          <div className="mt-2 space-y-2">
            <PeriodFilter value={activePeriod} onChange={setActivePeriod} compact />
            {/* Category filter */}
            <div className="relative">
              <select
                value={categoryFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategoryFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm appearance-none focus:border-green-500 outline-none cursor-pointer pr-8"
              >
                <option value="all">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>
          </div>
        )}
      </div>

      {/* Total */}
      {displayed.length > 0 && (
        <div className="mx-4 mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-2xl">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Total dépenses</span>
            <span className="text-base font-bold text-red-400">
              {formatCurrency(total, settings.currencySymbol)}
            </span>
          </div>
          {/* Category breakdown (top 3) */}
          {Object.keys(categoryTotals).length > 1 && (
            <div className="mt-2 pt-2 border-t border-slate-700/30 space-y-1">
              {Object.entries(categoryTotals)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 4)
                .map(([cat, amt]) => (
                  <div key={cat} className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">{cat}</span>
                    <span className="text-xs font-medium text-red-400/70">
                      {formatCurrency(amt, settings.currencySymbol)}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* List */}
      <div className="px-4 mt-3 space-y-2">
        {displayed.length === 0 ? (
          <EmptyState
            icon={CreditCard}
            title="Aucune dépense"
            description="Enregistrez vos dépenses pour suivre vos coûts."
            actionLabel="Nouvelle dépense"
            onAction={() => setShowForm(true)}
          />
        ) : (
          displayed.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              currencySymbol={settings.currencySymbol}
              onEdit={() => handleEdit(expense)}
              onDelete={() => setDeletingId(expense.id)}
            />
          ))
        )}
      </div>

      {/* Form */}
      {showForm && (
        <ExpenseFormModal
          isOpen={showForm}
          onClose={handleClose}
          editingExpense={editingExpense}
          onSave={async (data) => {
            if (editingExpense) {
              await editExpense(editingExpense.id, data);
            } else {
              await createExpense(data);
            }
            handleClose();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        title="Supprimer la dépense"
        message="Cette dépense sera définitivement supprimée."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

// ---- Expense Card ----
function ExpenseCard({
  expense,
  currencySymbol,
  onEdit,
  onDelete,
}: {
  expense: Expense;
  currencySymbol: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-3">
      <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <CreditCard size={18} className="text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{expense.category}</p>
        <p className="text-xs text-slate-500">
          {formatDate(expense.date)}
          {expense.description && ` · ${expense.description}`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <p className="text-sm font-bold text-red-400">
          {formatCurrency(expense.amount, currencySymbol)}
        </p>
        <button
          onClick={onEdit}
          className="p-1.5 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <Edit3 size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

// ---- Expense Form ----
function ExpenseFormModal({
  isOpen,
  onClose,
  editingExpense,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingExpense: Expense | null;
  onSave: (data: Omit<Expense, "id" | "createdAt" | "updatedAt">) => Promise<void>;
}) {
  const { categories } = useApp();
  const [date, setDate] = useState(editingExpense?.date || todayString());
  const [category, setCategory] = useState(
    editingExpense?.category || (categories[0]?.name || "Autres dépenses")
  );
  const [description, setDescription] = useState(editingExpense?.description || "");
  const [amount, setAmount] = useState(editingExpense ? String(editingExpense.amount) : "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isValid = category && amount && parseFloat(amount) > 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await onSave({
        date,
        category,
        description,
        amount: parseFloat(amount),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingExpense ? "Modifier la dépense" : "Nouvelle dépense"}
      size="md"
    >
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base focus:border-green-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Catégorie *</label>
          <div className="relative">
            <select
              value={category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base appearance-none focus:border-green-500 outline-none cursor-pointer pr-10"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-slate-800">{cat.name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
            placeholder="Optionnel — détail de la dépense"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-slate-600 focus:border-green-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Montant *</label>
          <input
            type="number"
            value={amount}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAmount(e.target.value)}
            placeholder="0"
            min="0"
            step="1"
            inputMode="decimal"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-slate-600 focus:border-green-500 outline-none"
          />
        </div>

        <div className="pb-2">
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full py-4 bg-green-500 text-white font-bold text-base rounded-2xl hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
          >
            {isSubmitting
              ? "Enregistrement..."
              : editingExpense
              ? "Mettre à jour"
              : "Enregistrer la dépense"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
