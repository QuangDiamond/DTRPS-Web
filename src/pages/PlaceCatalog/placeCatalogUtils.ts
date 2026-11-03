import type { CatalogPlaceStatus, PlaceSource, TranslationKey } from '@/types';

export const CATALOG_STATUSES: CatalogPlaceStatus[] = ['active', 'draft', 'paused', 'maintenance'];
export const PLACE_SOURCES: PlaceSource[] = ['partner', 'admin'];

export const STATUS_STYLE: Record<
  CatalogPlaceStatus,
  { labelKey: TranslationKey; className: string }
> = {
  active: {
    labelKey: 'placeCatalog.status.active',
    className: 'bg-secondary-fixed text-on-secondary-fixed-variant',
  },
  draft: {
    labelKey: 'placeCatalog.status.draft',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  paused: {
    labelKey: 'placeCatalog.status.paused',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
  maintenance: {
    labelKey: 'placeCatalog.status.maintenance',
    className: 'bg-error-container text-on-error-container',
  },
};

export const SOURCE_STYLE: Record<PlaceSource, { labelKey: TranslationKey; icon: string }> = {
  partner: { labelKey: 'placeCatalog.source.partner', icon: 'storefront' },
  admin: { labelKey: 'placeCatalog.source.admin', icon: 'verified' },
};

/** Mã hiển thị, ví dụ PL-0001 */
export const placeCode = (id: string): string => `PL-${id.padStart(4, '0')}`;
