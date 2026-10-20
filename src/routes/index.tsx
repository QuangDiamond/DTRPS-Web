import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestOnly, RequireAuth } from '../components/auth/RouteGuards';
import PageLoader from '../components/common/PageLoader';
import { ROUTES } from '../constants/routes';
import AdminLayout from '../layouts/AdminLayout';

// Mỗi trang là một chunk riêng — chỉ tải khi người dùng mở trang đó
const LoginPage = lazy(() => import('../pages/Auth/Login'));
const ForgotPasswordPage = lazy(() => import('../pages/Auth/ForgotPassword'));
const VerifyOtpPage = lazy(() => import('../pages/Auth/VerifyOtp'));
const ResetPasswordPage = lazy(() => import('../pages/Auth/ResetPassword'));
const DashboardPage = lazy(() => import('../pages/Dashboard'));
const UsersPage = lazy(() => import('../pages/Users'));
const UserDetailPage = lazy(() => import('../pages/UserDetail'));
const PartnersPage = lazy(() => import('../pages/Partners'));
const PartnerDetailPage = lazy(() => import('../pages/PartnerDetail'));
const ListingsPage = lazy(() => import('../pages/Listings'));
const ApprovedListingsPage = lazy(() => import('../pages/ApprovedListings'));
const RejectedListingsPage = lazy(() => import('../pages/RejectedListings'));
const ListingReviewPage = lazy(() => import('../pages/ListingReview'));
const LocationsPage = lazy(() => import('../pages/Locations'));
const PoiEditorPage = lazy(() => import('../pages/PoiEditor'));
const ReportsPage = lazy(() => import('../pages/Reports'));
const NotificationsPage = lazy(() => import('../pages/Notifications'));
const SettingsPage = lazy(() => import('../pages/Settings'));
const ProfilePage = lazy(() => import('../pages/Profile'));
const NotFoundPage = lazy(() => import('../pages/NotFound'));

/** Trang toàn màn hình (đăng nhập, 404) cần Suspense riêng vì không nằm trong AdminLayout */
const fullScreen = (page: ReactNode) => (
  <Suspense fallback={<PageLoader fullScreen />}>{page}</Suspense>
);

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ROUTES.DASHBOARD} replace /> },

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
          { path: ROUTES.DASHBOARD, element: <DashboardPage /> },
          { path: ROUTES.USERS, element: <UsersPage /> },
          { path: ROUTES.USER_DETAIL, element: <UserDetailPage /> },
          { path: ROUTES.PARTNERS, element: <PartnersPage /> },
          { path: ROUTES.PARTNER_DETAIL, element: <PartnerDetailPage /> },
          { path: ROUTES.LISTINGS, element: <ListingsPage /> },
          { path: ROUTES.LISTINGS_APPROVED, element: <ApprovedListingsPage /> },
          { path: ROUTES.LISTINGS_REJECTED, element: <RejectedListingsPage /> },
          { path: ROUTES.LISTING_REVIEW, element: <ListingReviewPage /> },
          { path: ROUTES.LOCATIONS, element: <LocationsPage /> },
          { path: ROUTES.LOCATION_NEW, element: <PoiEditorPage /> },
          { path: ROUTES.LOCATION_EDIT, element: <PoiEditorPage /> },
          { path: ROUTES.REPORTS, element: <ReportsPage /> },
          { path: ROUTES.NOTIFICATIONS, element: <NotificationsPage /> },
          { path: ROUTES.SETTINGS, element: <SettingsPage /> },
          { path: ROUTES.PROFILE, element: <ProfilePage /> },
        ],
      },
    ],
  },

  { path: '*', element: fullScreen(<NotFoundPage />) },
]);
