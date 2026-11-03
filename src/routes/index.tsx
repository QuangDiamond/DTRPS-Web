import { lazy, type ReactNode, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { clientRoutes } from '@/client/routes';
import { PageLoader } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import AdminLayout from '@/layouts/AdminLayout';
import { GuestOnly, RequireAuth } from './RouteGuards';

// Mỗi trang là một chunk riêng — chỉ tải khi người dùng mở trang đó
const LoginPage = lazy(() => import('@/pages/Auth/Login/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/Auth/ForgotPassword/ForgotPasswordPage'));
const VerifyOtpPage = lazy(() => import('@/pages/Auth/VerifyOtp/VerifyOtpPage'));
const ResetPasswordPage = lazy(() => import('@/pages/Auth/ResetPassword/ResetPasswordPage'));
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboard/AdminDashboardPage'));
const UserListPage = lazy(() => import('@/pages/UserAdmin/UserListPage'));
const UserAdminDetailPage = lazy(() => import('@/pages/UserAdmin/UserAdminDetailPage'));
const PartnersPage = lazy(() => import('@/pages/Partners/PartnersPage'));
const PartnerDetailPage = lazy(() => import('@/pages/PartnerDetail/PartnerDetailPage'));
// Duyệt địa điểm của đối tác (dữ liệu thật)
const PlaceReviewQueuePage = lazy(() => import('@/pages/PlaceReview/PlaceReviewQueuePage'));
const ListingReviewPage = lazy(() => import('@/pages/PlaceReview/ListingReviewPage'));
const RevisionReviewPage = lazy(() => import('@/pages/PlaceReview/RevisionReviewPage'));
const PlaceCatalogPage = lazy(() => import('@/pages/PlaceCatalog/PlaceCatalogPage'));
const PlaceCatalogDetailPage = lazy(() => import('@/pages/PlaceCatalog/PlaceCatalogDetailPage'));
const AdminReportsPage = lazy(() => import('@/pages/AdminMisc/AdminReportsPage'));
const AdminNotificationsPage = lazy(() => import('@/pages/AdminMisc/AdminNotificationsPage'));
const AdminSettingsPage = lazy(() => import('@/pages/AdminMisc/AdminSettingsPage'));
const AdminProfilePage = lazy(() => import('@/pages/AdminMisc/AdminProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFound/NotFoundPage'));

/** Trang toàn màn hình (đăng nhập, 404) cần Suspense riêng vì không nằm trong AdminLayout */
const fullScreen = (page: ReactNode) => (
  <Suspense fallback={<PageLoader fullScreen />}>{page}</Suspense>
);

export const router = createBrowserRouter([
  // Khu client (du khách + đối tác): /, /login, /register, /explore, /partner…
  ...clientRoutes,

  // Màn xác thực: chỉ dành cho người chưa đăng nhập
  {
    element: <GuestOnly />,
    children: [
      { path: ROUTES.LOGIN, element: fullScreen(<LoginPage />) },
      { path: ROUTES.FORGOT_PASSWORD, element: fullScreen(<ForgotPasswordPage />) },
      { path: ROUTES.VERIFY_OTP, element: fullScreen(<VerifyOtpPage />) },
      { path: ROUTES.RESET_PASSWORD, element: fullScreen(<ResetPasswordPage />) },
    ],
  },

  // Trang quản trị: bắt buộc đăng nhập (Suspense nằm trong AdminLayout để giữ Sidebar/Header)
  {
    element: <RequireAuth />,
    children: [
      {
        path: ROUTES.ROOT,
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
          { path: ROUTES.DASHBOARD, element: <AdminDashboardPage /> },
          { path: ROUTES.USERS, element: <UserListPage /> },
          { path: ROUTES.USER_DETAIL, element: <UserAdminDetailPage /> },
          { path: ROUTES.PARTNERS, element: <PartnersPage /> },
          { path: ROUTES.PARTNER_DETAIL, element: <PartnerDetailPage /> },
          { path: ROUTES.LISTINGS, element: <PlaceReviewQueuePage /> },
          // Đường dẫn cũ → bộ lọc tương ứng trong hàng chờ
          {
            path: ROUTES.LISTINGS_PENDING,
            element: <Navigate to={`${ROUTES.LISTINGS}?status=pending`} replace />,
          },
          {
            path: ROUTES.LISTINGS_APPROVED,
            element: <Navigate to={`${ROUTES.LISTINGS}?status=approved`} replace />,
          },
          {
            path: ROUTES.LISTINGS_REJECTED,
            element: <Navigate to={`${ROUTES.LISTINGS}?status=rejected`} replace />,
          },
          { path: ROUTES.LISTING_REVISION, element: <RevisionReviewPage /> },
          { path: ROUTES.LISTING_REVIEW, element: <ListingReviewPage /> },
          { path: ROUTES.POIS, element: <PlaceCatalogPage /> },
          { path: ROUTES.POI_DETAIL, element: <PlaceCatalogDetailPage /> },
          // Thêm / sửa POI nền tảng chưa có API → về kho địa điểm
          { path: ROUTES.POI_NEW, element: <Navigate to={ROUTES.POIS} replace /> },
          { path: ROUTES.POI_EDIT, element: <Navigate to={ROUTES.POIS} replace /> },
          { path: ROUTES.REPORTS, element: <AdminReportsPage /> },
          { path: ROUTES.NOTIFICATIONS, element: <AdminNotificationsPage /> },
          { path: ROUTES.SETTINGS, element: <AdminSettingsPage /> },
          { path: ROUTES.PROFILE, element: <AdminProfilePage /> },
        ],
      },
    ],
  },

  { path: '*', element: fullScreen(<NotFoundPage />) },
]);
