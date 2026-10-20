import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import type { Partner } from '../../../types/admin';
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

const COLUMNS = [
  { label: 'Đối tác & Cơ sở đại diện', className: 'px-6' },
  { label: 'Loại hình', className: 'px-5' },
  { label: 'Thông tin liên hệ', className: 'px-5' },
  { label: 'Niêm yết', className: 'px-5 text-center' },
  { label: 'Ngày tham gia', className: 'px-5' },
  { label: 'Trạng thái', className: 'px-5 text-center' },
  { label: 'Thao tác', className: 'px-6 text-right' },
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
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-surface-container-low/70 font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              {COLUMNS.map((column) => (
                <th key={column.label} className={`py-4 font-semibold ${column.className}`}>
                  {column.label}
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
                      Không tìm thấy đối tác phù hợp
                    </span>
                    <span className="font-body-sm text-body-sm">
                      Thử thay đổi từ khóa hoặc bộ lọc.
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
              <Icon name="visibility" className="text-[18px]" /> Xem chi tiết
            </button>
            <button
              type="button"
              onClick={() => runMenuAction(onEdit)}
              className={`${MENU_ITEM_CLASS} text-on-surface hover:bg-surface-container-low`}
            >
              <Icon name="edit" className="text-[18px]" /> Chỉnh sửa thông tin
            </button>
            {menu.partner.status === 'suspended' ? (
              <button
                type="button"
                onClick={() => runMenuAction(onUnlock)}
                className={`${MENU_ITEM_CLASS} text-primary hover:bg-surface-container-low`}
              >
                <Icon name="lock_open" className="text-[18px]" /> Mở khóa tài khoản
              </button>
            ) : (
              <button
                type="button"
                onClick={() => runMenuAction(onLock)}
                className={`${MENU_ITEM_CLASS} text-error hover:bg-error-container/40`}
              >
                <Icon name="lock" className="text-[18px]" /> Khóa tài khoản
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
