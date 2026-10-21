import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { DASHBOARD_CARD_CLASS } from '@/pages/Dashboard/dashboardUtils';
import type { CategoryShare, ListingCategory } from '@/types';
import { formatNumber } from '@/utils/format';

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const CATEGORY_COLORS: Record<ListingCategory, { stroke: string; dot: string }> = {
  hotel: { stroke: 'stroke-primary', dot: 'bg-primary' },
  fnb: { stroke: 'stroke-primary-container', dot: 'bg-primary-container' },
  attraction: { stroke: 'stroke-tertiary-fixed-dim', dot: 'bg-tertiary-fixed-dim' },
  tour: { stroke: 'stroke-surface-container-highest', dot: 'bg-surface-container-highest' },
  shopping: { stroke: 'stroke-error-container', dot: 'bg-error-container' },
};

export default function CategoryDonut({ data }: { data: CategoryShare[] }) {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState<ListingCategory | null>(null);

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const percentOf = (count: number) => (total === 0 ? 0 : Math.round((count / total) * 100));

  // Mỗi đoạn vòng tròn: độ dài theo tỷ lệ, bắt đầu nối tiếp đoạn trước
  const segments = data.reduce<{ item: CategoryShare; length: number; offset: number }[]>(
    (acc, item) => {
      const previous = acc[acc.length - 1];
      const offset = previous ? previous.offset + previous.length : 0;
      return [...acc, { item, length: total ? (item.count / total) * CIRCUMFERENCE : 0, offset }];
    },
    [],
  );

  const hoveredItem = data.find((item) => item.category === hovered);

  return (
    <div className={`${DASHBOARD_CARD_CLASS} flex flex-col justify-between`}>
      <div>
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
            {t('dashboard.categories.title')}
          </h2>
          <Icon name="pie_chart" className="text-[22px] text-on-surface-variant" />
        </div>
        <p className="mb-4 font-body-sm text-[13px] text-on-surface-variant">
          {t('dashboard.categories.subtitle')}
        </p>

        <div className="relative my-3 flex items-center justify-center">
          <svg className="h-48 w-48 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="transparent"
              className="stroke-surface-container"
              strokeWidth="13"
            />
            {segments.map(({ item, length, offset }) => (
              <circle
                key={item.category}
                cx="50"
                cy="50"
                r={RADIUS}
                fill="transparent"
                className={`${CATEGORY_COLORS[item.category].stroke} cursor-pointer transition-all duration-200`}
                strokeWidth={hovered === item.category ? 16 : 13}
                strokeDasharray={`${length} ${CIRCUMFERENCE}`}
                strokeDashoffset={-offset}
                onMouseEnter={() => setHovered(item.category)}
                onMouseLeave={() => setHovered(null)}
              />
            ))}
          </svg>
          <div className="pointer-events-none absolute flex flex-col items-center justify-center text-center">
            <span className="font-display-sm text-[26px] leading-tight font-extrabold text-on-surface">
              {formatNumber(hoveredItem ? hoveredItem.count : total)}
            </span>
            <span className="font-label-sm text-[11px] font-semibold tracking-wider text-on-surface-variant uppercase">
              {hoveredItem
                ? t('dashboard.categories.percentOfTotal', {
                    percent: percentOf(hoveredItem.count),
                  })
                : t('dashboard.categories.total')}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2.5 border-t border-surface-container/60 pt-3">
        {data.map((item) => (
          <div
            key={item.category}
            onMouseEnter={() => setHovered(item.category)}
            onMouseLeave={() => setHovered(null)}
            className={`flex items-center justify-between rounded-md font-body-sm text-[12px] transition-opacity ${
              hovered && hovered !== item.category ? 'opacity-50' : ''
            }`}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`h-3 w-3 shrink-0 rounded-full ${CATEGORY_COLORS[item.category].dot}`}
              />
              <span className="truncate text-on-surface">
                {t(`dashboard.categories.${item.category}`)}
              </span>
            </div>
            <span className="ml-2 font-bold text-on-surface">
              {percentOf(item.count)}% ({formatNumber(item.count)})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
