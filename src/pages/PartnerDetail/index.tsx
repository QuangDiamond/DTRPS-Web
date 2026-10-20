import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import SendMessageModal, {
  type MessageChannel,
  type MessageTemplate,
} from '../../components/common/SendMessageModal';
import LockPartnerModal from '../../components/partners/LockPartnerModal';
import { ROUTES } from '../../constants/routes';
import { usePartnerActions } from '../../hooks/usePartnerActions';
import { usePartners } from '../../hooks/usePartners';
import { useToast } from '../../hooks/useToast';
import type { Partner, PartnerFormValues } from '../../types/admin';
import { formatDate } from '../../utils/format';
import PartnerFormModal from '../Partners/components/PartnerFormModal';
import AuditLogTab from './components/AuditLogTab';
import CommissionModal from './components/CommissionModal';
import LegalTab from './components/LegalTab';
import PartnerProfileCard from './components/PartnerProfileCard';
import ScheduleReviewModal from './components/ScheduleReviewModal';
import TabPlaceholder from './components/TabPlaceholder';
import { getPartnerAuditLog, getPartnerProfile } from './partnerProfileUtils';

const PARTNER_MESSAGE_CHANNELS: MessageChannel[] = [
  { id: 'email', label: 'Email', icon: 'mail' },
  { id: 'app', label: 'Ứng dụng đối tác', icon: 'notifications' },
  { id: 'sms', label: 'SMS', icon: 'sms' },
];

const PARTNER_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    title: 'Nhắc gia hạn giấy phép',
    body: 'Giấy phép kinh doanh / PCCC của quý đối tác sắp hết hiệu lực. Vui lòng cập nhật bản mới trên cổng đối tác.',
  },
  {
    title: 'Lịch tái thẩm định định kỳ',
    body: 'Smart Travel sẽ tiến hành tái thẩm định chất lượng dịch vụ định kỳ. Vui lòng chuẩn bị hồ sơ liên quan.',
  },
  {
    title: 'Cập nhật chính sách hợp tác',
    body: 'Quy chế hợp tác & chiết khấu có điều chỉnh mới. Vui lòng xem chi tiết trên cổng đối tác.',
  },
];

type DetailTab = 'legal' | 'contract' | 'history' | 'ratings' | 'audit';
type ModalName = 'lock' | 'notify' | 'edit' | 'schedule' | 'commission' | null;

const TABS: { id: DetailTab; label: string; icon: string }[] = [
  { id: 'legal', label: 'Thông tin doanh nghiệp & Pháp lý', icon: 'corporate_fare' },
  { id: 'contract', label: 'Hợp đồng & Hạn mức', icon: 'description' },
  { id: 'history', label: 'Lịch sử hợp tác & Giao dịch', icon: 'receipt_long' },
  { id: 'ratings', label: 'Đánh giá & Xếp hạng đối tác', icon: 'military_tech' },
  { id: 'audit', label: 'Nhật ký kiểm toán (Audit Log)', icon: 'history' },
];

const HEADER_BUTTON_CLASS =
  'flex items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md shadow-sm transition-all';

/** Màn Chi tiết đối tác: /admin/partners/:id */
export default function PartnerDetailPage() {
  const { id } = useParams();
  const { partners } = usePartners();
  const partner = partners.find((item) => item.id === id);

  if (!partner) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest py-16 text-center shadow-sm">
        <Icon name="search_off" className="text-[48px] text-outline" />
        <h1 className="font-headline-lg text-headline-lg text-on-surface">
          Không tìm thấy đối tác {id}
        </h1>
        <Link
          to={ROUTES.PARTNERS}
          className="font-label-md text-label-md text-primary hover:underline"
        >
          Quay lại danh sách đối tác
        </Link>
      </div>
    );
  }

  return <PartnerDetailContent key={partner.id} partner={partner} />;
}

function PartnerDetailContent({ partner }: { partner: Partner }) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { updatePartner, profileOverrides, updateProfile, auditLogs, logAudit } = usePartners();
  const { lockPartner, unlockPartner, approvePartner, rejectPartner, countVisibleListings } =
    usePartnerActions();

  const [tab, setTab] = useState<DetailTab>('legal');
  const [modal, setModal] = useState<ModalName>(null);

  const profile = getPartnerProfile(partner, profileOverrides[partner.id]);
  const auditEntries = useMemo(
    () => getPartnerAuditLog(partner, auditLogs[partner.id]),
    [partner, auditLogs],
  );
  const sessionCode = `SEC-${partner.id}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const closeModal = () => setModal(null);

  // ===== Trạng thái tài khoản =====
  const confirmLock = (reason: string, note: string) => {
    const hidden = lockPartner(partner, reason, note || undefined);
    showToast(
      `Đã khóa tài khoản ${partner.name}${hidden ? ` và tạm ẩn ${hidden} địa điểm` : ''}`,
      'error',
    );
    closeModal();
  };

  const handleUnlock = () => {
    const shown = unlockPartner(partner);
    showToast(`Đã mở khóa ${partner.name}${shown ? `, hiển thị lại ${shown} địa điểm` : ''}`);
  };

  // ===== Thao tác khác =====
  const handleEdit = (values: PartnerFormValues) => {
    updatePartner(partner.id, values);
    showToast(`Đã cập nhật thông tin ${values.name}`);
    closeModal();
  };

  const handleSendNotification = (title: string, channels: string[]) => {
    logAudit(partner.id, 'forward_to_inbox', `Gửi thông báo "${title}" qua ${channels.join(', ')}`);
    showToast(`Đã gửi thông báo "${title}" tới ${partner.name}`);
    closeModal();
  };

  const handleSchedule = (isoDate: string) => {
    updateProfile(partner.id, { nextReviewDate: isoDate });
    logAudit(partner.id, 'event_available', `Lên lịch tái thẩm định ngày ${formatDate(isoDate)}`);
    showToast(`Đã lên lịch tái thẩm định ngày ${formatDate(isoDate)}`);
    closeModal();
  };

  const handleCommission = (commission: number) => {
    logAudit(
      partner.id,
      'edit_document',
      `Điều chỉnh hoa hồng từ ${profile.agreement.commission}% thành ${commission}%`,
    );
    updateProfile(partner.id, { commission });
    showToast(`Đã cập nhật mức hoa hồng ${commission}%`);
    closeModal();
  };

  const handleResendActivation = () => {
    logAudit(partner.id, 'key', `Gửi lại mã kích hoạt tới ${profile.contact.otpPhone}`);
    showToast(`Đã gửi mã kích hoạt tới ${profile.contact.otpPhone}`);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Breadcrumb & thao tác nhanh */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <nav className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-on-surface-variant">
            <Link
              to={ROUTES.DASHBOARD}
              className="flex items-center gap-1 transition-colors hover:text-primary"
            >
              <Icon name="home" className="text-[18px]" />
              <span>Quản trị hệ thống</span>
            </Link>
            <span className="text-outline-variant">/</span>
            <Link
              to={ROUTES.PARTNERS}
              className="flex items-center gap-1 transition-colors hover:text-primary"
            >
              <Icon name="business_center" className="text-[18px]" />
              <span>Quản lý đối tác</span>
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="font-semibold text-primary">Chi tiết đối tác: {partner.name}</span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold tracking-wide text-primary">
              Mã: {partner.id}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.PARTNERS)}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 font-label-md text-label-md text-on-surface-variant shadow-sm transition-all hover:bg-surface-container-high"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>Quay lại danh sách</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
                Đồng bộ hồ sơ đám mây AI
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {partner.status === 'active' && (
            <button
              type="button"
              onClick={() => setModal('lock')}
              className={`group bg-surface-container-lowest text-error hover:bg-error-container/30 ${HEADER_BUTTON_CLASS}`}
            >
              <Icon
                name="lock"
                className="text-[18px] transition-transform group-hover:scale-110"
              />
              <span>Khóa tài khoản</span>
            </button>
          )}
          {partner.status === 'suspended' && (
            <button
              type="button"
              onClick={handleUnlock}
              className={`bg-surface-container-lowest text-primary hover:bg-primary/10 ${HEADER_BUTTON_CLASS}`}
            >
              <Icon name="lock_open" className="text-[18px]" />
              <span>Mở khóa tài khoản</span>
            </button>
          )}
          {partner.status === 'pending' && (
            <button
              type="button"
              onClick={() => {
                rejectPartner(partner);
                showToast(`Đã từ chối hồ sơ ${partner.name}`, 'error');
              }}
              className={`bg-surface-container-lowest text-error hover:bg-error-container/30 ${HEADER_BUTTON_CLASS}`}
            >
              <Icon name="block" className="text-[18px]" />
              <span>Từ chối hồ sơ</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setModal('notify')}
            className={`bg-surface-container-lowest text-on-surface hover:bg-surface-container ${HEADER_BUTTON_CLASS}`}
          >
            <Icon name="forward_to_inbox" className="text-[18px] text-primary" />
            <span>Gửi thông báo</span>
          </button>
          <button
            type="button"
            onClick={() => setModal('edit')}
            className={`px-5 shadow-md ${
              partner.status === 'pending'
                ? 'bg-surface-container-lowest text-on-surface hover:bg-surface-container'
                : 'bg-primary text-on-primary hover:bg-primary-container'
            } ${HEADER_BUTTON_CLASS}`}
          >
            <Icon name="edit_square" className="text-[18px]" />
            <span>Chỉnh sửa thông tin</span>
          </button>
          {partner.status === 'pending' && (
            <button
              type="button"
              onClick={() => {
                approvePartner(partner);
                showToast(`Đã duyệt hồ sơ ${partner.name}`);
              }}
              className={`bg-primary px-5 text-on-primary shadow-md hover:bg-primary-container ${HEADER_BUTTON_CLASS}`}
            >
              <Icon name="verified" className="text-[18px]" />
              <span>Duyệt đối tác</span>
            </button>
          )}
        </div>
      </div>

      <PartnerProfileCard partner={partner} profile={profile} />

      {/* Tabs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto rounded-xl bg-surface-container p-1">
          {TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex shrink-0 items-center gap-2 rounded-lg px-4 py-2 font-label-md text-label-md whitespace-nowrap transition-all ${
                  active
                    ? 'bg-surface-container-lowest font-semibold text-primary shadow-sm'
                    : 'font-medium text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon name={item.icon} className="text-[18px]" />
                <span>{item.label}</span>
                {item.id === 'audit' && (
                  <span className="rounded-full bg-surface-container-high px-1.5 font-label-sm text-label-sm">
                    {auditEntries.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <div className="hidden shrink-0 items-center gap-2 xl:flex">
          <span className="font-label-sm text-label-sm text-outline">Hồ sơ xác thực:</span>
          <span className="flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container">
            <Icon name="verified" className="text-[14px]" />
            {profile.verificationLevel}
          </span>
        </div>
      </div>

      {tab === 'legal' && (
        <LegalTab
          partner={partner}
          profile={profile}
          onViewLicense={() =>
            showToast(
              `Bản xem trước ${profile.legal.licenseFile.name} sẽ có khi kết nối kho tài liệu`,
              'info',
            )
          }
          onGrantPermissions={() =>
            showToast('Phân quyền chi tiết cho tài khoản đối tác đang được phát triển', 'info')
          }
          onResendActivation={handleResendActivation}
          onScheduleReview={() => setModal('schedule')}
          onAdjustCommission={() => setModal('commission')}
        />
      )}
      {tab === 'contract' && (
        <TabPlaceholder
          icon="description"
          title="Hợp đồng & Hạn mức"
          description={`Hợp đồng ${profile.agreement.contractCode} • Hoa hồng ${profile.agreement.commission}%. Giao diện chi tiết tab này đang chờ thiết kế từ Stitch.`}
          action={
            <button
              type="button"
              onClick={() => setModal('commission')}
              className="rounded-full bg-primary px-4 py-2 font-label-md text-label-md text-on-primary hover:bg-primary-container"
            >
              Điều chỉnh chiết khấu
            </button>
          }
        />
      )}
      {tab === 'history' && (
        <TabPlaceholder
          icon="receipt_long"
          title="Lịch sử hợp tác & Giao dịch"
          description="Giao diện tab này đang chờ thiết kế từ Stitch. Trong lúc chờ, bạn có thể xem các địa điểm niêm yết của đối tác."
          action={
            <button
              type="button"
              onClick={() => navigate(`${ROUTES.LISTINGS}?partner=${partner.id}`)}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 font-label-md text-label-md text-on-primary hover:bg-primary-container"
            >
              <Icon name="map" className="text-[18px]" /> Xem địa điểm của đối tác
            </button>
          }
        />
      )}
      {tab === 'ratings' && (
        <TabPlaceholder
          icon="military_tech"
          title="Đánh giá & Xếp hạng đối tác"
          description={`Hạng ${profile.tierLabel} • Đánh giá trung bình ${
            partner.rating > 0 ? partner.rating.toFixed(1) : '—'
          }/5 • Tín nhiệm AI ${profile.trustScore}/100. Giao diện chi tiết đang chờ thiết kế từ Stitch.`}
        />
      )}
      {tab === 'audit' && <AuditLogTab entries={auditEntries} />}

      {/* Ghi chú bảo mật */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4 px-6 font-body-sm text-body-sm text-on-surface-variant shadow-sm">
        <div className="flex items-center gap-2">
          <Icon name="verified_user" className="text-[18px] text-primary" />
          <span>
            Quy chuẩn can thiệp tài khoản: Mọi thao tác chỉnh sửa hoặc khóa đối tác đều được tự động
            ghi nhận vào Audit Log hệ thống Smart Travel Vietnam.
          </span>
        </div>
        <div className="flex items-center gap-3 font-label-sm text-label-sm">
          <span className="text-outline">Mã phiên kiểm tra: {sessionCode}</span>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <Icon name="print" className="text-[16px]" />
            In trích lục hồ sơ
          </button>
        </div>
      </div>

      {modal === 'lock' && (
        <LockPartnerModal
          partner={partner}
          affectedListings={countVisibleListings(partner)}
          onConfirm={confirmLock}
          onClose={closeModal}
        />
      )}
      {modal === 'notify' && (
        <SendMessageModal
          title="Gửi thông báo tới đối tác"
          recipient={`${partner.name} • ${partner.email}`}
          templates={PARTNER_MESSAGE_TEMPLATES}
          channels={PARTNER_MESSAGE_CHANNELS}
          defaultChannelIds={['email', 'app']}
          onSend={handleSendNotification}
          onClose={closeModal}
        />
      )}
      {modal === 'edit' && (
        <PartnerFormModal partner={partner} onSubmit={handleEdit} onClose={closeModal} />
      )}
      {modal === 'schedule' && (
        <ScheduleReviewModal
          currentDate={profile.nextReviewDate}
          onConfirm={handleSchedule}
          onClose={closeModal}
        />
      )}
      {modal === 'commission' && (
        <CommissionModal
          current={profile.agreement.commission}
          onConfirm={handleCommission}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
