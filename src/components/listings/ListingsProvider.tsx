import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { LISTING_CATEGORY_CONFIG } from '../../constants/listing';
import { ListingsContext } from '../../contexts/listings';
import { useAuth } from '../../hooks/useAuth';
import { useInitialData } from '../../hooks/useInitialData';
import { usePersist } from '../../hooks/usePersist';
import { listingService, listingsSource } from '../../services/listingService';
import type {
  ActivityItem,
  Listing,
  ListingFormValues,
  ListingStats,
  ListingVisibility,
  RejectOptions,
} from '../../types/admin';

/** Phần chênh lệch so với số liệu gốc, phát sinh do thao tác trong phiên */
interface StatsDelta {
  approved: number;
  rejected: number;
  hidden: number;
  added: number;
  /** Hồ sơ bị từ chối được mở lại để thẩm định (sau khi đối tác gửi lại) */
  reopened: number;
  locked: number;
}

const ZERO_DELTA: StatsDelta = {
  approved: 0,
  rejected: 0,
  hidden: 0,
  added: 0,
  reopened: 0,
  locked: 0,
};

const EMPTY_STATS: ListingStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  hidden: 0,
  resubmitted: 0,
  locked: 0,
  weeklyEngagements: 0,
  weeklyEngagementGrowth: 0,
};

/**
 * Store niêm yết dùng chung cho Bảng điều khiển, Quản lý niêm yết, màn Thẩm định
 * và Địa điểm đã duyệt — thao tác ở đâu thì số liệu & danh sách ở mọi nơi đều cập nhật theo.
 * Dữ liệu tải qua listingService (mock hoặc API); thao tác ghi cập nhật lạc quan rồi lưu xuống server.
 */
export default function ListingsProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const seed = listingsSource.seed;
  const [listings, setListings] = useState<Listing[]>(seed?.listings ?? []);
  const [activities, setActivities] = useState<ActivityItem[]>(seed?.activities ?? []);
  const [baseStats, setBaseStats] = useState<ListingStats>(seed?.stats ?? EMPTY_STATS);
  const [delta, setDelta] = useState<StatsDelta>(ZERO_DELTA);
  const nextActivityId = useRef(0);
  const nextManualId = useRef(1);

  const dataStatus = useInitialData(
    listingsSource,
    (snapshot) => {
      setListings(snapshot.listings);
      setActivities(snapshot.activities);
      setBaseStats(snapshot.stats);
      setDelta(ZERO_DELTA);
    },
    Boolean(admin),
  );
  const persist = usePersist(dataStatus.reload);

  // Đọc danh sách mới nhất trong callback mà không phải đưa listings vào dependency
  const listingsRef = useRef(listings);
  listingsRef.current = listings;

  const createActivity = useCallback(
    (kind: ActivityItem['kind'], subject: string, reason?: string): ActivityItem => ({
      id: `act-new-${nextActivityId.current++}`,
      kind,
      subject,
      reason,
      createdAt: new Date().toISOString(),
    }),
    [],
  );

  // ===== Duyệt / từ chối =====
  const approveListings = useCallback(
    (ids: string[], note?: string) => {
      const targets = listingsRef.current.filter(
        (listing) => ids.includes(listing.id) && listing.status === 'pending',
      );
      if (targets.length === 0) return 0;

      const now = new Date().toISOString();
      const targetIds = new Set(targets.map((listing) => listing.id));
      setListings((current) =>
        current.map((listing) =>
          targetIds.has(listing.id)
            ? {
                ...listing,
                status: 'approved',
                rejectReason: undefined,
                reviewNote: note,
                reviewedAt: now,
                visibility: 'visible',
              }
            : listing,
        ),
      );
      setDelta((current) => ({ ...current, approved: current.approved + targets.length }));
      setActivities((current) => [
        ...targets.map((listing) => createActivity('listing_approved', listing.name)),
        ...current,
      ]);
      persist(listingService.approve([...targetIds], note), 'Không lưu được kết quả phê duyệt');
      return targets.length;
    },
    [createActivity, persist],
  );

  const rejectListing = useCallback(
    (id: string, reason: string, options: RejectOptions = {}) => {
      const target = listingsRef.current.find(
        (listing) => listing.id === id && listing.status === 'pending',
      );
      if (!target) return;

      setListings((current) =>
        current.map((listing) =>
          listing.id === id
            ? {
                ...listing,
                status: 'rejected',
                rejectReason: reason,
                rejectReasonCode: options.reasonCode,
                rejectIcon: undefined,
                resubmittedAt: undefined,
                locked: false,
                partnerFeedback: options.feedback,
                reviewNote: options.note,
                reviewedAt: new Date().toISOString(),
              }
            : listing,
        ),
      );
      setDelta((current) => ({ ...current, rejected: current.rejected + 1 }));
      setActivities((current) => [
        createActivity('listing_rejected', target.name, reason),
        ...current,
      ]);
      persist(listingService.reject(id, reason, options), 'Không lưu được kết quả từ chối');
    },
    [createActivity, persist],
  );

  // ===== Hồ sơ bị từ chối =====
  /** Mở lại hồ sơ đối tác đã gửi lại → quay về hàng chờ duyệt */
  const reopenListing = useCallback(
    (id: string) => {
      const target = listingsRef.current.find(
        (listing) => listing.id === id && listing.status === 'rejected' && listing.resubmittedAt,
      );
      if (!target) return false;

      setListings((current) =>
        current.map((listing) =>
          listing.id === id
            ? {
                ...listing,
                status: 'pending',
                submittedAt: listing.resubmittedAt ?? new Date().toISOString(),
                reviewedAt: undefined,
                rejectReason: undefined,
                rejectReasonCode: undefined,
                rejectIcon: undefined,
                partnerFeedback: undefined,
                resubmittedAt: undefined,
              }
            : listing,
        ),
      );
      setDelta((current) => ({ ...current, reopened: current.reopened + 1 }));
      persist(listingService.reopen(id), 'Không mở lại được hồ sơ');
      return true;
    },
    [persist],
  );

  /** Đóng vĩnh viễn các hồ sơ bị từ chối chưa gửi lại */
  const lockListings = useCallback(
    (ids: string[]) => {
      const targets = listingsRef.current.filter(
        (listing) =>
          ids.includes(listing.id) &&
          listing.status === 'rejected' &&
          !listing.locked &&
          !listing.resubmittedAt,
      );
      if (targets.length === 0) return 0;

      const targetIds = new Set(targets.map((listing) => listing.id));
      setListings((current) =>
        current.map((listing) =>
          targetIds.has(listing.id) ? { ...listing, locked: true } : listing,
        ),
      );
      setDelta((current) => ({ ...current, locked: current.locked + targets.length }));
      persist(listingService.lock([...targetIds]), 'Không đóng được hồ sơ');
      return targets.length;
    },
    [persist],
  );

  // ===== Quản lý niêm yết đã duyệt =====
  const setListingsVisibility = useCallback(
    (ids: string[], visibility: ListingVisibility, reason?: string) => {
      const targets = listingsRef.current.filter(
        (listing) =>
          ids.includes(listing.id) &&
          listing.status === 'approved' &&
          (listing.visibility ?? 'visible') !== visibility,
      );
      if (targets.length === 0) return 0;

      const targetIds = new Set(targets.map((listing) => listing.id));
      setListings((current) =>
        current.map((listing) =>
          targetIds.has(listing.id)
            ? {
                ...listing,
                visibility,
                hiddenReason: visibility === 'hidden' ? reason : undefined,
              }
            : listing,
        ),
      );
      const change = visibility === 'hidden' ? targets.length : -targets.length;
      setDelta((current) => ({ ...current, hidden: current.hidden + change }));
      persist(
        listingService.setVisibility([...targetIds], visibility, reason),
        'Không cập nhật được trạng thái hiển thị',
      );
      return targets.length;
    },
    [persist],
  );

  const updateListing = useCallback(
    (id: string, values: ListingFormValues) => {
      setListings((current) =>
        current.map((listing) => {
          if (listing.id !== id) return listing;
          const categoryChanged = listing.category !== values.category;
          return {
            ...listing,
            ...values,
            categoryIcon: categoryChanged
              ? LISTING_CATEGORY_CONFIG[values.category].defaultIcon
              : listing.categoryIcon,
          };
        }),
      );
      persist(listingService.update(id, values), 'Không lưu được thông tin địa điểm');
    },
    [persist],
  );

  const assignCategory = useCallback(
    (ids: string[], category: Listing['category']) => {
      const config = LISTING_CATEGORY_CONFIG[category];
      setListings((current) =>
        current.map((listing) =>
          ids.includes(listing.id)
            ? {
                ...listing,
                category,
                categoryLabel: config.filterLabel,
                categoryIcon: config.defaultIcon,
              }
            : listing,
        ),
      );
      persist(listingService.assignCategory(ids, category), 'Không gán được danh mục');
    },
    [persist],
  );

  const addListing = useCallback(
    (values: ListingFormValues) => {
      const now = new Date().toISOString();
      const icon = LISTING_CATEGORY_CONFIG[values.category].defaultIcon;
      const listing: Listing = {
        ...values,
        id: `POI-M${String(nextManualId.current++).padStart(4, '0')}`,
        icon,
        categoryIcon: icon,
        partnerTier: 'verified',
        submittedAt: now,
        reviewedAt: now,
        status: 'approved',
        visibility: 'visible',
        reviewNote: 'Quản trị viên thêm thủ công',
        rating: 0,
        reviewCount: 0,
        views: 0,
      };
      setListings((current) => [listing, ...current]);
      setDelta((current) => ({ ...current, added: current.added + 1 }));
      persist(listingService.create(listing), 'Không lưu được địa điểm mới');
      return listing;
    },
    [persist],
  );

  const stats: ListingStats = useMemo(
    () => ({
      total: baseStats.total + delta.added,
      pending: Math.max(0, baseStats.pending - delta.approved - delta.rejected + delta.reopened),
      approved: baseStats.approved + delta.approved + delta.added,
      rejected: baseStats.rejected + delta.rejected - delta.reopened,
      hidden: Math.max(0, baseStats.hidden + delta.hidden),
      resubmitted: Math.max(0, baseStats.resubmitted - delta.reopened),
      locked: baseStats.locked + delta.locked,
      weeklyEngagements: baseStats.weeklyEngagements,
      weeklyEngagementGrowth: baseStats.weeklyEngagementGrowth,
    }),
    [baseStats, delta],
  );

  const value = useMemo(
    () => ({
      listings,
      activities,
      stats,
      dataStatus,
      approveListings,
      rejectListing,
      reopenListing,
      lockListings,
      setListingsVisibility,
      updateListing,
      assignCategory,
      addListing,
    }),
    [
      listings,
      activities,
      stats,
      dataStatus,
      approveListings,
      rejectListing,
      reopenListing,
      lockListings,
      setListingsVisibility,
      updateListing,
      assignCategory,
      addListing,
    ],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}
