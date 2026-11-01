/**
 * Thông tin địa điểm hiển thị trên bản đồ (kiểu Google Maps).
 * Form thêm / sửa và màn Xem xét & Duyệt cùng đọc cấu hình này nên luôn hiển thị cùng bộ trường.
 */
import i18n from 'i18next';
import type {
  Listing,
  ListingAmenity,
  ListingCategory,
  ListingMapInfo,
  ListingSubType,
  ShoppingService,
  TranslationKey,
} from '@/types';

// ===== Loại hình con =====
interface ListingSubTypeConfig {
  category: ListingCategory;
  icon: string;
  labelKey: TranslationKey;
}

export const LISTING_SUBTYPE_CONFIG: Record<ListingSubType, ListingSubTypeConfig> = {
  restaurant: { category: 'fnb', icon: 'restaurant', labelKey: 'listingMap.subTypes.restaurant' },
  cafe: { category: 'fnb', icon: 'local_cafe', labelKey: 'listingMap.subTypes.cafe' },
  localEatery: {
    category: 'fnb',
    icon: 'ramen_dining',
    labelKey: 'listingMap.subTypes.localEatery',
  },
  barPub: { category: 'fnb', icon: 'local_bar', labelKey: 'listingMap.subTypes.barPub' },
  hotel: { category: 'hotel', icon: 'hotel', labelKey: 'listingMap.subTypes.hotel' },
  resort: { category: 'hotel', icon: 'beach_access', labelKey: 'listingMap.subTypes.resort' },
  homestay: { category: 'hotel', icon: 'cottage', labelKey: 'listingMap.subTypes.homestay' },
  villa: { category: 'hotel', icon: 'villa', labelKey: 'listingMap.subTypes.villa' },
  amusementPark: {
    category: 'attraction',
    icon: 'attractions',
    labelKey: 'listingMap.subTypes.amusementPark',
  },
  park: { category: 'attraction', icon: 'park', labelKey: 'listingMap.subTypes.park' },
  scenicSpot: {
    category: 'attraction',
    icon: 'landscape',
    labelKey: 'listingMap.subTypes.scenicSpot',
  },
  checkinSpot: {
    category: 'attraction',
    icon: 'photo_camera',
    labelKey: 'listingMap.subTypes.checkinSpot',
  },
  nightMarket: {
    category: 'shopping',
    icon: 'storefront',
    labelKey: 'listingMap.subTypes.nightMarket',
  },
  specialtyStore: {
    category: 'shopping',
    icon: 'shopping_basket',
    labelKey: 'listingMap.subTypes.specialtyStore',
  },
  souvenirShop: {
    category: 'shopping',
    icon: 'redeem',
    labelKey: 'listingMap.subTypes.souvenirShop',
  },
  craftVillage: {
    category: 'shopping',
    icon: 'handyman',
    labelKey: 'listingMap.subTypes.craftVillage',
  },
};

/** Loại hình con theo nhóm, theo thứ tự hiển thị */
export const LISTING_SUBTYPES_BY_CATEGORY: Record<ListingCategory, ListingSubType[]> = {
  fnb: ['restaurant', 'cafe', 'localEatery', 'barPub'],
  hotel: ['hotel', 'resort', 'homestay', 'villa'],
  attraction: ['amusementPark', 'park', 'scenicSpot', 'checkinSpot'],
  shopping: ['nightMarket', 'specialtyStore', 'souvenirShop', 'craftVillage'],
};

/** Nhãn loại hình con theo ngôn ngữ đang chọn, ví dụ "Quán cafe" */
export const getSubTypeLabel = (subType: ListingSubType): string =>
  i18n.t(LISTING_SUBTYPE_CONFIG[subType].labelKey);

export const getListingSubTypeLabel = (listing: Pick<Listing, 'subType'>): string =>
  getSubTypeLabel(listing.subType);

export const getListingSubTypeIcon = (listing: Pick<Listing, 'subType'>): string =>
  LISTING_SUBTYPE_CONFIG[listing.subType].icon;

// ===== Lựa chọn dạng chip =====
export const LISTING_AMENITY_CONFIG: Record<
  ListingAmenity,
  { icon: string; labelKey: TranslationKey }
> = {
  parking: { icon: 'local_parking', labelKey: 'listingMap.amenities.parking' },
  airConditioning: { icon: 'ac_unit', labelKey: 'listingMap.amenities.airConditioning' },
  bankTransfer: { icon: 'qr_code_2', labelKey: 'listingMap.amenities.bankTransfer' },
  wifi: { icon: 'wifi', labelKey: 'listingMap.amenities.wifi' },
  outdoorSeating: { icon: 'deck', labelKey: 'listingMap.amenities.outdoorSeating' },
  pool: { icon: 'pool', labelKey: 'listingMap.amenities.pool' },
  petFriendly: { icon: 'pets', labelKey: 'listingMap.amenities.petFriendly' },
  breakfast: { icon: 'free_breakfast', labelKey: 'listingMap.amenities.breakfast' },
};

export const SHOPPING_SERVICE_CONFIG: Record<
  ShoppingService,
  { icon: string; labelKey: TranslationKey }
> = {
  giftWrapping: { icon: 'inventory_2', labelKey: 'listingMap.services.giftWrapping' },
  delivery: { icon: 'local_shipping', labelKey: 'listingMap.services.delivery' },
};

// ===== Bộ trường theo nhóm =====
type TextFieldKey =
  | 'description'
  | 'phone'
  | 'website'
  | 'openingHours'
  | 'checkInOut'
  | 'priceRange'
  | 'highlights'
  | 'externalBooking'
  | 'visitRules'
  | 'bestTime';

export type ListingMapField =
  | {
      kind: 'text' | 'textarea';
      key: TextFieldKey;
      icon: string;
      labelKey: TranslationKey;
      placeholderKey: TranslationKey;
    }
  | {
      kind: 'amenities';
      key: 'amenities';
      icon: string;
      labelKey: TranslationKey;
      options: ListingAmenity[];
    }
  | {
      kind: 'services';
      key: 'services';
      icon: string;
      labelKey: TranslationKey;
      options: ShoppingService[];
    };

export const LISTING_MAP_FIELDS: Record<ListingCategory, ListingMapField[]> = {
  fnb: [
    {
      kind: 'textarea',
      key: 'description',
      icon: 'info',
      labelKey: 'listingMap.fields.introFood',
      placeholderKey: 'listingMap.placeholders.introFood',
    },
    {
      kind: 'text',
      key: 'openingHours',
      icon: 'schedule',
      labelKey: 'listingMap.fields.openingHours',
      placeholderKey: 'listingMap.placeholders.openingHours',
    },
    {
      kind: 'text',
      key: 'priceRange',
      icon: 'payments',
      labelKey: 'listingMap.fields.priceRange',
      placeholderKey: 'listingMap.placeholders.foodPrice',
    },
    {
      kind: 'textarea',
      key: 'highlights',
      icon: 'menu_book',
      labelKey: 'listingMap.fields.signatureDishes',
      placeholderKey: 'listingMap.placeholders.signatureDishes',
    },
    {
      kind: 'amenities',
      key: 'amenities',
      icon: 'checklist',
      labelKey: 'listingMap.fields.amenities',
      options: ['parking', 'airConditioning', 'bankTransfer', 'wifi', 'outdoorSeating'],
    },
    {
      kind: 'text',
      key: 'phone',
      icon: 'call',
      labelKey: 'listingMap.fields.phone',
      placeholderKey: 'listingMap.placeholders.phone',
    },
    {
      kind: 'text',
      key: 'website',
      icon: 'language',
      labelKey: 'listingMap.fields.website',
      placeholderKey: 'listingMap.placeholders.website',
    },
  ],
  hotel: [
    {
      kind: 'textarea',
      key: 'description',
      icon: 'info',
      labelKey: 'listingMap.fields.introStay',
      placeholderKey: 'listingMap.placeholders.introStay',
    },
    {
      kind: 'text',
      key: 'priceRange',
      icon: 'payments',
      labelKey: 'listingMap.fields.pricePerNight',
      placeholderKey: 'listingMap.placeholders.pricePerNight',
    },
    {
      kind: 'text',
      key: 'checkInOut',
      icon: 'schedule',
      labelKey: 'listingMap.fields.checkInOut',
      placeholderKey: 'listingMap.placeholders.checkInOut',
    },
    {
      kind: 'amenities',
      key: 'amenities',
      icon: 'checklist',
      labelKey: 'listingMap.fields.amenities',
      options: ['wifi', 'pool', 'petFriendly', 'parking', 'breakfast', 'airConditioning'],
    },
    {
      kind: 'text',
      key: 'externalBooking',
      icon: 'call',
      labelKey: 'listingMap.fields.externalBooking',
      placeholderKey: 'listingMap.placeholders.externalBooking',
    },
    {
      kind: 'text',
      key: 'phone',
      icon: 'call',
      labelKey: 'listingMap.fields.phone',
      placeholderKey: 'listingMap.placeholders.phone',
    },
  ],
  attraction: [
    {
      kind: 'textarea',
      key: 'description',
      icon: 'info',
      labelKey: 'listingMap.fields.introAttraction',
      placeholderKey: 'listingMap.placeholders.introAttraction',
    },
    {
      kind: 'text',
      key: 'openingHours',
      icon: 'schedule',
      labelKey: 'listingMap.fields.openingHours',
      placeholderKey: 'listingMap.placeholders.openingHours',
    },
    {
      kind: 'text',
      key: 'priceRange',
      icon: 'confirmation_number',
      labelKey: 'listingMap.fields.ticketPrice',
      placeholderKey: 'listingMap.placeholders.ticketPrice',
    },
    {
      kind: 'textarea',
      key: 'visitRules',
      icon: 'gavel',
      labelKey: 'listingMap.fields.visitRules',
      placeholderKey: 'listingMap.placeholders.visitRules',
    },
    {
      kind: 'text',
      key: 'bestTime',
      icon: 'wb_twilight',
      labelKey: 'listingMap.fields.bestTime',
      placeholderKey: 'listingMap.placeholders.bestTime',
    },
    {
      kind: 'text',
      key: 'phone',
      icon: 'call',
      labelKey: 'listingMap.fields.phone',
      placeholderKey: 'listingMap.placeholders.phone',
    },
    {
      kind: 'text',
      key: 'website',
      icon: 'language',
      labelKey: 'listingMap.fields.website',
      placeholderKey: 'listingMap.placeholders.website',
    },
  ],
  shopping: [
    {
      kind: 'textarea',
      key: 'description',
      icon: 'info',
      labelKey: 'listingMap.fields.introShop',
      placeholderKey: 'listingMap.placeholders.introShop',
    },
    {
      kind: 'text',
      key: 'openingHours',
      icon: 'schedule',
      labelKey: 'listingMap.fields.openingHours',
      placeholderKey: 'listingMap.placeholders.openingHours',
    },
    {
      kind: 'textarea',
      key: 'highlights',
      icon: 'redeem',
      labelKey: 'listingMap.fields.mainProducts',
      placeholderKey: 'listingMap.placeholders.mainProducts',
    },
    {
      kind: 'text',
      key: 'priceRange',
      icon: 'payments',
      labelKey: 'listingMap.fields.averagePrice',
      placeholderKey: 'listingMap.placeholders.averagePrice',
    },
    {
      kind: 'services',
      key: 'services',
      icon: 'local_shipping',
      labelKey: 'listingMap.fields.services',
      options: ['giftWrapping', 'delivery'],
    },
    {
      kind: 'text',
      key: 'phone',
      icon: 'call',
      labelKey: 'listingMap.fields.phone',
      placeholderKey: 'listingMap.placeholders.phone',
    },
  ],
};

/** Số trường đã điền / tổng số trường của nhóm — dùng cho badge "Đã điền 6/8" */
export function countFilledMapFields(category: ListingCategory, info: ListingMapInfo) {
  const fields = LISTING_MAP_FIELDS[category];
  const filled = fields.filter((field) => {
    const value = info[field.key];
    return Array.isArray(value) ? value.length > 0 : Boolean(value?.trim());
  }).length;
  return { filled, total: fields.length };
}
