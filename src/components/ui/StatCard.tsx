"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency, formatPercent } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  format?: "currency" | "number" | "percent";
  symbol?: string;
  trend?: "positive" | "negative" | "neutral";
  color?: "green" | "red" | "blue" | "yellow" | "purple" | "gray";
  size?: "normal" | "large";
  subtitle?: string;
  onRemove?: () => void;
}

const colorMap = {
  green: {
    bg: "bg-green-500/10",
    text: "text-green-400",
    border: "border-green-500/20",
    icon: "text-green-400",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    icon: "text-red-400",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    icon: "text-blue-400",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    icon: "text-yellow-400",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    icon: "text-purple-400",
  },
  gray: {
    bg: "bg-slate-500/10",
    text: "text-slate-300",
    border: "border-slate-500/20",
    icon: "text-slate-400",
  },
};

export default function StatCard({
  label,
  value,
  format = "currency",
  symbol = "FCFA",
  trend,
  color = "green",
  size = "normal",
  subtitle,
  onRemove,
}: StatCardProps) {
  const colors = colorMap[color];

  const formattedValue =
    format === "currency"
      ? formatCurrency(value, symbol)
      : format === "percent"
      ? formatPercent(value)
      : new Intl.NumberFormat("fr-FR").format(value);

  const TrendIcon =
    trend === "positive"
      ? TrendingUp
      : trend === "negative"
      ? TrendingDown
      : Minus;

  return (
    <div
      className={`relative bg-slate-800 border ${colors.border} rounded-2xl p-4 ${
        size === "large" ? "col-span-2" : ""
      }`}
    >
      {onRemove && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-700 text-slate-400 hover:text-red-400 hover:bg-slate-600 transition-colors flex items-center justify-center text-xs font-bold"
          title="Supprimer"
        >
          ×
        </button>
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wide truncate mb-1">
            {label}
          </p>
          <p
            className={`font-bold leading-tight ${colors.text} ${
              size === "large" ? "text-xl" : "text-lg"
            }`}
          >
            {formattedValue}
          </p>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
        {trend && (
          <div className={`p-2 rounded-xl ${colors.bg} flex-shrink-0`}>
            <TrendIcon size={16} className={colors.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
