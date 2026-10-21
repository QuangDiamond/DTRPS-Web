export type BadgeTone = 'tertiary' | 'secondary';

export type NavBadgeSource = 'pendingListings' | 'unreadNotifications';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  /** Badge số lượng — giá trị lấy trực tiếp từ store theo `source` */
  badge?: {
    source: NavBadgeSource;
    tone: BadgeTone;
  };
}

export interface BreadcrumbItem {
  label: string;
  icon?: string;
  to?: string;
}
