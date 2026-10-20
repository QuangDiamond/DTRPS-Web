import { PARTNER_STATUS_CONFIG } from '../../../constants/partner';
import type { PartnerStatus } from '../../../types/admin';

export default function PartnerStatusBadge({ status }: { status: PartnerStatus }) {
  const config = PARTNER_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold ${config.badgeClass}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotClass}`} /> {config.label}
    </span>
  );
}
