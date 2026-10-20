import Icon from '../../../components/common/Icon';
import type { ListingStats } from '../../../types/admin';
import { formatNumber } from '../../../utils/format';
import type { ListingTab } from '../listingUtils';

interface ListingStatusTabsProps {
  active: ListingTab;
  stats: ListingStats;
  onChange: (tab: ListingTab) => void;
}

interface TabConfig {
  value: ListingTab;
  label: string;
  icon: string;
  iconClass: string;
  count: (stats: ListingStats) => number;
  countClass: string;
}

const TABS: TabConfig[] = [
  {
    value: 'all',
    label: 'Tất cả niêm yết',
    icon: 'folder_copy',
    iconClass: '',
    count: (stats) => stats.total,
    countClass: 'bg-primary/10 font-bold text-primary',
  },
  {
    value: 'pending',
    label: 'Chờ phê duyệt',
    icon: 'hourglass_top',
    iconClass: 'text-tertiary',
    count: (stats) => stats.pending,
    countClass: 'bg-tertiary-fixed font-bold text-on-tertiary-fixed',
  },
  {
    value: 'approved',
    label: 'Đã phê duyệt',
    icon: 'check_circle',
    iconClass: '',
    count: (stats) => stats.approved,
    countClass: 'bg-secondary-container text-on-secondary-container',
  },
  {
    value: 'rejected',
    label: 'Bị từ chối',
    icon: 'cancel',
    iconClass: '',
    count: (stats) => stats.rejected,
    countClass: 'bg-surface-container-highest text-outline',
  },
];

export default function ListingStatusTabs({ active, stats, onChange }: ListingStatusTabsProps) {
  return (
    <div className="flex items-center gap-3 overflow-x-auto rounded-2xl bg-surface-container-low p-1.5">
      {TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-5 py-3 font-label-md text-label-md whitespace-nowrap transition-all ${
              isActive
                ? 'bg-surface-container-lowest font-bold text-primary shadow-[0_2px_10px_rgba(0,0,0,0.06)]'
                : 'text-on-surface-variant hover:bg-surface-container-lowest hover:text-on-surface'
            }`}
          >
            <Icon
              name={tab.icon}
              className={`text-[18px] ${isActive ? 'text-primary' : tab.iconClass}`}
            />
            <span>{tab.label}</span>
            <span
              className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm ${tab.countClass}`}
            >
              {formatNumber(tab.count(stats))}
            </span>
          </button>
        );
      })}
    </div>
  );
}
