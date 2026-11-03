/**
 * Kho địa điểm (admin) — luôn gọi API thật /admin/places.
 * Trạng thái backend viết hoa (ACTIVE…) được đổi sang chữ thường cho giao diện.
 */
import type {
  CatalogPlace,
  CatalogPlaceDetail,
  CatalogPlaceStatus,
  CatalogQuery,
  CatalogStats,
  CategoryGroupRef,
  PlaceImage,
  OpeningHour,
  Paged,
  PlacePrice,
  PlaceSource,
  RefItem,
  ReviewListingStatus,
} from '@/types';
import { ENDPOINTS } from './endpoints';
import { apiRequest } from './httpClient';

interface ApiSummary {
  id: number;
  name: string;
  group: RefItem | null;
  category: RefItem | null;
  province: RefItem | null;
  address: string | null;
  status: string;
  source: string;
  listingId: number | null;
  listingStatus: string | null;
  businessName: string | null;
  coverUrl: string | null;
  imageCount: number;
  rating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

interface ApiDetail {
  summary: ApiSummary;
  description: string | null;
  latitude: number;
  longitude: number;
  phone: string | null;
  website: string | null;
  openingHours: OpeningHour[] | null;
  prices: PlacePrice[] | null;
  images: PlaceImage[] | null;
}

interface ApiPage<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

const upper = (value: string | undefined) =>
  value && value !== 'all' ? value.toUpperCase() : undefined;

function toPlace(place: ApiSummary): CatalogPlace {
  return {
    id: String(place.id),
    name: place.name,
    group: place.group,
    category: place.category,
    province: place.province,
    address: place.address,
    status: place.status.toLowerCase() as CatalogPlaceStatus,
    source: place.source.toLowerCase() as PlaceSource,
    listingId: place.listingId === null ? undefined : String(place.listingId),
    listingStatus: place.listingStatus?.toLowerCase() as ReviewListingStatus | undefined,
    businessName: place.businessName ?? undefined,
    coverUrl: place.coverUrl ?? undefined,
    imageCount: place.imageCount,
    rating: place.rating,
    reviewCount: place.reviewCount,
    createdAt: place.createdAt,
    updatedAt: place.updatedAt,
  };
}

function query(params: CatalogQuery): string {
  const search = new URLSearchParams({ page: String(params.page), size: String(params.size) });
  const optional: Record<string, string | undefined> = {
    keyword: params.keyword?.trim() || undefined,
    group: params.group && params.group !== 'all' ? params.group : undefined,
    province: params.province && params.province !== 'all' ? params.province : undefined,
    status: upper(params.status),
    source: upper(params.source),
  };
  Object.entries(optional).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  return search.toString();
}

export const placeCatalogService = {
  list: async (params: CatalogQuery): Promise<Paged<CatalogPlace>> => {
    const page = await apiRequest<ApiPage<ApiSummary>>(`${ENDPOINTS.places.list}?${query(params)}`);
    return { ...page, items: page.items.map(toPlace) };
  },

  stats: () => apiRequest<CatalogStats>(ENDPOINTS.places.stats),

  get: async (placeId: string): Promise<CatalogPlaceDetail> => {
    const detail = await apiRequest<ApiDetail>(ENDPOINTS.places.detail(placeId));
    const place = toPlace(detail.summary);
    return {
      place,
      content: {
        name: place.name,
        description: detail.description,
        address: place.address ?? '',
        latitude: detail.latitude,
        longitude: detail.longitude,
        group: place.group,
        category: place.category,
        province: place.province,
        phone: detail.phone,
        website: detail.website,
        openingHours: detail.openingHours ?? [],
        prices: detail.prices ?? [],
        images: detail.images ?? [],
      },
    };
  },

  provinces: () => apiRequest<RefItem[]>(ENDPOINTS.reference.provinces),
  categories: () => apiRequest<CategoryGroupRef[]>(ENDPOINTS.reference.categories),
};
