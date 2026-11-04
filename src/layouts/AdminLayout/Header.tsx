import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Icon, LanguageSwitcher } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useAuth, useToast } from '@/hooks';

const ICON_BUTTON_CLASS =
  'flex h-10 w-10 items-center justify-center rounded-full bg-[#F1F4F8] text-on-surface-variant transition-all hover:bg-[#E4EAF1] hover:text-on-surface';

export default function Header() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { admin } = useAuth();
  // Chưa có API thông báo
  const unreadCount = 0;
  const [keyword, setKeyword] = useState('');
  const { t } = useTranslation();

  return (
    <header className="print:hidden fixed top-0 right-0 left-72 z-40 flex h-[68px] items-center justify-between gap-4 border-b border-[#E3E8EF] bg-white px-space-lg shadow-[0_1px_4px_rgba(15,23,42,0.04)]">
      {/* Tìm kiếm toàn cục */}
      <div className="flex max-w-xl flex-1 items-center gap-4">
        <div className="relative w-full max-w-md">
          <Icon
            name="search"
            className="absolute top-1/2 left-3 -translate-y-1/2 text-[20px] text-on-surface-variant"
          />
          <input
            type="text"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={t('header.searchPlaceholder')}
            className="h-10 w-full rounded-full border border-transparent bg-[#F1F4F8] pr-4 pl-10 font-body-sm text-body-sm text-on-surface transition-all placeholder:text-outline focus:border-primary/30 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitcher />

        <button
          type="button"
          onClick={() => navigate(ROUTES.NOTIFICATIONS)}
          className={`relative ${ICON_BUTTON_CLASS}`}
          title={
            unreadCount > 0
              ? t('header.notificationsUnread', { count: unreadCount })
              : t('header.notifications')
          }
        >
          <Icon name="notifications" className="text-[20px]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-error ring-2 ring-surface-container-lowest" />
          )}
        </button>

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
