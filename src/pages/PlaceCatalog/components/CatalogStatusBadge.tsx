import { useTranslation } from 'react-i18next';
import { STATUS_STYLE } from '@/pages/PlaceCatalog/placeCatalogUtils';
import type { CatalogPlaceStatus } from '@/types';

const BADGE_CLASS =
  'inline-flex items-center rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap';

export default function CatalogStatusBadge({ status }: { status: CatalogPlaceStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status];
  return <span className={`${BADGE_CLASS} ${style.className}`}>{t(style.labelKey)}</span>;
}
