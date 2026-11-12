import type { CatalogPlaceStatus, CatalogSort, PlaceSource, TranslationKey } from '@/types';
import { ROUTES } from '@/constants/routes';

export const CATALOG_STATUSES: CatalogPlaceStatus[] = ['active', 'draft', 'paused', 'maintenance'];
export const PLACE_SOURCES: PlaceSource[] = ['partner', 'admin'];

/** Các kiểu sắp xếp danh sách; 'code' (mã địa điểm) là mặc định, không nhảy trang khi sửa */
export const CATALOG_SORTS: CatalogSort[] = ['code', 'updated', 'created', 'name'];
export const SORT_LABEL_KEYS: Record<CatalogSort, TranslationKey> = {
  code: 'placeCatalog.filters.sortCode',
  updated: 'placeCatalog.filters.sortUpdated',
  created: 'placeCatalog.filters.sortCreated',
  name: 'placeCatalog.filters.sortName',
};

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

/** Ô chọn gọn dùng trong bảng thông tin (ví dụ đổi trạng thái) */
export const INPUT_CLASS_SELECT =
  'rounded-lg bg-surface-container-low px-2 py-1.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50';

/** Danh sách đang xem (trang, bộ lọc) của Kho địa điểm, giữ trong tab để quay lại đúng chỗ */
const LIST_SEARCH_KEY = 'smarttravel.admin.placeCatalog.listSearch';

export function rememberCatalogListSearch(search: string): void {
  try {
    window.sessionStorage.setItem(LIST_SEARCH_KEY, search);
  } catch {
    // Không lưu được thì nút quay lại về trang 1
  }
}

/** Đường dẫn về Kho địa điểm, giữ nguyên trang và bộ lọc lần trước */
export function catalogListPath(): string {
  let search = '';
  try {
    search = window.sessionStorage.getItem(LIST_SEARCH_KEY) ?? '';
  } catch {
    // bỏ qua
  }
  return `${ROUTES.POIS}${search}`;
}
