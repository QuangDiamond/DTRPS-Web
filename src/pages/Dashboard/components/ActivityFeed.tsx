import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import type { ActivityItem, ActivityKind } from '../../../types/admin';
import { formatRelativeTime } from '../../../utils/format';
import { DASHBOARD_CARD_CLASS } from '../dashboardUtils';

interface ActivityFeedProps {
  activities: ActivityItem[];
  refreshing: boolean;
  onRefresh: () => void;
}

interface ActivityConfig {
  markerClass: string;
  dotClass: string;
  renderMessage: (subject: string) => ReactNode;
  meta?: ReactNode;
}

const ACTIVITY_CONFIG: Record<ActivityKind, ActivityConfig> = {
  partner_registered: {
    markerClass: 'bg-secondary-container',
    dotClass: 'bg-primary',
    renderMessage: (subject) => (
      <>
        Đối tác mới <strong className="font-semibold text-primary">{subject}</strong> đã hoàn tất
        đăng ký tài khoản.
      </>
    ),
    meta: (
      <span className="font-label-sm text-[11px] text-on-surface-variant">
        Tài khoản Doanh nghiệp
      </span>
    ),
  },
  listing_approved: {
    markerClass: 'bg-secondary-container',
    dotClass: 'bg-secondary',
    renderMessage: (subject) => (
      <>
        Admin đã phê duyệt niêm yết <span className="font-semibold">{subject}</span>.
      </>
    ),
    meta: (
      <span className="inline-flex items-center gap-0.5 font-label-sm text-[11px] font-bold text-primary">
        <Icon name="check" className="text-[14px]" /> Đã xuất bản
      </span>
    ),
  },
  listing_rejected: {
    markerClass: 'bg-error-container',
    dotClass: 'bg-error',
    renderMessage: (subject) => (
      <>
        Admin đã từ chối niêm yết <span className="font-semibold">{subject}</span>.
      </>
    ),
  },
  listing_submitted: {
    markerClass: 'bg-tertiary-fixed',
    dotClass: 'bg-tertiary',
    renderMessage: (subject) => (
      <>
        Yêu cầu niêm yết mới gửi lên từ <strong className="font-semibold">{subject}</strong>.
      </>
    ),
    meta: (
      <span className="font-label-sm text-[11px] font-bold text-tertiary">Đang trong hàng chờ</span>
    ),
  },
};

export default function ActivityFeed({ activities, refreshing, onRefresh }: ActivityFeedProps) {
  return (
    <div className={`${DASHBOARD_CARD_CLASS} flex flex-col justify-between xl:col-span-4`}>
      <div>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Icon name="history" className="text-[22px] text-primary" />
            <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
              Hoạt động gần đây
            </h2>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center justify-center rounded-lg p-1.5 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
            title="Làm mới"
          >
            <Icon name="refresh" className={`text-[19px] ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Dòng thời gian */}
        <div className="relative max-h-[420px] space-y-6 overflow-y-auto pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-0.5 before:bg-surface-container-high before:content-['']">
          {activities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.kind];
            const time = (
              <span className="font-label-sm text-[11px] text-outline">
                {formatRelativeTime(activity.createdAt)}
              </span>
            );
            return (
              <div key={activity.id} className="relative">
                <div
                  className={`absolute top-1 -left-6 flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-surface-container-lowest ${config.markerClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} />
                </div>
                <div className="flex flex-col">
                  <p className="font-body-md text-[13px] leading-snug text-on-surface">
                    {config.renderMessage(activity.subject)}
                  </p>
                  {activity.reason && (
                    <p className="mt-1 rounded-lg bg-error-container/40 p-2 font-body-sm text-[12px] leading-relaxed text-error">
                      Lý do: {activity.reason}
                    </p>
                  )}
                  {config.meta ? (
                    <div className="mt-1 flex items-center gap-2">
                      {time}
                      <span className="text-[11px] text-outline">•</span>
                      {config.meta}
                    </div>
                  ) : (
                    <div className="mt-1">{time}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trạng thái AI */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-surface-container/60 bg-surface-container-low/80 p-3.5">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon name="smart_toy" className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-[13px] font-bold text-on-surface">
              Trợ lý AI giám sát
            </span>
            <span className="font-body-sm text-[11px] text-on-surface-variant">
              Phản hồi 45ms • 99.98% SLA
            </span>
          </div>
        </div>
        <span className="h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-secondary-container/50" />
      </div>
    </div>
  );
}
