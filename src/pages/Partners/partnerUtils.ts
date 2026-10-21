import i18n from 'i18next';
import { PARTNER_TYPE_CONFIG, SUSPENDED_AVATAR_CLASS } from '@/constants/partner';
import type { Partner, PartnerFilters, PartnerListingSummary } from '@/types';
import { normalizeText } from '@/utils/string';

export function filterAndSortPartners(partners: Partner[], filters: PartnerFilters): Partner[] {
  const keyword = normalizeText(filters.keyword);

  const filtered = partners.filter((partner) => {
    if (filters.type !== 'all' && partner.type !== filters.type) return false;
    if (filters.status !== 'all' && partner.status !== filters.status) return false;
    if (filters.province !== 'all' && partner.province !== filters.province) return false;
    if (!keyword) return true;

    return [partner.name, partner.businessName, partner.taxCode, partner.email, partner.id].some(
      (field) => normalizeText(field).includes(keyword),
    );
  });

  return [...filtered].sort((a, b) => {
    switch (filters.sort) {
      case 'listings':
        return b.listings.total - a.listings.total;
      case 'rating':
        return b.rating - a.rating;
      case 'newest':
        return b.joinedAt.localeCompare(a.joinedAt);
    }
  });
}

/** Dòng phụ dưới số lượng niêm yết: ưu tiên tạm dừng > chờ duyệt > đã duyệt */
export function getListingSummary(listings: PartnerListingSummary): {
  label: string;
  className: string;
} {
  if (listings.paused > 0)
    return {
      label: i18n.t('partners.utils.paused', { paused: listings.paused }),
      className: 'text-error',
    };
  if (listings.pending > 0) {
    return {
      label: i18n.t('partners.utils.pending', { pending: listings.pending }),
      className: 'text-tertiary',
    };
  }
  return {
    label: i18n.t('partners.utils.approved', { approved: listings.approved }),
    className: 'text-primary',
  };
}

export function getPartnerAvatarClass(partner: Partner): string {
  return partner.status === 'suspended'
    ? SUSPENDED_AVATAR_CLASS
    : PARTNER_TYPE_CONFIG[partner.type].avatarClass;
}
