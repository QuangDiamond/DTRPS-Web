import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';
import type { ListingStats } from '../../../types/admin';
import { formatNumber } from '../../../utils/format';

interface CardConfig {
  label: string;
  value: number;
  valueClass: string;
  icon: string;
  iconBoxClass: string;
  glowClass: string;
  tag: ReactNode;
  tagClass: string;
}

const CARD_CLASS =
  'group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-surface-container-lowest p-5 shadow-[0_4px_20px_-2px_rgba(15,118,110,0.06)]';

export default function RejectedStatsCards({ stats }: { stats: ListingStats }) {
  const unresolved = Math.max(0, stats.rejected - stats.resubmitted - stats.locked);

  const cards: CardConfig[] = [
    {
      label: 'Tổng từ chối',
      value: stats.rejected,
      valueClass: 'text-on-surface',
      icon: 'cancel',
      iconBoxClass: 'bg-error-container text-error',
      glowClass: 'bg-error-container/40',
      tag: 'Vi phạm / Thiếu giấy tờ',
      tagClass: 'bg-error-container text-on-error-container font-semibold',
    },
    {
      label: 'Chờ thẩm định lại',
      value: stats.resubmitted,
      valueClass: 'text-tertiary',
      icon: 'published_with_changes',
      iconBoxClass: 'bg-tertiary-fixed text-tertiary',
      glowClass: 'bg-tertiary-fixed/40',
      tag: (
        <>
          <span className="h-1.5 w-1.5 animate-ping rounded-full bg-tertiary" />
          Cần xử lý gấp
        </>
      ),
      tagClass: 'flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed font-semibold',
    },
    {
      label: 'Chưa khắc phục',
      value: unresolved,
      valueClass: 'text-on-surface',
      icon: 'pending_actions',
      iconBoxClass: 'bg-surface-container text-outline',
      glowClass: 'bg-surface-container-high/60',
      tag: 'Đang chờ đối tác bổ sung',
      tagClass: 'bg-surface-container-high text-on-surface-variant font-medium',
    },
    {
      label: 'Đóng vĩnh viễn',
      value: stats.locked,
      valueClass: 'text-on-surface',
      icon: 'block',
      iconBoxClass: 'bg-surface-variant text-on-surface-variant',
      glowClass: 'bg-surface-variant/50',
      tag: 'Spam / Gian lận thông tin',
      tagClass: 'bg-surface-variant text-on-surface-variant font-semibold',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className={CARD_CLASS}>
          <div
            className={`pointer-events-none absolute -right-4 -bottom-4 h-24 w-24 rounded-full transition-transform group-hover:scale-125 ${card.glowClass}`}
          />
          <div className="flex items-start justify-between">
            <div>
              <span className="font-label-md text-label-md tracking-wider text-on-surface-variant uppercase">
                {card.label}
              </span>
              <div className={`mt-1 font-display-sm text-display-sm font-bold ${card.valueClass}`}>
                {formatNumber(card.value)}
              </div>
            </div>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.iconBoxClass}`}
            >
              <Icon name={card.icon} className="text-[22px]" />
            </div>
          </div>
          <div className="relative mt-4 flex items-center gap-2">
            <span className={`rounded-md px-2 py-0.5 font-label-sm text-label-sm ${card.tagClass}`}>
              {card.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
