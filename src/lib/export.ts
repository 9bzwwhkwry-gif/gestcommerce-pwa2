import type { Sale, Product, Expense } from "@/types";
import { formatDate } from "./utils";

// ================================
// CSV EXPORT
// ================================

function escapeCsv(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers.map(escapeCsv).join(",")];
  for (const row of rows) {
    lines.push(row.map(escapeCsv).join(","));
  }
  return lines.join("\n");
}

export function exportSalesToCsv(sales: Sale[]): void {
  const headers = [
    "Date",
    "Produit",
    "Quantité",
    "Prix unitaire",
    "Chiffre d'affaires",
    "Coût unitaire",
    "Coût total",
    "Dépenses",
    "Bénéfice net",
  ];

  const rows = sales.map((s) => [
    formatDate(s.date),
    s.productName,
    s.quantity,
    s.unitPrice,
    s.revenue,
    s.unitCost,
    s.totalCost,
    s.totalExpenses,
    s.netProfit,
  ]);

  downloadFile(buildCsv(headers, rows), "ventes.csv", "text/csv");
}

export function exportProductsToCsv(products: Product[]): void {
  const headers = [
    "Nom",
    "Prix d'achat",
    "Prix de vente",
    "Bénéfice théorique",
  ];

  const rows = products.map((p) => [
    p.name,
    p.buyPrice,
    p.sellPrice,
    p.margin,
  ]);

  downloadFile(buildCsv(headers, rows), "produits.csv", "text/csv");
}

export function exportExpensesToCsv(expenses: Expense[]): void {
  const headers = ["Date", "Catégorie", "Description", "Montant"];

  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    e.description,
    e.amount,
  ]);

  downloadFile(buildCsv(headers, rows), "depenses.csv", "text/csv");
}

// ================================
// EXCEL EXPORT (simple HTML table trick - no xlsx lib required)
// ================================

export function exportSalesToExcel(sales: Sale[]): void {
  const headers = [
    "Date",
    "Produit",
    "Quantité",
    "Prix unitaire",
    "Chiffre d'affaires",
    "Coût unitaire",
    "Coût total",
    "Dépenses",
    "Bénéfice net",
  ];

  const rows = sales.map((s) => [
    formatDate(s.date),
    s.productName,
    s.quantity,
    s.unitPrice,
    s.revenue,
    s.unitCost,
    s.totalCost,
    s.totalExpenses,
    s.netProfit,
  ]);

  const html = buildExcelHtml("Ventes", headers, rows);
  downloadFile(html, "ventes.xls", "application/vnd.ms-excel");
}

export function exportProductsToExcel(products: Product[]): void {
  const headers = [
    "Nom",
    "Prix d'achat",
    "Prix de vente",
    "Bénéfice théorique",
  ];

  const rows = products.map((p) => [p.name, p.buyPrice, p.sellPrice, p.margin]);

  const html = buildExcelHtml("Produits", headers, rows);
  downloadFile(html, "produits.xls", "application/vnd.ms-excel");
}

export function exportExpensesToExcel(expenses: Expense[]): void {
  const headers = ["Date", "Catégorie", "Description", "Montant"];

  const rows = expenses.map((e) => [
    formatDate(e.date),
    e.category,
    e.description,
    e.amount,
  ]);

  const html = buildExcelHtml("Dépenses", headers, rows);
  downloadFile(html, "depenses.xls", "application/vnd.ms-excel");
}

function buildExcelHtml(
  title: string,
  headers: string[],
  rows: (string | number)[][]
): string {
  const headerCells = headers.map((h) => `<th>${h}</th>`).join("");
  const bodyRows = rows
    .map(
      (row) =>
        `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`
    )
    .join("");

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><title>${title}</title></head><body><table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table></body></html>`;
}

// ================================
// BACKUP JSON
// ================================

export function exportBackupJson(data: unknown): void {
  const json = JSON.stringify(data, null, 2);
  const date = new Date().toISOString().split("T")[0];
  downloadFile(json, `backup-ecommerce-${date}.json`, "application/json");
}

// ================================
// HELPER
// ================================

function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
