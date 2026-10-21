import i18n from 'i18next';

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

/** 7 -> "07" */
export const pad2 = (value: number): string => String(value).padStart(2, '0');

/** Date -> "YYYY-MM-DD" theo giờ máy */
export function toIsoDate(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

/** Ngày hôm nay theo giờ máy, dạng YYYY-MM-DD */
export function todayIsoDate(): string {
  return toIsoDate(new Date());
}

/** "10 phút trước" / "10 minutes ago", "2 giờ trước", "3 ngày trước" — theo ngôn ngữ đang chọn */
export function formatRelativeTime(isoDateTime: string, now: Date = new Date()): string {
  const diffMinutes = Math.floor((now.getTime() - new Date(isoDateTime).getTime()) / 60_000);
  if (diffMinutes < 1) return i18n.t('time.justNow');
  if (diffMinutes < 60) return i18n.t('time.minutesAgo', { count: diffMinutes });
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return i18n.t('time.hoursAgo', { count: diffHours });
  return i18n.t('time.daysAgo', { count: Math.floor(diffHours / 24) });
}

/** "Hôm nay 09:30" / "Today 09:30", "Hôm qua 21:40", hoặc "12/10/2024 08:15" */
export function formatDayTime(isoDateTime: string, now: Date = new Date()): string {
  const date = new Date(isoDateTime);
  const time = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  if (toIsoDate(date) === toIsoDate(now)) return i18n.t('time.todayAt', { time });
  if (toIsoDate(date) === toIsoDate(yesterday)) return i18n.t('time.yesterdayAt', { time });
  return `${formatDate(toIsoDate(date))} ${time}`;
}

/** "24/10/2024" + "09:42 SA" (SA = sáng, CH = chiều; tiếng Anh: AM / PM) */
export function formatDateWithPeriod(isoDateTime?: string): { date: string; time: string } {
  if (!isoDateTime) return { date: '—', time: '' };
  const date = new Date(isoDateTime);
  const hours = date.getHours();
  return {
    date: formatDate(toIsoDate(date)),
    time: `${pad2(hours)}:${pad2(date.getMinutes())} ${i18n.t(hours < 12 ? 'time.am' : 'time.pm')}`,
  };
}

/** "14:32:08 - 24/10/2024" (giờ:phút:giây - ngày/tháng/năm) */
export function formatTimestamp(isoDateTime: string): string {
  const date = new Date(isoDateTime);
  return `${pad2(date.getHours())}:${pad2(date.getMinutes())}:${pad2(date.getSeconds())} - ${formatDate(
    toIsoDate(date),
  )}`;
}

/** Nhãn tháng ngắn cho trục biểu đồ: 5 → "T5" / "May" */
export function formatMonthShort(month: number): string {
  const name = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    new Date(2000, month - 1, 1),
  );
  return i18n.t('time.monthShort', { month, name });
}

/** Nhãn tháng theo ngôn ngữ: 5 → "Tháng 5" / "May" */
export function formatMonthLabel(month: number): string {
  const name = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
    new Date(2000, month - 1, 1),
  );
  return i18n.t('time.month', { month, name });
}
