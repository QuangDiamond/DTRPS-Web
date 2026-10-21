import { Icon } from '@/components/common';
import { PARTNER_TYPE_CONFIG } from '@/constants/partner';
import type { PartnerType } from '@/types';

export default function PartnerTypeBadge({ type }: { type: PartnerType }) {
  const config = PARTNER_TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold ${config.badgeClass}`}
    >
      <Icon name={config.icon} className="text-[15px]" /> {config.label}
    </span>
  );
}
