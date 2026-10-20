import Icon from '../../../components/common/Icon';
import { formatDayTime } from '../../../utils/format';
import type { ReviewLogEntry } from '../reviewUtils';

const DOT_CLASS: Record<ReviewLogEntry['tone'], string> = {
  primary: 'bg-primary ring-primary-fixed/60',
  muted: 'bg-outline ring-surface-container',
  error: 'bg-error ring-error-container',
};

export default function ReviewLogCard({ logs }: { logs: ReviewLogEntry[] }) {
  return (
    <div className="rounded-2xl border border-surface-container-high/90 bg-surface-container-lowest p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-on-surface">
        <Icon name="history" className="text-[18px] text-on-surface-variant" />
        <span>Nhật ký thẩm định hệ thống</span>
      </h3>
      <div className="relative space-y-3.5 pl-5 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[2px] before:bg-surface-container-high">
        {logs.map((log) => (
          <div key={log.id} className="relative">
            <div
              className={`absolute top-1 -left-[17px] h-2.5 w-2.5 rounded-full ring-4 ${DOT_CLASS[log.tone]}`}
            />
            <div className="font-mono text-[10.5px] text-on-surface-variant">
              {formatDayTime(log.time)}
            </div>
            <div className="text-[12px] font-medium text-on-surface">{log.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
