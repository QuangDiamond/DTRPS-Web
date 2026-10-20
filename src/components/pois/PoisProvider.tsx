import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { MOCK_POIS, POI_BASE_STATS } from '../../constants/mockPois';
import { POI_CATEGORY_CONFIG } from '../../constants/poi';
import { PoisContext } from '../../contexts/pois';
import { useAuth } from '../../hooks/useAuth';
import type { Poi, PoiCategoryTab, PoiFormValues, PoiKpiGroup, PoiStats } from '../../types/admin';

function nextPoiId(pois: Poi[]): string {
  const maxNumber = pois.reduce(
    (max, poi) => Math.max(max, Number(poi.id.replace('POI-VN-', '')) || 0),
    0,
  );
  return `POI-VN-${String(maxNumber + 1).padStart(4, '0')}`;
}

/** Đếm POI theo nhóm KPI, tab danh mục và số POI đang công khai */
function countPois(pois: Poi[]) {
  const byGroup: Record<PoiKpiGroup, number> = { sights: 0, food: 0, stay: 0, tour: 0 };
  const byTab: Record<PoiCategoryTab, number> = {
    all: pois.length,
    heritage: 0,
    food: 0,
    stay: 0,
    nature: 0,
    craft: 0,
  };
  let available = 0;
  pois.forEach((poi) => {
    const config = POI_CATEGORY_CONFIG[poi.category];
    byGroup[config.kpiGroup] += 1;
    if (config.tab) byTab[config.tab] += 1;
    if (poi.status === 'active') available += 1;
  });
  return { byGroup, byTab, available };
}

const MOCK_COUNTS = countPois(MOCK_POIS);

function withDelta<K extends string>(
  base: Record<K, number>,
  now: Record<K, number>,
  initial: Record<K, number>,
): Record<K, number> {
  const result = { ...base };
  (Object.keys(base) as K[]).forEach((key) => {
    result[key] = Math.max(0, base[key] + now[key] - initial[key]);
  });
  return result;
}

/** Store điểm đến POI. Khi có backend: thay state bằng dữ liệu gọi API. */
export default function PoisProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const [pois, setPois] = useState<Poi[]>(MOCK_POIS);
  const [createdCount, setCreatedCount] = useState(0);
  const poisRef = useRef(pois);
  poisRef.current = pois;
  const actor = admin?.role ?? 'Quản trị viên';

  const createPoi = useCallback(
    (values: PoiFormValues) => {
      const poi: Poi = {
        ...values,
        id: nextPoiId(poisRef.current),
        source: 'system',
        rating: 0,
        reviewCount: 0,
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
      };
      setPois((current) => [poi, ...current]);
      setCreatedCount((count) => count + 1);
      return poi;
    },
    [actor],
  );

  const updatePoi = useCallback(
    (id: string, values: PoiFormValues) => {
      const existing = poisRef.current.find((poi) => poi.id === id);
      if (!existing) return null;
      const updated: Poi = {
        ...existing,
        ...values,
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
      };
      setPois((current) => current.map((poi) => (poi.id === id ? updated : poi)));
      return updated;
    },
    [actor],
  );

  // KPI = số liệu toàn quốc của Stitch + chênh lệch giữa dữ liệu hiện tại và dữ liệu mẫu ban đầu
  const stats = useMemo<PoiStats>(() => {
    const current = countPois(pois);
    return {
      total: POI_BASE_STATS.total + pois.length - MOCK_POIS.length,
      newThisMonth: POI_BASE_STATS.newThisMonth + createdCount,
      available: Math.max(0, POI_BASE_STATS.available + current.available - MOCK_COUNTS.available),
      byGroup: withDelta(POI_BASE_STATS.byGroup, current.byGroup, MOCK_COUNTS.byGroup),
      byTab: withDelta(POI_BASE_STATS.byTab, current.byTab, MOCK_COUNTS.byTab),
    };
  }, [pois, createdCount]);

  const value = useMemo(
    () => ({ pois, stats, createPoi, updatePoi }),
    [pois, stats, createPoi, updatePoi],
  );

  return <PoisContext.Provider value={value}>{children}</PoisContext.Provider>;
}
