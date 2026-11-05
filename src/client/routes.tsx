import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import {
  ClientAppLayout,
  ClientRoot,
  GuestOnlyClient,
  RequireActivePartner,
  RequireClientLogin,
} from './guards';
import { CLIENT_ROUTES } from './routePaths';

// Mỗi trang một chunk riêng — chỉ tải khi mở
const WelcomePage = lazy(() => import('@/client/pages/auth/WelcomePage'));
const LoginPage = lazy(() => import('@/client/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/client/pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/client/pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/client/pages/auth/ResetPasswordPage'));
const ComingSoonPage = lazy(() => import('@/client/pages/ComingSoonPage'));

// Du khách
const HomePage = lazy(() => import('@/client/traveller/pages/HomePage'));
const ExplorePage = lazy(() => import('@/client/traveller/pages/ExplorePage'));

const PlaceDetailsPage = lazy(() => import('@/client/traveller/pages/PlaceDetailsPage'));
const FavoritesPage = lazy(() => import('@/client/traveller/pages/FavoritesPage'));
const TravelPreferencesPage = lazy(() => import('@/client/traveller/pages/TravelPreferencesPage'));
const ProfilePage = lazy(() => import('@/client/traveller/pages/ProfilePage'));
const EditProfilePage = lazy(() => import('@/client/traveller/pages/EditProfilePage'));
const ChangePasswordPage = lazy(() => import('@/client/traveller/pages/ChangePasswordPage'));
const SettingsPage = lazy(() => import('@/client/traveller/pages/SettingsPage'));
const MyTripsPage = lazy(() => import('@/client/traveller/pages/MyTripsPage'));
const PlanTripPage = lazy(() => import('@/client/traveller/pages/PlanTripPage'));
const EditTripPlanPage = lazy(() => import('@/client/traveller/pages/EditTripPlanPage'));
const GeneratingTripPage = lazy(() => import('@/client/traveller/pages/GeneratingTripPage'));
const SuggestedPlacesPage = lazy(() => import('@/client/traveller/pages/SuggestedPlacesPage'));
const SuggestionDetailPage = lazy(() => import('@/client/traveller/pages/SuggestionDetailPage'));
const SelectedPlacesPage = lazy(() => import('@/client/traveller/pages/SelectedPlacesPage'));
const AddLocationPage = lazy(() => import('@/client/traveller/pages/AddLocationPage'));
const ItineraryOverviewPage = lazy(() => import('@/client/traveller/pages/ItineraryOverviewPage'));
const ItineraryDetailPage = lazy(() => import('@/client/traveller/pages/ItineraryDetailPage'));
const TripLiveMapPage = lazy(() => import('@/client/traveller/pages/TripLiveMapPage'));

// Đối tác
const PartnerHomePage = lazy(() => import('@/client/partner/pages/PartnerHomePage'));
const PartnerApplicationPage = lazy(() => import('@/client/partner/pages/PartnerApplicationPage'));
const PartnerLocationsPage = lazy(() => import('@/client/partner/pages/PartnerLocationsPage'));
const PartnerNewLocationPage = lazy(() => import('@/client/partner/pages/PartnerNewLocationPage'));
const PartnerLocationPage = lazy(() => import('@/client/partner/pages/PartnerLocationPage'));
const PartnerBusinessProfilePage = lazy(
  () => import('@/client/partner/pages/PartnerBusinessProfilePage'),
);

const partnerSoon = (path: string, title: string, description: string): RouteObject => ({
  path,
  element: (
    <ComingSoonPage
      eyebrow="BUSINESS OWNER"
      title={title}
      description={description}
      backTo={CLIENT_ROUTES.PARTNER}
      backLabel="Về tổng quan đối tác"
    />
  ),
});

/** Khu du khách + đối tác (admin nằm riêng dưới /admin) */
export const clientRoutes: RouteObject[] = [
  {
    element: <ClientRoot />,
    children: [
      {
        element: <GuestOnlyClient />,
        children: [
          { path: CLIENT_ROUTES.WELCOME, element: <WelcomePage /> },
          { path: CLIENT_ROUTES.LOGIN, element: <LoginPage /> },
          { path: CLIENT_ROUTES.REGISTER, element: <RegisterPage /> },
        ],
      },
      // Mở được cả khi đã đăng nhập (đi từ màn Đổi mật khẩu)
      { path: CLIENT_ROUTES.FORGOT_PASSWORD, element: <ForgotPasswordPage /> },
      { path: CLIENT_ROUTES.RESET_PASSWORD, element: <ResetPasswordPage /> },

      {
        element: <ClientAppLayout />,
        children: [
          // Khách chưa đăng nhập cũng xem được: trang chủ, danh sách + bộ lọc, chi tiết địa điểm
          { path: CLIENT_ROUTES.HOME, element: <HomePage /> },
          { path: CLIENT_ROUTES.EXPLORE, element: <ExplorePage /> },
          { path: CLIENT_ROUTES.PLACE_DETAIL, element: <PlaceDetailsPage /> },
          {
            // Cần đăng nhập: yêu thích, hồ sơ, lịch trình, đối tác
            element: <RequireClientLogin />,
            children: [
              { path: CLIENT_ROUTES.FAVORITES, element: <FavoritesPage /> },
              { path: CLIENT_ROUTES.PREFERENCES, element: <TravelPreferencesPage /> },
              { path: CLIENT_ROUTES.PROFILE, element: <ProfilePage /> },
              { path: CLIENT_ROUTES.PROFILE_EDIT, element: <EditProfilePage /> },
              { path: CLIENT_ROUTES.PROFILE_PASSWORD, element: <ChangePasswordPage /> },
              { path: CLIENT_ROUTES.PROFILE_SETTINGS, element: <SettingsPage /> },
              { path: CLIENT_ROUTES.TRIPS, element: <MyTripsPage /> },
              { path: CLIENT_ROUTES.TRIP_PLAN, element: <PlanTripPage /> },
              { path: CLIENT_ROUTES.TRIP_PLAN_SELECTED, element: <SelectedPlacesPage /> },
              { path: CLIENT_ROUTES.TRIP_PLAN_EDIT, element: <EditTripPlanPage /> },
              { path: CLIENT_ROUTES.TRIP_GENERATING, element: <GeneratingTripPage /> },
              { path: CLIENT_ROUTES.TRIP_SUGGESTIONS, element: <SuggestedPlacesPage /> },
              { path: CLIENT_ROUTES.TRIP_SUGGESTION_DETAIL, element: <SuggestionDetailPage /> },
              { path: CLIENT_ROUTES.TRIP_ADD_LOCATION, element: <AddLocationPage /> },
              { path: CLIENT_ROUTES.ITINERARY, element: <ItineraryOverviewPage /> },
              { path: CLIENT_ROUTES.ITINERARY_DAY, element: <ItineraryDetailPage /> },
              { path: CLIENT_ROUTES.ITINERARY_LIVE, element: <TripLiveMapPage /> },

              // Đối tác
              { path: CLIENT_ROUTES.PARTNER, element: <PartnerHomePage /> },
              { path: CLIENT_ROUTES.PARTNER_APPLY, element: <PartnerApplicationPage /> },
              {
                element: <RequireActivePartner />,
                children: [
                  { path: CLIENT_ROUTES.PARTNER_PROFILE, element: <PartnerBusinessProfilePage /> },
                  { path: CLIENT_ROUTES.PARTNER_LOCATIONS, element: <PartnerLocationsPage /> },
                  { path: CLIENT_ROUTES.PARTNER_LOCATION_NEW, element: <PartnerNewLocationPage /> },
                  { path: CLIENT_ROUTES.PARTNER_LOCATION_DETAIL, element: <PartnerLocationPage /> },
                  {
                    path: CLIENT_ROUTES.PARTNER_LOCATION_LEGACY,
                    element: <Navigate to={CLIENT_ROUTES.PARTNER_LOCATIONS} replace />,
                  },
                  partnerSoon(
                    CLIENT_ROUTES.PARTNER_ADS,
                    'Quản lý quảng cáo',
                    'Theo dõi nội dung quảng bá cho địa điểm của bạn.',
                  ),
                ],
              },
            ],
          },
        ],
      },
    ],
  },
];
