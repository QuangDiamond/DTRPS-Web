import { DEFAULT_REVIEW_CHECKLIST, PARTNER_TIER_CONFIG } from '@/constants/listing';
import { PROVINCE_NAMES } from '@/constants/partner';
import { MOCK_LISTING_DETAILS } from '@/mocks/data/mockListingDetails';
import type { Listing, ListingDetail } from '@/types';

/** Hồ sơ chi tiết giả lập: lấy từ mock, nếu chưa có thì dựng tự động từ thông tin niêm yết */
export function buildMockListingDetail(listing: Listing): ListingDetail {
  const mock = MOCK_LISTING_DETAILS[listing.id];
  if (mock) return mock;

  const reviewed = listing.status === 'approved';
  return {
    reviewLevel: listing.partnerTier === 'gold' ? 'Ưu tiên (Cấp 2)' : 'Khắt khe (Cấp 1)',
    areaLabel: PROVINCE_NAMES[listing.province],
    completeness: listing.imageUrl ? 78 : 64,
    photos: listing.imageUrl ? [{ url: listing.imageUrl, caption: listing.name }] : [],
    requiredPhotoCount: 7,
    partner: {
      code: listing.partnerId ?? 'Chưa liên kết',
      representative: 'Đang cập nhật',
      hotline: '—',
      yearsActive: PARTNER_TIER_CONFIG[listing.partnerTier].label,
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
