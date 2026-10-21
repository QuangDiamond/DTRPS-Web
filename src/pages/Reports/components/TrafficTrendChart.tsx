import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { isMonthInRange, REPORT_CARD_CLASS, smoothPath } from '@/pages/Reports/reportUtils';
import type { DateRange, MonthlyTrafficPoint } from '@/types';
import { formatMonthShort, formatNumber } from '@/utils/format';

interface TrafficTrendChartProps {
  data: MonthlyTrafficPoint[];
  dateRange: DateRange;
  year: number;
  insight: string;
  onOpenInsight: () => void;
}

const WIDTH = 700;
const HEIGHT = 240;
const BASELINE = 210;
const TOP = 25;
const BAR_WIDTH = 24;
const GRID_LINES = [40, 100, 160];

export default function TrafficTrendChart({
  data,
  dateRange,
  year,
  insight,
  onOpenInsight,
}: TrafficTrendChartProps) {
  const { t } = useTranslation();
  const slot = WIDTH / Math.max(1, data.length);
  const maxViews = Math.max(1, ...data.map((point) => point.pageViewsK));
  const maxUsers = Math.max(1, ...data.map((point) => point.newUsers));
  const scaleY = (value: number, max: number) => BASELINE - (value / max) * (BASELINE - TOP);
  const linePoints = data.map((point, index) => ({
    x: index * slot + slot / 2,
    y: scaleY(point.newUsers, maxUsers),
  }));
  const peakIndex = data.reduce(
    (best, point, index) => (point.newUsers > data[best].newUsers ? index : best),
    0,
  );
  const lastActual = data.reduce((last, point, index) => (point.projected ? last : index), 0);

  return (
    <div className={`flex flex-col justify-between lg:col-span-7 ${REPORT_CARD_CLASS}`}>
      <div>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <span className="font-label-sm text-[11px] font-bold tracking-wider text-primary uppercase">
              {t('reports.trafficTrendChart.engagementTrend')}
            </span>
            <h2 className="mt-0.5 font-headline-sm text-[17px] font-bold text-on-surface">
              {t('reports.trafficTrendChart.userTrafficGrowth', { year })}
            </h2>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-primary" />
              <span className="font-label-sm text-[12px] text-on-surface-variant">
                {t('reports.trafficTrendChart.viewsK')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-3 rounded-full bg-tertiary" />
              <span className="font-label-sm text-[12px] text-on-surface-variant">
                {t('reports.trafficTrendChart.newUsers')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative flex h-64 w-full items-end">
          <svg
            className="h-full w-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={t('reports.trafficTrendChart.chartMonthlyViewsNew')}
          >
            <defs>
              <linearGradient id="report-bar" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.9" />
                <stop offset="100%" stopColor="var(--color-primary-fixed)" stopOpacity="0.3" />
              </linearGradient>
              <linearGradient id="report-line" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="var(--color-tertiary)" />
                <stop offset="100%" stopColor="var(--color-tertiary-fixed-dim)" />
              </linearGradient>
            </defs>
            {GRID_LINES.map((y) => (
              <line
                key={y}
                x1="0"
                x2={WIDTH}
                y1={y}
                y2={y}
                strokeWidth="1.5"
                className="stroke-surface-container"
              />
            ))}
            <line
              x1="0"
              x2={WIDTH}
              y1={BASELINE}
              y2={BASELINE}
              strokeWidth="1"
              className="stroke-surface-container-highest"
            />

            {data.map((point, index) => {
              const y = scaleY(point.pageViewsK, maxViews);
              return (
                <rect
                  key={point.month}
                  x={index * slot + (slot - BAR_WIDTH) / 2}
                  y={y}
                  width={BAR_WIDTH}
                  height={BASELINE - y}
                  rx="4"
                  fill="url(#report-bar)"
                  opacity={point.projected ? 0.45 : 1}
                  strokeDasharray={point.projected ? '4 2' : undefined}
                  className={point.projected ? 'stroke-primary' : undefined}
                >
                  <title>
                    {point.projected
                      ? t('reports.trafficTrendChart.forecastKViewsNew', {
                          month: formatMonthShort(point.month),
                          pageViewsK: formatNumber(point.pageViewsK),
                          newUsers: formatNumber(point.newUsers),
                        })
                      : t('reports.trafficTrendChart.kViewsNewUsers', {
                          month: formatMonthShort(point.month),
                          pageViewsK: formatNumber(point.pageViewsK),
                          newUsers: formatNumber(point.newUsers),
                        })}
                  </title>
                </rect>
              );
            })}

            <path
              d={smoothPath(linePoints)}
              fill="none"
              stroke="url(#report-line)"
              strokeLinecap="round"
              strokeWidth="3"
            />
            {[...new Set([peakIndex, lastActual])].map((index) => (
              <circle
                key={index}
                cx={linePoints[index]?.x}
                cy={linePoints[index]?.y}
                r="5"
                strokeWidth="2"
                className="fill-tertiary stroke-surface-container-lowest"
              />
            ))}
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-12 pt-2 text-center font-label-sm text-[12px] text-on-surface-variant">
          {data.map((point) => (
            <span
              key={point.month}
              className={isMonthInRange(point.month, dateRange) ? 'font-bold text-primary' : ''}
            >
              {formatMonthShort(point.month)}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-surface-container bg-surface-container-low/70 px-4 py-2.5 font-body-sm text-[13px] text-on-surface-variant">
        <div className="flex items-center gap-2">
          <Icon name="auto_awesome" className="text-[19px] text-primary" />
          <span>AI Insight: {insight}</span>
        </div>
        <button
          type="button"
          onClick={onOpenInsight}
          className="ml-2 shrink-0 font-semibold text-primary hover:underline print:hidden"
        >
          {t('reports.trafficTrendChart.details')}
        </button>
      </div>
    </div>
  );
}
