import { Suspense } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import ClientAuthProvider from '@/client/auth/ClientAuthProvider';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import ClientShell from '@/client/layouts/ClientShell';
import PartnerProfileProvider from '@/client/partner/PartnerProfileProvider';
import {
  PartnerProfileContext,
  type PartnerProfileValue,
  usePartnerProfile,
} from '@/client/partner/partnerProfileContext';
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

/** Khách chưa đăng nhập: không có hồ sơ đối tác (không gọi API) */
const GUEST_PARTNER: PartnerProfileValue = {
  profile: null,
  error: null,
  reload: () => undefined,
  setProfile: () => undefined,
};

/**
 * Khung chung (header, thanh chuyển vai trò, menu) cho cả khách và người đã đăng nhập.
 * Khách xem được trang chủ, khám phá, chi tiết địa điểm; các trang khác bọc RequireClientLogin.
 */
export function ClientAppLayout() {
  const { user } = useClientAuth();
  if (!user) {
    return (
      <PartnerProfileContext.Provider value={GUEST_PARTNER}>
        <TravellerProvider userId={0} guest>
          <ClientShell />
        </TravellerProvider>
      </PartnerProfileContext.Provider>
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

/** Trang cần đăng nhập (lịch trình, yêu thích, hồ sơ, đối tác) — đăng nhập xong quay lại đúng trang */
export function RequireClientLogin() {
  const { user } = useClientAuth();
  const location = useLocation();
  if (user) return <Outlet />;
  return (
    <Navigate
      to={CLIENT_ROUTES.LOGIN}
      replace
      state={{ from: `${location.pathname}${location.search}` }}
    />
  );
}

/** Các màn quản lý của đối tác: chỉ khi hồ sơ đã được duyệt (ACTIVE) */
export function RequireActivePartner() {
  const { profile } = usePartnerProfile();
  if (profile === undefined) return <Spinner />;
  if (profile?.status !== 'ACTIVE') return <Navigate to={CLIENT_ROUTES.PARTNER} replace />;
  return <Outlet />;
}
