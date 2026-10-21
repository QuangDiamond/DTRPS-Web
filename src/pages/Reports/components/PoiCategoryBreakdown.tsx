import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { CATEGORY_BAR_TONES, REPORT_CARD_CLASS } from '@/pages/Reports/reportUtils';
import type { PoiCategoryStat } from '@/types';
import { formatNumber } from '@/utils/format';

interface PoiCategoryBreakdownProps {
  categories: (PoiCategoryStat & { share: number })[];
  total: number;
}

export default function PoiCategoryBreakdown({ categories, total }: PoiCategoryBreakdownProps) {
  const { t } = useTranslation();
  return (
    <div className={`flex flex-col justify-between lg:col-span-5 ${REPORT_CARD_CLASS}`}>
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <h2 className="font-headline-sm text-[17px] font-bold text-on-surface">
            {t('reports.poiCategoryBreakdown.placesByCategory')}
          </h2>
          <span className="shrink-0 font-label-sm text-[12px] font-semibold text-on-surface-variant">
            {t('reports.poiCategoryBreakdown.totalPois', { total: formatNumber(total) })}
          </span>
        </div>
        <p className="mb-6 font-body-sm text-[13px] text-on-surface-variant">
          {t('reports.poiCategoryBreakdown.accommodationDiningMakeUp')}
        </p>

        <div className="space-y-4">
          {categories.map((category, index) => {
            const tone = CATEGORY_BAR_TONES[index % CATEGORY_BAR_TONES.length];
            return (
              <div key={category.id} className="space-y-1.5">
                <div className="flex items-center justify-between font-body-sm text-[13px] text-on-surface">
                  <div className="flex items-center gap-2">
                    <Icon name={category.icon} className={`text-[18px] ${tone.icon}`} />
                    <span className="font-semibold">{category.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-on-surface">
                      {formatNumber(category.count)}
                    </span>
                    <span className="font-label-sm text-[12px] text-on-surface-variant">
                      ({category.share.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-container">
                  <div
                    className={`h-full rounded-full ${tone.bar}`}
                    style={{ width: `${category.share}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
