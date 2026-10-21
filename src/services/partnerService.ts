import {
  buildMockPartnerAuditHistory,
  buildMockPartnerProfile,
} from '@/mocks/builders/partnerProfileMock';
import { MOCK_PARTNERS, PARTNER_STATS } from '@/mocks/data/mockData';
import type {
  Partner,
  PartnerAuditEntry,
  PartnerFormValues,
  PartnerProfile,
  PartnerProfileOverrides,
  PartnersSnapshot,
  PartnerStatus,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, peek, readRequest, writeRequest } from './request';

const MOCK_SNAPSHOT: PartnersSnapshot = { partners: MOCK_PARTNERS, stats: PARTNER_STATS };

/** Dữ liệu khởi tạo của store đối tác */
export const partnersSource = createSource(ENDPOINTS.partners.snapshot, MOCK_SNAPSHOT);

export const partnerService = {
  peekProfile: (partner: Partner): PartnerProfile | undefined =>
    peek(() => buildMockPartnerProfile(partner)),
  getProfile: (partner: Partner): Promise<PartnerProfile> =>
    readRequest(ENDPOINTS.partners.profile(partner.id), () => buildMockPartnerProfile(partner)),
  peekAuditHistory: (partner: Partner): PartnerAuditEntry[] | undefined =>
    peek(() => buildMockPartnerAuditHistory(partner)),
  getAuditHistory: (partner: Partner): Promise<PartnerAuditEntry[]> =>
    readRequest(ENDPOINTS.partners.auditHistory(partner.id), () =>
      buildMockPartnerAuditHistory(partner),
    ),

  create: (partner: Partner) => writeRequest(ENDPOINTS.partners.create, 'POST', partner),
  update: (id: string, values: PartnerFormValues) =>
    writeRequest(ENDPOINTS.partners.update(id), 'PUT', values),
  setStatus: (id: string, status: PartnerStatus, statusNote?: string) =>
    writeRequest(ENDPOINTS.partners.status(id), 'PATCH', { status, statusNote }),
  updateProfile: (id: string, changes: PartnerProfileOverrides) =>
    writeRequest(ENDPOINTS.partners.profile(id), 'PATCH', changes),
};
