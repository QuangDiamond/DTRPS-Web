import { Suspense, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import ClientAuthProvider from '@/client/auth/ClientAuthProvider';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import ClientShell from '@/client/layouts/ClientShell';
import ClientLiveProvider from '@/client/live/ClientLiveProvider';
import PartnerProfileProvider from '@/client/partner/PartnerProfileProvider';
import {
  PartnerProfileContext,
  type PartnerProfileValue,
  usePartnerProfile,
} from '@/client/partner/partnerProfileContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import TravellerProvider from '@/client/traveller/TravellerProvider';
import { Spinner } from '@/client/ui/Blocks';
import { clientSessionEnd } from '@/utils/sessionEnd';

/** Gốc của khu client: phiên đăng nhập riêng + tải trang theo từng chunk */
export function ClientRoot() {
  const { pathname } = useLocation();
  // Lý do mất phiên chỉ sống tới lần chuyển trang kế tiếp: guard đã mang nó sang trang đăng nhập
  // (qua state, còn khi F5); phiên hết hạn lúc đang xem trang công khai thì bỏ, không hiện nhầm sau này
  useEffect(() => {
    clientSessionEnd.clear();
  }, [pathname]);
  return (
    <ClientAuthProvider>
      <Suspense fallback={<Spinner />}>
        <Outlet />
      </Suspense>
    </ClientAuthProvider>
  );
}

/** Màn đăng nhập / đăng ký: đã đăng nhập thì vào trang chính của cổng mình */
export function GuestOnlyClient() {
  const { user, hasRole } = useClientAuth();
  if (!user) return <Outlet />;
  return (
    <Navigate to={hasRole('BUSINESS_OWNER') ? CLIENT_ROUTES.PARTNER : CLIENT_ROUTES.HOME} replace />
  );
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
  // Du khách / đối tác: giữ đăng nhập theo "Ghi nhớ" (30 ngày), không tự đăng xuất khi để yên —
  // giống Google, Shopee. Đổi mật khẩu / khoá tài khoản thì backend thu hồi phiên.
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
      <ClientLiveProvider key={user.id} userId={user.id}>
        <TravellerProvider key={user.id} userId={user.id}>
          <ClientShell />
        </TravellerProvider>
      </ClientLiveProvider>
    </PartnerProfileProvider>
  );
}

/** Trang cần đăng nhập (lịch trình, yêu thích, hồ sơ, đối tác) — đăng nhập xong quay lại đúng trang */
export function RequireClientLogin() {
  const { user } = useClientAuth();
  const location = useLocation();
  if (user) return <Outlet />;
  // Vừa mất phiên ngay trên trang này → mang lý do sang trang đăng nhập (khách mở trang thì không có)
  const ended = clientSessionEnd.get();
  // Trang của đối tác → về cổng đăng nhập Đối tác
  const partnerArea = location.pathname.startsWith(CLIENT_ROUTES.PARTNER);
  return (
    <Navigate
      to={partnerArea ? CLIENT_ROUTES.PARTNER_LOGIN : CLIENT_ROUTES.LOGIN}
      replace
      state={{ from: `${location.pathname}${location.search}`, ...(ended && { ended }) }}
    />
  );
}

/** Khu đối tác: chỉ tài khoản đối tác (du khách không có lối vào, về trang chủ) */
export function RequirePartner() {
  const { hasRole } = useClientAuth();
  return hasRole('BUSINESS_OWNER') ? <Outlet /> : <Navigate to={CLIENT_ROUTES.HOME} replace />;
}

/** Trang chỉ dành cho du khách (trang chủ, chuyến đi, yêu thích…): đối tác về trang đối tác */
export function TravellerOnly() {
  const { hasRole } = useClientAuth();
  return hasRole('BUSINESS_OWNER') ? <Navigate to={CLIENT_ROUTES.PARTNER} replace /> : <Outlet />;
}

/** Các màn quản lý của đối tác: chỉ khi hồ sơ đã được duyệt (ACTIVE) */
export function RequireActivePartner() {
  const { profile } = usePartnerProfile();
  if (profile === undefined) return <Spinner />;
  if (profile?.status !== 'ACTIVE') return <Navigate to={CLIENT_ROUTES.PARTNER} replace />;
  return <Outlet />;
}
