import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ErrorState from '../../components/common/ErrorState';
import NotFoundState from '../../components/common/NotFoundState';
import PageLoader from '../../components/common/PageLoader';
import Icon from '../../components/common/Icon';
import SendMessageModal, { type MessageTemplate } from '../../components/common/SendMessageModal';
import { ROUTES } from '../../constants/routes';
import { useResource } from '../../hooks/useResource';
import { useToast } from '../../hooks/useToast';
import { useUsers } from '../../hooks/useUsers';
import { userService } from '../../services/userService';
import type {
  AppUser,
  UserAuditEntry,
  UserFormValues,
  UserProfile,
  UserTrip,
} from '../../types/admin';
import { downloadCsv } from '../../utils/exportCsv';
import { formatDate } from '../../utils/format';
import UserFormModal from '../Users/components/UserFormModal';
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
    title: 'Xác minh lại thông tin tài khoản',
    body: 'Smart Travel cần bạn xác minh lại email và số điện thoại để tiếp tục sử dụng đầy đủ tính năng.',
  },
  {
    title: 'Cảnh báo vi phạm tiêu chuẩn cộng đồng',
    body: 'Chúng tôi ghi nhận nội dung từ tài khoản của bạn chưa phù hợp tiêu chuẩn cộng đồng. Vui lòng xem lại quy định.',
  },
  {
    title: 'Ưu đãi dành riêng cho thành viên',
    body: 'Cảm ơn bạn đã đồng hành cùng Smart Travel! Ưu đãi đặc biệt cho chuyến đi tiếp theo đang chờ bạn trong ứng dụng.',
  },
];

/** Màn Chi tiết người dùng: /admin/users/:id */
export default function UserDetailPage() {
  const { id } = useParams();
  const { users } = useUsers();
  const user = users.find((item) => item.id === id);

  if (!user) {
    return (
      <NotFoundState
        icon="person_search"
        title={`Không tìm thấy người dùng ${id}`}
        backTo={ROUTES.USERS}
        backLabel="Quay lại danh sách người dùng"
      />
    );
  }

  return <UserDetailLoader key={user.id} user={user} />;
}

/** Tải hồ sơ chi tiết & lịch sử phiên của người dùng qua userService */
function UserDetailLoader({ user }: { user: AppUser }) {
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
        title="Không tải được hồ sơ người dùng"
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
      label: `Lịch trình & Chuyến đi (${profile.tripSummary.total})`,
      icon: 'explore',
    },
    { id: 'saved', label: `Địa điểm đã lưu & Yêu thích (${profile.savedPois})`, icon: 'bookmarks' },
    {
      id: 'reviews',
      label: `Lịch sử đánh giá & Bình luận (${profile.reviewCount})`,
      icon: 'rate_review',
    },
    { id: 'audit', label: 'Nhật ký đăng nhập & Thiết bị (Audit Log)', icon: 'history' },
  ];

  // ===== Thao tác tài khoản =====
  const confirmLock = (reason: string) => {
    lockUsers([user.id], reason);
    showToast(`Đã khóa tài khoản ${user.name}, phiên đăng nhập trên ${device} đã bị hủy`, 'error');
    closeModal();
  };

  const handleUnlock = () => {
    unlockUsers([user.id]);
    showToast(`Đã mở khóa tài khoản ${user.name}`);
  };

  const handleEdit = (values: UserFormValues) => {
    updateUser(user.id, values);
    showToast(`Đã cập nhật hồ sơ ${values.name}`);
    closeModal();
  };

  const handleSendEmail = (subject: string) => {
    logAudit(user.id, 'mail', `Gửi email "${subject}" tới ${user.email}`);
    showToast(`Đã gửi email "${subject}" tới ${user.email}`);
    closeModal();
  };

  const handleDownloadTrip = (trip: UserTrip) => {
    downloadCsv(
      `lich-trinh-${trip.id}.csv`,
      ['Thông tin', 'Giá trị'],
      [
        ['Mã lộ trình', trip.id],
        ['Tên chuyến đi', trip.name],
        ['Khách du lịch', `${user.name} (${user.id})`],
        ['Trạng thái', TRIP_STATUS_CONFIG[trip.status].label],
        ['Thời gian', `${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`],
        ['Số điểm tham quan', trip.poiCount],
        ['Chi phí', formatVnd(trip.amount)],
        ['Lập bởi AI Planner', trip.aiPlanned ? 'Có' : 'Không'],
      ],
    );
    showToast(`Đã tải file lịch trình ${trip.id}`);
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
          <span>Quản trị hệ thống</span>
        </Link>
        <span className="px-2 text-outline-variant">/</span>
        <Link
          to={ROUTES.USERS}
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Icon name="group" className="text-[18px]" />
          <span>Quản lý người dùng</span>
        </Link>
        <span className="px-2 text-outline-variant">/</span>
        <span className="flex items-center gap-1.5 font-semibold text-on-surface">
          <Icon name="person" className="text-[18px] text-primary" />
          <span>Chi tiết người dùng: {user.name}</span>
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
            <span>Quay lại danh sách người dùng</span>
          </button>
          <div className="flex items-center gap-2 rounded-full bg-surface-container-low px-space-md py-1.5 font-label-sm text-label-sm font-semibold text-primary">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
            <span>Hồ sơ du khách được đồng bộ đám mây AI</span>
            <span className="text-[11px] font-normal text-outline">
              • Vừa cập nhật 2 phút trước
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
              <span>Mở khóa tài khoản</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setModal('lock')}
              className="inline-flex items-center gap-1.5 rounded-full bg-error-container/60 px-space-md py-2.5 font-label-md text-label-md font-semibold text-error transition-all hover:bg-error-container"
            >
              <Icon name="lock" className="text-[18px]" />
              <span>Khóa tài khoản</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setModal('email')}
            className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-space-md py-2.5 font-label-md text-label-md font-semibold text-primary transition-all hover:bg-surface-container-high"
          >
            <Icon name="mail" className="text-[18px]" />
            <span>Gửi email thông báo</span>
          </button>
          <button
            type="button"
            onClick={() => setModal('edit')}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-space-lg py-2.5 font-label-md text-label-md font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container hover:shadow"
          >
            <Icon name="edit" className="text-[18px]" />
            <span>Chỉnh sửa quyền / Hồ sơ</span>
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
            title={`${profile.savedPois} Địa điểm du lịch được lưu trữ`}
            description={profile.savedBreakdown}
          />
        )}
        {tab === 'reviews' && (
          <SummaryTab
            icon="rate_review"
            iconClass="text-tertiary"
            title={`${profile.reviewCount} Đánh giá đã xác thực trải nghiệm`}
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
              Quy chuẩn can thiệp tài khoản
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              Mọi thao tác Khóa, Thay đổi quyền hạn hoặc Đặt lại mật khẩu của người dùng đều được
              ghi nhận trực tiếp vào Hệ thống Nhật ký Kiểm toán Quản trị viên Cấp cao.
            </span>
          </div>
        </div>
        <span className="shrink-0 self-end font-label-sm text-label-sm text-outline md:self-auto">
          Quyền hạn: <strong className="text-primary">Super Admin (toàn quyền)</strong>
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
          title="Gửi email thông báo"
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
