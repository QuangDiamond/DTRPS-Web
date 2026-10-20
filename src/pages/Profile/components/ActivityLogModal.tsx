import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import type { AdminActivity } from '../../../types/admin';
import { formatDayTime } from '../../../utils/format';

interface ActivityLogModalProps {
  activities: AdminActivity[];
  onExport: () => void;
  onClose: () => void;
}

export default function ActivityLogModal({ activities, onExport, onClose }: ActivityLogModalProps) {
  return (
    <Modal
      title="Nhật ký hoạt động"
      description="Các thao tác quản trị của tài khoản này, lưu trữ chống sửa đổi 365 ngày"
      size="lg"
      onClose={onClose}
      footer={
        <button
          type="button"
          onClick={onExport}
          className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2.5 font-label-md text-label-md font-semibold text-primary transition-all hover:bg-surface-container-high"
        >
          <Icon name="file_download" className="text-[18px]" /> Xuất CSV
        </button>
      }
    >
      <ol className="flex flex-col gap-space-sm">
        {activities.map((activity) => (
          <li
            key={activity.id}
            className="flex items-start gap-space-sm rounded-xl bg-surface-container-low p-space-sm"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest text-primary shadow-xs">
              <Icon name={activity.icon} className="text-[18px]" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-label-md text-label-md text-on-surface">
                  {activity.title}
                </span>
                <span className="font-label-sm text-label-sm text-outline">
                  {formatDayTime(activity.createdAt)}
                </span>
              </div>
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {activity.detail}
              </span>
              <span className="font-label-sm text-label-sm text-outline">IP: {activity.ip}</span>
            </div>
          </li>
        ))}
      </ol>
    </Modal>
  );
}
