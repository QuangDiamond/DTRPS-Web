/** "Phố cổ Hội An (Hoi An Ancient Town)" → "Phố cổ Hội An" */
export function shortPoiName(name: string): string {
  return name.replace(/\s*\(.*\)\s*$/, '').trim() || name;
}

/** Giá vé dạng ngắn ở bảng: "120,000 VNĐ / vé quốc tế, ..." → "120,000 đ/vé" */
export function priceSummary(price: string): string {
  const text = price.trim();
  if (!text) return '—';
  if (/miễn phí/i.test(text)) return 'Miễn phí';
  return text
    .split(/,\s+/)[0]
    .replace(/\s*\(.*\)\s*$/, '')
    .replace(/\s*VNĐ\s*\/\s*(vé|người|lượt|đêm)[^,]*$/i, ' đ/$1')
    .replace(/\s*VNĐ/i, ' đ')
    .trim();
}

/** Vị trí ngắn ở bảng: "Phường Minh An, TP. Hội An, Tỉnh Quảng Nam" → "TP. Hội An, Quảng Nam" */
export function shortLocation(address: string): string {
  const parts = address
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  return parts
    .slice(-2)
    .map((part) => part.replace(/^Tỉnh\s+/i, '').replace(/^Quận\s+/i, 'Q. '))
    .join(', ');
}
