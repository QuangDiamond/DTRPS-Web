import { DEFAULT_REVIEW_CHECKLIST, PARTNER_TIER_CONFIG } from '@/constants/listing';
import { PROVINCE_NAMES } from '@/constants/partner';
import { MOCK_LISTING_DETAILS } from '@/mocks/data/mockListingDetails';
import type { Listing, ListingDetail } from '@/types';

/** Hồ sơ chi tiết giả lập: lấy từ mock, nếu chưa có thì dựng tự động từ thông tin niêm yết */
export function buildMockListingDetail(listing: Listing, allListings: Listing[]): ListingDetail {
  const mock = MOCK_LISTING_DETAILS[listing.id];
  if (mock) return mock;

  const reviewed = listing.status === 'approved';
  return {
    categoryDetail: listing.categoryLabel,
    reviewLevel: listing.partnerTier === 'gold' ? 'Ưu tiên (Cấp 2)' : 'Khắt khe (Cấp 1)',
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
