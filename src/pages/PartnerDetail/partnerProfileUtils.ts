import type { PartnerAuditEntry, PartnerProfile, PartnerProfileOverrides } from '../../types/admin';

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
  if (months < 1) return 'Mới gia nhập';
  if (months < 12) return `${months} tháng đồng hành`;
  return `${Math.floor(months / 12)} năm đồng hành`;
}

export function formatCurrencyVnd(value: number): string {
  return `${value.toLocaleString('en-US')} đ`;
}
