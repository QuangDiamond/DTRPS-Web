import { useTranslation } from 'react-i18next';
import { type MouseEvent, type ReactNode, useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import type { Partner, TranslationKey } from '@/types';
import PartnerRow from './PartnerRow';

interface PartnerTableProps {
  partners: Partner[];
  /** Thanh phân trang hiển thị dưới bảng */
  footer: ReactNode;
  onViewDetail: (partner: Partner) => void;
  onEdit: (partner: Partner) => void;
  onLock: (partner: Partner) => void;
  onUnlock: (partner: Partner) => void;
  onViewListings: (partner: Partner) => void;
}

interface MenuState {
  partner: Partner;
  top: number;
  right: number;
}

const COLUMNS: { labelKey: TranslationKey; className: string }[] = [
  { labelKey: 'table.partners.partner', className: 'px-6' },
  { labelKey: 'table.partners.type', className: 'px-5' },
  { labelKey: 'table.partners.contact', className: 'px-5' },
  { labelKey: 'table.partners.listings', className: 'px-5 text-center' },
  { labelKey: 'table.partners.joinedAt', className: 'px-5' },
  { labelKey: 'table.partners.status', className: 'px-5 text-center' },
  { labelKey: 'table.partners.actions', className: 'px-6 text-right' },
];

const MENU_ITEM_CLASS =
  'flex w-full items-center gap-2 px-4 py-2 text-left font-label-md text-label-md transition-colors';

export default function PartnerTable({
  partners,
  footer,
  onViewDetail,
  onEdit,
  onLock,
  onUnlock,
  onViewListings,
}: PartnerTableProps) {
  const { t } = useTranslation();
  const [menu, setMenu] = useState<MenuState | null>(null);

  // Menu dùng position: fixed nên đóng lại khi cuộn / đổi kích thước cửa sổ
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [menu]);

  const openMenu = (partner: Partner, event: MouseEvent<HTMLButtonElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setMenu({ partner, top: rect.bottom + 4, right: window.innerWidth - rect.right });
  };

  const runMenuAction = (action: (partner: Partner) => void) => {
    if (!menu) return;
    action(menu.partner);
    setMenu(null);
  };

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
      <div className="w-full table-scroll overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              {COLUMNS.map((column) => (
                <th key={column.labelKey} className={`py-4 font-semibold ${column.className}`}>
                  {t(column.labelKey)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {partners.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="px-6 py-16 text-center">
                  <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                    <Icon name="search_off" className="text-[40px] text-outline" />
                    <span className="font-title-md text-title-md">
                      {t('partners.partnerTable.noMatchingPartnersFound')}
                    </span>
                    <span className="font-body-sm text-body-sm">
                      {t('partners.partnerTable.tryChangingKeywordOr')}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              partners.map((partner) => (
                <PartnerRow
                  key={partner.id}
                  partner={partner}
                  onViewDetail={onViewDetail}
                  onUnlock={onUnlock}
                  onViewListings={onViewListings}
                  onOpenMenu={openMenu}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {footer}

      {menu && (
        <>
          <div className="fixed inset-0 z-[55]" onClick={() => setMenu(null)} />
          <div
            className="fixed z-[56] w-52 overflow-hidden rounded-xl bg-surface-container-lowest py-1 shadow-lg ring-1 ring-surface-container"
            style={{ top: menu.top, right: menu.right }}
          >
            <button
              type="button"
              onClick={() => runMenuAction(onViewDetail)}
              className={`${MENU_ITEM_CLASS} text-on-surface hover:bg-surface-container-low`}
            >
              <Icon name="visibility" className="text-[18px]" /> {t('actions.viewDetail')}
            </button>
            <button
              type="button"
              onClick={() => runMenuAction(onEdit)}
              className={`${MENU_ITEM_CLASS} text-on-surface hover:bg-surface-container-low`}
            >
              <Icon name="edit" className="text-[18px]" /> {t('partners.partnerTable.editDetails')}
            </button>
            {menu.partner.status === 'suspended' ? (
              <button
                type="button"
                onClick={() => runMenuAction(onUnlock)}
                className={`${MENU_ITEM_CLASS} text-primary hover:bg-surface-container-low`}
              >
                <Icon name="lock_open" className="text-[18px]" />{' '}
                {t('partners.partnerTable.unlockAccount')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => runMenuAction(onLock)}
                className={`${MENU_ITEM_CLASS} text-error hover:bg-error-container/40`}
              >
                <Icon name="lock" className="text-[18px]" />{' '}
                {t('partners.partnerTable.lockAccount')}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
