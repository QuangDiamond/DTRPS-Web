import { NavLink, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import { useAuth } from '../../hooks/useAuth';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';
import { useToast } from '../../hooks/useToast';
import type { BadgeTone } from '../../types/navigation';

const BADGE_TONE_CLASSES: Record<BadgeTone, string> = {
  tertiary: 'bg-tertiary-fixed text-on-tertiary-fixed',
  secondary: 'bg-secondary-container text-on-secondary-container',
};

export default function Sidebar() {
  const navigate = useNavigate();
  const { admin, logout } = useAuth();
  const { showToast } = useToast();

  const handleLogout = () => {
    logout();
    showToast('Đã đăng xuất khỏi hệ thống', 'info');
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <aside className="fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col justify-between bg-surface-container-lowest shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Logo */}
        <div className="flex h-[68px] items-center gap-3 bg-surface-container-lowest px-space-lg">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0d9488] shadow-sm">
            <Icon name="public" className="text-[20px] text-white" />
          </div>
          <div className="flex min-w-0 flex-col">
            <span className="text-base leading-none font-black tracking-tight text-slate-900">
              Smart<span className="text-[#0d9488]">Travel</span>
            </span>
            <span className="mt-0.5 block text-[10px] font-bold tracking-wider text-slate-500 uppercase">
              VIETNAM AI ADMIN
            </span>
          </div>
        </div>

        <div className="px-space-md py-space-sm">
          <div className="px-space-sm py-space-xs font-label-sm text-label-sm font-semibold tracking-wider text-outline uppercase">
            Quản trị hệ thống
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 space-y-1 px-space-md">
          {ADMIN_NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-space-md py-2.5 transition-all ${
                  isActive
                    ? 'bg-primary font-semibold text-on-primary shadow-sm'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon name={item.icon} className="text-[20px]" />
                <span className="font-label-md text-label-md">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold ${BADGE_TONE_CLASSES[item.badge.tone]}`}
                >
                  {item.badge.count}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Thông tin admin + đăng xuất */}
      <div className="bg-surface-container-low/60 p-space-md">
        <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-space-sm shadow-[0_1px_4px_rgba(0,0,0,0.03)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary">
              <Icon name="person" className="text-[18px] text-on-primary" />
            </div>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-label-md text-label-md font-semibold text-on-surface">
                {admin?.name}
              </span>
              <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
                {admin?.email}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="shrink-0 rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-error-container/40 hover:text-error"
            title="Đăng xuất"
          >
            <Icon name="logout" className="text-[20px]" />
          </button>
        </div>
      </div>
    </aside>
  );
}
