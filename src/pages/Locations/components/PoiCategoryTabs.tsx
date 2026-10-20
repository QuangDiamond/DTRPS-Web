import { POI_CATEGORY_TABS } from '../../../constants/poi';
import type { PoiCategoryTab } from '../../../types/admin';
import { formatNumber } from '../../../utils/format';

interface PoiCategoryTabsProps {
  active: PoiCategoryTab;
  counts: Record<PoiCategoryTab, number>;
  onChange: (tab: PoiCategoryTab) => void;
}

export default function PoiCategoryTabs({ active, counts, onChange }: PoiCategoryTabsProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {POI_CATEGORY_TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`rounded-full px-space-md py-2 font-label-md text-label-md whitespace-nowrap transition-all ${
            tab.id === active
              ? 'bg-primary font-semibold text-on-primary shadow-sm'
              : 'bg-surface-container-lowest font-medium text-on-surface-variant shadow-xs hover:bg-surface-container-high hover:text-on-surface'
          }`}
        >
          {tab.label} ({formatNumber(counts[tab.id])})
        </button>
      ))}
    </div>
  );
}
