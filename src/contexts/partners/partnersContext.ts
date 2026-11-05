import { createContext } from 'react';
import type { DataStatus, Partner, PartnerStats } from '@/types';

export interface PartnersContextValue {
  /** Số liệu toàn hệ thống (GET /admin/business-profiles/stats) */
  stats: PartnerStats;
  /** Trạng thái tải số liệu */
  dataStatus: DataStatus;
  /** Tăng sau mỗi thao tác ghi — các trang danh sách / chi tiết dựa vào đây để tải lại */
  version: number;
  /** Dữ liệu đổi từ nơi khác (sự kiện realtime): tải lại số liệu và báo các trang tải lại */
  refresh: () => void;
  approve: (id: string) => Promise<Partner>;
  reject: (id: string, reason: string) => Promise<Partner>;
  lock: (id: string, reason: string) => Promise<Partner>;
  unlock: (id: string) => Promise<Partner>;
}

export const PartnersContext = createContext<PartnersContextValue | null>(null);
