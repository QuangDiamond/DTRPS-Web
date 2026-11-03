/** Kiểu dữ liệu màn Chuyến đi của tôi (giống constants/trips.ts của mobile) */

export type TripStatus =
  | 'upcoming' // Đã chốt, sắp khởi hành
  | 'planned' // Đã lên lịch, còn xa ngày đi
  | 'draft' // Bản nháp, chưa hoàn thành
  | 'saved' // Lịch trình đã lưu
  | 'completed'; // Đã đi

export interface Trip {
  id: string;
  title: string;
  location: string;
  duration: string;
  /** Số ngày — dùng cho màn Thêm địa điểm */
  days: number;
  image: string;
  status: TripStatus;
  /** Nhãn trên ảnh, vd "Khởi hành sau 3 ngày" */
  statusLabel: string;
  dateRange?: string;
  guests: string;
  budget?: string;
  placeCount: number;
  hotelBooked?: number;
}
