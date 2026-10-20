import { useState } from 'react';
import Icon from '../../../components/common/Icon';
import { CIDR_PATTERN } from '../../../constants/settings';
import { useToast } from '../../../hooks/useToast';
import type { IpWhitelistEntry } from '../../../types/admin';

interface IpWhitelistFieldProps {
  entries: IpWhitelistEntry[];
  onChange: (entries: IpWhitelistEntry[]) => void;
}

const INPUT_CLASS =
  'h-9 rounded-lg bg-surface-container-lowest px-space-sm font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline focus:ring-2 focus:ring-primary/20';

let entrySeq = 0;

/** Danh sách dải IP được phép truy cập cổng quản trị */
export default function IpWhitelistField({ entries, onChange }: IpWhitelistFieldProps) {
  const { showToast } = useToast();
  const [adding, setAdding] = useState(false);
  const [cidr, setCidr] = useState('');
  const [label, setLabel] = useState('');
  const [error, setError] = useState('');

  const closeForm = () => {
    setAdding(false);
    setCidr('');
    setLabel('');
    setError('');
  };

  const addEntry = () => {
    const value = cidr.trim();
    if (!CIDR_PATTERN.test(value)) {
      setError('Dải IP phải đúng định dạng CIDR, ví dụ 118.70.192.0/24');
      return;
    }
    if (entries.some((entry) => entry.cidr === value)) {
      setError('Dải IP này đã có trong danh sách');
      return;
    }
    entrySeq += 1;
    onChange([
      ...entries,
      { id: `ip-${Date.now()}-${entrySeq}`, cidr: value, label: label.trim() || 'Văn phòng mới' },
    ]);
    showToast(`Đã thêm dải IP ${value} (chưa lưu)`, 'info');
    closeForm();
  };

  const removeEntry = (entry: IpWhitelistEntry) => {
    onChange(entries.filter((item) => item.id !== entry.id));
    showToast(`Đã gỡ dải IP ${entry.cidr} (chưa lưu)`, 'info');
  };

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="font-label-md text-label-md text-on-surface-variant">
          Giới hạn dải IP truy cập văn phòng điều hành
        </span>
        {!adding && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="font-label-sm text-label-sm font-semibold text-primary hover:underline"
          >
            + Thêm IP CIDR
          </button>
        )}
      </div>
      <div className="space-y-1.5 rounded-xl bg-surface-container-low p-space-sm">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg bg-surface-container-lowest px-space-sm py-1.5"
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
              <span className="font-mono text-body-sm font-semibold text-on-surface">
                {entry.cidr}
              </span>
              <span className="truncate font-label-sm text-label-sm text-on-surface-variant">
                ({entry.label})
              </span>
            </div>
            <button
              type="button"
              title="Gỡ dải IP"
              onClick={() => removeEntry(entry)}
              className="text-outline transition-colors hover:text-error"
            >
              <Icon name="close" className="text-[16px]" />
            </button>
          </div>
        ))}

        {entries.length === 0 && !adding && (
          <div className="flex items-center gap-2 px-space-sm py-1.5 font-body-sm text-body-sm text-tertiary">
            <Icon name="warning_amber" className="text-[16px]" />
            Chưa giới hạn IP — mọi địa chỉ đều truy cập được cổng quản trị
          </div>
        )}

        {adding && (
          <div className="flex flex-col gap-1.5 rounded-lg bg-surface-container-lowest/60 p-space-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <input
                autoFocus
                type="text"
                value={cidr}
                placeholder="VD: 203.113.0.0/24"
                onChange={(event) => {
                  setCidr(event.target.value);
                  setError('');
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addEntry();
                  if (event.key === 'Escape') closeForm();
                }}
                className={`${INPUT_CLASS} w-44 font-mono`}
              />
              <input
                type="text"
                value={label}
                placeholder="Ghi chú (văn phòng, chi nhánh...)"
                onChange={(event) => setLabel(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') addEntry();
                  if (event.key === 'Escape') closeForm();
                }}
                className={`${INPUT_CLASS} min-w-0 flex-1`}
              />
              <button
                type="button"
                onClick={addEntry}
                className="h-9 rounded-lg bg-primary px-space-sm font-label-sm text-label-sm font-semibold text-on-primary"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="h-9 rounded-lg px-space-sm font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-high"
              >
                Hủy
              </button>
            </div>
            {error && (
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-error">
                <Icon name="error" className="text-[14px]" /> {error}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
