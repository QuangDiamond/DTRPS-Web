import { POI_CATEGORY_CONFIG, POI_PROVINCE_LABELS } from '../../constants/poi';
import type { Poi, PoiCategoryTab, PoiFilters } from '../../types/admin';
import { normalizeText } from '../../utils/string';

export function filterPois(pois: Poi[], tab: PoiCategoryTab, filters: PoiFilters): Poi[] {
  const keyword = normalizeText(filters.search.trim());
  return pois.filter((poi) => {
    if (tab !== 'all' && POI_CATEGORY_CONFIG[poi.category].tab !== tab) return false;
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
