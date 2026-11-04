
import { clientRequest } from './http';
import type { CategoryGroup, ReferenceItem } from './types';

export const referenceApi = {
  // GET /api/reference/provinces
  provinces: () =>
    clientRequest<ReferenceItem[]>('/reference/provinces', {
      auth: false,
    }),

  // GET /api/reference/categories
  categories: () =>
    clientRequest<CategoryGroup[]>('/reference/categories', {
      auth: false,
    }),
};
