import { Trans, useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { formatCurrencyVnd } from '@/pages/PartnerDetail/partnerProfileUtils';
import type { Partner, PartnerCertification, PartnerProfile } from '@/types';
import { formatDate } from '@/utils/format';
import { getInitials } from '@/utils/string';
import DetailCard, { CARD_LINK_BUTTON_CLASS, FieldLabel } from './DetailCard';

interface LegalTabProps {
  partner: Partner;
  profile: PartnerProfile;
  onViewLicense: () => void;
  onGrantPermissions: () => void;
  onResendActivation: () => void;
  onScheduleReview: () => void;
  onAdjustCommission: () => void;
}

const VERIFIED_BADGE_CLASS =
  'flex items-center gap-1 rounded-full bg-secondary-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container';

const CERT_TONE_CLASS: Record<PartnerCertification['tone'], string> = {
  valid: 'bg-secondary-container text-on-secondary-container',
  trust: 'bg-primary-fixed text-on-primary-fixed',
  warning: 'bg-tertiary-fixed text-on-tertiary-fixed',
};

export default function LegalTab({
  partner,
  profile,
  onViewLicense,
  onGrantPermissions,
  onResendActivation,
  onScheduleReview,
  onAdjustCommission,
}: LegalTabProps) {
  const { t } = useTranslation();
  const { legal, contact, agreement } = profile;
  const initials = getInitials(contact.name);
  const isActive = partner.status === 'active';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Khối 1: Thông tin pháp lý & ĐKKD */}
      <DetailCard
        icon="domain"
        iconBoxClass="bg-primary-container/10 text-primary"
        title={t('partnerDetail.legalTab.legalBusinessRegistration')}
        subtitle={t('partnerDetail.legalTab.notarizedCorporateLegalDocuments')}
        badge={
          partner.status === 'pending' ? (
            <span className="rounded-full bg-tertiary-fixed px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed">
              {t('partnerDetail.legalTab.pendingVerification')}
            </span>
          ) : (
            <span className={VERIFIED_BADGE_CLASS}>
              <Icon name="verified" className="text-[14px]" />
              {t('partnerDetail.legalTab.verified')}
            </span>
          )
        }
        footer={
          <>
            <div className="flex min-w-0 items-center gap-2">
              <Icon name="attach_file" className="text-[18px] text-outline" />
              <span className="truncate font-label-sm text-label-sm text-on-surface-variant">
                {legal.licenseFile.name} ({legal.licenseFile.size})
              </span>
            </div>
            <button type="button" onClick={onViewLicense} className={CARD_LINK_BUTTON_CLASS}>
              <Icon name="visibility" className="text-[16px]" />
              <span>{t('partnerDetail.legalTab.viewOriginalFile')}</span>
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 font-body-sm text-body-sm md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel>{t('partnerDetail.legalTab.fullCompanyName')}</FieldLabel>
            <span className="font-title-md text-title-md font-semibold text-on-surface">
              {legal.fullName}
            </span>
          </div>
          <div>
            <FieldLabel>{t('partnerDetail.legalTab.taxCodeBusinessLicense')}</FieldLabel>
            <span className="font-body-md text-body-md font-semibold text-on-surface">
              {partner.taxCode}
            </span>
          </div>
          <div>
            <FieldLabel>{t('partnerDetail.legalTab.founded')}</FieldLabel>
            <span className="font-body-md text-body-md text-on-surface">
              {formatDate(legal.foundedAt)}
            </span>
          </div>
          <div>
            <FieldLabel>{t('partnerDetail.legalTab.issuingAuthority')}</FieldLabel>
            <span className="font-body-md text-body-md text-on-surface">{legal.issuer}</span>
          </div>
          <div>
            <FieldLabel>{t('partnerDetail.legalTab.registeredCharterCapital')}</FieldLabel>
            <span className="font-body-md text-body-md font-semibold text-secondary">
              {formatCurrencyVnd(legal.charterCapital)}
            </span>
          </div>
          <div className="md:col-span-2">
            <FieldLabel>{t('partnerDetail.legalTab.headOfficeAddress')}</FieldLabel>
            <div className="flex items-center gap-1.5 text-on-surface">
              <Icon name="location_on" className="shrink-0 text-[16px] text-primary" />
              <span>{legal.headOffice}</span>
            </div>
          </div>
          <div>
            <FieldLabel>{t('partnerDetail.legalTab.legalRepresentative')}</FieldLabel>
            <span className="font-body-md text-body-md font-semibold text-on-surface">
              {legal.legalRepresentative}
            </span>
          </div>
          <div>
            <FieldLabel>{t('partnerDetail.legalTab.representativeSIdNumber')}</FieldLabel>
            <span className="font-body-md text-body-md text-on-surface">
              {legal.idNumberMasked}
            </span>
          </div>
        </div>
      </DetailCard>

      {/* Khối 2: Liên hệ & Quản trị đại diện */}
      <DetailCard
        icon="manage_accounts"
        iconBoxClass="bg-secondary-container/40 text-secondary"
        title={t('partnerDetail.legalTab.contactRepresentativeAdmin')}
        subtitle={t('partnerDetail.legalTab.pointContactSupportTransaction')}
        badge={
          <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
            {t('partnerDetail.legalTab.n2fa')}{' '}
            {contact.twoFactor ? t('partnerDetail.legalTab.on') : t('partnerDetail.legalTab.off')}
          </span>
        }
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              onClick={onGrantPermissions}
              className="rounded-full bg-surface-container px-3.5 py-1.5 font-label-sm text-label-sm font-semibold text-on-surface transition-all hover:bg-surface-container-high"
            >
              {t('partnerDetail.legalTab.grantExtraPermissions')}
            </button>
            <button
              type="button"
              onClick={onResendActivation}
              className="rounded-full bg-primary px-3.5 py-1.5 font-label-sm text-label-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
            >
              {t('partnerDetail.legalTab.resendActivationCode')}
            </button>
          </div>
        }
      >
        <div className="space-y-3 font-body-sm text-body-sm">
          <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-on-primary">
                {initials}
              </div>
              <div>
                <div className="font-title-md text-title-md font-semibold text-on-surface">
                  {contact.name}
                </div>
                <div className="font-label-sm text-label-sm text-outline">
                  {t('partnerDetail.legalTab.position', { position: contact.position })}
                </div>
              </div>
            </div>
            <span className="rounded-full bg-primary-fixed px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-primary-fixed">
              {t('partnerDetail.legalTab.primaryAdmin')}
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-surface-container-low p-3">
              <span className="mb-1 block font-label-sm text-label-sm tracking-wider text-outline uppercase">
                {t('partnerDetail.legalTab.notificationEmail')}
              </span>
              <div className="flex items-center gap-1.5">
                <Icon name="mail" className="text-[16px] text-primary" />
                <a
                  className="truncate font-body-md text-body-md text-on-surface hover:underline"
                  href={`mailto:${contact.email}`}
                >
                  {contact.email}
                </a>
              </div>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <span className="mb-1 block font-label-sm text-label-sm tracking-wider text-outline uppercase">
                {t('partnerDetail.legalTab.otpPhoneNumber')}
              </span>
              <div className="flex items-center gap-1.5">
                <Icon name="phone_android" className="text-[16px] text-primary" />
                <span className="font-body-md text-body-md font-semibold text-on-surface">
                  {contact.otpPhone}
                </span>
              </div>
            </div>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3.5">
            <span className="mb-2 block font-label-sm text-label-sm tracking-wider text-outline uppercase">
              {t('partnerDetail.legalTab.paymentGatewayBusinessAccount')}
            </span>
            {contact.bank ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon name="account_balance" className="text-[20px] text-secondary" />
                  <div>
                    <div className="font-body-md text-body-md font-semibold text-on-surface">
                      {contact.bank.name}
                    </div>
                    <div className="font-body-sm text-body-sm text-outline">
                      STK: <strong className="text-on-surface">{contact.bank.account}</strong> (
                      {contact.bank.currency})
                    </div>
                  </div>
                </div>
                {contact.escrow && (
                  <span className="rounded-full bg-secondary-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-secondary-container">
                    {t('partnerDetail.legalTab.aiEscrowDeposit')}
                  </span>
                )}
              </div>
            ) : (
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                {t('partnerDetail.legalTab.thisPartnerHasNot')}
              </span>
            )}
          </div>
        </div>
      </DetailCard>

      {/* Khối 3: Thẩm định & Chứng nhận ngành */}
      <DetailCard
        icon="workspace_premium"
        iconBoxClass="bg-tertiary-fixed/40 text-tertiary"
        title={t('partnerDetail.legalTab.assessmentsIndustryCertifications')}
        subtitle={t('partnerDetail.legalTab.periodicQualityInspectionTourism')}
        badge={
          <span className="flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed">
            <Icon name="hotel_class" className="text-[14px]" />
            {profile.tierLabel} Partner
          </span>
        }
        footer={
          <>
            <span className="font-label-sm text-label-sm text-outline">
              <Trans
                i18nKey="partnerDetail.legalTab.nextAssessmentDue"
                values={{ nextReviewDate: formatDate(profile.nextReviewDate) }}
                components={{ c0: <strong className="text-on-surface" /> }}
              />
            </span>
            <button type="button" onClick={onScheduleReview} className={CARD_LINK_BUTTON_CLASS}>
              <Icon name="schedule" className="text-[16px]" />
              <span>{t('partnerDetail.legalTab.scheduleReAssessment')}</span>
            </button>
          </>
        }
      >
        <div className="space-y-2.5">
          {profile.certifications.map((cert) => (
            <div
              key={cert.title}
              className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-low p-3"
            >
              <div className="flex items-center gap-3">
                <Icon name={cert.icon} className="text-[22px] text-primary" />
                <div>
                  <div className="font-body-md text-body-md font-semibold text-on-surface">
                    {cert.title}
                  </div>
                  <div className="font-label-sm text-label-sm text-outline">{cert.meta}</div>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-0.5 font-label-sm text-label-sm font-semibold ${CERT_TONE_CLASS[cert.tone]}`}
              >
                {cert.statusLabel}
              </span>
            </div>
          ))}
        </div>
      </DetailCard>

      {/* Khối 4: Thỏa thuận hợp tác & Chiết khấu */}
      <DetailCard
        icon="handshake"
        iconBoxClass="bg-primary-container/10 text-primary"
        title={t('partnerDetail.legalTab.partnershipAgreementCommission')}
        subtitle={t('partnerDetail.legalTab.commissionPolicyRoomTicket')}
        badge={
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 font-label-sm text-label-sm font-semibold ${
              isActive
                ? 'bg-secondary-container text-on-secondary-container'
                : 'bg-surface-container-high text-on-surface-variant'
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-primary' : 'bg-outline'}`}
            />
            {isActive ? t('partnerDetail.legalTab.active') : t('partnerDetail.legalTab.suspended')}
          </span>
        }
        footer={
          <>
            <span className="font-label-sm text-label-sm text-outline">
              <Trans
                i18nKey="partnerDetail.legalTab.contract"
                values={{ contractCode: agreement.contractCode }}
                components={{ c0: <strong className="text-on-surface" /> }}
              />
            </span>
            <button type="button" onClick={onAdjustCommission} className={CARD_LINK_BUTTON_CLASS}>
              <Icon name="edit_document" className="text-[16px]" />
              <span>{t('partnerDetail.legalTab.adjustCommission')}</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 font-body-sm text-body-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <FieldLabel>{t('partnerDetail.legalTab.contractType')}</FieldLabel>
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                {agreement.type}
              </span>
            </div>
            <div className="rounded-xl bg-secondary-container/30 p-3">
              <span className="mb-1 block font-label-sm text-label-sm font-semibold tracking-wider text-secondary uppercase">
                {t('partnerDetail.legalTab.platformCommissionRate')}
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-secondary">
                {agreement.commission} %
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <FieldLabel>{t('partnerDetail.legalTab.activated')}</FieldLabel>
              <span className="font-body-md text-body-md text-on-surface">
                {formatDate(agreement.activatedAt)}
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <FieldLabel>{t('partnerDetail.legalTab.nextRenewalDate')}</FieldLabel>
              <span className="font-body-md text-body-md font-semibold text-primary">
                {formatDate(agreement.renewAt)}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-surface-container-low p-3">
            <div className="flex items-center gap-2">
              <Icon name="payments" className="text-[18px] text-outline" />
              <div>
                <div className="font-body-md text-body-md font-medium text-on-surface">
                  {t('partnerDetail.legalTab.otaSettlementCycle')}
                </div>
                <div className="font-label-sm text-label-sm text-outline">
                  {agreement.paymentCycle}
                </div>
              </div>
            </div>
            <span className="font-label-sm text-label-sm font-semibold text-primary">
              {agreement.paymentMode}
            </span>
          </div>
        </div>
      </DetailCard>
    </div>
  );
}
