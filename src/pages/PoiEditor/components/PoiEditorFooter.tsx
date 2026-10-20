import Icon from '../../../components/common/Icon';
import { formatDayTime } from '../../../utils/format';

interface PoiEditorFooterProps {
  isNew: boolean;
  isDirty: boolean;
  updatedAt?: string;
  updatedBy?: string;
  onCancel: () => void;
  onSave: () => void;
}

/** Thanh lưu cố định ở đáy màn hình (left-72 = độ rộng Sidebar) */
export default function PoiEditorFooter({
  isNew,
  isDirty,
  updatedAt,
  updatedBy,
  onCancel,
  onSave,
}: PoiEditorFooterProps) {
  return (
    <footer className="fixed right-0 bottom-0 left-72 z-30 flex items-center justify-between bg-surface-container-lowest/95 px-space-lg py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] backdrop-blur-md">
      <div className="flex items-center gap-space-sm font-body-sm text-body-sm text-on-surface-variant">
        <Icon name="history_toggle_off" className="text-[18px] text-secondary" />
        {isNew || !updatedAt ? (
          <span>POI mới — chưa được lưu lên hệ thống</span>
        ) : (
          <span>
            Lần cập nhật cuối bởi{' '}
            <strong className="font-semibold text-on-surface">{updatedBy}</strong>:{' '}
            {formatDayTime(updatedAt).replace(/^(Hôm nay|Hôm qua) /, '$1 lúc ')}
          </span>
        )}
        <span className="text-outline-variant">•</span>
        {isDirty ? (
          <span className="flex items-center gap-1 font-label-sm text-label-sm font-semibold text-tertiary">
            <span className="h-1.5 w-1.5 rounded-full bg-tertiary" /> Có thay đổi chưa lưu
          </span>
        ) : (
          <span className="font-label-sm text-label-sm text-outline">
            Dữ liệu được sao lưu tự động
          </span>
        )}
      </div>
      <div className="flex items-center gap-space-sm">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full bg-surface-container-low px-space-md py-2.5 font-label-md text-label-md text-on-surface-variant transition-colors hover:bg-surface-container"
        >
          Hủy bỏ
        </button>
        <button
          type="button"
          onClick={onSave}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-md transition-all hover:bg-surface-tint"
        >
          <Icon name="save" className="text-[18px]" />
          <span>{isNew ? 'Tạo POI mới' : 'Lưu thay đổi POI'}</span>
        </button>
      </div>
    </footer>
  );
}
