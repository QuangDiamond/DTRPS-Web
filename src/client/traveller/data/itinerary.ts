/**
 * Kiểu dữ liệu lịch trình (giống ItineraryOverviewScreen + ItineraryDetailScreen của mobile).
 * Chưa có dữ liệu — sẽ nối API lịch trình sau.
 */

export interface Activity {
  id: string;
  time: string;
  duration: string;
  title: string;
  location: string;
  image: string;
  icon: string;
  note: string;
  noteIcon: string;
  /** Kiểu ghi chú: quyết định màu nền + chữ */
  noteTone: 'lavender' | 'mint' | 'violet' | 'orange';
  transfer?: string;
  /** Hoạt động buổi tối — chấm mốc màu vàng */
  evening?: boolean;
  coordinate: [number, number];
}

export interface ItineraryDay {
  day: number;
  date: string;
  title: string;
  description: string;
  /** Tóm tắt ở màn tổng quan */
  summary: string;
  subtitle: string;
  icon: string;
  image: string;
  activities: Activity[];
}

export const ITINERARY: ItineraryDay[] = [];

export const NOTE_TONES: Record<Activity['noteTone'], string> = {
  lavender: 'bg-[#EFF0FD] text-[#6474A5]',
  mint: 'bg-[#DBF9F3] text-[#006B65]',
  violet: 'bg-[#F1F0FF] text-[#6C70A0]',
  orange: 'bg-[#FFF1E5] text-[#B57A31]',
};
