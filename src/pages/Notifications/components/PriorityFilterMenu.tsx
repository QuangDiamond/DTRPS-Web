import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import { Icon } from '@/components/common';
import { NOTIFICATION_PRIORITIES, NOTIFICATION_PRIORITY_CONFIG } from '@/constants/notification';
import { useDismiss } from '@/hooks';
import type { NotificationPriority } from '@/types';

interface PriorityFilterMenuProps {
  value: NotificationPriority | 'all';
  counts: Record<NotificationPriority, number>;
  onChange: (value: NotificationPriority | 'all') => void;
}

/** Nút "Lọc mức ưu tiên" + menu chọn mức */
export default function PriorityFilterMenu({ value, counts, onChange }: PriorityFilterMenuProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useDismiss(containerRef, open, () => setOpen(false));

  const select = (next: NotificationPriority | 'all') => {
    onChange(next);
    setOpen(false);
  };

  const options: {
    id: NotificationPriority | 'all';
    label: string;
    dotClass: string;
    count?: number;
  }[] = [
    {
      id: 'all',
      label: t('notifications.priorityFilterMenu.allPriorities'),
      dotClass: 'bg-outline-variant',
    },
    ...NOTIFICATION_PRIORITIES.map((priority) => ({
      id: priority,
      label: NOTIFICATION_PRIORITY_CONFIG[priority].label,
      dotClass: NOTIFICATION_PRIORITY_CONFIG[priority].dotClass,
      count: counts[priority],
    })),
  ];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={`flex h-10 items-center gap-space-xs rounded-full px-space-md font-label-md text-label-md font-semibold transition-all ${
          value === 'all'
            ? 'bg-surface-container-low text-on-surface hover:bg-surface-container-high'
            : 'bg-secondary-container text-on-secondary-container'
        }`}
      >
        <Icon name="filter_list" className="text-[19px] text-primary" />
        <span>
          {value === 'all'
            ? t('notifications.priorityFilterMenu.filterByPriority')
            : t('notifications.priorityFilterMenu.priority', {
                label: NOTIFICATION_PRIORITY_CONFIG[value].label,
              })}
        </span>
      </button>

      {open && (
        <div className="absolute top-full right-0 z-30 mt-2 flex w-60 flex-col gap-0.5 rounded-xl bg-surface-container-lowest p-space-xs shadow-lg ring-1 ring-surface-container-high">
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => select(option.id)}
              className={`flex items-center justify-between rounded-lg px-space-sm py-2 text-left font-body-md text-body-md transition-colors ${
                option.id === value
                  ? 'bg-primary-fixed/40 font-semibold text-on-surface'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
              }`}
            >
              <span className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${option.dotClass}`} />
                {option.label}
              </span>
              <span className="flex items-center gap-1">
                {option.count !== undefined && (
                  <span className="font-label-sm text-label-sm text-outline">{option.count}</span>
                )}
                {option.id === value && <Icon name="check" className="text-[16px] text-primary" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
