import type { Poi, PoiFormValues, PoisSnapshot } from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest } from './request';

/** Dữ liệu khởi tạo của store điểm đến POI */
export const poisSource = createSource<PoisSnapshot>(ENDPOINTS.pois.snapshot);

export const poiService = {
  create: (poi: Poi) => writeRequest(ENDPOINTS.pois.create, 'POST', poi),
  update: (id: string, values: PoiFormValues) =>
    writeRequest(ENDPOINTS.pois.update(id), 'PUT', values),
};
