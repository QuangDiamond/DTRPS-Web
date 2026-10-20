import { DEFAULT_REVIEW_CHECKLIST, PARTNER_TIER_CONFIG } from '../../constants/listing';
import { MOCK_LISTING_DETAILS } from '../../constants/mockListingDetails';
import { PROVINCE_NAMES } from '../../constants/partner';
import type { Listing, ListingDetail } from '../../types/admin';

export interface ReviewLogEntry {
  id: string;
  /** ISO datetime */
  time: string;
  text: string;
  tone: 'primary' | 'muted' | 'error';
}

/** Hồ sơ chi tiết: lấy từ mock, nếu chưa có thì dựng tự động từ thông tin niêm yết */
export function getListingDetail(listing: Listing, allListings: Listing[]): ListingDetail {
  const mock = MOCK_LISTING_DETAILS[listing.id];
  if (mock) return mock;

  const reviewed = listing.status === 'approved';
  return {
    categoryDetail: listing.categoryLabel,
    reviewLevel: listing.partnerTier === 'gold' ? 'Ưu tiên (Tier 2)' : 'Khắt khe (Tier 1)',
    areaLabel: PROVINCE_NAMES[listing.province],
    completeness: listing.imageUrl ? 78 : 64,
    description: `Đối tác ${listing.partnerName} đăng ký niêm yết "${listing.name}" thuộc nhóm ${listing.categoryLabel}. Mô tả chi tiết đang được đối tác bổ sung.`,
    fullAddress: listing.address,
    hotline: 'Đang cập nhật',
    email: 'Đang cập nhật',
    schedule: { label: 'Giờ hoạt động', value: 'Đang cập nhật' },
    photos: listing.imageUrl ? [{ url: listing.imageUrl, caption: listing.name }] : [],
    requiredPhotoCount: 7,
    business: { scaleBadge: listing.categoryLabel, facts: [], amenities: [] },
    partner: {
      code: listing.partnerId ?? 'Chưa liên kết',
      representative: 'Đang cập nhật',
      hotline: '—',
      yearsActive: PARTNER_TIER_CONFIG[listing.partnerTier].label,
      approvedCount: allListings.filter(
        (item) => item.partnerName === listing.partnerName && item.status === 'approved',
      ).length,
      responseRate: '—',
      verified: listing.partnerTier !== 'new',
    },
    checklist: DEFAULT_REVIEW_CHECKLIST.map((item) => ({ ...item, passed: reviewed })),
    location: { areaNote: listing.address },
    documents: [
      {
        id: 'business-license',
        fileType: 'pdf',
        title: 'Giấy chứng nhận đăng ký kinh doanh',
        meta: 'Đối tác tải lên khi nộp hồ sơ',
        verified: reviewed,
      },
      {
        id: 'site-photo',
        fileType: 'image',
        title: 'Ảnh thực tế biển hiệu cơ sở',
        meta: listing.address,
        verified: reviewed,
      },
    ],
    logs: [],
    defaultNote: '',
  };
}

/** Nhật ký thẩm định: nộp hồ sơ + log hệ thống + kết quả xử lý (mới nhất lên đầu) */
export function buildReviewLogs(listing: Listing, detail: ListingDetail): ReviewLogEntry[] {
  const submittedTime = new Date(listing.submittedAt).getTime();
  const entries: ReviewLogEntry[] = [
    {
      id: 'submitted',
      time: listing.submittedAt,
      text: `Đối tác ${listing.partnerName} nộp hồ sơ niêm yết mới.`,
      tone: 'muted',
    },
    ...detail.logs.map((log, index) => ({
      id: `system-${index}`,
      time: new Date(submittedTime + log.minutesAfterSubmit * 60_000).toISOString(),
      text: log.text,
      tone: 'primary' as const,
    })),
  ];

  if (listing.reviewedAt && listing.status !== 'pending') {
    const note = listing.reviewNote ? ` Ghi chú: ${listing.reviewNote}` : '';
    entries.push({
      id: 'reviewed',
      time: listing.reviewedAt,
      text:
        listing.status === 'approved'
          ? `Admin phê duyệt địa điểm.${note}`
          : `Admin từ chối địa điểm. Lý do: ${listing.rejectReason ?? '—'}.${note}`,
      tone: listing.status === 'approved' ? 'primary' : 'error',
    });
  }

  return entries.sort((a, b) => b.time.localeCompare(a.time));
}

/** "14h 22m" */
export function formatWaitDuration(fromIso: string, toIso?: string): string {
  const end = toIso ? new Date(toIso).getTime() : Date.now();
  const totalMinutes = Math.max(0, Math.floor((end - new Date(fromIso).getTime()) / 60_000));
  return `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`;
}

/** "24/10/2024 lúc 09:42" */
export function formatSubmittedAt(iso: string): string {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} lúc ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

export function getMapsUrl(listing: Listing, detail: ListingDetail): string {
  const query = detail.location.coordinates
    ? `${detail.location.coordinates.lat},${detail.location.coordinates.lng}`
    : `${listing.name}, ${detail.fullAddress}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}
