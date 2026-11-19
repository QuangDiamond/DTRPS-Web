/**
 * Mã thời tiết WMO (Open-Meteo) → icon Material Symbols. Dùng chung cho mọi màn hiển thị thời
 * tiết, khớp với nhãn tiếng Việt của WeatherCodeMapper bên Backend.
 */
export function weatherIconName(code: number | null | undefined): string {
  if (code === null || code === undefined) return 'help_outline';
  if (code === 0) return 'wb_sunny';
  if (code >= 1 && code <= 3) return 'cloud';
  if (code === 45 || code === 48) return 'foggy';
  // Mưa phùn, mưa, mưa đông lạnh, mưa rào — dùng chung 1 icon mưa để dễ nhận ra, tránh "grain"
  // (hạt lấm tấm) nhìn không rõ là mưa.
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rainy';
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'ac_unit';
  if (code === 95 || code === 96 || code === 99) return 'thunderstorm';
  return 'help_outline';
}

/** Mã giông bão (95/96/99) tô màu cảnh báo đậm hơn mưa thường. */
export function isStormCode(code: number | null | undefined): boolean {
  return code === 95 || code === 96 || code === 99;
}

const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

/** "yyyy-MM-dd" → "T2"/"T3".../"CN" — dùng chung cho mọi dải ngày thời tiết. */
export function weekdayShortLabel(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return Number.isNaN(date.getTime()) ? '' : WEEKDAY_SHORT[date.getDay()];
}
