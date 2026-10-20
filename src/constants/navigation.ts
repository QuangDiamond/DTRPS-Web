import type { NavItem } from '../types/navigation';
import { ROUTES } from './routes';

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { label: 'Bảng điều khiển', path: ROUTES.DASHBOARD, icon: 'dashboard' },
  { label: 'Quản lý người dùng', path: ROUTES.USERS, icon: 'group' },
  { label: 'Quản lý đối tác', path: ROUTES.PARTNERS, icon: 'business_center' },
  {
    label: 'Quản lý niêm yết',
    path: ROUTES.LISTINGS,
    icon: 'store_mall_directory',
    badge: { count: 12, tone: 'tertiary' },
  },
  { label: 'Quản lý điểm đến POI', path: ROUTES.LOCATIONS, icon: 'place' },
  { label: 'Báo cáo & Thống kê', path: ROUTES.REPORTS, icon: 'bar_chart' },
  {
    label: 'Thông báo',
    path: ROUTES.NOTIFICATIONS,
    icon: 'notifications',
    badge: { count: 5, tone: 'secondary' },
  },
  { label: 'Cài đặt hệ thống', path: ROUTES.SETTINGS, icon: 'settings' },
];

/** Breadcrumb gốc dùng chung cho mọi trang admin */
export const ADMIN_ROOT_CRUMB = {
  label: 'Quản trị hệ thống',
  icon: 'home',
  to: ROUTES.DASHBOARD,
};
