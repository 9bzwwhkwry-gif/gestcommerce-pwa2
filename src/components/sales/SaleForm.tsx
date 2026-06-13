"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ChevronDown } from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { todayString } from "@/lib/utils";
import Modal from "@/components/ui/Modal";
import type { Sale, SaleExpense } from "@/types";
import { generateId } from "@/lib/db";

interface SaleFormProps {
  isOpen: boolean;
  onClose: () => void;
  editingSale?: Sale | null;
}

const DEFAULT_EXPENSE_CATEGORIES = [
  "Livraison",
  "Publicité",
  "Assistant",
  "Emballage",
  "Autre",
];

export default function SaleForm({ isOpen, onClose, editingSale }: SaleFormProps) {
  const { createSale, editSale, categories } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form fields
  const [date, setDate] = useState(todayString());
  const [productName, setProductName] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [expenses, setExpenses] = useState<SaleExpense[]>([]);

  // Populate form when editing
  useEffect(() => {
    if (editingSale) {
      setDate(editingSale.date);
      setProductName(editingSale.productName);
      setQuantity(String(editingSale.quantity));
      setUnitPrice(String(editingSale.unitPrice));
      setUnitCost(String(editingSale.unitCost));
      setExpenses(editingSale.expenses);
    } else {
      setDate(todayString());
      setProductName("");
      setQuantity("1");
      setUnitPrice("");
      setUnitCost("");
      setExpenses([]);
    }
  }, [editingSale, isOpen]);

  // Calculated values
  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;
  const cost = parseFloat(unitCost) || 0;
  const revenue = qty * price;
  const totalCost = qty * cost;
  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(String(e.amount)) || 0), 0);
  const netProfit = revenue - totalCost - totalExpenses;

  const addExpense = () => {
    setExpenses((prev) => [
      ...prev,
      { id: generateId(), category: "Livraison", amount: 0 },
    ]);
  };

  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const updateExpense = (id: string, field: keyof SaleExpense, value: string | number) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, [field]: field === "amount" ? parseFloat(String(value)) || 0 : value } : e
      )
    );
  };

  const allCategories = [
    ...DEFAULT_EXPENSE_CATEGORIES,
    ...categories.map((c) => c.name).filter((n) => !DEFAULT_EXPENSE_CATEGORIES.includes(n)),
  ];

  const handleSubmit = async () => {
    if (!productName.trim() || !unitPrice || !unitCost) return;
    setIsSubmitting(true);
    try {
      const data = {
        date,
        productName: productName.trim(),
        quantity: qty,
        unitPrice: price,
        unitCost: cost,
        expenses: expenses.map((e) => ({
          ...e,
          amount: parseFloat(String(e.amount)) || 0,
        })),
      };

      if (editingSale) {
        await editSale(editingSale.id, data);
      } else {
        await createSale(data);
      }
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = productName.trim() && unitPrice && unitCost && qty > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingSale ? "Modifier la vente" : "Nouvelle vente"}
      size="full"
    >
      <div className="p-5 space-y-5">
        {/* Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Date *
          </label>
          <input
            type="date"
            value={date}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base focus:border-green-500 outline-none"
          />
        </div>

        {/* Product name */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Nom du produit *
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProductName(e.target.value)}
            placeholder="Ex: Robe africaine, Chaussures Nike..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-slate-600 focus:border-green-500 outline-none"
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Quantité vendue *
          </label>
          <input
            type="number"
            value={quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
            min="1"
            step="1"
            inputMode="numeric"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base focus:border-green-500 outline-none"
          />
        </div>

        {/* Prices */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Prix de vente *
            </label>
            <input
              type="number"
              value={unitPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnitPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              inputMode="decimal"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-slate-600 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Coût d&apos;achat *
            </label>
            <input
              type="number"
              value={unitCost}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUnitCost(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              inputMode="decimal"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-slate-600 focus:border-green-500 outline-none"
            />
          </div>
        </div>

        {/* Live calculations */}
        {(revenue > 0 || totalCost > 0) && (
          <div className="bg-slate-900 rounded-2xl p-4 space-y-2 border border-slate-700/50">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Calcul automatique
            </p>
            <CalcRow label="Chiffre d'affaires" value={revenue} color="text-green-400" />
            <CalcRow label="Coût d'achat total" value={-totalCost} color="text-yellow-400" />
            {totalExpenses > 0 && (
              <CalcRow label="Total dépenses" value={-totalExpenses} color="text-red-400" />
            )}
            <div className="border-t border-slate-700/50 pt-2 mt-1">
              <CalcRow
                label="Bénéfice net"
                value={netProfit}
                color={netProfit >= 0 ? "text-green-400" : "text-red-400"}
                bold
              />
            </div>
          </div>
        )}

        {/* Expenses section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Dépenses liées à la vente
            </label>
            <button
              onClick={addExpense}
              className="flex items-center gap-1.5 text-green-400 text-xs font-semibold hover:text-green-300 transition-colors"
            >
              <Plus size={14} />
              Ajouter
            </button>
          </div>

          {expenses.length === 0 ? (
            <button
              onClick={addExpense}
              className="w-full border-2 border-dashed border-slate-700 rounded-xl py-4 text-slate-500 text-sm hover:border-green-500/30 hover:text-green-400/70 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} />
              Livraison, publicité, assistant...
            </button>
          ) : (
            <div className="space-y-2">
              {expenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center gap-2 bg-slate-800 rounded-xl p-2 border border-slate-700/50"
                >
                  {/* Category selector */}
                  <div className="relative flex-1">
                    <select
                      value={exp.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateExpense(exp.id, "category", e.target.value)}
                      className="w-full bg-transparent text-white text-sm py-2 px-3 pr-7 appearance-none focus:outline-none cursor-pointer"
                    >
                      {allCategories.map((cat) => (
                        <option key={cat} value={cat} className="bg-slate-800">
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                  </div>
                  {/* Amount */}
                  <input
                    type="number"
                    value={exp.amount || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateExpense(exp.id, "amount", e.target.value)}
                    placeholder="0"
                    min="0"
                    step="1"
                    inputMode="decimal"
                    className="w-28 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm text-right focus:border-green-500 outline-none"
                  />
                  {/* Remove */}
                  <button
                    onClick={() => removeExpense(exp.id)}
                    className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="pb-2">
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="w-full py-4 bg-green-500 text-white font-bold text-base rounded-2xl hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
          >
            {isSubmitting
              ? "Enregistrement..."
              : editingSale
              ? "Mettre à jour"
              : "Enregistrer la vente"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function CalcRow({
  label,
  value,
  color,
  bold = false,
}: {
  label: string;
  value: number;
  color: string;
  bold?: boolean;
}) {
  const formatted = new Intl.NumberFormat("fr-FR").format(Math.abs(value));
  const sign = value < 0 ? "- " : "";
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs text-slate-400">{label}</span>
      <span className={`text-xs ${color} ${bold ? "font-bold text-sm" : "font-medium"}`}>
        {sign}{formatted}
      </span>
    </div>
  );
}
