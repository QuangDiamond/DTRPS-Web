export type BadgeTone = 'tertiary' | 'secondary';

export interface NavItem {
  label: string;
  path: string;
  icon: string;
  badge?: {
    count: number;
    tone: BadgeTone;
  };
}

export interface BreadcrumbItem {
  label: string;
  icon?: string;
  to?: string;
}
