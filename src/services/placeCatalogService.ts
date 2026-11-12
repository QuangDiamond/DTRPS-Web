/**
 * Kho địa điểm (admin) — luôn gọi API thật /admin/places.
 * Trạng thái backend viết hoa (ACTIVE…) được đổi sang chữ thường cho giao diện.
 */
import type {
  CatalogPlace,
  CatalogPlaceDetail,
  CatalogPlaceInput,
  CatalogPlaceStatus,
  CatalogPriceInput,
  CatalogQuery,
  CatalogStats,
  CategoryGroupRef,
  OpeningHour,
  Paged,
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
  groups?: RefItem[];
  categories?: (RefItem & { groupCode?: string | null })[];
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
  editable: boolean;
  openingHours: OpeningHour[] | null;
  prices: ApiPrice[] | null;
  images: ApiImage[] | null;
}

interface ApiImage {
  id: number;
  url: string;
  primary: boolean;
}

interface ApiPrice {
  id: number;
  priceType: string;
  amount: number;
  currency: string;
  description: string | null;
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
    groups: place.groups ?? (place.group ? [place.group] : []),
    categories: place.categories ?? (place.category ? [place.category] : []),
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
    category: params.category && params.category !== 'all' ? params.category : undefined,
    province: params.province && params.province !== 'all' ? params.province : undefined,
    status: upper(params.status),
    source: upper(params.source),
    // Mặc định (theo mã địa điểm) thì không gửi
    sort: params.sort && params.sort !== 'code' ? params.sort : undefined,
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

  get: async (placeId: string): Promise<CatalogPlaceDetail> =>
    toDetail(await apiRequest<ApiDetail>(ENDPOINTS.places.detail(placeId))),

  // ===== Địa điểm do admin tạo (địa điểm đối tác: BE trả 409) =====

  create: async (input: CatalogPlaceInput): Promise<CatalogPlaceDetail> =>
    toDetail(await apiRequest<ApiDetail>(ENDPOINTS.places.create, { method: 'POST', body: input })),

  /** Danh sách để trống (undefined) thì BE giữ nguyên */
  update: async (placeId: string, input: CatalogPlaceInput): Promise<CatalogPlaceDetail> =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.detail(placeId), { method: 'PUT', body: input }),
    ),

  changeStatus: async (placeId: string, status: CatalogPlaceStatus) =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.status(placeId), {
        method: 'PUT',
        body: { status: status.toUpperCase() },
      }),
    ),

  /** Gửi đủ 7 ngày */
  replaceHours: async (placeId: string, days: OpeningHour[]) =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.hours(placeId), {
        method: 'PUT',
        body: { days },
      }),
    ),

  addImage: async (placeId: string, url: string, primary = false) =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.images(placeId), {
        method: 'POST',
        body: { url, primary },
      }),
    ),

  deleteImage: async (placeId: string, imageId: string) =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.image(placeId, imageId), { method: 'DELETE' }),
    ),

  setPrimaryImage: async (placeId: string, imageId: string) =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.primaryImage(placeId, imageId), {
        method: 'PUT',
      }),
    ),

  addPrice: async (placeId: string, price: CatalogPriceInput) =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.prices(placeId), {
        method: 'POST',
        body: price,
      }),
    ),

  updatePrice: async (placeId: string, priceId: string, price: CatalogPriceInput) =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.price(placeId, priceId), {
        method: 'PUT',
        body: price,
      }),
    ),

  deletePrice: async (placeId: string, priceId: string) =>
    toDetail(
      await apiRequest<ApiDetail>(ENDPOINTS.places.price(placeId, priceId), { method: 'DELETE' }),
    ),

  /** Tải ảnh trong máy lên Cloudinary qua BE, trả về URL https */
  uploadImage: async (file: File): Promise<string> => {
    const form = new FormData();
    form.append('file', file);
    const result = await apiRequest<{ url: string }>(ENDPOINTS.uploads.image, {
      method: 'POST',
      body: form,
    });
    return result.url;
  },

  provinces: () => apiRequest<RefItem[]>(ENDPOINTS.reference.provinces, { auth: false }),

  categories: () => apiRequest<CategoryGroupRef[]>(ENDPOINTS.reference.categories, { auth: false }),
};

function toDetail(detail: ApiDetail): CatalogPlaceDetail {
  const place = toPlace(detail.summary);
  const images = (detail.images ?? []).map((image) => ({ ...image, id: String(image.id) }));
  const prices = (detail.prices ?? []).map((price) => ({ ...price, id: String(price.id) }));
  return {
    place,
    editable: detail.editable,
    images,
    prices,
    content: {
      name: place.name,
      description: detail.description,
      address: place.address ?? '',
      latitude: detail.latitude,
      longitude: detail.longitude,
      group: place.group,
      category: place.category,
      groups: place.groups,
      categories: place.categories,
      province: place.province,
      phone: detail.phone,
      website: detail.website,
      openingHours: detail.openingHours ?? [],
      prices,
      images,
    },
  };
}
