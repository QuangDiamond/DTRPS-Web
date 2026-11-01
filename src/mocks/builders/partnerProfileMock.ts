import { buildPartnerRatings } from './detailExtrasMock';
import { PROVINCE_LABELS, PROVINCE_NAMES } from '@/constants/partner';
import { MOCK_PARTNER_AUDIT, MOCK_PARTNER_PROFILES } from '@/mocks/data/mockPartnerProfiles';
import type { Partner, PartnerAuditEntry, PartnerProfile } from '@/types';
import { toIsoDate } from '@/utils/format';

function getTrustLabel(score: number): string {
  if (score >= 90) return 'Rất an toàn';
  if (score >= 75) return 'An toàn';
  if (score >= 50) return 'Cần theo dõi';
  return 'Rủi ro cao';
}

function addYears(isoDate: string, years: number): string {
  const date = new Date(isoDate);
  date.setFullYear(date.getFullYear() + years);
  return toIsoDate(date);
}

/** Hồ sơ dựng tự động cho đối tác chưa có dữ liệu chi tiết */
function buildFallbackProfile(partner: Partner): Omit<PartnerProfile, 'ratings'> {
  const trustScore = partner.status === 'active' ? 86 : partner.status === 'pending' ? 62 : 35;
  const nextReview = new Date();
  nextReview.setMonth(nextReview.getMonth() + 6);

  return {
    tierLabel: 'Tiêu chuẩn',
    trustScore,
    trustLabel: getTrustLabel(trustScore),
    verificationLevel: partner.status === 'pending' ? 'Chưa đối soát' : 'Đã xác thực cấp Tỉnh',
    taxIssuer: `Sở KH&ĐT ${PROVINCE_NAMES[partner.province]}`,
    aiSearchHits: partner.listings.approved * 310,
    legal: {
      fullName: partner.name,
      foundedAt: partner.joinedAt,
      issuer: `Sở Kế hoạch & Đầu tư ${PROVINCE_NAMES[partner.province]}`,
      charterCapital: 5_000_000_000,
      headOffice: `${partner.address}, ${PROVINCE_LABELS[partner.province]}`,
      legalRepresentative: partner.representative,
      idNumberMasked: 'Đang cập nhật',
      licenseFile: { name: `GPKD_${partner.id}.pdf`, size: '1.2 MB' },
    },
    contact: {
      name: partner.representative,
      position: 'Người đại diện',
      email: partner.email,
      otpPhone: partner.phone,
      twoFactor: partner.status === 'active',
    },
    certifications: [
      {
        icon: 'gavel',
        title: 'Giấy chứng nhận đăng ký kinh doanh',
        meta: `Mã số thuế ${partner.taxCode} • ${PROVINCE_LABELS[partner.province]}`,
        statusLabel: partner.status === 'pending' ? 'Chờ xác minh' : 'Hợp lệ',
        tone: partner.status === 'pending' ? 'warning' : 'valid',
      },
      {
        icon: 'psychology',
        title: 'Chỉ số tín nhiệm & Tuân thủ',
        meta: `Điểm đánh giá tự động: ${trustScore}/100${
          partner.statusNote ? ` • ${partner.statusNote}` : ''
        }`,
        statusLabel: getTrustLabel(trustScore),
        tone: trustScore >= 75 ? 'trust' : 'warning',
      },
    ],
    nextReviewDate: toIsoDate(nextReview),
    agreement: {
      type: 'Hợp tác tiêu chuẩn',
      activatedAt: partner.joinedAt,
      renewAt: addYears(partner.joinedAt, 2),
      contractCode: `HD-${partner.joinedAt.slice(0, 4)}/STV-${partner.id}`,
    },
  };
}

export function buildMockPartnerProfile(partner: Partner): PartnerProfile {
  const base = MOCK_PARTNER_PROFILES[partner.id] ?? buildFallbackProfile(partner);
  return {
    ...base,
    ratings: buildPartnerRatings(partner),
  };
}

/** Lịch sử kiểm toán có sẵn trên server + mốc đăng ký tài khoản */
export function buildMockPartnerAuditHistory(partner: Partner): PartnerAuditEntry[] {
  const history = (MOCK_PARTNER_AUDIT[partner.id] ?? []).map((entry, index) => ({
    ...entry,
    id: `history-${index}`,
  }));
  return [
    ...history,
    {
      id: 'joined',
      time: `${partner.joinedAt}T08:00:00+07:00`,
      icon: 'how_to_reg',
      text: 'Đăng ký tài khoản đối tác trên hệ thống Smart Travel',
      actor: 'Đối tác',
    },
  ];
}
