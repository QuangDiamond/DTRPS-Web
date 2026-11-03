import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import type { RoleName } from '@/client/api/types';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Card, CardTitle, Heading, InfoLine } from '@/client/ui/Blocks';
import { SecondaryButton } from '@/client/ui/Buttons';

const ROLE_LABELS: Record<RoleName, string> = {
  TRAVELLER: 'Du khách',
  BUSINESS_OWNER: 'Đối tác',
  ADMIN: 'Quản trị viên',
};

/** Hồ sơ du khách — thông tin lấy từ phiên đăng nhập (GET /api/users/me) */
export default function ProfilePage() {
  const { user, logout } = useClientAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <Heading
        eyebrow="TÀI KHOẢN CỦA BẠN"
        title="Hồ sơ cá nhân"
        description="Thông tin tài khoản SmartTravel."
      />
      <Card>
        <div className="mb-4 flex flex-col items-center">
          <Icon name="account_circle" className="text-[68px] text-primary" />
          <CardTitle>{user.name}</CardTitle>
          <p className="text-[12px] text-client-muted">{user.email}</p>
        </div>
        <InfoLine label="Số điện thoại" value={user.phoneNumber ?? 'Chưa cập nhật'} />
        <InfoLine
          label="Vai trò"
          value={user.roles.map((role) => ROLE_LABELS[role] ?? role).join(', ')}
        />
      </Card>
      <Link
        to={CLIENT_ROUTES.PARTNER}
        className="mb-3 flex items-center justify-between rounded-[20px] border border-client-line bg-white p-4 hover:border-primary/40"
      >
        <span className="flex items-center gap-3">
          <Icon name="storefront" className="text-[24px] text-primary" />
          <span className="text-[14px] font-bold text-client-ink">Khu vực đối tác</span>
        </span>
        <Icon name="chevron_right" className="text-[20px] text-primary" />
      </Link>
      <SecondaryButton
        onClick={() => {
          logout();
          navigate(CLIENT_ROUTES.LOGIN, { replace: true });
        }}
      >
        Đăng xuất
      </SecondaryButton>
    </div>
  );
}
