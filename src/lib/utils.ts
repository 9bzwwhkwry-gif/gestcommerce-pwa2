import type { ActivePeriod, DateRange, PeriodFilter } from "@/types";

// ================================
// DATE HELPERS
// ================================

export function toDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export function todayString(): string {
  return toDateString(new Date());
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const [year, month, day] = dateStr.split("-");
  return `${day}/${month}/${year}`;
}

export function formatCurrency(amount: number, symbol = "FCFA"): string {
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
  return amount < 0 ? `- ${formatted} ${symbol}` : `${formatted} ${symbol}`;
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

// ================================
// PERIOD FILTER → DATE RANGE
// ================================

export function getDateRangeForPeriod(
  period: ActivePeriod
): DateRange | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (period.filter === "all") return null;

  if (period.filter === "custom" && period.customRange) {
    return period.customRange;
  }

  const getRange = (): DateRange => {
    const start = new Date(today);
    const end = new Date(today);

    switch (period.filter) {
      case "today":
        return {
          start: toDateString(start),
          end: toDateString(end),
        };

      case "yesterday": {
        start.setDate(start.getDate() - 1);
        end.setDate(end.getDate() - 1);
        return {
          start: toDateString(start),
          end: toDateString(end),
        };
      }

      case "last7days": {
        start.setDate(start.getDate() - 6);
        return {
          start: toDateString(start),
          end: toDateString(end),
        };
      }

      case "last30days": {
        start.setDate(start.getDate() - 29);
        return {
          start: toDateString(start),
          end: toDateString(end),
        };
      }

      case "thisMonth": {
        start.setDate(1);
        return {
          start: toDateString(start),
          end: toDateString(end),
        };
      }

      case "lastMonth": {
        start.setDate(1);
        start.setMonth(start.getMonth() - 1);
        end.setDate(0); // last day of previous month
        return {
          start: toDateString(start),
          end: toDateString(end),
        };
      }

      case "thisYear": {
        start.setMonth(0, 1);
        return {
          start: toDateString(start),
          end: toDateString(end),
        };
      }

      default:
        return {
          start: toDateString(start),
          end: toDateString(end),
        };
    }
  };

  return getRange();
}

export function isInRange(
  dateStr: string,
  range: DateRange | null
): boolean {
  if (!range) return true;
  return dateStr >= range.start && dateStr <= range.end;
}

export function getPeriodLabel(period: ActivePeriod): string {
  const labels: Record<PeriodFilter, string> = {
    today: "Aujourd'hui",
    yesterday: "Hier",
    last7days: "7 derniers jours",
    last30days: "30 derniers jours",
    thisMonth: "Ce mois-ci",
    lastMonth: "Mois précédent",
    thisYear: "Cette année",
    all: "Tout",
    custom: "Personnalisé",
  };

  if (period.filter === "custom" && period.customRange) {
    return `${formatDate(period.customRange.start)} – ${formatDate(period.customRange.end)}`;
  }

  return labels[period.filter] || "Tout";
}
