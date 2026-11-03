import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { usePartnerProfile } from '@/client/partner/partnerProfileContext';
import { formatDate, PROFILE_STATUS, profileCode } from '@/client/partner/profileStatus';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Card, CardTitle, Heading, InfoLine, StatusBadge } from '@/client/ui/Blocks';
import { PrimaryButton } from '@/client/ui/Buttons';

/** /partner/profile — hồ sơ doanh nghiệp đã được duyệt */
export default function PartnerBusinessProfilePage() {
  const navigate = useNavigate();
  const { profile } = usePartnerProfile();
  if (!profile) return null;
  const status = PROFILE_STATUS[profile.status];

  return (
    <div className="mx-auto max-w-2xl">
      <Heading
        eyebrow="TÀI KHOẢN ĐỐI TÁC"
        title="Hồ sơ doanh nghiệp"
        description="Thông tin doanh nghiệp và người đại diện trên SmartTravel."
      />
      <Card>
        <div className="mb-4 flex flex-col items-center gap-1">
          <Icon name="storefront" className="text-[56px] text-primary" />
          <CardTitle>{profile.businessName}</CardTitle>
          <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
        </div>
        <InfoLine label="Mã hồ sơ" value={profileCode(profile)} />
        <InfoLine label="Mã số thuế" value={profile.taxCode} />
        <InfoLine label="Người đại diện" value={profile.ownerName} />
        <InfoLine label="Email liên hệ" value={profile.contactEmail} />
        <InfoLine label="Số điện thoại" value={profile.contactPhone} />
        <InfoLine label="Ngày được duyệt" value={formatDate(profile.approvedAt)} />
      </Card>
      <PrimaryButton onClick={() => navigate(CLIENT_ROUTES.PARTNER_APPLY)}>
        Chỉnh sửa hồ sơ
      </PrimaryButton>
    </div>
  );
}
