import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { MOCK_PARTNERS } from '../../constants/mockData';
import { PARTNER_STATUS_CONFIG, PARTNER_TYPE_CONFIG } from '../../constants/partner';
import { PartnersContext, type PartnerProfileOverrides } from '../../contexts/partners';
import { useAuth } from '../../hooks/useAuth';
import type {
  Partner,
  PartnerAuditEntry,
  PartnerFormValues,
  PartnerStatus,
} from '../../types/admin';
import { todayIsoDate } from '../../utils/format';

function nextPartnerId(partners: Partner[]): string {
  const maxNumber = partners.reduce(
    (max, partner) => Math.max(max, Number(partner.id.replace('PTN-', '')) || 0),
    0,
  );
  return `PTN-${String(maxNumber + 1).padStart(4, '0')}`;
}

/**
 * Store đối tác dùng chung cho danh sách & màn Chi tiết đối tác.
 * Mọi thay đổi đều được ghi vào nhật ký kiểm toán (Audit Log) của đối tác.
 */
export default function PartnersProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const [partners, setPartners] = useState<Partner[]>(MOCK_PARTNERS);
  const [profileOverrides, setProfileOverrides] = useState<Record<string, PartnerProfileOverrides>>(
    {},
  );
  const [auditLogs, setAuditLogs] = useState<Record<string, PartnerAuditEntry[]>>({});
  const nextAuditId = useRef(0);

  const partnersRef = useRef(partners);
  partnersRef.current = partners;
  const actor = admin?.name ?? 'Quản trị viên';

  const logAudit = useCallback(
    (partnerId: string, icon: string, text: string) => {
      const entry: PartnerAuditEntry = {
        id: `audit-${nextAuditId.current++}`,
        time: new Date().toISOString(),
        icon,
        text,
        actor,
      };
      setAuditLogs((current) => ({
        ...current,
        [partnerId]: [entry, ...(current[partnerId] ?? [])],
      }));
    },
    [actor],
  );

  const createPartner = useCallback(
    (values: PartnerFormValues) => {
      const partner: Partner = {
        ...values,
        id: nextPartnerId(partnersRef.current),
        businessIcon: PARTNER_TYPE_CONFIG[values.type].defaultBusinessIcon,
        listings: { total: 0, approved: 0, pending: 0, paused: 0 },
        joinedAt: todayIsoDate(),
        status: 'pending',
        rating: 0,
      };
      setPartners((current) => [partner, ...current]);
      logAudit(partner.id, 'person_add', 'Tạo hồ sơ đối tác mới, chờ xác minh');
      return partner;
    },
    [logAudit],
  );

  const updatePartner = useCallback(
    (id: string, values: PartnerFormValues) => {
      setPartners((current) =>
        current.map((partner) => (partner.id === id ? { ...partner, ...values } : partner)),
      );
      logAudit(id, 'edit_square', 'Cập nhật thông tin hồ sơ doanh nghiệp');
    },
    [logAudit],
  );

  const setPartnerStatus = useCallback(
    (id: string, status: PartnerStatus, statusNote?: string) => {
      setPartners((current) =>
        current.map((partner) =>
          partner.id === id ? { ...partner, status, statusNote } : partner,
        ),
      );
      const label = PARTNER_STATUS_CONFIG[status].label;
      logAudit(
        id,
        status === 'suspended' ? 'lock' : 'lock_open',
        `Chuyển trạng thái sang "${label}"${statusNote ? ` — ${statusNote}` : ''}`,
      );
    },
    [logAudit],
  );

  const updateProfile = useCallback((id: string, changes: PartnerProfileOverrides) => {
    setProfileOverrides((current) => ({ ...current, [id]: { ...current[id], ...changes } }));
  }, []);

  const value = useMemo(
    () => ({
      partners,
      createPartner,
      updatePartner,
      setPartnerStatus,
      profileOverrides,
      updateProfile,
      auditLogs,
      logAudit,
    }),
    [
      partners,
      createPartner,
      updatePartner,
      setPartnerStatus,
      profileOverrides,
      updateProfile,
      auditLogs,
      logAudit,
    ],
  );

  return <PartnersContext.Provider value={value}>{children}</PartnersContext.Provider>;
}
