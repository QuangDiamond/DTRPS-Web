import type {
  PoiCategory,
  PoiCategoryTab,
  PoiFilters,
  PoiFormValues,
  PoiKpiGroup,
  PoiProvince,
  PoiSource,
  PoiStatus,
  SelectOption,
} from '../types/admin';

export const POI_CATEGORY_CONFIG: Record<
  PoiCategory,
  {
    /** Nhãn trong ô chọn "Danh mục chính" của form */
    label: string;
    /** Nhãn ngắn ở bảng khi POI chưa có danh mục phụ */
    shortLabel: string;
    icon: string;
    badgeClass: string;
    tab: Exclude<PoiCategoryTab, 'all'> | null;
    kpiGroup: PoiKpiGroup;
  }
> = {
  heritage: {
    label: 'Di tích & Di sản văn hóa UNESCO',
    shortLabel: 'Di sản văn hóa',
    icon: 'account_balance',
    badgeClass: 'bg-secondary-container/50 text-on-secondary-container',
    tab: 'heritage',
    kpiGroup: 'sights',
  },
  nature: {
    label: 'Thiên nhiên & Danh lam thắng cảnh',
    shortLabel: 'Thiên nhiên',
    icon: 'landscape',
    badgeClass: 'bg-surface-container-highest text-primary',
    tab: 'nature',
    kpiGroup: 'sights',
  },
  food: {
    label: 'Ẩm thực & Chợ truyền thống',
    shortLabel: 'Ẩm thực truyền thống',
    icon: 'restaurant',
    badgeClass: 'bg-tertiary-fixed/60 text-on-tertiary-fixed',
    tab: 'food',
    kpiGroup: 'food',
  },
  resort: {
    label: 'Nghỉ dưỡng & Sinh thái biển',
    shortLabel: 'Nghỉ dưỡng biển',
    icon: 'beach_access',
    badgeClass: 'bg-surface-container-highest text-primary',
    tab: 'nature',
    kpiGroup: 'sights',
  },
  stay: {
    label: 'Lưu trú & Homestay / Khách sạn',
    shortLabel: 'Lưu trú',
    icon: 'hotel',
    badgeClass: 'bg-primary-fixed/60 text-on-primary-fixed-variant',
    tab: 'stay',
    kpiGroup: 'stay',
  },
  craft: {
    label: 'Mua sắm & Làng nghề truyền thống',
    shortLabel: 'Làng nghề & Văn hóa',
    icon: 'architecture',
    badgeClass: 'bg-tertiary-fixed/40 text-on-tertiary-fixed-variant',
    tab: 'craft',
    kpiGroup: 'sights',
  },
  tour: {
    label: 'Tour & Trải nghiệm',
    shortLabel: 'Tour & Trải nghiệm',
    icon: 'kayaking',
    badgeClass: 'bg-surface-container-high text-on-surface',
    tab: null,
    kpiGroup: 'tour',
  },
};

export const POI_CATEGORY_OPTIONS: SelectOption<PoiCategory>[] = (
  Object.keys(POI_CATEGORY_CONFIG) as PoiCategory[]
).map((category) => ({ value: category, label: POI_CATEGORY_CONFIG[category].label }));

export const POI_CATEGORY_TABS: { id: PoiCategoryTab; label: string }[] = [
  { id: 'all', label: 'Tất cả' },
  { id: 'heritage', label: 'Điểm tham quan & Di tích' },
  { id: 'food', label: 'Ẩm thực & Nhà hàng' },
  { id: 'stay', label: 'Lưu trú & Homestay/Khách sạn' },
  { id: 'nature', label: 'Bãi biển & Thiên nhiên' },
  { id: 'craft', label: 'Mua sắm & Làng nghề truyền thống' },
];

export const POI_KPI_GROUP_CONFIG: Record<
  PoiKpiGroup,
  { label: string; icon: string; iconBoxClass: string; barClass: string; percentClass: string }
> = {
  sights: {
    label: 'Tham quan & Di sản',
    icon: 'account_balance',
    iconBoxClass: 'bg-secondary-container/60 text-secondary',
    barClass: 'bg-secondary',
    percentClass: 'text-secondary',
  },
  food: {
    label: 'Nhà hàng & Ẩm thực',
    icon: 'restaurant',
    iconBoxClass: 'bg-tertiary-fixed/60 text-tertiary',
    barClass: 'bg-tertiary',
    percentClass: 'text-tertiary',
  },
  stay: {
    label: 'Lưu trú & Khách sạn',
    icon: 'hotel',
    iconBoxClass: 'bg-surface-container-highest text-primary',
    barClass: 'bg-primary-container',
    percentClass: 'text-primary',
  },
  tour: {
    label: 'Tour & Trải nghiệm',
    icon: 'kayaking',
    iconBoxClass: 'bg-surface-container-high text-on-surface',
    barClass: 'bg-on-surface-variant',
    percentClass: 'text-on-surface',
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
> = {
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
};

export const POI_STATUS_OPTIONS: SelectOption<PoiStatus>[] = [
  { value: 'active', label: 'Đang công khai' },
  { value: 'maintenance', label: 'Đang bảo trì' },
  { value: 'paused', label: 'Tạm dừng' },
  { value: 'draft', label: 'Bản nháp' },
];

export const POI_SOURCE_CONFIG: Record<
  PoiSource,
  { label: string; filterLabel: string; icon: string; textClass: string; iconClass: string }
> = {
  gov: {
    label: 'Tổng cục Du lịch',
    filterLabel: 'Tổng cục Du lịch',
    icon: 'policy',
    textClass: 'font-semibold text-primary',
    iconClass: '',
  },
  ai: {
    label: 'AI đã xác minh',
    filterLabel: 'Thu thập dữ liệu AI',
    icon: 'auto_awesome',
    textClass: 'font-semibold text-secondary',
    iconClass: '',
  },
  authority: {
    label: 'Ban quản lý',
    filterLabel: 'Ban quản lý di tích / địa phương',
    icon: 'shield',
    textClass: 'font-medium text-on-surface',
    iconClass: 'text-primary',
  },
  partner: {
    label: 'Đối tác gửi duyệt',
    filterLabel: 'Đối tác gửi duyệt',
    icon: 'storefront',
    textClass: 'font-semibold text-tertiary',
    iconClass: '',
  },
  system: {
    label: 'Hệ thống',
    filterLabel: 'Hệ thống xác thực',
    icon: 'database',
    textClass: 'font-semibold text-on-surface-variant',
    iconClass: '',
  },
};

export const POI_SOURCE_OPTIONS: SelectOption<PoiSource>[] = (
  ['system', 'partner', 'ai', 'gov', 'authority'] as PoiSource[]
).map((source) => ({ value: source, label: POI_SOURCE_CONFIG[source].filterLabel }));

export const POI_PROVINCE_LABELS: Record<PoiProvince, string> = {
  'quang-nam': 'Quảng Nam',
  'da-nang': 'Đà Nẵng',
  'ha-noi': 'Hà Nội',
  'quang-ninh': 'Quảng Ninh',
  hcm: 'TP. Hồ Chí Minh',
  'lao-cai': 'Lào Cai (Sa Pa)',
  'thua-thien-hue': 'Thừa Thiên Huế',
  'kien-giang': 'Kiên Giang (Phú Quốc)',
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
  name: '',
  category: 'heritage',
  tags: '',
  description: '',
  price: '',
  openingHours: '',
  suggestedDuration: '',
  aiRecommendedHours: 0,
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
  priorityScore: 70,
  personas: [],
  status: 'draft',
};
