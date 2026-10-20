import Icon from '../../../components/common/Icon';
import type { Partner, PartnerCertification, PartnerProfile } from '../../../types/admin';
import { formatDate } from '../../../utils/format';
import { formatCurrencyVnd } from '../partnerProfileUtils';
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
  const { legal, contact, agreement } = profile;
  const initials = contact.name
    .split(' ')
    .filter(Boolean)
    .slice(-2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  const isActive = partner.status === 'active';

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Khối 1: Thông tin pháp lý & ĐKKD */}
      <DetailCard
        icon="domain"
        iconBoxClass="bg-primary-container/10 text-primary"
        title="Thông tin pháp lý & ĐKKD"
        subtitle="Hồ sơ pháp nhân doanh nghiệp đã được công chứng"
        badge={
          partner.status === 'pending' ? (
            <span className="rounded-full bg-tertiary-fixed px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed">
              Chờ xác minh
            </span>
          ) : (
            <span className={VERIFIED_BADGE_CLASS}>
              <Icon name="verified" className="text-[14px]" />
              Đã xác thực
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
              <span>Xem tệp gốc</span>
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 font-body-sm text-body-sm md:grid-cols-2">
          <div className="md:col-span-2">
            <FieldLabel>Tên đầy đủ công ty</FieldLabel>
            <span className="font-title-md text-title-md font-semibold text-on-surface">
              {legal.fullName}
            </span>
          </div>
          <div>
            <FieldLabel>Mã số thuế / Số GPKD</FieldLabel>
            <span className="font-body-md text-body-md font-semibold text-on-surface">
              {partner.taxCode}
            </span>
          </div>
          <div>
            <FieldLabel>Ngày thành lập</FieldLabel>
            <span className="font-body-md text-body-md text-on-surface">
              {formatDate(legal.foundedAt)}
            </span>
          </div>
          <div>
            <FieldLabel>Cơ quan cấp phép</FieldLabel>
            <span className="font-body-md text-body-md text-on-surface">{legal.issuer}</span>
          </div>
          <div>
            <FieldLabel>Vốn điều lệ đăng ký</FieldLabel>
            <span className="font-body-md text-body-md font-semibold text-secondary">
              {formatCurrencyVnd(legal.charterCapital)}
            </span>
          </div>
          <div className="md:col-span-2">
            <FieldLabel>Địa chỉ trụ sở chính</FieldLabel>
            <div className="flex items-center gap-1.5 text-on-surface">
              <Icon name="location_on" className="shrink-0 text-[16px] text-primary" />
              <span>{legal.headOffice}</span>
            </div>
          </div>
          <div>
            <FieldLabel>Người đại diện pháp luật</FieldLabel>
            <span className="font-body-md text-body-md font-semibold text-on-surface">
              {legal.legalRepresentative}
            </span>
          </div>
          <div>
            <FieldLabel>Số CCCD / CMND đại diện</FieldLabel>
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
        title="Liên hệ & Quản trị đại diện"
        subtitle="Đầu mối tiếp nhận hỗ trợ và xác thực giao dịch"
        badge={
          <span className="rounded-full bg-surface-container px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-surface-variant">
            Khóa 2FA: {contact.twoFactor ? 'Bật' : 'Tắt'}
          </span>
        }
        footer={
          <div className="flex w-full items-center justify-end gap-2">
            <button
              type="button"
              onClick={onGrantPermissions}
              className="rounded-full bg-surface-container px-3.5 py-1.5 font-label-sm text-label-sm font-semibold text-on-surface transition-all hover:bg-surface-container-high"
            >
              Phân quyền bổ sung
            </button>
            <button
              type="button"
              onClick={onResendActivation}
              className="rounded-full bg-primary px-3.5 py-1.5 font-label-sm text-label-sm font-semibold text-on-primary shadow-sm transition-all hover:bg-primary-container"
            >
              Gửi mã kích hoạt lại
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
                  Chức vụ: {contact.position}
                </div>
              </div>
            </div>
            <span className="rounded-full bg-primary-fixed px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-primary-fixed">
              Admin chính
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl bg-surface-container-low p-3">
              <span className="mb-1 block font-label-sm text-label-sm tracking-wider text-outline uppercase">
                Email tiếp nhận thông báo
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
                Số điện thoại nhận OTP
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
              Cổng thanh toán & Tài khoản doanh nghiệp
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
                    Ký quỹ AI Escrow
                  </span>
                )}
              </div>
            ) : (
              <span className="font-body-sm text-body-sm text-on-surface-variant">
                Đối tác chưa liên kết tài khoản thanh toán
              </span>
            )}
          </div>
        </div>
      </DetailCard>

      {/* Khối 3: Thẩm định & Chứng nhận ngành */}
      <DetailCard
        icon="workspace_premium"
        iconBoxClass="bg-tertiary-fixed/40 text-tertiary"
        title="Thẩm định & Chứng nhận ngành"
        subtitle="Kiểm định chất lượng dịch vụ du lịch & lưu trú định kỳ"
        badge={
          <span className="flex items-center gap-1 rounded-full bg-tertiary-fixed px-2.5 py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed">
            <Icon name="hotel_class" className="text-[14px]" />
            {profile.tierLabel} Partner
          </span>
        }
        footer={
          <>
            <span className="font-label-sm text-label-sm text-outline">
              Hạn kỳ thẩm định tiếp theo:{' '}
              <strong className="text-on-surface">{formatDate(profile.nextReviewDate)}</strong>
            </span>
            <button type="button" onClick={onScheduleReview} className={CARD_LINK_BUTTON_CLASS}>
              <Icon name="schedule" className="text-[16px]" />
              <span>Lên lịch tái thẩm định</span>
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
        title="Thỏa thuận hợp tác & Chiết khấu"
        subtitle="Quy chế hoa hồng và điều khoản phát hành phòng/vé"
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
            {isActive ? 'Đang hoạt động' : 'Tạm ngưng'}
          </span>
        }
        footer={
          <>
            <span className="font-label-sm text-label-sm text-outline">
              Hợp đồng: <strong className="text-on-surface">{agreement.contractCode}</strong>
            </span>
            <button type="button" onClick={onAdjustCommission} className={CARD_LINK_BUTTON_CLASS}>
              <Icon name="edit_document" className="text-[16px]" />
              <span>Điều chỉnh chiết khấu</span>
            </button>
          </>
        }
      >
        <div className="space-y-3 font-body-sm text-body-sm">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <FieldLabel>Loại hợp đồng</FieldLabel>
              <span className="font-body-md text-body-md font-semibold text-on-surface">
                {agreement.type}
              </span>
            </div>
            <div className="rounded-xl bg-secondary-container/30 p-3">
              <span className="mb-1 block font-label-sm text-label-sm font-semibold tracking-wider text-secondary uppercase">
                Mức hoa hồng hệ thống
              </span>
              <span className="font-headline-sm text-headline-sm font-bold text-secondary">
                {agreement.commission} %
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container-low p-3">
              <FieldLabel>Ngày kích hoạt</FieldLabel>
              <span className="font-body-md text-body-md text-on-surface">
                {formatDate(agreement.activatedAt)}
              </span>
            </div>
            <div className="rounded-xl bg-surface-container-low p-3">
              <FieldLabel>Ngày gia hạn kế tiếp</FieldLabel>
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
                  Chu kỳ thanh toán đối soát OTA
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
