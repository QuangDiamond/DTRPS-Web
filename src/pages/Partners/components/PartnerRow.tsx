import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import type { MouseEvent } from 'react';
import { Icon } from '@/components/common';
import { getListingSummary, getPartnerAvatarClass } from '@/pages/Partners/partnerUtils';
import type { Partner, PartnerStatus } from '@/types';
import { formatDate } from '@/utils/format';
import PartnerStatusBadge from './PartnerStatusBadge';
import PartnerTypeBadge from './PartnerTypeBadge';

interface PartnerRowProps {
  partner: Partner;
  onViewDetail: (partner: Partner) => void;
  onUnlock: (partner: Partner) => void;
  onViewListings: (partner: Partner) => void;
  onOpenMenu: (partner: Partner, event: MouseEvent<HTMLButtonElement>) => void;
}

const VIEW_DETAIL_ACTION = {
  icon: 'visibility',
  get title() {
    return i18n.t('partners.partnerRow.viewPartnerDetails');
  },
  iconClass: '',
};

/** Nút đầu tiên của cột Thao tác: xem chi tiết (xác minh cũng làm trong trang chi tiết), riêng tài khoản bị khóa là mở khóa */
const PRIMARY_ACTION: Record<PartnerStatus, { icon: string; title: string; iconClass: string }> = {
  active: VIEW_DETAIL_ACTION,
  pending: VIEW_DETAIL_ACTION,
  suspended: {
    icon: 'lock_open',
    get title() {
      return i18n.t('partners.partnerRow.unlockAccount');
    },
    iconClass: 'text-primary',
  },
};

const ROUND_BUTTON_CLASS =
  'flex h-8 w-8 items-center justify-center rounded-full text-on-surface-variant transition-all';

export default function PartnerRow({
  partner,
  onViewDetail,
  onUnlock,
  onViewListings,
  onOpenMenu,
}: PartnerRowProps) {
  const { t } = useTranslation();
  const listingSummary = getListingSummary(partner.listings);
  const primaryAction = PRIMARY_ACTION[partner.status];
  const isSuspended = partner.status === 'suspended';

  return (
    <tr className="transition-colors hover:bg-surface-container-low/40">
      {/* Đối tác & cơ sở */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3.5">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${getPartnerAvatarClass(partner)}`}
          >
            <Icon name="person" className="text-[20px]" />
          </div>
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onViewDetail(partner)}
                className="group flex items-center gap-1 truncate font-title-md text-title-md font-bold text-on-surface hover:text-primary hover:underline"
              >
                <span>{partner.name}</span>
                <Icon
                  name="arrow_forward"
                  className="text-[16px] opacity-0 transition-opacity group-hover:opacity-100"
                />
              </button>
              <span className="rounded-full bg-surface-container px-2 py-0.5 font-label-sm font-mono text-label-sm text-primary">
                {partner.id}
              </span>
            </div>
            <span className="mt-0.5 flex items-center gap-1 font-body-sm text-body-sm text-on-surface-variant">
              <Icon name={partner.businessIcon} className="text-[15px] text-tertiary" />{' '}
              {partner.businessName} • {partner.address}
            </span>
            <span className="mt-0.5 font-label-sm text-label-sm text-outline">
              {t('partners.partnerRow.representative', { representative: partner.representative })}
            </span>
          </div>
        </div>
      </td>

      {/* Loại hình */}
      <td className="px-5 py-4 align-middle">
        <PartnerTypeBadge type={partner.type} />
      </td>

      {/* Liên hệ */}
      <td className="px-5 py-4 align-middle">
        <div className="flex flex-col gap-0.5">
          <span className="font-body-sm text-body-sm font-medium text-on-surface">
            {partner.email}
          </span>
          <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant">
            <Icon name="call" className="text-[14px]" /> {partner.phone}
          </span>
        </div>
      </td>

      {/* Niêm yết */}
      <td className="px-5 py-4 text-center align-middle">
        <div className="inline-flex flex-col items-center">
          <span className="font-title-md text-title-md font-bold text-on-surface">
            {partner.listings.total}
          </span>
          <span className={`font-label-sm text-label-sm font-medium ${listingSummary.className}`}>
            {listingSummary.label}
          </span>
        </div>
      </td>

      {/* Ngày tham gia */}
      <td className="px-5 py-4 align-middle">
        <span className="font-body-sm text-body-sm text-on-surface">
          {formatDate(partner.joinedAt)}
        </span>
      </td>

      {/* Trạng thái */}
      <td className="px-5 py-4 text-center align-middle">
        {partner.statusNote ? (
          <div className="inline-flex flex-col items-center">
            <PartnerStatusBadge status={partner.status} />
            <span className="mt-0.5 font-label-sm text-[10px] text-outline">
              {partner.statusNote}
            </span>
          </div>
        ) : (
          <PartnerStatusBadge status={partner.status} />
        )}
      </td>

      {/* Thao tác */}
      <td className="px-6 py-4 text-right align-middle">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={() => (isSuspended ? onUnlock(partner) : onViewDetail(partner))}
            className={`${ROUND_BUTTON_CLASS} hover:bg-surface-container hover:text-primary`}
            title={primaryAction.title}
          >
            <Icon name={primaryAction.icon} className={`text-[19px] ${primaryAction.iconClass}`} />
          </button>
          <button
            type="button"
            onClick={() => onViewListings(partner)}
            className={`${ROUND_BUTTON_CLASS} hover:bg-surface-container hover:text-primary`}
            title={t('partners.partnerRow.placeList')}
          >
            <Icon name="map" className="text-[19px]" />
          </button>
          <button
            type="button"
            onClick={(event) => onOpenMenu(partner, event)}
            className={`${ROUND_BUTTON_CLASS} ${
              isSuspended
                ? 'hover:bg-surface-container hover:text-on-surface'
                : 'hover:bg-error-container/40 hover:text-error'
            }`}
            title={
              isSuspended
                ? t('partners.partnerRow.moreOptions')
                : t('partners.partnerRow.lockSettings')
            }
          >
            <Icon name="more_vert" className="text-[19px]" />
          </button>
        </div>
      </td>
    </tr>
  );
}
