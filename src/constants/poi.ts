import i18n from 'i18next';
import type {
  ListingCategory,
  PoiCategory,
  PoiCategoryTab,
  PoiFilters,
  PoiFormValues,
  PoiKpiGroup,
  PoiProvince,
  PoiSource,
  PoiStatus,
  SelectOption,
} from '@/types';
import { linkedOption, localizeConfig, localizedOption } from '@/utils/localize';
import { LISTING_CATEGORY_CONFIG } from './listing';

export const POI_CATEGORY_CONFIG: Record<
  PoiCategory,
  {
    /** Nhãn trong ô chọn "Danh mục chính" của form */
    label: string;
    /** Nhãn ngắn ở bảng khi POI chưa có danh mục phụ */
    shortLabel: string;
    icon: string;
    badgeClass: string;
    /** Nhóm địa điểm (tab lọc + thẻ KPI) */
    group: ListingCategory;
  }
> = localizeConfig(
  'category.poi',
  {
    heritage: {
      label: 'Di tích & Di sản văn hóa UNESCO',
      shortLabel: 'Di sản văn hóa',
      icon: 'account_balance',
      badgeClass: 'bg-secondary-container/50 text-on-secondary-container',
      group: 'attraction',
    },
    nature: {
      label: 'Thiên nhiên & Danh lam thắng cảnh',
      shortLabel: 'Thiên nhiên',
      icon: 'landscape',
      badgeClass: 'bg-surface-container-highest text-primary',
      group: 'attraction',
    },
    food: {
      label: 'Ẩm thực địa phương',
      shortLabel: 'Ẩm thực truyền thống',
      icon: 'restaurant',
      badgeClass: 'bg-tertiary-fixed/60 text-on-tertiary-fixed',
      group: 'fnb',
    },
    resort: {
      label: 'Nghỉ dưỡng & Sinh thái biển',
      shortLabel: 'Nghỉ dưỡng biển',
      icon: 'beach_access',
      badgeClass: 'bg-surface-container-highest text-primary',
      group: 'hotel',
    },
    stay: {
      label: 'Lưu trú & Homestay / Khách sạn',
      shortLabel: 'Lưu trú',
      icon: 'hotel',
      badgeClass: 'bg-primary-fixed/60 text-on-primary-fixed-variant',
      group: 'hotel',
    },
    craft: {
      label: 'Mua sắm & Làng nghề truyền thống',
      shortLabel: 'Làng nghề & Văn hóa',
      icon: 'architecture',
      badgeClass: 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant',
      group: 'shopping',
    },
  },
  ['label', 'shortLabel'],
);

export const POI_CATEGORY_OPTIONS: SelectOption<PoiCategory>[] = (
  Object.keys(POI_CATEGORY_CONFIG) as PoiCategory[]
).map((category) => linkedOption(category, () => POI_CATEGORY_CONFIG[category].label));

const POI_GROUPS: ListingCategory[] = ['attraction', 'fnb', 'hotel', 'shopping'];

export const POI_CATEGORY_TABS: { id: PoiCategoryTab; label: string }[] = [
  {
    id: 'all',
    get label() {
      return i18n.t('pois.constants.all');
    },
  },
  ...POI_GROUPS.map((group) => ({
    id: group,
    get label() {
      return LISTING_CATEGORY_CONFIG[group].label;
    },
  })),
];

export const POI_KPI_GROUP_CONFIG: Record<
  PoiKpiGroup,
  { label: string; icon: string; iconBoxClass: string; barClass: string; percentClass: string }
> = {
  attraction: {
    get label() {
      return LISTING_CATEGORY_CONFIG.attraction.label;
    },
    icon: 'account_balance',
    iconBoxClass: 'bg-secondary-container/60 text-secondary',
    barClass: 'bg-secondary',
    percentClass: 'text-secondary',
  },
  fnb: {
    get label() {
      return LISTING_CATEGORY_CONFIG.fnb.label;
    },
    icon: 'restaurant',
    iconBoxClass: 'bg-tertiary-fixed/60 text-tertiary',
    barClass: 'bg-tertiary',
    percentClass: 'text-tertiary',
  },
  hotel: {
    get label() {
      return LISTING_CATEGORY_CONFIG.hotel.label;
    },
    icon: 'hotel',
    iconBoxClass: 'bg-surface-container-highest text-primary',
    barClass: 'bg-primary-container',
    percentClass: 'text-primary',
  },
  shopping: {
    get label() {
      return LISTING_CATEGORY_CONFIG.shopping.label;
    },
    icon: 'shopping_bag',
    iconBoxClass: 'bg-error-container/40 text-error',
    barClass: 'bg-error',
    percentClass: 'text-error',
  },
};

export const POI_STATUS_CONFIG: Record<
  PoiStatus,
  {
    /** Nhãn ngắn ở bảng */
    label: string;
    /** Nhãn đầy đủ ở màn chỉnh sửa */
    longLabel: string;
    badgeClass: string;
    dotClass: string;
  }
> = localizeConfig(
  'status.poi',
  {
    active: {
      label: 'Công khai',
      longLabel: 'Đang công khai trên hệ thống',
      badgeClass: 'bg-secondary-container text-on-secondary-container',
      dotClass: 'bg-primary',
    },
    maintenance: {
      label: 'Đang bảo trì',
      longLabel: 'Đang bảo trì, tạm ngưng đón khách',
      badgeClass: 'bg-surface-container-high text-on-surface-variant',
      dotClass: 'bg-outline',
    },
    paused: {
      label: 'Tạm dừng',
      longLabel: 'Tạm dừng hiển thị trên ứng dụng',
      badgeClass: 'bg-tertiary-fixed/60 text-on-tertiary-fixed-variant',
      dotClass: 'bg-tertiary',
    },
    draft: {
      label: 'Bản nháp',
      longLabel: 'Bản nháp, chưa công khai',
      badgeClass: 'bg-surface-container text-outline',
      dotClass: 'bg-outline-variant',
    },
  },
  ['label', 'longLabel'],
);

export const POI_STATUS_OPTIONS: SelectOption<PoiStatus>[] = [
  localizedOption('active', 'status.poi.active.option', 'Đang công khai'),
  localizedOption('maintenance', 'status.poi.maintenance.option', 'Đang bảo trì'),
  localizedOption('paused', 'status.poi.paused.option', 'Tạm dừng'),
  localizedOption('draft', 'status.poi.draft.option', 'Bản nháp'),
];

export const POI_SOURCE_CONFIG: Record<
  PoiSource,
  { label: string; filterLabel: string; icon: string; textClass: string; iconClass: string }
> = {
  gov: {
    get label() {
      return i18n.t('pois.constants.nationalTourismAdministration');
    },
    get filterLabel() {
      return i18n.t('pois.constants.nationalTourismAdministration');
    },
    icon: 'policy',
    textClass: 'font-semibold text-primary',
    iconClass: '',
  },
  openData: {
    get label() {
      return i18n.t('pois.constants.openDataOsm');
    },
    get filterLabel() {
      return i18n.t('pois.constants.openDataOpenStreetMap');
    },
    icon: 'public',
    textClass: 'font-semibold text-secondary',
    iconClass: '',
  },
  authority: {
    get label() {
      return i18n.t('pois.constants.managementBoard');
    },
    get filterLabel() {
      return i18n.t('pois.constants.heritageSiteLocalManagement');
    },
    icon: 'shield',
    textClass: 'font-medium text-on-surface',
    iconClass: 'text-primary',
  },
  partner: {
    get label() {
      return i18n.t('pois.constants.partnerSubmission');
    },
    get filterLabel() {
      return i18n.t('pois.constants.partnerSubmission');
    },
    icon: 'storefront',
    textClass: 'font-semibold text-tertiary',
    iconClass: '',
  },
  system: {
    get label() {
      return i18n.t('pois.constants.system');
    },
    get filterLabel() {
      return i18n.t('pois.constants.verifiedBySystem');
    },
    icon: 'database',
    textClass: 'font-semibold text-on-surface-variant',
    iconClass: '',
  },
};

export const POI_SOURCE_OPTIONS: SelectOption<PoiSource>[] = (
  ['system', 'partner', 'openData', 'gov', 'authority'] as PoiSource[]
).map((source) => ({ value: source, label: POI_SOURCE_CONFIG[source].filterLabel }));

export const POI_PROVINCE_LABELS: Record<PoiProvince, string> = {
  get 'quang-nam'() {
    return i18n.t('pois.constants.quangNam');
  },
  get 'da-nang'() {
    return i18n.t('pois.constants.daNang');
  },
  get 'ha-noi'() {
    return i18n.t('pois.constants.hanoi');
  },
  get 'quang-ninh'() {
    return i18n.t('pois.constants.quangNinh');
  },
  get hcm() {
    return i18n.t('pois.constants.hoChiMinhCity');
  },
  get 'lao-cai'() {
    return i18n.t('pois.constants.laoCaiSaPa');
  },
  get 'thua-thien-hue'() {
    return i18n.t('pois.constants.thuaThienHue');
  },
  get 'kien-giang'() {
    return i18n.t('pois.constants.kienGiangPhuQuoc');
  },
};

export const POI_PROVINCE_OPTIONS: SelectOption<PoiProvince>[] = (
  Object.keys(POI_PROVINCE_LABELS) as PoiProvince[]
).map((province) => ({ value: province, label: POI_PROVINCE_LABELS[province] }));

export const DEFAULT_POI_FILTERS: PoiFilters = {
  search: '',
  province: 'all',
  status: 'all',
  source: 'all',
};

export const POI_PAGE_SIZE_OPTIONS = [6, 10, 25, 50] as const;

/** Gợi ý đối tượng phù hợp khi bấm "Thêm" */
export const POI_PERSONA_SUGGESTIONS = [
  'Cặp đôi',
  'Gia đình',
  'Khách quốc tế',
  'Nhiếp ảnh',
  'Phượt thủ',
  'Người cao tuổi',
  'Học sinh - Sinh viên',
];

export const POI_MAX_PHOTOS = 12;
export const POI_CLUSTER_RADIUS = { min: 100, max: 1100, step: 50 };

export const EMPTY_POI_VALUES: PoiFormValues = {
  vectorEmbedded: false,
  name: '',
  category: 'heritage',
  tags: '',
  description: '',
  price: '',
  openingHours: '',
  suggestedDuration: '',
  gallery: [],
  managingUnit: '',
  hotline: '',
  website: '',
  email: '',
  province: 'quang-nam',
  address: '',
  latitude: 15.8777,
  longitude: 108.3262,
  clusterRadius: 500,
  clusterPois: [],
  peakSeason: '',
  idealTime: '',
  personas: [],
  status: 'draft',
};
