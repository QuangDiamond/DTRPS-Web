import { createContext } from 'react';
import type { Poi, PoiFormValues, PoiStats } from '../types/admin';
import type { DataStatus } from '../types/api';

export interface PoisContextValue {
  pois: Poi[];
  stats: PoiStats;
  /** Trạng thái tải dữ liệu từ server */
  dataStatus: DataStatus;
  createPoi: (values: PoiFormValues) => Poi;
  updatePoi: (id: string, values: PoiFormValues) => Poi | null;
}

export const PoisContext = createContext<PoisContextValue | null>(null);
