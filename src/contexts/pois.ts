import { createContext } from 'react';
import type { Poi, PoiFormValues, PoiStats } from '../types/admin';

export interface PoisContextValue {
  pois: Poi[];
  stats: PoiStats;
  createPoi: (values: PoiFormValues) => Poi;
  updatePoi: (id: string, values: PoiFormValues) => Poi | null;
}

export const PoisContext = createContext<PoisContextValue | null>(null);
