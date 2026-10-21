import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { formatSigned, REPORT_CARD_CLASS } from '@/pages/Reports/reportUtils';
import type { DestinationRank } from '@/types';
import { formatNumber } from '@/utils/format';

interface TopDestinationsProps {
  destinations: DestinationRank[];
  totalTrips: number;
}

const RANK_CLASSES = [
  'bg-primary text-on-primary',
  'bg-primary/80 text-on-primary',
  'bg-primary/70 text-on-primary',
];
const DEFAULT_RANK_CLASS = 'bg-surface-container-high text-on-surface';

export default function TopDestinations({ destinations, totalTrips }: TopDestinationsProps) {
  const { t } = useTranslation();
  const maxTrips = Math.max(1, ...destinations.map((item) => item.plannedTrips));
  const allGrowing = destinations.every((item) => item.growthPercent >= 0);

  return (
    <div className={REPORT_CARD_CLASS}>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Icon name="grade" className="text-[24px] text-primary" />
            <h2 className="font-headline-lg text-[20px] font-bold text-on-surface">
              {t('reports.topDestinations.mostPlannedDestinations')}
            </h2>
          </div>
          <p className="mt-0.5 font-body-md text-[14px] text-on-surface-variant">
            {t('reports.topDestinations.rankedFromTripsAggregated', {
              totalTrips: formatNumber(totalTrips),
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-label-sm text-[12px] text-on-surface-variant">
            {t('reports.topDestinations.trendIndex')}
          </span>
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 font-label-sm text-[12px] font-bold ${
              allGrowing
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-tertiary-fixed text-on-tertiary-fixed'
            }`}
          >
            <Icon name={allGrowing ? 'trending_up' : 'trending_flat'} className="text-[15px]" />
            {allGrowing
              ? t('reports.topDestinations.positiveGrowth')
              : t('reports.topDestinations.someDestinationsSlowing')}
          </span>
        </div>
      </div>

      {destinations.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-center text-on-surface-variant">
          <Icon name="travel_explore" className="text-[36px] text-outline" />
          <span className="font-body-md text-[14px]">
            {t('reports.topDestinations.noDestinationDataThis')}
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {destinations.map((destination, index) => (
            <div
              key={destination.id}
              className="flex flex-col justify-between rounded-2xl border border-surface-container bg-surface-container-low/60 p-5 transition-all hover:border-primary/40"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full font-headline-sm text-sm font-bold shadow-xs ${
                        RANK_CLASSES[index] ?? DEFAULT_RANK_CLASS
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <div>
                      <h3 className="font-title-md text-[16px] font-bold text-on-surface">
                        {destination.name}
                      </h3>
                      <span className="font-label-sm text-[12px] text-on-surface-variant">
                        {destination.area}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 rounded-full border border-surface-container bg-surface-container-lowest px-2.5 py-0.5 text-tertiary shadow-xs">
                    <Icon name="star" filled className="text-[15px]" />
                    <span className="font-label-sm text-[12px] font-bold">
                      {destination.rating}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display-sm text-[26px] font-bold text-primary">
                      {formatNumber(destination.plannedTrips)}
                    </span>
                    <span
                      className={`flex items-center gap-0.5 font-label-sm text-[12px] font-bold ${
                        destination.growthPercent >= 0 ? 'text-secondary' : 'text-error'
                      }`}
                    >
                      <Icon
                        name={destination.growthPercent >= 0 ? 'trending_up' : 'trending_down'}
                        className="text-[15px]"
                      />
                      {formatSigned(destination.growthPercent)}
                    </span>
                  </div>
                  <span className="font-body-sm text-[12px] text-on-surface-variant">
                    {t('reports.topDestinations.itinerariesPlanned')}
                  </span>
                </div>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface-container-high">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${Math.max(4, (destination.plannedTrips / maxTrips) * 95)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-1.5 rounded-xl border border-surface-container/60 bg-surface-container-lowest/80 p-3">
                <span className="font-label-sm text-[11px] font-medium text-on-surface-variant">
                  {t('reports.topDestinations.highlights')}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {destination.highlights.map((highlight, highlightIndex) => (
                    <span
                      key={highlight}
                      className={`rounded-md px-2 py-0.5 font-label-sm text-[11px] ${
                        highlightIndex < 2
                          ? 'bg-secondary-container/60 text-on-secondary-container'
                          : 'bg-surface-container-high text-on-surface-variant'
                      }`}
                    >
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
