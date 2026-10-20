type CsvCell = string | number;

function escapeCell(cell: CsvCell): string {
  const text = String(cell);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Tải file CSV (mở được bằng Excel, có BOM để giữ tiếng Việt) */
export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]): void {
  const content = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
  const blob = new Blob(['﻿', content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
