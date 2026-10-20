import { PARTNER_LOCK_HIDDEN_REASON } from '../constants/partner';
import type { Partner } from '../types/admin';
import { useListings } from './useListings';
import { usePartners } from './usePartners';

/**
 * Thao tác trạng thái đối tác có ảnh hưởng sang niêm yết:
 * khóa đối tác → tạm ẩn các địa điểm đang hiển thị; mở khóa → hiện lại đúng các địa điểm đó.
 */
export function usePartnerActions() {
  const { setPartnerStatus, logAudit } = usePartners();
  const { listings, setListingsVisibility } = useListings();

  const partnerListingIds = (partner: Partner, predicate: (hiddenReason?: string) => boolean) =>
    listings
      .filter(
        (listing) =>
          listing.partnerId === partner.id &&
          listing.status === 'approved' &&
          predicate(listing.visibility === 'hidden' ? listing.hiddenReason : undefined),
      )
      .map((listing) => listing.id);

  /** Trả về số địa điểm bị tạm ẩn theo */
  const lockPartner = (partner: Partner, reason: string, note?: string) => {
    setPartnerStatus(partner.id, 'suspended', reason);
    if (note) logAudit(partner.id, 'sticky_note_2', `Ghi chú khóa tài khoản: ${note}`);
    const ids = partnerListingIds(partner, (hiddenReason) => hiddenReason === undefined);
    return setListingsVisibility(ids, 'hidden', PARTNER_LOCK_HIDDEN_REASON);
  };

  /** Trả về số địa điểm được hiển thị lại */
  const unlockPartner = (partner: Partner) => {
    setPartnerStatus(partner.id, 'active');
    const ids = partnerListingIds(
      partner,
      (hiddenReason) => hiddenReason === PARTNER_LOCK_HIDDEN_REASON,
    );
    return setListingsVisibility(ids, 'visible');
  };

  const approvePartner = (partner: Partner) => setPartnerStatus(partner.id, 'active');

  const rejectPartner = (partner: Partner) =>
    setPartnerStatus(partner.id, 'suspended', 'Hồ sơ bị từ chối');

  /** Số địa điểm đang hiển thị sẽ bị ảnh hưởng nếu khóa đối tác */
  const countVisibleListings = (partner: Partner) =>
    partnerListingIds(partner, (hiddenReason) => hiddenReason === undefined).length;

  return { lockPartner, unlockPartner, approvePartner, rejectPartner, countVisibleListings };
}
