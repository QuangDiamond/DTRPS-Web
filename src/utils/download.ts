/** Tải một Blob về máy dưới tên file cho trước */
export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/** Tải nội dung văn bản thành file .txt (UTF-8) */
export function downloadTextFile(filename: string, content: string): void {
  downloadBlob(filename, new Blob([content], { type: 'text/plain;charset=utf-8' }));
}
