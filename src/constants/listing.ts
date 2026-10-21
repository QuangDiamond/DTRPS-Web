import i18n from 'i18next';
import type {
  ApprovedListingFilters,
  TranslationKey,
  ApprovedSortOption,
  ListingCategory,
  ListingFilters,
  ListingPriority,
  ListingStatus,
  ListingVisibility,
  PartnerTier,
  ProvinceCode,
  RejectedListingFilters,
  RejectionReason,
  RejectionReasonCode,
  ResubmissionStatus,
  SelectOption,
} from '@/types';
import { linkedOption, localizeConfig, localizedOption } from '@/utils/localize';
import { PROVINCE_LABELS } from './partner';

// ===== Danh mục =====
interface ListingCategoryConfig {
  /** Icon mặc định khi gán danh mục / thêm thủ công */
  defaultIcon: string;
  /** Nhãn ngắn (bảng ở Bảng điều khiển) */
  label: string;
  /** Nhãn trong bộ lọc */
  filterLabel: string;
  /** Badge ngắn (bảng ở Bảng điều khiển) */
  badgeClass: string;
  /** Badge bo tròn (bảng Quản lý niêm yết) */
  pillClass: string;
  /** Ô icon cơ sở */
  iconBoxClass: string;
}

export const LISTING_CATEGORY_CONFIG: Record<ListingCategory, ListingCategoryConfig> =
  localizeConfig(
    'category.listing',
    {
      hotel: {
        defaultIcon: 'cottage',
        label: 'Khách sạn',
        filterLabel: 'Khách sạn / Homestay',
        badgeClass: 'bg-secondary-container/60 text-on-secondary-container',
        pillClass: 'bg-secondary-container text-on-secondary-container',
        iconBoxClass: 'bg-secondary-container/40 text-primary',
      },
      fnb: {
        defaultIcon: 'restaurant',
        label: 'Ẩm thực',
        filterLabel: 'Nhà hàng / Ẩm thực',
        badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
        pillClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
        iconBoxClass: 'bg-tertiary-fixed/60 text-tertiary',
      },
      attraction: {
        defaultIcon: 'attractions',
        label: 'Tham quan',
        filterLabel: 'Điểm tham quan / Di tích',
        badgeClass: 'bg-surface-container-highest text-on-surface',
        pillClass: 'bg-surface-container-high text-on-surface',
        iconBoxClass: 'bg-surface-container-high text-primary',
      },
      tour: {
        defaultIcon: 'tour',
        label: 'Tour',
        filterLabel: 'Trải nghiệm & Tour',
        badgeClass: 'bg-surface-container-high text-primary',
        pillClass: 'bg-primary-fixed text-on-primary-fixed',
        iconBoxClass: 'bg-surface-container-high text-primary',
      },
      shopping: {
        defaultIcon: 'shopping_bag',
        label: 'Mua sắm',
        filterLabel: 'Mua sắm đặc sản',
        badgeClass: 'bg-error-container/60 text-on-error-container',
        pillClass: 'bg-error-container/60 text-on-error-container',
        iconBoxClass: 'bg-error-container/40 text-error',
      },
    },
    ['label', 'filterLabel'],
  );

const LISTING_CATEGORIES = Object.keys(LISTING_CATEGORY_CONFIG) as ListingCategory[];

/** Bộ lọc gọn (Bảng điều khiển) */
export const LISTING_CATEGORY_FILTER_OPTIONS: SelectOption<ListingCategory | 'all'>[] = [
  localizedOption('all', 'filters.allCategories', 'Tất cả danh mục'),
  ...LISTING_CATEGORIES.map((category) =>
    linkedOption(category, () => LISTING_CATEGORY_CONFIG[category].label),
  ),
];

/** Bộ lọc đầy đủ (Quản lý niêm yết) */
export const LISTING_CATEGORY_SELECT_OPTIONS: SelectOption<ListingCategory | 'all'>[] = [
  localizedOption('all', 'filters.allCategories', 'Tất cả danh mục'),
  ...LISTING_CATEGORIES.map((category) =>
    linkedOption(category, () => LISTING_CATEGORY_CONFIG[category].filterLabel),
  ),
];

// ===== Trạng thái =====
interface ListingStatusConfig {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const LISTING_STATUS_CONFIG: Record<ListingStatus, ListingStatusConfig> = localizeConfig(
  'status.listing',
  {
    pending: {
      label: 'Chờ duyệt',
      badgeClass: 'bg-tertiary-fixed text-on-tertiary-fixed',
      dotClass: 'bg-tertiary animate-pulse',
    },
    approved: {
      label: 'Đã duyệt',
      badgeClass: 'bg-secondary-container text-on-secondary-container',
      dotClass: 'bg-primary',
    },
    rejected: {
      label: 'Từ chối',
      badgeClass: 'bg-error-container text-on-error-container',
      dotClass: 'bg-error',
    },
  },
  ['label'],
);

// ===== Hạng đối tác =====
export const PARTNER_TIER_CONFIG: Record<PartnerTier, { label: string; className: string }> = {
  diamond: {
    get label() {
      return i18n.t('listings.constants.diamondPartner');
    },
    className: 'font-medium text-primary',
  },
  individual: {
    get label() {
      return i18n.t('listings.constants.soleProprietorship');
    },
    className: 'text-on-surface-variant',
  },
  gold: {
    get label() {
      return i18n.t('listings.constants.goldPartner');
    },
    className: 'font-medium text-tertiary',
  },
  verified: {
    get label() {
      return i18n.t('listings.constants.verifiedPartner');
    },
    className: 'text-on-surface-variant',
  },
  new: {
    get label() {
      return i18n.t('listings.constants.newPartner');
    },
    className: 'text-on-surface-variant',
  },
  public: {
    get label() {
      return i18n.t('listings.constants.publicOrganization');
    },
    className: 'font-medium text-primary',
  },
};

export const PARTNER_TIER_OPTIONS: SelectOption<PartnerTier | 'all'>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('listings.constants.allPartners');
    },
  },
  {
    value: 'diamond',
    get label() {
      return i18n.t('listings.constants.diamondPartner');
    },
  },
  {
    value: 'gold',
    get label() {
      return i18n.t('listings.constants.strategicPartnerGold');
    },
  },
  {
    value: 'verified',
    get label() {
      return i18n.t('listings.constants.verifiedPartner');
    },
  },
  {
    value: 'new',
    get label() {
      return i18n.t('listings.constants.newlyRegisteredPartner');
    },
  },
  {
    value: 'public',
    get label() {
      return i18n.t('listings.constants.publicOrganization');
    },
  },
  {
    value: 'individual',
    get label() {
      return i18n.t('listings.constants.soleProprietorship');
    },
  },
];

/** Badge hạng đối tác trong bảng Địa điểm đã duyệt (null = chỉ hiện dòng chữ) */
export const PARTNER_TIER_BADGE: Record<
  PartnerTier,
  { label: string; icon?: string; className?: string }
> = {
  diamond: {
    get label() {
      return i18n.t('listings.constants.diamondPartner');
    },
    icon: 'diamond',
    className: 'bg-primary-fixed text-on-primary-fixed-variant',
  },
  gold: {
    get label() {
      return i18n.t('listings.constants.goldPartner');
    },
    icon: 'hotel_class',
    className: 'bg-tertiary-fixed text-on-tertiary-fixed',
  },
  verified: {
    get label() {
      return i18n.t('listings.constants.verified');
    },
    icon: 'verified',
    className: 'bg-secondary-container/70 text-on-secondary-container',
  },
  public: {
    get label() {
      return i18n.t('listings.constants.publicOrganization');
    },
    icon: 'account_balance',
    className: 'bg-surface-container-high text-primary',
  },
  new: {
    get label() {
      return i18n.t('listings.constants.newPartner2');
    },
    icon: 'new_releases',
    className: 'bg-surface-container-high text-on-surface-variant',
  },
  individual: {
    get label() {
      return i18n.t('listings.constants.idVerified');
    },
  },
};

// ===== Tỉnh thành & mức độ ưu tiên =====
export const LISTING_PROVINCE_OPTIONS: SelectOption<ProvinceCode | 'all'>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('listings.constants.nationwideProvinceCity');
    },
  },
  ...(['quangnam', 'danang', 'hanoi', 'ninhbinh', 'kiengiang'] as ProvinceCode[]).map((province) =>
    linkedOption(province, () => PROVINCE_LABELS[province]),
  ),
];

export const LISTING_PRIORITY_OPTIONS: SelectOption<ListingPriority>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('listings.constants.allPriorities');
    },
  },
  {
    value: 'overdue',
    get label() {
      return i18n.t('listings.constants.waitingOver24hUrgent');
    },
  },
  {
    value: 'medium',
    get label() {
      return i18n.t('listings.constants.waiting212h');
    },
  },
  {
    value: 'today',
    get label() {
      return i18n.t('listings.constants.submittedToday');
    },
  },
];

export const DEFAULT_LISTING_FILTERS: ListingFilters = {
  keyword: '',
  category: 'all',
  province: 'all',
  tier: 'all',
  priority: 'all',
};

/** Hồ sơ chờ quá số giờ này bị coi là quá hạn */
export const LISTING_OVERDUE_HOURS = 24;

export const LISTING_PAGE_SIZE_OPTIONS = [5, 10, 25] as const;

// ===== Thẩm định =====

/** Checklist kiểm định chuẩn — dùng cho hồ sơ không có dữ liệu chi tiết */
export const DEFAULT_REVIEW_CHECKLIST = [
  {
    id: 'gps',
    get label() {
      return i18n.t('listings.constants.validGpsCoordinates');
    },
  },
  {
    id: 'zoning',
    get label() {
      return i18n.t('listings.constants.withinTourismZoningArea');
    },
  },
  {
    id: 'photos',
    get label() {
      return i18n.t('listings.constants.photosMeetResolutionStandard');
    },
  },
  {
    id: 'license',
    get label() {
      return i18n.t('listings.constants.licenseStillValid');
    },
  },
];

/** Trạng thái hiển thị trên banner màn Xem xét & Duyệt */
export const REVIEW_STATUS_BANNER: Record<
  ListingStatus,
  { label: string; badgeClass: string; dotClass: string }
> = {
  pending: {
    get label() {
      return i18n.t('listings.constants.pendingReview');
    },
    badgeClass: 'border-tertiary-fixed bg-tertiary-fixed/60 text-on-tertiary-fixed',
    dotClass: 'animate-pulse bg-tertiary-container',
  },
  approved: {
    get label() {
      return i18n.t('listings.constants.approved');
    },
    badgeClass:
      'border-secondary-fixed-dim/50 bg-secondary-container/60 text-on-secondary-fixed-variant',
    dotClass: 'bg-secondary',
  },
  rejected: {
    get label() {
      return i18n.t('listings.constants.rejected');
    },
    badgeClass: 'border-error-container bg-error-container/70 text-on-error-container',
    dotClass: 'bg-error',
  },
};

export const REVIEW_POLICIES = [
  {
    icon: 'gavel',
    get title() {
      return i18n.t('listings.constants.mandatoryLegalDocuments');
    },
    get description() {
      return i18n.t('listings.constants.everyBusinessMustHold');
    },
  },
  {
    icon: 'photo_library',
    get title() {
      return i18n.t('listings.constants.photosContent');
    },
    get description() {
      return i18n.t('listings.constants.atLeast5Real');
    },
  },
  {
    icon: 'schedule',
    get title() {
      return i18n.t('listings.constants.processingDeadline');
    },
    get description() {
      return i18n.t('listings.constants.submissionsMustReviewedWithin');
    },
  },
  {
    icon: 'report',
    get title() {
      return i18n.t('listings.constants.rejectProfile');
    },
    get description() {
      return i18n.t('listings.constants.aClearRejectionReason');
    },
  },
];

export const REJECTION_REASONS: RejectionReason[] = [
  {
    id: 'legal',
    get shortLabel() {
      return i18n.t('listings.constants.missingFireSafetyFood');
    },
    icon: 'local_fire_department',
    toneClass: 'text-error',
    get title() {
      return i18n.t('listings.constants.insufficientLegalDocumentationFood');
    },
    get description() {
      return i18n.t('listings.constants.theLicenseHasExpired');
    },
    get templateCause() {
      return i18n.t('listings.constants.theLegalLicensesFood');
    },
    get templateFix() {
      return i18n.t('listings.constants.uploadNewValidNotarized');
    },
  },
  {
    id: 'pricing',
    get shortLabel() {
      return i18n.t('listings.constants.incorrectBusinessRegistrationDetails');
    },
    icon: 'description',
    toneClass: 'text-error',
    get title() {
      return i18n.t('listings.constants.inaccurateBusinessInformationOr');
    },
    get description() {
      return i18n.t('listings.constants.thePublishedPriceList');
    },
    get templateCause() {
      return i18n.t('listings.constants.theBusinessInformationListed');
    },
    get templateFix() {
      return i18n.t('listings.constants.reviewUpdatePriceList');
    },
  },
  {
    id: 'location',
    get shortLabel() {
      return i18n.t('listings.constants.incorrectGpsCoordinates');
    },
    icon: 'wrong_location',
    toneClass: 'text-tertiary',
    get title() {
      return i18n.t('listings.constants.invalidLocationGpsCoordinates');
    },
    get description() {
      return i18n.t('listings.constants.theMapPinFar');
    },
    get templateCause() {
      return i18n.t('listings.constants.theGpsCoordinatesMap');
    },
    get templateFix() {
      return i18n.t('listings.constants.pinExactLocationBusiness');
    },
  },
  {
    id: 'photos',
    get shortLabel() {
      return i18n.t('listings.constants.poorQualityPhotosWatermarks');
    },
    icon: 'broken_image',
    toneClass: 'text-on-surface-variant',
    get title() {
      return i18n.t('listings.constants.poorQualityWatermarkedOr');
    },
    get description() {
      return i18n.t('listings.constants.theStorefrontOrSignage');
    },
    get templateCause() {
      return i18n.t('listings.constants.theStorefrontSignagePhotos');
    },
    get templateFix() {
      return i18n.t('listings.constants.retakeClearRealLife');
    },
  },
  {
    id: 'duplicate',
    get shortLabel() {
      return i18n.t('listings.constants.duplicatePlace');
    },
    icon: 'content_copy',
    toneClass: 'text-on-surface-variant',
    get title() {
      return i18n.t('listings.constants.duplicatesPlaceThatAlready');
    },
    get description() {
      return i18n.t('listings.constants.aPoiWithSame');
    },
    get templateCause() {
      return i18n.t('listings.constants.thePlaceDuplicatesExisting');
    },
    get templateFix() {
      return i18n.t('listings.constants.provideDocumentsProvingManagement');
    },
  },
  {
    id: 'other',
    get shortLabel() {
      return i18n.t('listings.constants.otherReason');
    },
    icon: 'info',
    toneClass: 'text-on-surface-variant',
    get title() {
      return i18n.t('listings.constants.otherReasonSeeFeedback');
    },
    get templateCause() {
      return i18n.t('listings.constants.itDoesNotYet');
    },
    get templateFix() {
      return i18n.t('listings.constants.addContentDescribedDetailed');
    },
  },
];

export const MAX_FEEDBACK_LENGTH = 500;

// ===== Địa điểm đã duyệt =====
export const VISIBILITY_FILTER_OPTIONS: SelectOption<ListingVisibility | 'all'>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('filters.userStatusAll');
    },
  },
  {
    value: 'visible',
    get label() {
      return i18n.t('listings.constants.visible');
    },
  },
  {
    value: 'hidden',
    get label() {
      return i18n.t('listings.constants.hidden');
    },
  },
];

export const APPROVED_SORT_OPTIONS: SelectOption<ApprovedSortOption>[] = [
  {
    value: 'recent',
    get label() {
      return i18n.t('listings.constants.recentlyApproved');
    },
  },
  {
    value: 'rating',
    get label() {
      return i18n.t('listings.constants.highestRated');
    },
  },
  {
    value: 'views',
    get label() {
      return i18n.t('listings.constants.mostViewed');
    },
  },
];

export const MIN_RATING_OPTIONS: SelectOption<string>[] = [
  {
    value: '0',
    get label() {
      return i18n.t('listings.constants.anyRating');
    },
  },
  {
    value: '4.5',
    get label() {
      return i18n.t('listings.constants.n45StarsUp');
    },
  },
  {
    value: '4',
    get label() {
      return i18n.t('listings.constants.n40StarsUp');
    },
  },
  {
    value: '3.5',
    get label() {
      return i18n.t('listings.constants.n35StarsUp');
    },
  },
];

export const DEFAULT_APPROVED_FILTERS: ApprovedListingFilters = {
  keyword: '',
  category: 'all',
  province: 'all',
  visibility: 'all',
  sort: 'recent',
  tier: 'all',
  minRating: 0,
};

/** Lý do tạm ẩn hay dùng — key bản dịch, hiển thị bằng t(key) */
export const HIDE_REASONS = [
  'listings.hideReasons.renovation',
  'listings.hideReasons.seasonalClosure',
  'listings.hideReasons.partnerRequest',
  'listings.hideReasons.investigatingFeedback',
] as const satisfies readonly TranslationKey[];

// ===== Địa điểm bị từ chối =====
/** Số ngày đối tác được bổ sung & gửi lại hồ sơ sau khi bị từ chối */
export const RESUBMIT_WINDOW_DAYS = 7;

export const REJECTION_REASON_FILTER_OPTIONS: SelectOption<RejectionReasonCode | 'all'>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('listings.constants.allRejectionReasons');
    },
  },
  ...REJECTION_REASONS.map((reason) => ({ value: reason.id, label: reason.shortLabel })),
];

export const RESUBMISSION_CONFIG: Record<
  ResubmissionStatus,
  { filterLabel: string; icon: string; badgeClass: string }
> = {
  resubmitted: {
    get filterLabel() {
      return i18n.t('listings.constants.resubmittedNew');
    },
    icon: 'refresh',
    badgeClass: 'bg-secondary-container font-semibold text-on-secondary-container',
  },
  waiting: {
    get filterLabel() {
      return i18n.t('listings.constants.notResubmittedWithinDeadline');
    },
    icon: 'hourglass_top',
    badgeClass: 'bg-surface-container-high font-medium text-on-surface-variant',
  },
  overdue: {
    get filterLabel() {
      return i18n.t('listings.constants.updateOverdue');
    },
    icon: 'alarm_off',
    badgeClass: 'bg-error-container/70 font-semibold text-on-error-container',
  },
  locked: {
    get filterLabel() {
      return i18n.t('listings.constants.permanentlyLocked');
    },
    icon: 'lock',
    badgeClass: 'bg-surface-variant font-semibold text-on-surface-variant',
  },
};

export const RESUBMISSION_FILTER_OPTIONS: SelectOption<ResubmissionStatus | 'all'>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('listings.constants.resubmissionStatus');
    },
  },
  ...(Object.keys(RESUBMISSION_CONFIG) as ResubmissionStatus[]).map((status) => ({
    value: status,
    label: RESUBMISSION_CONFIG[status].filterLabel,
  })),
];

export const REJECTED_PROVINCE_OPTIONS: SelectOption<ProvinceCode | 'all'>[] = [
  {
    value: 'all',
    get label() {
      return i18n.t('listings.constants.provinceCity');
    },
  },
  ...(['danang', 'quangnam', 'thanhhoa', 'quangngai', 'hanoi', 'kiengiang'] as ProvinceCode[]).map(
    (province) => linkedOption(province, () => PROVINCE_LABELS[province]),
  ),
];

export const DEFAULT_REJECTED_FILTERS: RejectedListingFilters = {
  keyword: '',
  reasonCode: 'all',
  resubmission: 'all',
  province: 'all',
};
