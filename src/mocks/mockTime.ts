/** Helper tạo mốc thời gian tương đối cho dữ liệu mẫu — giúp "Hôm nay", "10 phút trước" luôn đúng khi demo */

/** Thời điểm cách hiện tại n phút */
export const minutesAgo = (minutes: number): string =>
  new Date(Date.now() - minutes * 60_000).toISOString();

/** Mốc giờ cụ thể của n ngày trước, ví dụ daysAgoAt(1, 18, 30) = "Hôm qua 18:30" */
export const daysAgoAt = (days: number, hours: number, minutes: number): string => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
};
