import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { formatCoordinate, parseCoordinate } from '@/pages/PoiEditor/poiFormUtils';

interface PoiCoordinateInputProps {
  label: string;
  axis: 'lat' | 'lng';
  value: number;
  onChange: (value: number) => void;
  onInvalid: (message: string) => void;
}

/** Hiển thị "15.8777° N"; khi gõ cho phép nhập số tự do, rời ô mới kiểm tra hợp lệ */
export default function PoiCoordinateInput({
  label,
  axis,
  value,
  onChange,
  onInvalid,
}: PoiCoordinateInputProps) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft === null) return;
    const parsed = parseCoordinate(draft, axis);
    if (parsed === null) {
      onInvalid(
        t('poiEditor.poiCoordinateInput.invalidLimit', { label, value: axis === 'lat' ? 90 : 180 }),
      );
    } else if (parsed !== value) {
      onChange(parsed);
    }
    setDraft(null);
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="font-label-sm text-label-sm font-semibold text-outline">{label}</span>
      <input
        type="text"
        inputMode="decimal"
        value={draft ?? formatCoordinate(value, axis)}
        onFocus={() => setDraft(String(value))}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
          if (event.key === 'Escape') {
            setDraft(null);
            event.currentTarget.blur();
          }
        }}
        className="w-full rounded-lg bg-surface-container-low px-space-sm py-2 text-center font-mono font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary/30 focus:outline-none"
      />
    </div>
  );
}
