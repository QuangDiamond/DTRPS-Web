import i18n from 'i18next';
import type { BreadcrumbItem, NavItem } from '@/types';
import { localizeField } from '@/utils/localize';
import { ROUTES } from './routes';

const NAV_ITEMS: (NavItem & { id: string })[] = [
  {
    id: 'dashboard',
    get label() {
      return i18n.t('nav.constants.dashboard');
    },
    path: ROUTES.DASHBOARD,
    icon: 'dashboard',
  },
  {
    id: 'users',
    get label() {
      return i18n.t('nav.constants.userManagement');
    },
    path: ROUTES.USERS,
    icon: 'group',
  },
  {
    id: 'partners',
    get label() {
      return i18n.t('nav.constants.partnerManagement');
    },
    path: ROUTES.PARTNERS,
    icon: 'business_center',
  },
  {
    id: 'listings',
    get label() {
      return i18n.t('nav.constants.listingManagement');
    },
    path: ROUTES.LISTINGS,
    icon: 'store_mall_directory',
    badge: { source: 'pendingListings', tone: 'tertiary' },
  },
  {
    id: 'pois',
    get label() {
      return i18n.t('nav.constants.poiDestinations');
    },
    path: ROUTES.POIS,
    icon: 'place',
  },
  {
    id: 'reports',
    get label() {
      return i18n.t('nav.constants.reportsAnalytics');
    },
    path: ROUTES.REPORTS,
    icon: 'bar_chart',
  },
  {
    id: 'notifications',
    get label() {
      return i18n.t('nav.constants.notifications');
    },
    path: ROUTES.NOTIFICATIONS,
    icon: 'notifications',
    badge: { source: 'unreadNotifications', tone: 'secondary' },
  },
  {
    id: 'settings',
    get label() {
      return i18n.t('nav.constants.systemSettings');
    },
    path: ROUTES.SETTINGS,
    icon: 'settings',
  },
];
NAV_ITEMS.forEach((item) => localizeField(item, 'label', `nav.${item.id}`));

/** Menu Sidebar — nhãn đổi theo ngôn ngữ đang chọn */
export const ADMIN_NAV_ITEMS: NavItem[] = NAV_ITEMS;

/** Breadcrumb gốc dùng chung cho mọi trang admin */
export const ADMIN_ROOT_CRUMB: BreadcrumbItem = {
  get label() {
    return i18n.t('nav.constants.systemAdministration');
  },
  icon: 'home',
  to: ROUTES.DASHBOARD,
};
localizeField(ADMIN_ROOT_CRUMB, 'label', 'nav.section');
