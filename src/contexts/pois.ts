import { createContext } from 'react';
import type { Poi, PoiFormValues, PoiStatus } from '../types/admin';

export interface PoisContextValue {
  pois: Poi[];
  createPoi: (values: PoiFormValues) => Poi;
  updatePoi: (id: string, values: PoiFormValues) => Poi | null;
  setPoiStatus: (id: string, status: PoiStatus) => void;
}

export const PoisContext = createContext<PoisContextValue | null>(null);
