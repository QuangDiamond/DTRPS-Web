import { Trans, useTranslation } from 'react-i18next';
import {
  formatThousands,
  formatVndCompact,
  REPORT_CARD_CLASS,
  smoothPath,
} from '@/pages/Reports/reportUtils';
import type { MonthlyTripPoint, TripInsights } from '@/types';
import { formatMonthShort, formatNumber } from '@/utils/format';

interface TripSeasonChartProps {
  data: MonthlyTripPoint[];
  insights: TripInsights;
}

const WIDTH = 500;
const HEIGHT = 200;
const LEFT = 20;
const RIGHT = 480;
const BASELINE = 170;
const TOP = 40;
/** Các tháng hiển thị nhãn dưới biểu đồ (giống thiết kế) */
const LABEL_MONTHS = [1, 3, 6, 9, 12];

export default function TripSeasonChart({ data, insights }: TripSeasonChartProps) {
  const { t } = useTranslation();
  const total = data.reduce((sum, point) => sum + point.trips, 0);
  const max = Math.max(1, ...data.map((point) => point.trips));
  const step = (RIGHT - LEFT) / Math.max(1, data.length - 1);
  const points = data.map((point, index) => ({
    x: LEFT + index * step,
    y: BASELINE - (point.trips / max) * (BASELINE - TOP),
  }));
  const peak = data.reduce((best, point) => (point.trips > best.trips ? point : best), data[0]);
  const peakPoint = points[data.indexOf(peak)];
  const [peakFrom, peakTo] = insights.peakMonths;
  const bandStart = LEFT + (peakFrom - 1) * step - step / 2;
  const bandWidth = (peakTo - peakFrom + 1) * step;
  const linePath = smoothPath(points);
  const areaPath = points.length
    ? `${linePath} L ${RIGHT} ${BASELINE + 10} L ${LEFT} ${BASELINE + 10} Z`
    : '';

  return (
    <div className={`flex flex-col justify-between lg:col-span-5 ${REPORT_CARD_CLASS}`}>
      <div>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <span className="font-label-sm text-[11px] font-bold tracking-wider text-secondary uppercase">
              {t('reports.tripSeasonChart.peakSeason')}
            </span>
            <h2 className="mt-0.5 font-headline-sm text-[17px] font-bold text-on-surface">
              {t('reports.tripSeasonChart.tripsPerMonth')}
            </h2>
          </div>
          <div className="shrink-0 rounded-full bg-secondary-container px-2.5 py-1 font-label-sm text-[11px] font-bold text-on-secondary-container">
            {t('reports.tripSeasonChart.peak', {
              peakFrom: formatMonthShort(peakFrom),
              peakTo: formatMonthShort(peakTo),
            })}
          </div>
        </div>
        <p className="mb-3 font-body-sm text-[13px] text-on-surface-variant">
          <Trans
            i18nKey="reports.tripSeasonChart.aTotalTripsTour"
            values={{
              total: formatNumber(total),
              bundleGrowthPercent: insights.bundleGrowthPercent,
            }}
            components={{ c0: <strong className="font-semibold text-on-surface" /> }}
          />
        </p>

        <div className="relative flex h-52 w-full items-end">
          <svg
            className="h-full w-full"
            fill="none"
            preserveAspectRatio="none"
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            role="img"
            aria-label={t('reports.tripSeasonChart.chartTripsPerMonth')}
          >
            <defs>
              <linearGradient id="report-trip-area" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary-container)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="var(--color-primary-container)" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <line
              x1="0"
              x2={WIDTH}
              y1="50"
              y2="50"
              strokeWidth="1.5"
              className="stroke-surface-container"
            />
            <line
              x1="0"
              x2={WIDTH}
              y1="110"
              y2="110"
              strokeWidth="1.5"
              className="stroke-surface-container"
            />
            <line
              x1="0"
              x2={WIDTH}
              y1={BASELINE}
              y2={BASELINE}
              strokeWidth="1"
              className="stroke-surface-container-highest"
            />
            <path d={areaPath} fill="url(#report-trip-area)" />
            <rect
              x={bandStart}
              y="20"
              width={bandWidth}
              height="150"
              rx="8"
              className="fill-primary-container"
              fillOpacity="0.08"
            />
            <path
              d={linePath}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              className="stroke-primary-container"
            />
            {data.map((point, index) => (
              <circle
                key={point.month}
                cx={points[index].x}
                cy={points[index].y}
                r="8"
                fill="transparent"
              >
                <title>
                  {t('reports.tripSeasonChart.trips', {
                    month: formatMonthShort(point.month),
                    trips: formatNumber(point.trips),
                  })}
                </title>
              </circle>
            ))}
            {peakPoint && (
              <>
                <circle
                  cx={peakPoint.x}
                  cy={peakPoint.y}
                  r="5"
                  strokeWidth="2"
                  className="fill-primary-container stroke-surface-container-lowest"
                />
                <text
                  x={Math.min(RIGHT - 50, Math.max(LEFT + 50, peakPoint.x))}
                  y={peakPoint.y - 12}
                  fontSize="11"
                  fontWeight="700"
                  textAnchor="middle"
                  className="fill-primary"
                >
                  {t('reports.tripSeasonChart.peak2', {
                    trips: formatNumber(peak.trips),
                    month: formatMonthShort(peak.month),
                  })}
                </text>
              </>
            )}
          </svg>
        </div>

        <div className="flex items-center justify-between pt-2 font-label-sm text-[12px] text-on-surface-variant">
          {LABEL_MONTHS.map((month) => {
            const point = data.find((item) => item.month === month);
            if (!point) return null;
            return (
              <span key={month} className={month === peak?.month ? 'font-bold text-primary' : ''}>
                {formatMonthShort(month)} ({formatThousands(point.trips)})
              </span>
            );
          })}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 pt-2">
        <div className="flex flex-col rounded-2xl border border-surface-container bg-surface-container-low p-3">
          <span className="font-body-sm text-[12px] text-on-surface-variant">
            {t('reports.tripSeasonChart.avgTripLength')}
          </span>
          <span className="mt-0.5 font-title-md text-[15px] font-bold text-on-surface">
            {t('reports.tripSeasonChart.daysTrip', { avgDurationDays: insights.avgDurationDays })}
          </span>
        </div>
        <div className="flex flex-col rounded-2xl border border-surface-container bg-surface-container-low p-3">
          <span className="font-body-sm text-[12px] text-on-surface-variant">
            {t('reports.tripSeasonChart.estimatedSpend')}
          </span>
          <span className="mt-0.5 font-title-md text-[15px] font-bold text-primary">
            {t('reports.tripSeasonChart.vnd', {
              avgSpendVnd: formatVndCompact(insights.avgSpendVnd),
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
