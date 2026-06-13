"use client";

import { useState, useRef } from "react";
import type React from "react";
import {
  Settings,
  Tag,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  Info,
  ChevronRight,
  Check,
  X,
  FileText,
  Table,
} from "lucide-react";
import { useApp } from "@/hooks/useApp";
import {
  exportSalesToCsv,
  exportSalesToExcel,
  exportProductsToCsv,
  exportProductsToExcel,
  exportExpensesToCsv,
  exportExpensesToExcel,
  exportBackupJson,
} from "@/lib/export";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Modal from "@/components/ui/Modal";

export default function ParametresPage() {
  const {
    categories,
    createCategory,
    removeCategory,
    exportBackup,
    importBackup,
    resetAll,
    sales,
    products,
    expenses,
    settings,
    updateSettings,
  } = useApp();

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#22c55e");
  const [deletingCatId, setDeletingCatId] = useState<string | null>(null);
  const [showReset, setShowReset] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [currency, setCurrency] = useState(settings.currencySymbol);
  const [currencyChanged, setCurrencyChanged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    await createCategory(newCategoryName.trim(), newCategoryColor);
    setNewCategoryName("");
    setNewCategoryColor("#22c55e");
    setShowNewCategory(false);
  };

  const handleDeleteCategory = async () => {
    if (!deletingCatId) return;
    try {
      await removeCategory(deletingCatId);
    } catch {
      // Default categories cannot be deleted
    }
    setDeletingCatId(null);
  };

  const handleExportBackup = async () => {
    const data = await exportBackup();
    exportBackupJson(data);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importBackup(data);
      setImportSuccess(true);
      setTimeout(() => setImportSuccess(false), 3000);
    } catch {
      alert("Fichier invalide. Assurez-vous d'importer un fichier de sauvegarde GestCommerce.");
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleReset = async () => {
    await resetAll();
    setShowReset(false);
  };

  const handleCurrencyChange = async () => {
    await updateSettings({ currencySymbol: currency, currency });
    setCurrencyChanged(false);
  };

  return (
    <div className="pb-4 max-w-screen-sm mx-auto">
      {/* Header */}
      <div className="px-4 pt-5 pb-3">
        <h1 className="text-xl font-bold text-white">Paramètres</h1>
        <p className="text-xs text-slate-500 mt-0.5">Gérer l&apos;application</p>
      </div>

      <div className="px-4 space-y-3">
        {/* Currency */}
        <SectionCard title="Devise" icon={Settings}>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={currency}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCurrency(e.target.value); setCurrencyChanged(true); }}
              placeholder="FCFA, €, $, ..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white text-sm focus:border-green-500 outline-none"
            />
            {currencyChanged && (
              <button
                onClick={handleCurrencyChange}
                className="p-3 bg-green-500 rounded-xl text-white"
              >
                <Check size={16} />
              </button>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">Symbole utilisé dans tous les affichages</p>
        </SectionCard>

        {/* Categories */}
        <SectionCard title="Catégories de dépenses" icon={Tag}>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="flex items-center gap-3 py-2"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color || "#64748b" }}
                />
                <span className="text-sm text-white flex-1">{cat.name}</span>
                {cat.isDefault ? (
                  <span className="text-[10px] text-slate-500 px-2 py-0.5 bg-slate-700/50 rounded-full">
                    Défaut
                  </span>
                ) : (
                  <button
                    onClick={() => setDeletingCatId(cat.id)}
                    className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))}

            {/* Add category */}
            {showNewCategory ? (
              <div className="bg-slate-700/50 rounded-xl p-3 space-y-2 mt-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryName(e.target.value)}
                  placeholder="Nom de la catégorie"
                  autoFocus
                  className="w-full bg-slate-800 border border-slate-600 rounded-xl px-3 py-2.5 text-white text-sm focus:border-green-500 outline-none"
                />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-slate-400">Couleur</label>
                    <input
                      type="color"
                      value={newCategoryColor}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCategoryColor(e.target.value)}
                      className="w-8 h-8 rounded-lg border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                  <button
                    onClick={() => { setShowNewCategory(false); setNewCategoryName(""); }}
                    className="p-2 text-slate-400 hover:text-white"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategoryName.trim()}
                    className="px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl disabled:opacity-50"
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowNewCategory(true)}
                className="w-full flex items-center gap-2 py-2.5 text-green-400 text-sm font-medium hover:text-green-300 transition-colors mt-1"
              >
                <Plus size={16} />
                Nouvelle catégorie
              </button>
            )}
          </div>
        </SectionCard>

        {/* Export */}
        <SectionCard title="Export" icon={Download}>
          <div className="space-y-1">
            <ActionButton
              label="Exporter tout (Excel + CSV)"
              description={`${sales.length} ventes · ${products.length} produits · ${expenses.length} dépenses`}
              icon={Table}
              onClick={() => setShowExportModal(true)}
            />
          </div>
        </SectionCard>

        {/* Backup */}
        <SectionCard title="Sauvegarde" icon={Upload}>
          <div className="space-y-2">
            <ActionButton
              label="Télécharger la sauvegarde"
              description="Fichier JSON complet pour restaurer sur un autre appareil"
              icon={Download}
              onClick={handleExportBackup}
            />
            <div className="border-t border-slate-700/50 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left"
              >
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  {importing ? (
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                  ) : importSuccess ? (
                    <Check size={16} className="text-green-400" />
                  ) : (
                    <Upload size={16} className="text-blue-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">
                    {importing ? "Import en cours..." : importSuccess ? "Import réussi !" : "Importer une sauvegarde"}
                  </p>
                  <p className="text-xs text-slate-500">Fichier JSON GestCommerce</p>
                </div>
                <ChevronRight size={16} className="text-slate-500" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>
        </SectionCard>

        {/* Reset */}
        <SectionCard title="Zone de danger" icon={RotateCcw}>
          <button
            onClick={() => setShowReset(true)}
            className="w-full flex items-center gap-3 p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-colors text-left"
          >
            <div className="w-8 h-8 bg-red-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <RotateCcw size={16} className="text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400">Réinitialiser l&apos;application</p>
              <p className="text-xs text-slate-500">Supprimer toutes les données définitivement</p>
            </div>
            <ChevronRight size={16} className="text-red-400/50" />
          </button>
        </SectionCard>

        {/* About */}
        <button
          onClick={() => setShowAbout(true)}
          className="w-full flex items-center gap-3 p-4 bg-slate-800 border border-slate-700/50 rounded-2xl text-left"
        >
          <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
            <Info size={18} className="text-green-400" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-white">À propos</p>
            <p className="text-xs text-slate-500">GestCommerce v1.0.0</p>
          </div>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Exporter les données"
        size="md"
      >
        <div className="p-5 space-y-4">
          <ExportSection
            title="Ventes"
            count={sales.length}
            onExcelExport={() => exportSalesToExcel(sales)}
            onCsvExport={() => exportSalesToCsv(sales)}
          />
          <ExportSection
            title="Produits"
            count={products.length}
            onExcelExport={() => exportProductsToExcel(products)}
            onCsvExport={() => exportProductsToCsv(products)}
          />
          <ExportSection
            title="Dépenses"
            count={expenses.length}
            onExcelExport={() => exportExpensesToExcel(expenses)}
            onCsvExport={() => exportExpensesToCsv(expenses)}
          />
        </div>
      </Modal>

      {/* About Modal */}
      <Modal
        isOpen={showAbout}
        onClose={() => setShowAbout(false)}
        title="À propos"
        size="md"
      >
        <div className="p-5 text-center">
          <div className="w-20 h-20 bg-green-500/10 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-green-500/20">
            <span className="text-3xl">🛒</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-1">GestCommerce</h2>
          <p className="text-sm text-slate-400 mb-1">Version 1.0.0</p>
          <p className="text-xs text-slate-500 mb-6">PWA Mobile-First</p>

          <div className="space-y-2 text-left">
            {[
              { label: "Stockage", value: "IndexedDB (local)" },
              { label: "Mode hors ligne", value: "✓ Service Worker" },
              { label: "Installation", value: "Android & iPhone" },
              { label: "Données", value: "100% privées" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl">
                <span className="text-xs text-slate-400">{item.label}</span>
                <span className="text-xs font-semibold text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {/* Delete category confirm */}
      <ConfirmDialog
        isOpen={!!deletingCatId}
        onConfirm={handleDeleteCategory}
        onCancel={() => setDeletingCatId(null)}
        title="Supprimer la catégorie"
        message="Les dépenses existantes dans cette catégorie seront conservées mais sans catégorie correspondante."
        confirmLabel="Supprimer"
        danger
      />

      {/* Reset confirm */}
      <ConfirmDialog
        isOpen={showReset}
        onConfirm={handleReset}
        onCancel={() => setShowReset(false)}
        title="Réinitialiser l'application"
        message="Toutes vos données (ventes, produits, dépenses) seront définitivement supprimées. Cette action est IRRÉVERSIBLE."
        confirmLabel="Tout supprimer"
        danger
      />
    </div>
  );
}

// ---- UI Components ----

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-800 border border-slate-700/50 rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className="text-green-400" />
        <h3 className="text-sm font-semibold text-slate-300">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function ActionButton({
  label,
  description,
  icon: Icon,
  onClick,
}: {
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-slate-700/50 hover:bg-slate-700 rounded-xl transition-colors text-left"
    >
      <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-green-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        <p className="text-xs text-slate-500 truncate">{description}</p>
      </div>
      <ChevronRight size={16} className="text-slate-500 flex-shrink-0" />
    </button>
  );
}

function ExportSection({
  title,
  count,
  onExcelExport,
  onCsvExport,
}: {
  title: string;
  count: number;
  onExcelExport: () => void;
  onCsvExport: () => void;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
        {title} ({count})
      </p>
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={onExcelExport}
          disabled={count === 0}
          className="flex items-center justify-center gap-2 py-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium hover:bg-green-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Table size={14} />
          Excel
        </button>
        <button
          onClick={onCsvExport}
          disabled={count === 0}
          className="flex items-center justify-center gap-2 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm font-medium hover:bg-blue-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <FileText size={14} />
          CSV
        </button>
      </div>
    </div>
  );
}
