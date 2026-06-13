"use client";

import { useState } from "react";
import {
  Plus,
  Package,
  Search,
  Trash2,
  Edit3,
  X,
  TrendingUp,
} from "lucide-react";
import { useApp } from "@/hooks/useApp";
import { formatCurrency } from "@/lib/utils";
import EmptyState from "@/components/ui/EmptyState";
import Modal from "@/components/ui/Modal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import type { Product } from "@/types";

export default function ProduitsPage() {
  const { products, createProduct, editProduct, removeProduct, settings } = useApp();
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const displayed = products
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    await removeProduct(deletingId);
    setDeletingId(null);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <div className="pb-4 max-w-screen-sm mx-auto">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 px-4 pt-5 pb-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-xl font-bold text-white">Catalogue</h1>
            <p className="text-xs text-slate-500">
              {displayed.length} produit{displayed.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={() => { setEditingProduct(null); setShowForm(true); }}
            className="flex items-center gap-2 bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl hover:bg-green-400 transition-colors text-sm shadow-lg shadow-green-500/20"
          >
            <Plus size={18} />
            Nouveau
          </button>
        </div>

        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Rechercher un produit..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-white text-sm placeholder:text-slate-500 focus:border-green-500 outline-none"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Info banner */}
      <div className="mx-4 mt-3 p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
        <p className="text-xs text-blue-400/80">
          ℹ️ Le catalogue est informatif uniquement. Les ventes peuvent utiliser n&apos;importe quel nom de produit.
        </p>
      </div>

      {/* List */}
      <div className="px-4 mt-3 space-y-2">
        {displayed.length === 0 ? (
          <EmptyState
            icon={Package}
            title="Catalogue vide"
            description="Ajoutez vos produits pour consulter leurs marges bénéficiaires."
            actionLabel="Ajouter un produit"
            onAction={() => setShowForm(true)}
          />
        ) : (
          displayed.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              currencySymbol={settings.currencySymbol}
              onEdit={() => handleEdit(product)}
              onDelete={() => setDeletingId(product.id)}
            />
          ))
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ProductFormModal
          isOpen={showForm}
          onClose={handleClose}
          editingProduct={editingProduct}
          onSave={async (data) => {
            if (editingProduct) {
              await editProduct(editingProduct.id, data);
            } else {
              await createProduct(data);
            }
            handleClose();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={!!deletingId}
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        title="Supprimer le produit"
        message="Ce produit sera retiré du catalogue."
        confirmLabel="Supprimer"
        danger
      />
    </div>
  );
}

// ---- Product Card ----
function ProductCard({
  product,
  currencySymbol,
  onEdit,
  onDelete,
}: {
  product: Product;
  currencySymbol: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const marginPercent =
    product.sellPrice > 0
      ? ((product.margin / product.sellPrice) * 100).toFixed(0)
      : "0";

  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Package size={18} className="text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{product.name}</p>
            <p className="text-xs text-slate-500">
              Marge : {marginPercent}%
            </p>
          </div>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <button
            onClick={onEdit}
            className="p-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-slate-300 transition-colors"
          >
            <Edit3 size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Achat</p>
          <p className="text-xs font-bold text-yellow-400 mt-0.5">
            {formatCurrency(product.buyPrice, currencySymbol)}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Vente</p>
          <p className="text-xs font-bold text-blue-400 mt-0.5">
            {formatCurrency(product.sellPrice, currencySymbol)}
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-xl p-2.5 text-center">
          <p className="text-[10px] text-slate-500 uppercase tracking-wide">Bénéfice</p>
          <p className={`text-xs font-bold mt-0.5 ${product.margin >= 0 ? "text-green-400" : "text-red-400"}`}>
            {formatCurrency(product.margin, currencySymbol)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---- Product Form ----
function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSave,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSave: (data: { name: string; buyPrice: number; sellPrice: number }) => Promise<void>;
}) {
  const [name, setName] = useState(editingProduct?.name || "");
  const [buyPrice, setBuyPrice] = useState(
    editingProduct ? String(editingProduct.buyPrice) : ""
  );
  const [sellPrice, setSellPrice] = useState(
    editingProduct ? String(editingProduct.sellPrice) : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const buy = parseFloat(buyPrice) || 0;
  const sell = parseFloat(sellPrice) || 0;
  const margin = sell - buy;
  const marginPct = sell > 0 ? ((margin / sell) * 100).toFixed(1) : "0";

  const isValid = name.trim() && buyPrice && sellPrice;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsSubmitting(true);
    try {
      await onSave({ name: name.trim(), buyPrice: buy, sellPrice: sell });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProduct ? "Modifier le produit" : "Nouveau produit"}
      size="md"
    >
      <div className="p-5 space-y-5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Nom du produit *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            placeholder="Ex: Robe africaine, Chaussures Nike..."
            autoFocus
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-slate-600 focus:border-green-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Prix d&apos;achat *
            </label>
            <input
              type="number"
              value={buyPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBuyPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              inputMode="decimal"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-slate-600 focus:border-green-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Prix de vente *
            </label>
            <input
              type="number"
              value={sellPrice}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSellPrice(e.target.value)}
              placeholder="0"
              min="0"
              step="1"
              inputMode="decimal"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3.5 text-white text-base placeholder:text-slate-600 focus:border-green-500 outline-none"
            />
          </div>
        </div>

        {/* Live margin preview */}
        {(buy > 0 || sell > 0) && (
          <div className="bg-slate-900 rounded-2xl p-4 border border-slate-700/50">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-green-400" />
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Bénéfice théorique
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Par unité vendue</span>
              <div className="text-right">
                <p className={`text-lg font-bold ${margin >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {new Intl.NumberFormat("fr-FR").format(margin)}
                </p>
                <p className="text-xs text-slate-500">Marge {marginPct}%</p>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={!isValid || isSubmitting}
          className="w-full py-4 bg-green-500 text-white font-bold text-base rounded-2xl hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/20"
        >
          {isSubmitting
            ? "Enregistrement..."
            : editingProduct
            ? "Mettre à jour"
            : "Ajouter au catalogue"}
        </button>
      </div>
    </Modal>
  );
}
