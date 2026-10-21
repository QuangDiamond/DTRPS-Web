import i18n from 'i18next';
import type { PartnerAuditEntry, PartnerProfile, PartnerProfileOverrides } from '@/types';

/** Áp các giá trị admin vừa chỉnh trong phiên (kỳ tái thẩm định, hoa hồng) lên hồ sơ từ server */
export function applyProfileOverrides(
  base: PartnerProfile,
  overrides: PartnerProfileOverrides = {},
): PartnerProfile {
  return {
    ...base,
    nextReviewDate: overrides.nextReviewDate ?? base.nextReviewDate,
    agreement: {
      ...base.agreement,
      commission: overrides.commission ?? base.agreement.commission,
    },
  };
}

/** Nhật ký kiểm toán: phát sinh trong phiên + lịch sử từ server (mới nhất lên đầu) */
export function mergeAuditLog(
  history: PartnerAuditEntry[],
  sessionEntries: PartnerAuditEntry[] = [],
): PartnerAuditEntry[] {
  return [...sessionEntries, ...history].sort((a, b) => b.time.localeCompare(a.time));
}

/** "1 năm đồng hành", "8 tháng đồng hành" */
export function formatPartnershipDuration(joinedAt: string, now: Date = new Date()): string {
  const joined = new Date(joinedAt);
  const months =
    (now.getFullYear() - joined.getFullYear()) * 12 + (now.getMonth() - joined.getMonth());
  if (months < 1) return i18n.t('partnerDetail.utils.newlyJoined');
  if (months < 12) return i18n.t('partnerDetail.utils.monthsWithUs', { count: months });
  return i18n.t('partnerDetail.utils.yearsWithUs', { count: Math.floor(months / 12) });
}

export function formatCurrencyVnd(value: number): string {
  return i18n.t('partnerDetail.utils.vnd', { toLocaleString: value.toLocaleString('en-US') });
}

/** Mức tín nhiệm theo điểm AI (0 - 100) — nhãn hiển thị theo ngôn ngữ đang chọn */
export function getTrustLevelKey(score: number) {
  if (score >= 90) return 'partnerDetail.trustLevel.verySafe' as const;
  if (score >= 75) return 'partnerDetail.trustLevel.safe' as const;
  if (score >= 50) return 'partnerDetail.trustLevel.watch' as const;
  return 'partnerDetail.trustLevel.highRisk' as const;
}
