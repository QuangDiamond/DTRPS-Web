import { Trans, useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, Icon, NotFoundState, PageLoader, SendMessageModal } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useResource, useToast, useUsers } from '@/hooks';
import UserFormModal from '@/pages/Users/components/UserFormModal';
import { userService } from '@/services/userService';
import type {
  AppUser,
  MessageTemplate,
  UserAuditEntry,
  UserFormValues,
  UserProfile,
  UserTrip,
} from '@/types';
import { downloadCsv } from '@/utils/exportCsv';
import { formatDate } from '@/utils/format';
import LockAccountDialog from './components/LockAccountDialog';
import SessionLogTab from './components/SessionLogTab';
import SummaryTab from './components/SummaryTab';
import TripDetailModal from './components/TripDetailModal';
import TripsTab from './components/TripsTab';
import UserMetricCards from './components/UserMetricCards';
import UserProfileCard from './components/UserProfileCard';
import { formatVnd, mergeSessionLog, TRIP_STATUS_CONFIG } from './userProfileUtils';

type DetailTab = 'trips' | 'saved' | 'reviews' | 'audit';
type ModalName = 'lock' | 'email' | 'edit' | null;

const EMAIL_TEMPLATES: MessageTemplate[] = [
  {
    get title() {
      return i18n.t('userDetail.page.reVerifyYourAccount');
    },
    get body() {
      return i18n.t('userDetail.page.smartTravelNeedsYou');
    },
  },
  {
    get title() {
      return i18n.t('userDetail.page.communityStandardsViolationWarning');
    },
    get body() {
      return i18n.t('userDetail.page.weNoticedContentFrom');
    },
  },
  {
    get title() {
      return i18n.t('userDetail.page.exclusiveMemberOffer');
    },
    get body() {
      return i18n.t('userDetail.page.thankYouTravelingWith');
    },
  },
];

/** Màn Chi tiết người dùng: /admin/users/:id */
export default function UserDetailPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const { id } = useParams();
  const { users } = useUsers();
  const user = users.find((item) => item.id === id);

  if (!user) {
    return (
      <NotFoundState
        icon="person_search"
        title={t('userDetail.page.userNotFound', { id })}
        backTo={ROUTES.USERS}
        backLabel={t('userDetail.page.backUserList')}
      />
    );
  }

  return <UserDetailLoader key={user.id} user={user} />;
}

/** Tải hồ sơ chi tiết & lịch sử phiên của người dùng qua userService */
function UserDetailLoader({ user }: { user: AppUser }) {
  const { t } = useTranslation();
  const profile = useResource(
    () => userService.getProfile(user),
    () => userService.peekProfile(user),
  );
  const history = useResource(
    () => userService.getSessionHistory(user),
    () => userService.peekSessionHistory(user),
  );

  if (profile.status === 'error' || history.status === 'error') {
    return (
      <ErrorState
        title={t('userDetail.page.couldNotLoadUser')}
        message={profile.error ?? history.error}
        onRetry={() => {
          if (profile.status === 'error') profile.reload();
          if (history.status === 'error') history.reload();
        }}
      />
    );
  }
  if (!profile.data || !history.data) return <PageLoader />;
  return (
    <UserDetailContent user={user} loadedProfile={profile.data} sessionHistory={history.data} />
  );
}

interface UserDetailContentProps {
  user: AppUser;
  loadedProfile: UserProfile;
  sessionHistory: UserAuditEntry[];
}

function UserDetailContent({ user, loadedProfile, sessionHistory }: UserDetailContentProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { updateUser, lockUsers, unlockUsers, auditLogs, logAudit } = useUsers();

  const [tab, setTab] = useState<DetailTab>('trips');
  const [modal, setModal] = useState<ModalName>(null);
  const [viewingTrip, setViewingTrip] = useState<UserTrip | null>(null);

  // Chế độ mock: dựng lại hồ sơ theo trạng thái người dùng mới nhất (khóa/mở khóa cập nhật ngay)
  const profile = userService.peekProfile(user) ?? loadedProfile;
  const sessionLog = useMemo(
    () => mergeSessionLog(sessionHistory, auditLogs[user.id]),
    [sessionHistory, auditLogs, user.id],
  );
  const suspended = user.status === 'suspended';
  const device = profile.lastLogin.device.match(/\(([^)]+)\)/)?.[1] ?? profile.lastLogin.device;
  const closeModal = () => setModal(null);

  const tabs: { id: DetailTab; label: string; icon: string }[] = [
    {
      id: 'trips',
      label: t('userDetail.page.itinerariesTrips', { total: profile.tripSummary.total }),
      icon: 'explore',
    },
    {
      id: 'saved',
      label: t('userDetail.page.savedFavoritePlaces', { savedPois: profile.savedPois }),
      icon: 'bookmarks',
    },
    {
      id: 'reviews',
      label: t('userDetail.page.reviewsCommentsHistory', { reviewCount: profile.reviewCount }),
      icon: 'rate_review',
    },
    { id: 'audit', label: t('userDetail.page.signDeviceLogAudit'), icon: 'history' },
  ];

  // ===== Thao tác tài khoản =====
  const confirmLock = (reason: string) => {
    lockUsers([user.id], reason);
    showToast(t('userDetail.page.lockedAccountSessionHas', { name: user.name, device }), 'error');
    closeModal();
  };

  const handleUnlock = () => {
    unlockUsers([user.id]);
    showToast(t('userDetail.page.unlockedAccount', { name: user.name }));
  };

  const handleEdit = (values: UserFormValues) => {
    updateUser(user.id, values);
    showToast(t('userDetail.page.updatedProfile', { name: values.name }));
    closeModal();
  };

  const handleSendEmail = (subject: string) => {
    logAudit(user.id, 'mail', t('userDetail.page.sentEmail', { subject, email: user.email }));
    showToast(t('userDetail.page.emailSent', { subject, email: user.email }));
    closeModal();
  };

  const handleDownloadTrip = (trip: UserTrip) => {
    downloadCsv(
      `lich-trinh-${trip.id}.csv`,
      [t('userDetail.page.information'), t('userDetail.page.value')],
      [
        [t('userDetail.page.itineraryCode'), trip.id],
        [t('userDetail.page.tripName'), trip.name],
        [t('userDetail.page.traveler'), `${user.name} (${user.id})`],
        [t('userDetail.page.status'), TRIP_STATUS_CONFIG[trip.status].label],
        [t('userDetail.page.time'), `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`],
        [t('userDetail.page.attractions'), trip.poiCount],
        [t('userDetail.page.cost'), formatVnd(trip.amount)],
      ],
    );
    showToast(t('userDetail.page.downloadedItinerary', { id: trip.id }));
  };

  return (
    <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-space-lg pb-12">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="flex items-center font-body-sm text-body-sm text-on-surface-variant"
      >
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Icon name="home" className="text-[18px]" />
          <span>{t('userDetail.page.systemAdministration')}</span>
        </Link>
        <span className="px-2 text-outline-variant">/</span>
        <Link
          to={ROUTES.USERS}
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Icon name="group" className="text-[18px]" />
          <span>{t('userDetail.page.userManagement')}</span>
        </Link>
        <span className="px-2 text-outline-variant">/</span>
        <span className="flex items-center gap-1.5 font-semibold text-on-surface">
          <Icon name="person" className="text-[18px] text-primary" />
          <span>{t('userDetail.page.userDetails', { name: user.name })}</span>
        </span>
      </nav>

      {/* Thanh thao tác */}
      <div className="flex flex-wrap items-center justify-between gap-space-md rounded-2xl bg-surface-container-lowest p-space-md shadow-sm">
        <div className="flex flex-wrap items-center gap-space-lg">
          <button
            type="button"
            onClick={() => navigate(ROUTES.USERS)}
            className="group inline-flex items-center gap-2 rounded-full bg-surface-container px-space-md py-2 font-label-md text-label-md font-medium text-on-surface transition-all hover:bg-surface-container-high"
          >
            <Icon
              name="arrow_back"
              className="text-[18px] text-primary transition-transform group-hover:-translate-x-0.5"
            />
            <span>{t('userDetail.page.backUserList')}</span>
          </button>
          <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-space-md py-1.5 font-label-sm text-label-sm font-semibold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span>{t('userDetail.page.travelerProfileSyncedAi')}</span>
            <span className="text-[11px] font-normal text-outline">
              {t('userDetail.page.updated2MinutesAgo')}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-space-sm">
          {suspended ? (
            <button
              type="button"
              onClick={handleUnlock}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary-container px-space-md py-2.5 font-label-md text-label-md font-semibold text-on-primary-container transition-all hover:opacity-90"
            >
              <Icon name="lock_open" className="text-[18px]" />
              <span>{t('userDetail.page.unlockAccount')}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModal('lock')}
              className="inline-flex items-center gap-1.5 rounded-full bg-error-container/60 px-space-md py-2.5 font-label-md text-label-md font-semibold text-error transition-all hover:bg-error-container"
            >
              <Icon name="lock" className="text-[18px]" />
              <span>{t('userDetail.page.lockAccount')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setModal('email')}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-space-md py-2.5 font-label-md text-label-md font-semibold text-primary transition-all hover:bg-surface-container-high"
          >
            <Icon name="mail" className="text-[18px]" />
            <span>{t('userDetail.page.sendNotificationEmail')}</span>
          </button>
          <button
            type="button"
            onClick={() => setModal('edit')}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow"
          >
            <Icon name="edit" className="text-[18px]" />
            <span>{t('userDetail.page.editPermissionsProfile')}</span>
          </button>
        </div>
      </div>

      <UserProfileCard user={user} profile={profile} />
      <UserMetricCards profile={profile} />

      {/* Tabs */}
      <div className="flex flex-col gap-space-md">
        <div className="flex items-center gap-space-xs overflow-x-auto rounded-2xl bg-surface-container-lowest p-1.5 shadow-sm">
          {tabs.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-space-lg py-2.5 font-label-md text-label-md whitespace-nowrap transition-all ${
                  active
                    ? 'bg-primary font-bold text-on-primary shadow-sm'
                    : 'font-semibold text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                }`}
              >
                <Icon name={item.icon} className="text-[18px]" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'trips' && (
          <TripsTab
            trips={profile.trips}
            totalTrips={profile.tripSummary.total}
            onDownload={handleDownloadTrip}
            onViewTrip={setViewingTrip}
          />
        )}
        {tab === 'saved' && (
          <SummaryTab
            icon="bookmark_border"
            iconClass="text-primary"
            title={t('userDetail.page.savedTravelPlaces', { count: profile.savedPois })}
            description={profile.savedBreakdown}
          />
        )}
        {tab === 'reviews' && (
          <SummaryTab
            icon="rate_review"
            iconClass="text-tertiary"
            title={t('userDetail.page.verifiedExperienceReviews', { count: profile.reviewCount })}
            description={profile.reviewsNote}
          />
        )}
        {tab === 'audit' && <SessionLogTab entries={sessionLog} />}
      </div>

      {/* Quy chuẩn can thiệp */}
      <div className="flex flex-col items-start justify-between gap-space-md rounded-2xl border-l-4 border-primary bg-surface-container-lowest p-space-lg shadow-sm md:flex-row md:items-center">
        <div className="flex items-center gap-space-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary">
            <Icon name="verified_user" className="text-[24px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-title-md text-title-md font-bold text-on-surface">
              {t('userDetail.page.accountInterventionPolicy')}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {t('userDetail.page.everyLockPermissionChange')}
            </span>
          </div>
        </div>
        <span className="shrink-0 self-end font-label-sm text-label-sm text-outline md:self-auto">
          <Trans
            i18nKey="userDetail.page.permissionsSuperAdminFull"
            components={{ c0: <strong className="text-primary" /> }}
          />
        </span>
      </div>

      {modal === 'lock' && (
        <LockAccountDialog
          user={user}
          device={device}
          onConfirm={confirmLock}
          onClose={closeModal}
        />
      )}
      {modal === 'email' && (
        <SendMessageModal
          title={t('userDetail.page.sendNotificationEmail')}
          recipient={`${user.name} • ${user.email}`}
          templates={EMAIL_TEMPLATES}
          onSend={handleSendEmail}
          onClose={closeModal}
        />
      )}
      {modal === 'edit' && <UserFormModal user={user} onSubmit={handleEdit} onClose={closeModal} />}
      {viewingTrip && (
        <TripDetailModal
          trip={viewingTrip}
          onClose={() => setViewingTrip(null)}
          onDownload={handleDownloadTrip}
        />
      )}
    </div>
  );
}
