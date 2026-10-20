import { createContext } from 'react';
import type { Partner, PartnerAuditEntry, PartnerFormValues, PartnerStatus } from '../types/admin';

/** Các giá trị hồ sơ admin chỉnh được ở màn Chi tiết đối tác */
export interface PartnerProfileOverrides {
  nextReviewDate?: string;
  commission?: number;
}

export interface PartnersContextValue {
  partners: Partner[];
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
