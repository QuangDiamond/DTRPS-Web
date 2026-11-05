import { Icon } from '@/components/common';
import type { ReferenceItem } from '@/client/api/types';

/** Chọn nhiều sở thích của chuyến (bảng interests → plan_interests). */
export default function InterestChips({
  options,
  selected,
  onChange,
  loading,
  failed,
}: {
  options: ReferenceItem[];
  selected: string[];
  onChange: (codes: string[]) => void;
  loading?: boolean;
  failed?: boolean;
}) {
  if (loading) {
    return <p className="text-[12px] text-[#72818C]">Đang tải sở thích…</p>;
  }
  if (failed) {
    return (
      <p className="text-[12px] text-red-600">
        Không tải được danh sách sở thích. Vui lòng thử tải lại trang.
      </p>
    );
  }
  if (options.length === 0) {
    return <p className="text-[12px] text-[#72818C]">Hiện chưa có sở thích nào.</p>;
  }

  const toggle = (code: string) =>
    onChange(
      selected.includes(code) ? selected.filter((item) => item !== code) : [...selected, code],
    );

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((item) => {
        const active = selected.includes(item.code);
        return (
          <button
            key={item.code}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(item.code)}
            className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-bold ${
              active
                ? 'border-[1.5px] border-[#087A78] bg-[#E2FAF5] text-[#075C66]'
                : 'border border-[#E3E7F0] bg-[#F8F8FF] text-[#506581]'
            }`}
          >
            {active && <Icon name="check" className="text-[14px]" />}
            {item.name}
          </button>
        );
      })}
    </div>
  );
}
