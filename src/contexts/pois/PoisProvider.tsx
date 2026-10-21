import i18n from 'i18next';
import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { POI_CATEGORY_CONFIG } from '@/constants/poi';
import { useAuth, useInitialData, usePersist } from '@/hooks';
import { poiService, poisSource } from '@/services/poiService';
import { searchService } from '@/services/searchService';
import type { Poi, PoiCategoryTab, PoiFormValues, PoiKpiGroup, PoiStats } from '@/types';
import { PoisContext } from './poisContext';

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
  return { total: pois.length, byGroup, byTab, available };
}

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

const EMPTY_STATS: PoiStats = {
  total: 0,
  newThisMonth: 0,
  available: 0,
  byGroup: { sights: 0, food: 0, stay: 0, tour: 0 },
  byTab: { all: 0, heritage: 0, food: 0, stay: 0, nature: 0, craft: 0 },
};

/** Store điểm đến POI — dữ liệu tải qua poiService (mock hoặc API) */
export default function PoisProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const seed = poisSource.seed;
  const [pois, setPois] = useState<Poi[]>(seed?.pois ?? []);
  const [baseStats, setBaseStats] = useState<PoiStats>(seed?.stats ?? EMPTY_STATS);
  // Số đếm của dữ liệu lúc tải — KPI = số gốc + chênh lệch so với lúc tải
  const [loadedCounts, setLoadedCounts] = useState(() => countPois(seed?.pois ?? []));
  const [createdCount, setCreatedCount] = useState(0);

  const dataStatus = useInitialData(
    poisSource,
    (snapshot) => {
      setPois(snapshot.pois);
      setBaseStats(snapshot.stats);
      setLoadedCounts(countPois(snapshot.pois));
      setCreatedCount(0);
    },
    Boolean(admin),
  );
  const persist = usePersist(dataStatus.reload);

  const poisRef = useRef(pois);
  poisRef.current = pois;
  const actor = admin?.role ?? i18n.t('common.administrator');

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
      persist(poiService.create(poi), i18n.t('stores.pois.couldNotSaveNew'));
      return poi;
    },
    [actor, persist],
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
      persist(poiService.update(id, values), i18n.t('stores.pois.couldNotSaveDestination'));
      return updated;
    },
    [actor, persist],
  );

  const reindexPois = useCallback(
    (ids?: string[]) => {
      const targets = poisRef.current.filter((poi) =>
        ids ? ids.includes(poi.id) : !poi.vectorEmbedded,
      );
      if (targets.length === 0) return 0;
      const targetIds = new Set(targets.map((poi) => poi.id));
      setPois((current) =>
        current.map((poi) => (targetIds.has(poi.id) ? { ...poi, vectorEmbedded: true } : poi)),
      );
      persist(searchService.reindex('pois', [...targetIds]), i18n.t('stores.pois.couldNotReindex'));
      return targets.length;
    },
    [persist],
  );

  // KPI = số liệu toàn quốc + chênh lệch giữa dữ liệu hiện tại và dữ liệu lúc tải
  const stats = useMemo<PoiStats>(() => {
    const current = countPois(pois);
    return {
      total: Math.max(0, baseStats.total + current.total - loadedCounts.total),
      newThisMonth: baseStats.newThisMonth + createdCount,
      available: Math.max(0, baseStats.available + current.available - loadedCounts.available),
      byGroup: withDelta(baseStats.byGroup, current.byGroup, loadedCounts.byGroup),
      byTab: withDelta(baseStats.byTab, current.byTab, loadedCounts.byTab),
    };
  }, [pois, baseStats, loadedCounts, createdCount]);

  const value = useMemo(
    () => ({ pois, stats, dataStatus, createPoi, updatePoi, reindexPois }),
    [pois, stats, dataStatus, createPoi, updatePoi, reindexPois],
  );

  return <PoisContext.Provider value={value}>{children}</PoisContext.Provider>;
}
