import { POI_CATEGORY_CONFIG, POI_PROVINCE_LABELS, POI_STATUS_CONFIG } from '@/constants/poi';
import type { Poi, PoiCategoryTab, PoiFilters } from '@/types';
import { shortLocation, shortPoiName } from '@/utils/poi';
import type { SortAccessors } from '@/utils/sort';
import { normalizeText } from '@/utils/string';

export function filterPois(pois: Poi[], tab: PoiCategoryTab, filters: PoiFilters): Poi[] {
  const keyword = normalizeText(filters.search.trim());
  return pois.filter((poi) => {
    if (tab !== 'all' && POI_CATEGORY_CONFIG[poi.category].group !== tab) return false;
    if (filters.province !== 'all' && poi.province !== filters.province) return false;
    if (filters.status !== 'all' && poi.status !== filters.status) return false;
    if (filters.source !== 'all' && poi.source !== filters.source) return false;
    if (!keyword) return true;
    const haystack = [
      poi.id,
      poi.name,
      poi.address,
      poi.tags,
      poi.subCategory ?? '',
      POI_PROVINCE_LABELS[poi.province],
    ].join(' ');
    return normalizeText(haystack).includes(keyword);
  });
}

export function hasActiveFilters(tab: PoiCategoryTab, filters: PoiFilters): boolean {
  return (
    tab !== 'all' ||
    Boolean(filters.search.trim()) ||
    filters.province !== 'all' ||
    filters.status !== 'all' ||
    filters.source !== 'all'
  );
}

export type PoiSortKey = 'name' | 'id' | 'location' | 'rating' | 'status';

export const POI_SORT_ACCESSORS: SortAccessors<Poi, PoiSortKey> = {
  name: (poi) => shortPoiName(poi.name),
  id: (poi) => poi.id,
  location: (poi) => shortLocation(poi.address),
  // POI chưa có đánh giá xếp sau cùng khi sắp xếp giảm dần
  rating: (poi) => (poi.reviewCount > 0 ? poi.rating : -1),
  status: (poi) => POI_STATUS_CONFIG[poi.status].label,
};
