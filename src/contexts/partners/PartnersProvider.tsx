import i18n from 'i18next';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { PARTNER_STATUS_CONFIG, PARTNER_TYPE_CONFIG } from '@/constants/partner';
import { useAuth, useInitialData, usePersist } from '@/hooks';
import { partnerService, partnersSource } from '@/services/partnerService';
import type {
  Partner,
  PartnerAuditEntry,
  PartnerFormValues,
  PartnerProfileOverrides,
  PartnerStats,
  PartnerStatus,
} from '@/types';
import { todayIsoDate } from '@/utils/format';
import { PartnersContext } from './partnersContext';

const EMPTY_STATS: PartnerStats = {
  total: 0,
  newThisMonth: 0,
  lodging: 0,
  culinary: 0,
  experiences: 0,
};

/** Đếm đối tác theo nhóm thẻ KPI (Lưu trú / Ẩm thực / Trải nghiệm) */
function countPartners(partners: Partner[]): Omit<PartnerStats, 'newThisMonth'> {
  return {
    total: partners.length,
    lodging: partners.filter((partner) => partner.type === 'hotel').length,
    culinary: partners.filter((partner) => partner.type === 'fnb').length,
    experiences: partners.filter(
      (partner) => partner.type === 'attraction' || partner.type === 'tour',
    ).length,
  };
}

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
  const seed = partnersSource.seed;
  const [partners, setPartners] = useState<Partner[]>(seed?.partners ?? []);
  const [baseStats, setBaseStats] = useState<PartnerStats>(seed?.stats ?? EMPTY_STATS);
  // Số đếm của dữ liệu lúc tải — KPI = số gốc + chênh lệch so với lúc tải
  const [loadedCounts, setLoadedCounts] = useState(() => countPartners(seed?.partners ?? []));
  const [createdCount, setCreatedCount] = useState(0);
  const [profileOverrides, setProfileOverrides] = useState<Record<string, PartnerProfileOverrides>>(
    {},
  );
  const [auditLogs, setAuditLogs] = useState<Record<string, PartnerAuditEntry[]>>({});
  const nextAuditId = useRef(0);

  const dataStatus = useInitialData(
    partnersSource,
    (snapshot) => {
      setPartners(snapshot.partners);
      setBaseStats(snapshot.stats);
      setLoadedCounts(countPartners(snapshot.partners));
      setCreatedCount(0);
    },
    Boolean(admin),
  );
  const persist = usePersist(dataStatus.reload);

  const partnersRef = useRef(partners);
  partnersRef.current = partners;
  const actor = admin?.name ?? i18n.t('common.administrator');

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
      setCreatedCount((count) => count + 1);
      logAudit(partner.id, 'person_add', i18n.t('stores.partners.newPartnerProfileCreated'));
      persist(partnerService.create(partner), i18n.t('stores.partners.couldNotSaveNew'));
      return partner;
    },
    [logAudit, persist],
  );

  const updatePartner = useCallback(
    (id: string, values: PartnerFormValues) => {
      setPartners((current) =>
        current.map((partner) => (partner.id === id ? { ...partner, ...values } : partner)),
      );
      logAudit(id, 'edit_square', i18n.t('stores.partners.businessProfileDetailsUpdated'));
      persist(partnerService.update(id, values), i18n.t('stores.partners.couldNotSavePartner'));
    },
    [logAudit, persist],
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
        statusNote
          ? i18n.t('stores.partners.statusChanged', { label, statusNote })
          : i18n.t('stores.partners.statusChanged2', { label }),
      );
      persist(
        partnerService.setStatus(id, status, statusNote),
        i18n.t('stores.partners.couldNotChangePartner'),
      );
    },
    [logAudit, persist],
  );

  const updateProfile = useCallback(
    (id: string, changes: PartnerProfileOverrides) => {
      setProfileOverrides((current) => ({ ...current, [id]: { ...current[id], ...changes } }));
      persist(
        partnerService.updateProfile(id, changes),
        i18n.t('stores.partners.couldNotSavePartner2'),
      );
    },
    [persist],
  );

  const stats = useMemo<PartnerStats>(() => {
    const current = countPartners(partners);
    return {
      total: Math.max(0, baseStats.total + current.total - loadedCounts.total),
      newThisMonth: baseStats.newThisMonth + createdCount,
      lodging: Math.max(0, baseStats.lodging + current.lodging - loadedCounts.lodging),
      culinary: Math.max(0, baseStats.culinary + current.culinary - loadedCounts.culinary),
      experiences: Math.max(
        0,
        baseStats.experiences + current.experiences - loadedCounts.experiences,
      ),
    };
  }, [partners, baseStats, loadedCounts, createdCount]);

  const value = useMemo(
    () => ({
      partners,
      stats,
      dataStatus,
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
      stats,
      dataStatus,
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
