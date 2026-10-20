/** 1840 -> "1,840" (giống định dạng trong thiết kế) */
export function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

/** "2023-03-12" -> "12/03/2023" */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return `${day}/${month}/${year}`;
}

/** Tỷ lệ phần trăm 1 chữ số thập phân: (780, 1840) -> "42.4%" */
export function formatPercent(part: number, total: number): string {
  if (total === 0) return '0%';
  return `${((part / total) * 100).toFixed(1)}%`;
}

/** Đếm ngược: 272 -> "04:32" */
export function formatCountdown(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = String(Math.floor(safeSeconds / 60)).padStart(2, '0');
  const seconds = String(safeSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

const pad = (value: number) => String(value).padStart(2, '0');

/** Date -> "YYYY-MM-DD" theo giờ máy */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Ngày hôm nay theo giờ máy, dạng YYYY-MM-DD */
export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

/** "10 phút trước", "2 giờ trước", "3 ngày trước" */
export function formatRelativeTime(isoDateTime: string, now: Date = new Date()): string {
  const diffMinutes = Math.floor((now.getTime() - new Date(isoDateTime).getTime()) / 60_000);
  if (diffMinutes < 1) return 'Vừa xong';
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return `${Math.floor(diffHours / 24)} ngày trước`;
}

/** "Hôm nay 09:30", "Hôm qua 21:40", hoặc "12/10/2024 08:15" */
export function formatDayTime(isoDateTime: string, now: Date = new Date()): string {
  const date = new Date(isoDateTime);
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (toIsoDate(date) === toIsoDate(now)) return `Hôm nay ${time}`;
  if (toIsoDate(date) === toIsoDate(yesterday)) return `Hôm qua ${time}`;
  return `${formatDate(toIsoDate(date))} ${time}`;
}

/** "24/10/2024" + "09:42 SA" (SA = sáng, CH = chiều) */
export function formatDateWithPeriod(isoDateTime?: string): { date: string; time: string } {
  if (!isoDateTime) return { date: '—', time: '' };
  const date = new Date(isoDateTime);
  const hours = date.getHours();
  return {
    date: formatDate(toIsoDate(date)),
    time: `${pad(hours)}:${pad(date.getMinutes())} ${hours < 12 ? 'SA' : 'CH'}`,
  };
}
