import { createContext } from 'react';
import type { DataStatus, Poi, PoiFormValues, PoiStats } from '@/types';

export interface PoisContextValue {
  pois: Poi[];
  stats: PoiStats;
  /** Trạng thái tải dữ liệu từ server */
  dataStatus: DataStatus;
  createPoi: (values: PoiFormValues) => Poi;
  updatePoi: (id: string, values: PoiFormValues) => Poi | null;
}

export const PoisContext = createContext<PoisContextValue | null>(null);
