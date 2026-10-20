import { downloadBlob } from './download';

type CsvCell = string | number;

function escapeCell(cell: CsvCell): string {
  const text = String(cell);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Tải file CSV (mở được bằng Excel, có BOM để giữ tiếng Việt) */
export function downloadCsv(filename: string, headers: string[], rows: CsvCell[][]): void {
  const content = [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\n');
  downloadBlob(filename, new Blob(['﻿', content], { type: 'text/csv;charset=utf-8;' }));
}
