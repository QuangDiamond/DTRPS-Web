import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import BrandMark from '@/components/common/BrandMark';
import { ADMIN_NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth, useListingReview, useToast } from '@/hooks';
import type { BadgeTone, NavBadgeSource } from '@/types';

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  secondary: 'bg-secondary-container text-on-secondary-container',
};

export default function Sidebar() {
  // Địa điểm mới + bản sửa đang chờ duyệt (dữ liệu thật)
  const { stats: reviewStats } = useListingReview();
  const badgeCounts: Record<NavBadgeSource, number> = {
    pendingListings: reviewStats.pending + reviewStats.pendingRevisions,
    // Chưa có API thông báo
    unreadNotifications: 0,
  };
  const isProfileActive = useLocation().pathname === ROUTES.PROFILE;
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { admin, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast(t('nav.loggedOut'), 'info');
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="print:hidden fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between bg-linear-to-b from-[#0B3F3B] to-[#072A28] text-white shadow-[2px_0_16px_rgba(7,42,40,0.18)]">
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Logo */}
        <div className="flex h-[68px] items-center gap-3 border-b border-white/10 px-space-lg">
          <BrandMark tone="dark" size="sm" subtitle="VIETNAM TRAVEL ADMIN" />
        </div>

        <div className="px-space-md py-space-sm">
          <div className="px-space-sm py-space-xs font-label-sm text-label-sm font-semibold tracking-wider text-white/45 uppercase">
            {t('nav.section')}
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 px-space-md">
          {ADMIN_NAV_ITEMS.map((item) => {
            const badgeCount = item.badge ? badgeCounts[item.badge.source] : 0;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center justify-between rounded-xl px-space-md py-2.5 transition-all ${
                    isActive
                      ? 'bg-white/12 font-semibold text-white shadow-sm before:absolute before:top-2 before:bottom-2 before:left-0 before:w-1 before:rounded-full before:bg-[#5EEAD4]'
                      : 'text-white/70 hover:bg-white/8 hover:text-white'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon name={item.icon} className="text-[20px]" />
                  <span className="font-label-md text-label-md">{item.label}</span>
                </div>
                {item.badge && badgeCount ? (
                  <span
                    className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold ${BADGE_TONE_CLASSES[item.badge.tone]}`}
                  >
                    {badgeCount}
                  </span>
                ) : null}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Thông tin admin + đăng xuất */}
      <div className="border-t border-white/10 p-space-md">
        {/* Bấm vào thẻ để mở Hồ sơ quản trị viên — thẻ được tô sáng khi đang ở trang hồ sơ */}
        <div
          className={`flex items-center justify-between rounded-xl p-space-sm transition-all ${
            isProfileActive ? 'bg-white/15 shadow-sm' : 'bg-white/6 hover:bg-white/10'
          }`}
        >
          <NavLink
            to={ROUTES.PROFILE}
            title={t('nav.profile')}
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#14B8A6]">
              <Icon name="person" className="text-[18px] text-white" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span
                className={`truncate font-label-md text-label-md font-semibold ${'text-white'}`}
              >
                {admin?.name}
              </span>
              <span className={`truncate font-body-sm text-body-sm ${'text-white/60'}`}>
                {admin?.email}
              </span>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={handleLogout}
            className={`shrink-0 rounded-lg p-1.5 transition-colors hover:bg-white/10 hover:text-[#FCA5A5] ${'text-white/70'}`}
            title={t('nav.logout')}
          >
            <Icon name="logout" className="text-[20px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
