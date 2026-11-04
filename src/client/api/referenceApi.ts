import { clientRequest } from './http';
import type { CategoryGroup, ReferenceItem } from './types';

export const referenceApi = {
  provinces: () => clientRequest<ReferenceItem[]>('/reference/provinces'),
  categories: () => clientRequest<CategoryGroup[]>('/reference/categories'),
  interests: () => clientRequest<ReferenceItem[]>('/reference/interests'),
  specialNeeds: () => clientRequest<ReferenceItem[]>('/reference/special-needs'),
};
