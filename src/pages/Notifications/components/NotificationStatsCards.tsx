import Icon from '../../../components/common/Icon';
import type { NotificationStats } from '../../../types/admin';
import { formatNumber } from '../../../utils/format';

const CARD_CLASS =
  'group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm transition-all hover:shadow-md';
const LABEL_CLASS =
  'font-label-md text-label-md font-semibold tracking-wider text-outline uppercase';
const ICON_BOX_CLASS = 'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl';

interface NotificationStatsCardsProps {
  stats: NotificationStats;
  /** Số hồ sơ niêm yết chờ duyệt, lấy từ store niêm yết */
  pendingListings: number;
}

export default function NotificationStatsCards({
  stats,
  pendingListings,
}: NotificationStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-space-md sm:grid-cols-2 lg:grid-cols-4">
      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL_CLASS}>Thông báo mới</span>
            <span className="mt-1 font-display-lg text-display-lg font-bold text-on-surface">
              {formatNumber(stats.unread)}
            </span>
          </div>
          <div className={`${ICON_BOX_CLASS} bg-error-container text-on-error-container`}>
            <Icon name="mark_email_unread" className="text-[24px]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 pt-2">
          <span className="flex items-center gap-1 rounded-full bg-error-container px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-on-error-container">
            <span className="h-1.5 w-1.5 rounded-full bg-error" /> Khẩn cấp
          </span>
          <span className="font-body-sm text-body-sm font-medium text-on-surface-variant">
            +{stats.newLastHour} trong 1 giờ qua
          </span>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL_CLASS}>Chờ duyệt niêm yết</span>
            <span className="mt-1 font-display-lg text-display-lg font-bold text-on-surface">
              {formatNumber(pendingListings)}
            </span>
          </div>
          <div className={`${ICON_BOX_CLASS} bg-secondary-container text-on-secondary-container`}>
            <Icon name="assignment" className="text-[24px]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 pt-2">
          <span className="rounded-full bg-secondary-fixed px-space-xs py-0.5 font-label-sm text-label-sm font-bold text-on-secondary-fixed-variant">
            Mới tiếp nhận
          </span>
          <span className="font-body-sm text-body-sm font-medium text-on-surface-variant">
            Hồ sơ cơ sở lưu trú &amp; tour
          </span>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL_CLASS}>Cảnh báo hệ thống</span>
            <span className="mt-1 font-display-lg text-display-lg font-bold text-tertiary">
              {String(stats.systemAlerts).padStart(2, '0')}
            </span>
          </div>
          <div className={`${ICON_BOX_CLASS} bg-tertiary-fixed text-on-tertiary-fixed`}>
            <Icon name="warning_amber" className="text-[24px]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 pt-2">
          <span className="rounded-full bg-tertiary-fixed px-space-xs py-0.5 font-label-sm text-label-sm font-bold whitespace-nowrap text-on-tertiary-fixed">
            {stats.systemAlerts > 0 ? 'Cần xử lý' : 'Ổn định'}
          </span>
          <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
            {stats.systemAlerts > 0 ? stats.systemAlertNote : 'Không còn cảnh báo chưa xử lý'}
          </span>
        </div>
      </div>

      <div className={CARD_CLASS}>
        <div className="flex items-start justify-between">
          <div className="flex flex-col">
            <span className={LABEL_CLASS}>Tỷ lệ xử lý trong ngày</span>
            <span className="mt-1 font-display-lg text-display-lg font-bold text-primary">
              {stats.resolvedRate.toFixed(1)}%
            </span>
          </div>
          <div className={`${ICON_BOX_CLASS} bg-primary-fixed text-on-primary-fixed`}>
            <Icon name="task_alt" className="text-[24px]" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2 pt-2">
          <Icon name="speed" className="text-[18px] text-primary" />
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            Thời gian phản hồi TB: <strong>{stats.avgResponseMinutes} phút</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
