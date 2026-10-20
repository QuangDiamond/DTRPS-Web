import Icon from '../../../components/common/Icon';
import type { UserStats } from '../../../types/admin';
import { formatNumber, formatPercent } from '../../../utils/format';

const CARD_CLASS =
  'relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm';
const LABEL_CLASS =
  'font-label-md text-label-md font-semibold tracking-wider text-on-surface-variant uppercase';
const VALUE_CLASS = 'mt-1 font-display-sm text-display-sm font-bold text-on-surface';
const ICON_BOX_CLASS = 'flex h-11 w-11 items-center justify-center rounded-2xl';

export default function UserStatsCards({ stats }: { stats: UserStats }) {
  const activeRate = stats.total ? (stats.active / stats.total) * 100 : 0;

  return (
    <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 xl:grid-cols-4">
      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL_CLASS}>Tổng số người dùng</span>
            <span className={VALUE_CLASS}>{formatNumber(stats.total)}</span>
          </div>
          <div className={`${ICON_BOX_CLASS} bg-secondary-container/40 text-primary`}>
            <Icon name="group" className="text-[24px]" />
          </div>
        </div>
        <div className="mt-space-md flex items-center gap-2 pt-space-xs">
          <span className="inline-flex items-center gap-0.5 rounded-full bg-secondary-container px-2 py-0.5 font-label-sm text-label-sm font-bold text-primary">
            <Icon name="arrow_upward" className="text-[14px]" />
            +12.4%
          </span>
          <span className="font-body-sm text-body-sm text-outline">so với tháng trước</span>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL_CLASS}>Đang hoạt động</span>
            <span className={VALUE_CLASS}>{formatNumber(stats.active)}</span>
          </div>
          <div className={`${ICON_BOX_CLASS} bg-primary-container/20 text-primary`}>
            <Icon name="check_circle" className="text-[24px]" />
          </div>
        </div>
        <div className="mt-space-md flex items-center gap-2 pt-space-xs">
          <div className="h-2 w-20 overflow-hidden rounded-full bg-surface-container-high">
            <div className="h-full rounded-full bg-primary" style={{ width: `${activeRate}%` }} />
          </div>
          <span className="font-label-sm text-label-sm font-bold text-primary">
            {formatPercent(stats.active, stats.total)}
          </span>
          <span className="font-body-sm text-body-sm text-outline">tỉ lệ trực tuyến</span>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL_CLASS}>Tài khoản mới tháng này</span>
            <span className={VALUE_CLASS}>{formatNumber(stats.newThisMonth)}</span>
          </div>
          <div className={`${ICON_BOX_CLASS} bg-surface-container-high text-primary-container`}>
            <Icon name="trending_up" className="text-[24px]" />
          </div>
        </div>
        <div className="mt-space-md flex items-center gap-2 pt-space-xs">
          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm font-bold text-on-surface">
            <span className="h-2 w-2 rounded-full bg-primary" />+{formatNumber(stats.newToday)} hôm
            nay
          </span>
          <span className="font-body-sm text-body-sm text-outline">trung bình 280/ngày</span>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL_CLASS}>Tạm khóa / Đình chỉ</span>
            <span className={VALUE_CLASS}>{formatNumber(stats.suspended)}</span>
          </div>
          <div className={`${ICON_BOX_CLASS} bg-error-container/40 text-error`}>
            <Icon name="lock_person" className="text-[24px]" />
          </div>
        </div>
        <div className="mt-space-md flex items-center gap-2 pt-space-xs">
          <span className="rounded-full bg-error-container/60 px-2 py-0.5 font-label-sm text-label-sm font-bold text-error">
            {stats.total ? ((stats.suspended / stats.total) * 100).toFixed(2) : '0'}%
          </span>
          <span className="font-body-sm text-body-sm text-outline">tổng vi phạm chính sách</span>
        </div>
      </div>
    </div>
  );
}
