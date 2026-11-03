/**
 * Loại địa điểm (admin) — luôn gọi API thật /admin/place-categories.
 * Loại là cấp con dưới 4 nhóm dịch vụ cố định; mã loại không đổi sau khi tạo.
 */
import type {
  CategoryStatus,
  PlaceCategory,
  PlaceCategoryGroup,
  PlaceCategoryInput,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

interface ApiCategory {
  id: number;
  code: string;
  name: string;
  description: string | null;
  status: string;
  placeCount: number;
}

interface ApiGroup {
  id: number;
  code: string;
  name: string;
  status: string;
  types: ApiCategory[];
}

const toCategory = (category: ApiCategory): PlaceCategory => ({
  ...category,
  id: String(category.id),
  status: category.status.toLowerCase() as CategoryStatus,
});

export const placeCategoryService = {
  list: async (): Promise<PlaceCategoryGroup[]> => {
    const groups = await apiRequest<ApiGroup[]>(ENDPOINTS.placeCategories.list);
    return groups.map((group) => ({
      id: String(group.id),
      code: group.code,
      name: group.name,
      types: group.types.map(toCategory),
    }));
  },

  create: async (input: PlaceCategoryInput): Promise<PlaceCategory> =>
    toCategory(
      await apiRequest<ApiCategory>(ENDPOINTS.placeCategories.list, {
        method: 'POST',
        body: input,
      }),
    ),

  update: async (categoryId: string, input: PlaceCategoryInput): Promise<PlaceCategory> =>
    toCategory(
      await apiRequest<ApiCategory>(ENDPOINTS.placeCategories.detail(categoryId), {
        method: 'PUT',
        body: { ...input, code: undefined },
      }),
    ),

  changeStatus: async (categoryId: string, status: CategoryStatus): Promise<PlaceCategory> =>
    toCategory(
      await apiRequest<ApiCategory>(ENDPOINTS.placeCategories.status(categoryId), {
        method: 'PUT',
        body: { status: status.toUpperCase() },
      }),
    ),
};
