import { Icon } from '@/components/common';
import { MAX_PRICES, PRICE_TYPES } from '@/client/partner/placeFormat';

/** Một dòng giá đang nhập (số tiền giữ dạng chữ để gõ thoải mái) */
export interface PriceRow {
  priceType: string;
  amount: string;
  description: string;
}

const INPUT_CLASS =
  'h-10 rounded-lg border border-[#EBEDF5] bg-client-field px-2 text-[13px] text-[#18333E] placeholder:text-[#98A4AF] focus:ring-2 focus:ring-primary/40 focus:outline-none';

/** Bảng giá tham khảo: loại giá, số tiền (VND), ghi chú */
export default function PriceEditor({
  rows,
  onChange,
  error,
}: {
  rows: PriceRow[];
  onChange: (rows: PriceRow[]) => void;
  error?: string;
}) {
  const update = (index: number, changes: Partial<PriceRow>) =>
    onChange(rows.map((row, i) => (i === index ? { ...row, ...changes } : row)));

  return (
    <div>
      {rows.length === 0 && (
        <p className="mb-2 text-[12px] text-client-muted">Chưa có mức giá nào.</p>
      )}
      <div className="flex flex-col gap-2">
        {rows.map((row, index) => (
          <div key={index} className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Loại giá"
              value={row.priceType}
              onChange={(event) => update(index, { priceType: event.target.value })}
              className={`${INPUT_CLASS} w-44`}
            >
              {PRICE_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            <div className="relative">
              <input
                aria-label="Số tiền"
                inputMode="numeric"
                placeholder="150000"
                value={row.amount}
                onChange={(event) =>
                  update(index, { amount: event.target.value.replace(/[^\d]/g, '') })
                }
                className={`${INPUT_CLASS} w-36 pr-7`}
              />
              <span className="absolute top-1/2 right-2 -translate-y-1/2 text-[12px] text-client-muted">
                ₫
              </span>
            </div>
            <input
              aria-label="Ghi chú giá"
              placeholder="Ghi chú (vd. Phòng đôi)"
              maxLength={500}
              value={row.description}
              onChange={(event) => update(index, { description: event.target.value })}
              className={`${INPUT_CLASS} min-w-40 flex-1`}
            />
            <button
              type="button"
              aria-label="Xóa mức giá"
              onClick={() => onChange(rows.filter((_, i) => i !== index))}
              className="flex h-10 w-10 items-center justify-center rounded-lg text-client-muted hover:bg-[#FCE4E3] hover:text-client-danger"
            >
              <Icon name="delete" className="text-[18px]" />
            </button>
          </div>
        ))}
      </div>
      {rows.length < MAX_PRICES && (
        <button
          type="button"
          onClick={() =>
            onChange([...rows, { priceType: PRICE_TYPES[0].value, amount: '', description: '' }])
          }
          className="mt-2 flex items-center gap-1 text-[12px] font-bold text-[#007A73] hover:underline"
        >
          <Icon name="add" className="text-[16px]" /> Thêm mức giá
        </button>
      )}
      {error && <p className="mt-1 text-xs text-client-danger">{error}</p>}
    </div>
  );
}
