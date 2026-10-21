import { createContext } from 'react';
import type {
  DataStatus,
  Partner,
  PartnerAuditEntry,
  PartnerFormValues,
  PartnerProfileOverrides,
  PartnerStats,
  PartnerStatus,
} from '@/types';

export interface PartnersContextValue {
  partners: Partner[];
  /** Số liệu toàn hệ thống, cập nhật theo thao tác trong phiên */
  stats: PartnerStats;
  /** Trạng thái tải dữ liệu từ server */
  dataStatus: DataStatus;
  createPartner: (values: PartnerFormValues) => Partner;
  updatePartner: (id: string, values: PartnerFormValues) => void;
  setPartnerStatus: (id: string, status: PartnerStatus, statusNote?: string) => void;
  profileOverrides: Record<string, PartnerProfileOverrides>;
  updateProfile: (id: string, changes: PartnerProfileOverrides) => void;
  /** Nhật ký phát sinh trong phiên (mới nhất trước) */
  auditLogs: Record<string, PartnerAuditEntry[]>;
  logAudit: (partnerId: string, icon: string, text: string) => void;
}

export const PartnersContext = createContext<PartnersContextValue | null>(null);
