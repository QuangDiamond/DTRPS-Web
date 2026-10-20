import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { MOCK_POIS } from '../../constants/mockPois';
import { PoisContext } from '../../contexts/pois';
import { useAuth } from '../../hooks/useAuth';
import type { Poi, PoiFormValues, PoiStatus } from '../../types/admin';

function nextPoiId(pois: Poi[]): string {
  const maxNumber = pois.reduce(
    (max, poi) => Math.max(max, Number(poi.id.replace('POI-VN-', '')) || 0),
    0,
  );
  return `POI-VN-${String(maxNumber + 1).padStart(4, '0')}`;
}

/** Store điểm đến POI. Khi có backend: thay state bằng dữ liệu gọi API. */
export default function PoisProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const [pois, setPois] = useState<Poi[]>(MOCK_POIS);
  const poisRef = useRef(pois);
  poisRef.current = pois;
  const actor = admin?.role ?? 'Quản trị viên';

  const createPoi = useCallback(
    (values: PoiFormValues) => {
      const poi: Poi = {
        ...values,
        id: nextPoiId(poisRef.current),
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
      };
      setPois((current) => [poi, ...current]);
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

  const setPoiStatus = useCallback(
    (id: string, status: PoiStatus) => {
      setPois((current) =>
        current.map((poi) =>
          poi.id === id
            ? { ...poi, status, updatedAt: new Date().toISOString(), updatedBy: actor }
            : poi,
        ),
      );
    },
    [actor],
  );

  const value = useMemo(
    () => ({ pois, createPoi, updatePoi, setPoiStatus }),
    [pois, createPoi, updatePoi, setPoiStatus],
  );

  return <PoisContext.Provider value={value}>{children}</PoisContext.Provider>;
}
