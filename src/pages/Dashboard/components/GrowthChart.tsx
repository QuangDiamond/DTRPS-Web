import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import type { GrowthPoint } from '../../../types/admin';
import { formatNumber } from '../../../utils/format';
import { DASHBOARD_CARD_CLASS } from '../dashboardUtils';

interface GrowthChartProps {
  data: GrowthPoint[];
  onViewReport: () => void;
}

// Hệ tọa độ SVG (viewBox 600 x 220) giữ nguyên như thiết kế
const VIEW_WIDTH = 600;
const VIEW_HEIGHT = 220;
const X_START = 30;
const X_END = 530;
const BASE_Y = 190;
const TOP_Y = 20;
const GRID_LINES = [40, 90, 140];

/** Làm tròn trục Y lên bội số 5,000 gần nhất */
function getScaleMax(data: GrowthPoint[]): number {
  const max = Math.max(...data.map((point) => Math.max(point.users, point.trips)), 1);
  return Math.ceil(max / 5000) * 5000;
}

export default function GrowthChart({ data, onViewReport }: GrowthChartProps) {
  const lastIndex = data.length - 1;
  const [activeIndex, setActiveIndex] = useState(lastIndex);

  const scaleMax = getScaleMax(data);
  const step = data.length > 1 ? (X_END - X_START) / (data.length - 1) : 0;
  const toY = (value: number) => BASE_Y - (value / scaleMax) * (BASE_Y - TOP_Y);
  const points = data.map((point, index) => ({
    x: X_START + index * step,
    usersY: toY(point.users),
    tripsY: toY(point.trips),
  }));

  const usersLine = points.map((p) => `${p.x},${p.usersY}`).join(' ');
  const tripsLine = points.map((p) => `${p.x},${p.tripsY}`).join(' ');
  const areaBase = `${points[lastIndex]?.x ?? X_END},${BASE_Y} ${X_START},${BASE_Y}`;
  const active = data[activeIndex];

  return (
    <div className={`${DASHBOARD_CARD_CLASS} flex flex-col justify-between lg:col-span-2`}>
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
            Lượng người dùng mới &amp; Chuyến đi tạo
          </h2>
          <p className="font-body-sm text-[13px] text-on-surface-variant">
            Biểu đồ đối sánh tăng trưởng người dùng &amp; hành trình AI sinh ra 6 tháng gần nhất
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-label-sm text-[12px] font-medium text-on-surface">
            <span className="inline-block h-3 w-3 rounded-full bg-primary" />
            <span>Người dùng mới</span>
          </div>
          <div className="flex items-center gap-2 font-label-sm text-[12px] font-medium text-on-surface">
            <span className="inline-block h-3 w-3 rounded-full bg-tertiary-container" />
            <span>Chuyến đi tạo</span>
          </div>
        </div>
      </div>

      <div className="relative h-64 w-full select-none">
        <svg
          className="h-full w-full overflow-visible"
          preserveAspectRatio="none"
          viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
          onMouseLeave={() => setActiveIndex(lastIndex)}
        >
          <defs>
            <linearGradient id="usersAreaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.28 }} />
              <stop
                offset="100%"
                style={{ stopColor: 'var(--color-primary)', stopOpacity: 0.01 }}
              />
            </linearGradient>
            <linearGradient id="tripsAreaGradient" x1="0" x2="0" y1="0" y2="1">
              <stop
                offset="0%"
                style={{ stopColor: 'var(--color-tertiary-container)', stopOpacity: 0.22 }}
              />
              <stop
                offset="100%"
                style={{ stopColor: 'var(--color-tertiary-container)', stopOpacity: 0.01 }}
              />
            </linearGradient>
          </defs>

          {/* Lưới ngang */}
          {GRID_LINES.map((y) => (
            <line
              key={y}
              x1="0"
              x2={VIEW_WIDTH}
              y1={y}
              y2={y}
              className="stroke-outline-variant"
              strokeDasharray="4 4"
              strokeOpacity="0.3"
            />
          ))}
          <line
            x1="0"
            x2={VIEW_WIDTH}
            y1={BASE_Y}
            y2={BASE_Y}
            className="stroke-outline-variant"
            strokeOpacity="0.35"
          />

          {/* Vùng & đường: người dùng mới */}
          <polygon fill="url(#usersAreaGradient)" points={`${usersLine} ${areaBase}`} />
          <polyline
            fill="none"
            points={usersLine}
            className="stroke-primary"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />

          {/* Vùng & đường: chuyến đi tạo */}
          <polygon fill="url(#tripsAreaGradient)" points={`${tripsLine} ${areaBase}`} />
          <polyline
            fill="none"
            points={tripsLine}
            className="stroke-tertiary-container"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
          />

          {/* Điểm dữ liệu */}
          {points.map((point, index) =>
            index === activeIndex ? (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.usersY}
                  r="5"
                  className="fill-primary stroke-surface-container-lowest"
                  strokeWidth="2.5"
                />
                <circle
                  cx={point.x}
                  cy={point.tripsY}
                  r="4"
                  className="fill-tertiary-container stroke-surface-container-lowest"
                  strokeWidth="2"
                />
              </g>
            ) : (
              <circle
                key={index}
                cx={point.x}
                cy={point.usersY}
                r="4"
                className="fill-surface-container-lowest stroke-primary"
                strokeWidth="2.5"
              />
            ),
          )}

          {/* Nhãn trục X */}
          {data.map((point, index) => (
            <text
              key={point.label}
              x={points[index].x}
              y="210"
              textAnchor="middle"
              fontSize="11"
              className={`font-body-sm ${
                index === activeIndex ? 'fill-primary font-bold' : 'fill-on-surface-variant'
              }`}
            >
              {point.label}
            </text>
          ))}

          {/* Vùng hover theo từng tháng */}
          {points.map((point, index) => (
            <rect
              key={`hover-${index}`}
              x={point.x - step / 2}
              y="0"
              width={step || VIEW_WIDTH}
              height={BASE_Y}
              fill="transparent"
              onMouseEnter={() => setActiveIndex(index)}
            />
          ))}
        </svg>

        {active && (
          <div className="pointer-events-none absolute top-2 right-10 hidden flex-col rounded-xl bg-inverse-surface px-3 py-2 text-surface shadow-lg sm:flex">
            <span className="font-label-sm text-[10px] font-bold tracking-wider text-surface-container-highest uppercase">
              {active.fullLabel}
            </span>
            <span className="font-label-md text-[13px] font-bold text-primary-fixed">
              {formatNumber(active.users)} Người dùng
            </span>
            <span className="font-body-sm text-[11px] font-medium text-tertiary-fixed">
              {formatNumber(active.trips)} Chuyến đi
            </span>
          </div>
        )}
      </div>

      {/* Nhận định */}
      <div className="mt-3 flex items-center justify-between rounded-xl border border-surface-container/40 bg-surface-container-low/60 px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <Icon name="insights" className="text-[20px] text-primary" />
          <span className="font-body-sm text-[13px] text-on-surface-variant">
            Tỷ lệ tương tác tạo lịch trình du lịch thông minh qua AI tăng{' '}
            <strong className="font-semibold text-on-surface">34.2%</strong> trong mùa thu.
          </span>
        </div>
        <button
          type="button"
          onClick={onViewReport}
          className="flex shrink-0 items-center gap-0.5 font-label-sm text-[12px] font-bold text-primary hover:underline"
        >
          <span>Xem báo cáo</span>
          <Icon name="chevron_right" className="text-[16px]" />
        </button>
      </div>
    </div>
  );
}
