import Icon from '../../../components/common/Icon';
import { formatDayTime } from '../../../utils/format';
import type { ReviewLogEntry } from '../reviewUtils';

const DOT_CLASS: Record<ReviewLogEntry['tone'], string> = {
  primary: 'bg-primary ring-teal-50',
  muted: 'bg-slate-400 ring-slate-100',
  error: 'bg-rose-600 ring-rose-50',
};

export default function ReviewLogCard({ logs }: { logs: ReviewLogEntry[] }) {
  return (
    <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-[13px] font-bold text-slate-900">
        <Icon name="history" className="text-[18px] text-slate-600" />
        <span>Nhật ký thẩm định hệ thống</span>
      </h3>
      <div className="relative space-y-3.5 pl-5 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[2px] before:bg-slate-200">
        {logs.map((log) => (
          <div key={log.id} className="relative">
            <div
              className={`absolute top-1 -left-[17px] h-2.5 w-2.5 rounded-full ring-4 ${DOT_CLASS[log.tone]}`}
            />
            <div className="font-mono text-[10.5px] text-slate-600">{formatDayTime(log.time)}</div>
            <div className="text-[12px] font-medium text-slate-800">{log.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
