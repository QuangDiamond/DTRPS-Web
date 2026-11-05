import { useListingReview, useLiveRefresh, usePartners } from '@/hooks';

/**
 * Nối sự kiện realtime với các store admin: đối tác gửi / sửa / rút, hoặc admin khác vừa duyệt →
 * hàng chờ, màn duyệt, danh sách đối tác và số trên Sidebar tự tải lại (không cần F5).
 */
export default function LiveSync() {
  const listingReview = useListingReview();
  const partners = usePartners();

  useLiveRefresh(['LISTING_', 'REVISION_'], () => listingReview.refresh());
  useLiveRefresh(['PARTNER_'], () => {
    partners.refresh();
    // Khoá / mở doanh nghiệp ảnh hưởng tới địa điểm chờ duyệt của họ
    listingReview.refresh();
  });
  return null;
}
