import Icon from '../../../components/common/Icon';
import { ADMIN_PERMISSION_SUMMARY } from '../../../constants/adminProfile';

export default function PermissionSummaryCard({ onOpenMatrix }: { onOpenMatrix: () => void }) {
  return (
    <div className="flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="policy" className="text-[20px] text-primary" />
          <h2 className="font-title-md text-title-md text-on-surface">
            Quyền hạn hệ thống cấp cao
          </h2>
        </div>
        <span className="rounded-full bg-secondary-fixed px-2.5 py-0.5 font-label-sm text-label-sm font-bold text-on-secondary-fixed">
          ROOT 01
        </span>
      </div>
      <div className="flex flex-col gap-space-sm">
        {ADMIN_PERMISSION_SUMMARY.map((item) => {
          const toneClass = item.tone === 'tertiary' ? 'text-tertiary' : 'text-primary';
          return (
            <div
              key={item.title}
              className="flex items-start gap-3 rounded-xl bg-surface-container-low p-space-sm transition-colors hover:bg-surface-container"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest shadow-xs ${toneClass}`}
              >
                <Icon name={item.icon} className="text-[18px]" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-label-md text-label-md text-on-surface">{item.title}</span>
                  <span className={`font-label-sm text-label-sm font-bold ${toneClass}`}>
                    {item.level}
                  </span>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  {item.description}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onOpenMatrix}
        className="self-start font-label-sm text-label-sm font-semibold text-primary hover:underline"
      >
        Xem ma trận phân quyền đầy đủ →
      </button>
    </div>
  );
}
