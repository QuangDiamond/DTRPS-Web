import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ErrorState, Icon, NotFoundState, PageLoader, SendMessageModal } from '@/components/common';
import LockPartnerModal from '@/components/partners/LockPartnerModal';
import { ROUTES } from '@/constants/routes';
import { useListings, usePartnerActions, usePartners, useResource, useToast } from '@/hooks';
import PartnerFormModal from '@/pages/Partners/components/PartnerFormModal';
import { partnerService } from '@/services/partnerService';
import type {
  MessageChannel,
  MessageTemplate,
  Partner,
  PartnerAuditEntry,
  PartnerFormValues,
  PartnerProfile,
} from '@/types';
import { formatDate } from '@/utils/format';
import AuditLogTab from './components/AuditLogTab';
import LegalTab from './components/LegalTab';
import PartnerPlaceTab from './components/PartnerPlaceTab';
import PartnerProfileCard from './components/PartnerProfileCard';
import RatingsTab from './components/RatingsTab';
import ScheduleReviewModal from './components/ScheduleReviewModal';
import { applyProfileOverrides, mergeAuditLog } from './partnerProfileUtils';

const PARTNER_MESSAGE_CHANNELS: MessageChannel[] = [
  { id: 'email', label: 'Email', icon: 'mail' },
  {
    id: 'app',
    get label() {
      return i18n.t('partnerDetail.page.partnerApp');
    },
    icon: 'notifications',
  },
  { id: 'sms', label: 'SMS', icon: 'sms' },
];

const PARTNER_MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    get title() {
      return i18n.t('partnerDetail.page.licenseRenewalReminder');
    },
    get body() {
      return i18n.t('partnerDetail.page.yourBusinessFireSafety');
    },
  },
  {
    get title() {
      return i18n.t('partnerDetail.page.periodicReAssessmentSchedule');
    },
    get body() {
      return i18n.t('partnerDetail.page.smartTravelWillCarry');
    },
  },
  {
    get title() {
      return i18n.t('partnerDetail.page.partnershipPolicyUpdate');
    },
    get body() {
      return i18n.t('partnerDetail.page.thePartnershipCommissionPolicy');
    },
  },
];

type DetailTab = 'legal' | 'place' | 'ratings' | 'audit';
type ModalName = 'lock' | 'notify' | 'edit' | 'schedule' | null;

const TABS: { id: DetailTab; label: string; icon: string }[] = [
  {
    id: 'legal',
    get label() {
      return i18n.t('partnerDetail.page.businessLegalInformation');
    },
    icon: 'corporate_fare',
  },
  {
    id: 'place',
    get label() {
      return i18n.t('partnerDetail.page.registeredPlace');
    },
    icon: 'location_on',
  },
  {
    id: 'ratings',
    get label() {
      return i18n.t('partnerDetail.page.partnerReviewsRanking');
    },
    icon: 'military_tech',
  },
  {
    id: 'audit',
    get label() {
      return i18n.t('partnerDetail.page.auditLog');
    },
    icon: 'history',
  },
];

const HEADER_BUTTON_CLASS =
  'flex items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md shadow-sm transition-all';

/** Màn Chi tiết đối tác: /admin/partners/:id */
export default function PartnerDetailPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const { id } = useParams();
  const { partners } = usePartners();
  const partner = partners.find((item) => item.id === id);

  if (!partner) {
    return (
      <NotFoundState
        title={t('partnerDetail.page.partnerNotFound', { id })}
        backTo={ROUTES.PARTNERS}
        backLabel={t('partnerDetail.page.backPartnerList')}
      />
    );
  }

  return <PartnerDetailLoader key={partner.id} partner={partner} />;
}

/** Tải hồ sơ pháp lý & lịch sử kiểm toán của đối tác qua partnerService */
function PartnerDetailLoader({ partner }: { partner: Partner }) {
  const { t } = useTranslation();
  const profile = useResource(
    () => partnerService.getProfile(partner),
    () => partnerService.peekProfile(partner),
  );
  const history = useResource(
    () => partnerService.getAuditHistory(partner),
    () => partnerService.peekAuditHistory(partner),
  );

  if (profile.status === 'error' || history.status === 'error') {
    return (
      <ErrorState
        title={t('partnerDetail.page.couldNotLoadPartner')}
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
    <PartnerDetailContent
      partner={partner}
      loadedProfile={profile.data}
      auditHistory={history.data}
    />
  );
}

interface PartnerDetailContentProps {
  partner: Partner;
  loadedProfile: PartnerProfile;
  auditHistory: PartnerAuditEntry[];
}

function PartnerDetailContent({ partner, loadedProfile, auditHistory }: PartnerDetailContentProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { updatePartner, profileOverrides, updateProfile, auditLogs, logAudit } = usePartners();
  const { listings } = useListings();
  const { lockPartner, unlockPartner, approvePartner, rejectPartner, countVisibleListings } =
    usePartnerActions();

  const [tab, setTab] = useState<DetailTab>('legal');
  const [modal, setModal] = useState<ModalName>(null);

  // Chế độ mock: dựng lại hồ sơ theo trạng thái đối tác mới nhất (duyệt/khóa đổi nhãn ngay)
  const baseProfile = partnerService.peekProfile(partner) ?? loadedProfile;
  const profile = applyProfileOverrides(baseProfile, profileOverrides[partner.id]);
  const auditEntries = useMemo(
    () => mergeAuditLog(auditHistory, auditLogs[partner.id]),
    [auditHistory, auditLogs, partner.id],
  );
  const sessionCode = `SEC-${partner.id}-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  const closeModal = () => setModal(null);

  // ===== Trạng thái tài khoản =====
  const confirmLock = (reason: string, note: string) => {
    const hidden = lockPartner(partner, reason, note || undefined);
    showToast(
      hidden
        ? t('partnerDetail.page.lockedAccountHidPlaces', { name: partner.name, count: hidden })
        : t('partnerDetail.page.lockedAccount', { name: partner.name }),
      'error',
    );
    closeModal();
  };

  const handleUnlock = () => {
    const shown = unlockPartner(partner);
    showToast(
      shown
        ? t('partnerDetail.page.unlockedRestoredPlaces', { name: partner.name, count: shown })
        : t('partnerDetail.page.unlocked', { name: partner.name }),
    );
  };

  // ===== Thao tác khác =====
  const handleEdit = (values: PartnerFormValues) => {
    updatePartner(partner.id, values);
    showToast(t('partnerDetail.page.updatedDetails', { name: values.name }));
    closeModal();
  };

  const handleSendNotification = (title: string, channels: string[]) => {
    logAudit(
      partner.id,
      'forward_to_inbox',
      t('partnerDetail.page.sentNotificationVia', { title, join: channels.join(', ') }),
    );
    showToast(t('partnerDetail.page.notificationSent', { title, name: partner.name }));
    closeModal();
  };

  const handleSchedule = (isoDate: string) => {
    updateProfile(partner.id, { nextReviewDate: isoDate });
    logAudit(
      partner.id,
      'event_available',
      t('partnerDetail.page.scheduledReAssessment', { isoDate: formatDate(isoDate) }),
    );
    showToast(t('partnerDetail.page.reAssessmentScheduled', { isoDate: formatDate(isoDate) }));
    closeModal();
  };

  const handleResendActivation = () => {
    logAudit(
      partner.id,
      'key',
      t('partnerDetail.page.resentActivationCode', { otpPhone: profile.contact.otpPhone }),
    );
    showToast(t('partnerDetail.page.activationCodeSent', { otpPhone: profile.contact.otpPhone }));
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
              <span>{t('partnerDetail.page.systemAdministration')}</span>
            </Link>
            <span className="text-outline-variant">/</span>
            <Link
              to={ROUTES.PARTNERS}
              className="flex items-center gap-1 transition-colors hover:text-primary"
            >
              <Icon name="business_center" className="text-[18px]" />
              <span>{t('partnerDetail.page.partnerManagement')}</span>
            </Link>
            <span className="text-outline-variant">/</span>
            <span className="font-semibold text-primary">
              {t('partnerDetail.page.partnerDetails', { name: partner.name })}
            </span>
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 font-label-sm text-label-sm font-semibold tracking-wide text-primary">
              {t('partnerDetail.page.code', { id: partner.id })}
            </span>
          </nav>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(ROUTES.PARTNERS)}
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-container px-3 py-1.5 font-label-md text-label-md text-on-surface-variant shadow-sm transition-all hover:bg-surface-container-high"
            >
              <Icon name="arrow_back" className="text-[18px]" />
              <span>{t('partnerDetail.page.backList')}</span>
            </button>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm tracking-wider text-outline uppercase">
                {t('partnerDetail.page.aiCloudProfileSync')}
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
              <span>{t('partnerDetail.page.lockAccount')}</span>
            </button>
          )}
          {partner.status === 'suspended' && (
            <button
              type="button"
              onClick={handleUnlock}
              className={`bg-surface-container-lowest text-primary hover:bg-primary/10 ${HEADER_BUTTON_CLASS}`}
            >
              <Icon name="lock_open" className="text-[18px]" />
              <span>{t('partnerDetail.page.unlockAccount')}</span>
            </button>
          )}
          {partner.status === 'pending' && (
            <button
              type="button"
              onClick={() => {
                rejectPartner(partner);
                showToast(t('partnerDetail.page.rejectedProfile', { name: partner.name }), 'error');
              }}
              className={`bg-surface-container-lowest text-error hover:bg-error-container/30 ${HEADER_BUTTON_CLASS}`}
            >
              <Icon name="block" className="text-[18px]" />
              <span>{t('partnerDetail.page.rejectProfile')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setModal('notify')}
            className={`bg-surface-container-lowest text-on-surface hover:bg-surface-container ${HEADER_BUTTON_CLASS}`}
          >
            <Icon name="forward_to_inbox" className="text-[18px] text-primary" />
            <span>{t('partnerDetail.page.sendNotification')}</span>
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
            <span>{t('partnerDetail.page.editDetails')}</span>
          </button>
          {partner.status === 'pending' && (
            <button
              type="button"
              onClick={() => {
                approvePartner(partner);
                showToast(t('partnerDetail.page.approvedProfile', { name: partner.name }));
              }}
              className={`bg-primary px-5 text-on-primary shadow-md hover:bg-primary-container ${HEADER_BUTTON_CLASS}`}
            >
              <Icon name="verified" className="text-[18px]" />
              <span>{t('partnerDetail.page.approvePartner')}</span>
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
          <span className="font-label-sm text-label-sm text-outline">
            {t('partnerDetail.page.verificationDocuments')}
          </span>
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
              t('partnerDetail.page.aPreviewWillAvailable', {
                name: profile.legal.licenseFile.name,
              }),
              'info',
            )
          }
          onGrantPermissions={() =>
            showToast(t('partnerDetail.page.fineGrainedPermissionsPartner'), 'info')
          }
          onResendActivation={handleResendActivation}
          onScheduleReview={() => setModal('schedule')}
        />
      )}
      {tab === 'place' && (
        <PartnerPlaceTab
          listings={listings.filter((listing) => listing.partnerId === partner.id)}
        />
      )}
      {tab === 'ratings' && <RatingsTab profile={profile} />}
      {tab === 'audit' && <AuditLogTab entries={auditEntries} />}

      {/* Ghi chú bảo mật */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-surface-container-lowest p-4 px-6 font-body-sm text-body-sm text-on-surface-variant shadow-sm">
        <div className="flex items-center gap-2">
          <Icon name="verified_user" className="text-[18px] text-primary" />
          <span>{t('partnerDetail.page.accountInterventionPolicyEvery')}</span>
        </div>
        <div className="flex items-center gap-3 font-label-sm text-label-sm">
          <span className="text-outline">
            {t('partnerDetail.page.inspectionSessionId', { sessionCode })}
          </span>
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            <Icon name="print" className="text-[16px]" />
            {t('partnerDetail.page.printProfileExtract')}
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
          title={t('partnerDetail.page.sendNotificationPartner')}
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
    </div>
  );
}
