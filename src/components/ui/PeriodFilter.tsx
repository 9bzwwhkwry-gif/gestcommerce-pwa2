"use client";

import { useState } from "react";
import { ChevronDown, Calendar, X } from "lucide-react";
import type { ActivePeriod, PeriodFilter } from "@/types";
import { getPeriodLabel, todayString } from "@/lib/utils";

const PERIOD_OPTIONS: { value: PeriodFilter; label: string }[] = [
  { value: "today", label: "Aujourd'hui" },
  { value: "yesterday", label: "Hier" },
  { value: "last7days", label: "7 derniers jours" },
  { value: "last30days", label: "30 derniers jours" },
  { value: "thisMonth", label: "Ce mois-ci" },
  { value: "lastMonth", label: "Mois précédent" },
  { value: "thisYear", label: "Cette année" },
  { value: "all", label: "Tout" },
  { value: "custom", label: "Personnalisé..." },
];

interface Props {
  value: ActivePeriod;
  onChange: (period: ActivePeriod) => void;
  compact?: boolean;
}

export default function PeriodFilter({ value, onChange, compact }: Props) {
  const [open, setOpen] = useState(false);
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState(
    value.customRange?.start || todayString()
  );
  const [customEnd, setCustomEnd] = useState(
    value.customRange?.end || todayString()
  );

  const label = getPeriodLabel(value);

  const handleSelect = (filter: PeriodFilter) => {
    if (filter === "custom") {
      setShowCustom(true);
      setOpen(false);
    } else {
      onChange({ filter });
      setShowCustom(false);
      setOpen(false);
    }
  };

  const handleApplyCustom = () => {
    if (customStart && customEnd) {
      onChange({
        filter: "custom",
        customRange: { start: customStart, end: customEnd },
      });
      setShowCustom(false);
    }
  };

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => { setOpen(!open); setShowCustom(false); }}
        className={`flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-xl transition-colors hover:bg-slate-700 ${
          compact ? "px-3 py-2 text-sm" : "px-4 py-2.5 text-sm"
        }`}
      >
        <Calendar size={15} className="text-green-400 flex-shrink-0" />
        <span className="font-medium truncate max-w-[140px]">{label}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full left-0 mt-2 z-50 w-56 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-slate-700 flex items-center justify-between ${
                  value.filter === option.value && option.value !== "custom"
                    ? "text-green-400 font-semibold bg-green-400/5"
                    : "text-slate-200"
                }`}
              >
                {option.label}
                {value.filter === option.value && option.value !== "custom" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Custom date range modal */}
      {showCustom && (
        <div className="fixed inset-0 z-50 flex items-end justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-base font-bold text-white">Période personnalisée</h3>
              <button
                onClick={() => setShowCustom(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-700 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Date de début
                </label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomStart(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-base focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Date de fin
                </label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomEnd(e.target.value)}
                  min={customStart}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white text-base focus:border-green-500 focus:ring-2 focus:ring-green-500/20 outline-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCustom(false)}
                className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:bg-slate-700 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleApplyCustom}
                disabled={!customStart || !customEnd}
                className="flex-1 py-3.5 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Appliquer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
