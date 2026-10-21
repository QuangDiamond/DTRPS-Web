import { MOCK_POIS, POI_BASE_STATS } from '@/mocks/data/mockPois';
import type { Poi, PoiFormValues, PoisSnapshot } from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, writeRequest } from './request';

const MOCK_SNAPSHOT: PoisSnapshot = { pois: MOCK_POIS, stats: POI_BASE_STATS };

/** Dữ liệu khởi tạo của store điểm đến POI */
export const poisSource = createSource(ENDPOINTS.pois.snapshot, MOCK_SNAPSHOT);

export const poiService = {
  create: (poi: Poi) => writeRequest(ENDPOINTS.pois.create, 'POST', poi),
  update: (id: string, values: PoiFormValues) =>
    writeRequest(ENDPOINTS.pois.update(id), 'PUT', values),
};
