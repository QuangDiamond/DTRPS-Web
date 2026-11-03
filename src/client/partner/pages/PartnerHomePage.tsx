import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import type { BusinessProfile } from '@/client/api/types';
import PartnerDashboard from '@/client/partner/components/PartnerDashboard';
import { usePartnerProfile } from '@/client/partner/partnerProfileContext';
import { formatDate, PROFILE_STATUS, profileCode } from '@/client/partner/profileStatus';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  Card,
  CardTitle,
  FormAlert,
  Heading,
  InfoLine,
  Notice,
  Spinner,
  StatusBadge,
} from '@/client/ui/Blocks';
import { PrimaryButton, SecondaryButton } from '@/client/ui/Buttons';

function StatusCard({ profile }: { profile: BusinessProfile }) {
  const status = PROFILE_STATUS[profile.status];
  return (
    <Card>
      <div className="flex items-center justify-between">
        <CardTitle>{profile.businessName}</CardTitle>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </div>
      <div className="mt-3">
        <InfoLine label="Mã hồ sơ" value={profileCode(profile)} />
        <InfoLine label="Mã số thuế" value={profile.taxCode} />
        <InfoLine label="Ngày gửi" value={formatDate(profile.createdAt)} />
        <InfoLine label="Cập nhật lần cuối" value={formatDate(profile.updatedAt)} />
      </div>
    </Card>
  );
}

/** Chưa có hồ sơ — "Trở thành đối tác" */
function BecomePartner() {
  const navigate = useNavigate();
  const benefits: [string, string, string][] = [
    ['storefront', 'Giới thiệu địa điểm', 'Tiếp cận thêm khách du lịch.'],
    ['edit_location_alt', 'Quản lý thông tin', 'Cập nhật địa chỉ, giờ mở cửa, giá và tiện ích.'],
    ['star', 'Theo dõi đánh giá', 'Lắng nghe và cải thiện trải nghiệm.'],
  ];
  return (
    <>
      <Heading
        eyebrow="CÙNG SMARTTRAVEL PHÁT TRIỂN"
        title="Bạn muốn trở thành người đồng hành cùng chúng tôi?"
        description="Giới thiệu địa điểm của bạn đến cộng đồng du lịch và phát triển hoạt động kinh doanh."
      />
      <div className="grid gap-3 md:grid-cols-3">
        {benefits.map(([icon, title, description]) => (
          <Card key={title} className="mb-0">
            <div className="flex items-center gap-3">
              <Icon name={icon} className="text-[28px] text-primary" />
              <div>
                <CardTitle>{title}</CardTitle>
                <p className="text-[12px] text-client-muted">{description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
      <div className="mt-4 max-w-md">
        <Notice>Đăng ký → Admin xét duyệt → kích hoạt quyền đối tác (Business Owner).</Notice>
        <PrimaryButton onClick={() => navigate(CLIENT_ROUTES.PARTNER_APPLY)}>
          Đăng ký trở thành đối tác
        </PrimaryButton>
      </div>
    </>
  );
}

/** /partner — hiển thị theo trạng thái hồ sơ doanh nghiệp */
export default function PartnerHomePage() {
  const navigate = useNavigate();
  const { profile, error, reload } = usePartnerProfile();

  if (error) {
    return (
      <div className="mx-auto max-w-md">
        <FormAlert message={error} />
        <SecondaryButton onClick={reload}>Thử lại</SecondaryButton>
      </div>
    );
  }
  if (profile === undefined) return <Spinner />;
  if (profile === null) return <BecomePartner />;
  if (profile.status === 'ACTIVE') return <PartnerDashboard profile={profile} />;

  return (
    <div className="mx-auto max-w-2xl">
      {profile.status === 'PENDING' && (
        <>
          <Heading
            eyebrow="THEO DÕI HỒ SƠ"
            title="Trạng thái đăng ký"
            description="Theo dõi quá trình Admin xác minh thông tin doanh nghiệp của bạn."
          />
          <StatusCard profile={profile} />
          <Notice tone="warning">
            Admin đang xem xét hồ sơ. Bạn vẫn có thể chỉnh sửa thông tin trong lúc chờ.
          </Notice>
          <SecondaryButton onClick={() => navigate(CLIENT_ROUTES.PARTNER_APPLY)}>
            Xem / sửa thông tin đăng ký
          </SecondaryButton>
        </>
      )}

      {profile.status === 'INACTIVE' && (
        <>
          <Heading
            eyebrow="THEO DÕI HỒ SƠ"
            title="Hồ sơ chưa được duyệt"
            description="Vui lòng chỉnh sửa theo góp ý của Admin rồi gửi lại."
          />
          <StatusCard profile={profile} />
          <Notice tone="danger">
            <strong>Lý do từ chối:</strong> {profile.statusNote ?? 'Admin không ghi lý do.'}
          </Notice>
          <PrimaryButton onClick={() => navigate(CLIENT_ROUTES.PARTNER_APPLY)}>
            Chỉnh sửa và gửi lại
          </PrimaryButton>
        </>
      )}

      {profile.status === 'SUSPENDED' && (
        <>
          <Heading
            eyebrow="TÀI KHOẢN ĐỐI TÁC"
            title="Tài khoản đối tác đang bị tạm khóa"
            description="Địa điểm của bạn tạm thời không hiển thị với du khách."
          />
          <StatusCard profile={profile} />
          <Notice tone="danger">
            <strong>Lý do:</strong> {profile.statusNote ?? 'Admin không ghi lý do.'} Vui lòng liên
            hệ quản trị viên SmartTravel để được hỗ trợ.
          </Notice>
        </>
      )}
    </div>
  );
}
