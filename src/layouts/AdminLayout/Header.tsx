import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon, LanguageSwitcher } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import NotificationBell from '@/components/common/NotificationBell';
import { useAuth, useLive, useToast } from '@/hooks';

const ICON_BUTTON_CLASS =
  'flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F4F8] text-on-surface-variant transition-all hover:bg-[#E4EAF1] hover:text-on-surface';

/** Admin nhận hồ sơ đối tác mới, không phải hồ sơ của mình */
const ADMIN_CATEGORY_LABELS = { LISTING: 'Đối tác', ADS: 'Thanh toán' };

export default function Header() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { admin } = useAuth();
  const live = useLive();
  const { t } = useTranslation();

  return (
    <header className="print:hidden fixed top-0 right-0 left-72 z-40 flex h-[68px] items-center justify-between gap-4 border-b border-[#E3E8EF] bg-white px-space-lg shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
      {/* Đẩy cụm ngôn ngữ / thông báo / tài khoản sang phải */}
      <div className="flex-1" />

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        {live && (
          <NotificationBell
            unread={live.unread}
            items={live.items}
            loading={live.loading}
            connected={live.connected}
            filter={live.filter}
            categories={live.categories}
            hasMore={live.hasMore}
            loadingMore={live.loadingMore}
            onFilter={live.setFilter}
            onLoadMore={live.loadMore}
            categoryLabels={ADMIN_CATEGORY_LABELS}
            onOpen={live.loadItems}
            onMarkAllRead={live.markAllRead}
            onSelect={(item) => {
              live.markRead(item.id);
              if (item.link) navigate(item.link);
            }}
          />
        )}

        <button
          type="button"
          onClick={() => showToast(t('header.helpComingSoon'), 'info')}
          className={ICON_BUTTON_CLASS}
          title={t('header.help')}
        >
          <Icon name="help_outline" className="text-[20px]" />
        </button>

        <div className="h-6 w-px bg-[#E3E8EF]" />

        <button
          type="button"
          title={t('header.profile')}
          onClick={() => navigate(ROUTES.PROFILE)}
          className="flex items-center gap-3 rounded-full py-1 pr-2 pl-1 transition-colors hover:bg-[#F1F4F8]"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
            <Icon name="person" className="text-[18px] text-on-primary" />
          </div>
          <div className="hidden flex-col text-left xl:flex">
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {admin?.name}
            </span>
            <span className="font-label-sm text-label-sm text-on-surface-variant">
              {admin?.role}
            </span>
          </div>
        </button>
      </div>
    </header>
  );
}
