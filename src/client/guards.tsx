import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import ClientAuthProvider from '@/client/auth/ClientAuthProvider';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import ClientShell from '@/client/layouts/ClientShell';
import PartnerProfileProvider from '@/client/partner/PartnerProfileProvider';
import { usePartnerProfile } from '@/client/partner/partnerProfileContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import TravellerProvider from '@/client/traveller/TravellerProvider';
import { Spinner } from '@/client/ui/Blocks';

/** Gốc của khu client: phiên đăng nhập riêng + tải trang theo từng chunk */
export function ClientRoot() {
  return (
    <ClientAuthProvider>
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </ClientAuthProvider>
  );
}

/** Màn đăng nhập / đăng ký: đã đăng nhập thì vào trang chủ */
export function GuestOnlyClient() {
  const { user } = useClientAuth();
  return user ? <Navigate to={CLIENT_ROUTES.HOME} replace /> : <Outlet />;
}

/** Các trang cần đăng nhập — bọc khung chung (header, thanh chuyển vai trò, menu) */
export function ClientAppLayout() {
  const { user } = useClientAuth();
  const location = useLocation();
  if (!user) {
    // Mở thẳng trang chủ khi chưa đăng nhập → màn chào mừng (như app mobile)
    if (location.pathname === CLIENT_ROUTES.HOME) {
      return <Navigate to={CLIENT_ROUTES.WELCOME} replace />;
    }
    return (
      <Navigate
        to={CLIENT_ROUTES.LOGIN}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  // key: đổi tài khoản thì tải lại hồ sơ đối tác + dữ liệu du khách
  return (
    <PartnerProfileProvider key={user.id}>
      <TravellerProvider key={user.id} userId={user.id}>
        <ClientShell />
      </TravellerProvider>
    </PartnerProfileProvider>
  );
}

/** Các màn quản lý của đối tác: chỉ khi hồ sơ đã được duyệt (ACTIVE) */
export function RequireActivePartner() {
  const { profile } = usePartnerProfile();
  if (profile === undefined) return <Spinner />;
  if (profile?.status !== 'ACTIVE') return <Navigate to={CLIENT_ROUTES.PARTNER} replace />;
  return <Outlet />;
}
