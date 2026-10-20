import { createBrowserRouter, Navigate } from 'react-router-dom';
import { GuestOnly, RequireAuth } from '../components/auth/RouteGuards';
import { ROUTES } from '../constants/routes';
import AdminLayout from '../layouts/AdminLayout';
import ForgotPasswordPage from '../pages/Auth/ForgotPassword';
import LoginPage from '../pages/Auth/Login';
import ResetPasswordPage from '../pages/Auth/ResetPassword';
import VerifyOtpPage from '../pages/Auth/VerifyOtp';
import DashboardPage from '../pages/Dashboard';
import ApprovedListingsPage from '../pages/ApprovedListings';
import ListingReviewPage from '../pages/ListingReview';
import ListingsPage from '../pages/Listings';
import LocationsPage from '../pages/Locations';
import NotFoundPage from '../pages/NotFound';
import NotificationsPage from '../pages/Notifications';
import PartnerDetailPage from '../pages/PartnerDetail';
import PartnersPage from '../pages/Partners';
import PoiEditorPage from '../pages/PoiEditor';
import ProfilePage from '../pages/Profile';
import RejectedListingsPage from '../pages/RejectedListings';
import ReportsPage from '../pages/Reports';
import SettingsPage from '../pages/Settings';
import UserDetailPage from '../pages/UserDetail';
import UsersPage from '../pages/Users';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={ROUTES.DASHBOARD} replace /> },

  // Màn xác thực: chỉ dành cho người chưa đăng nhập
  {
    element: <GuestOnly />,
    children: [
      { path: ROUTES.LOGIN, element: <LoginPage /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: ROUTES.VERIFY_OTP, element: <VerifyOtpPage /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },
    ],
  },

  // Trang quản trị: bắt buộc đăng nhập
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

  { path: '*', element: <NotFoundPage /> },
]);
