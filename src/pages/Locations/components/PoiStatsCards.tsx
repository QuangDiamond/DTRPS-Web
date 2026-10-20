import Icon from '../../../components/common/Icon';
import { POI_KPI_GROUP_CONFIG } from '../../../constants/poi';
import type { PoiKpiGroup, PoiStats } from '../../../types/admin';
import { formatNumber, formatPercent } from '../../../utils/format';

const CARD_CLASS =
  'flex flex-col justify-between rounded-xl bg-surface-container-lowest p-space-md shadow-sm transition-all hover:shadow-md';

const GROUPS: PoiKpiGroup[] = ['sights', 'food', 'stay', 'tour'];

export default function PoiStatsCards({ stats }: { stats: PoiStats }) {
  return (
    <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {/* Tổng */}
      <div className={`${CARD_CLASS} group relative overflow-hidden`}>
        <div className="absolute -right-2 -bottom-2 -z-0 h-16 w-16 rounded-full bg-primary/5" />
        <div className="z-10 flex items-center justify-between">
          <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
            Tổng POI toàn quốc
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary">
            <Icon name="travel_explore" className="text-[18px]" />
          </div>
        </div>
        <div className="z-10 mt-3">
          <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
            {formatNumber(stats.total)}
          </div>
          <div className="mt-0.5 flex items-center gap-1 font-label-sm text-label-sm text-primary">
            <Icon name="trending_up" className="text-[14px]" />
            <span>+{formatNumber(stats.newThisMonth)} địa điểm mới tháng này</span>
          </div>
        </div>
      </div>

      {/* Theo nhóm danh mục */}
      {GROUPS.map((group) => {
        const config = POI_KPI_GROUP_CONFIG[group];
        const value = stats.byGroup[group];
        const share = stats.total > 0 ? (value / stats.total) * 100 : 0;
        return (
          <div key={group} className={CARD_CLASS}>
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
                {config.label}
              </span>
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg ${config.iconBoxClass}`}
              >
                <Icon name={config.icon} className="text-[18px]" />
              </div>
            </div>
            <div className="mt-3">
              <div className="font-headline-lg text-headline-lg font-bold text-on-surface">
                {formatNumber(value)}
              </div>
              <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                <div
                  className={`h-full rounded-full ${config.barClass}`}
                  style={{ width: `${share}%` }}
                />
              </div>
              <div className="mt-1 flex justify-between font-label-sm text-label-sm text-on-surface-variant">
                <span>Tỷ trọng</span>
                <span className={`font-semibold ${config.percentClass}`}>
                  {formatPercent(value, stats.total)}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Tỷ lệ khả dụng */}
      <div className="flex flex-col justify-between rounded-xl bg-primary p-space-md text-on-primary shadow-sm">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm tracking-wider uppercase opacity-80">
            POI Khả dụng
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-on-primary/10 text-on-primary">
            <Icon name="verified" className="text-[18px]" />
          </div>
        </div>
        <div className="mt-3">
          <div className="font-headline-lg text-headline-lg font-bold">
            {formatNumber(stats.available)}
          </div>
          <div className="mt-1 flex items-center gap-1 font-label-sm text-label-sm opacity-90">
            <Icon name="check_circle" className="text-[14px]" />
            <span>{formatPercent(stats.available, stats.total)} đang hoạt động ổn định</span>
          </div>
        </div>
      </div>
    </div>
  );
}
