import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import { ClientAppLayout, ClientRoot, GuestOnlyClient, RequireActivePartner } from './guards';
import { CLIENT_ROUTES } from './routePaths';

// Mỗi trang một chunk riêng — chỉ tải khi mở
const LoginPage = lazy(() => import('@/client/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/client/pages/auth/RegisterPage'));
const ComingSoonPage = lazy(() => import('@/client/pages/ComingSoonPage'));
const HomePage = lazy(() => import('@/client/traveller/pages/HomePage'));
const ProfilePage = lazy(() => import('@/client/traveller/pages/ProfilePage'));
const PartnerHomePage = lazy(() => import('@/client/partner/pages/PartnerHomePage'));
const PartnerApplicationPage = lazy(() => import('@/client/partner/pages/PartnerApplicationPage'));
const PartnerLocationsPage = lazy(() => import('@/client/partner/pages/PartnerLocationsPage'));
const PartnerNewLocationPage = lazy(() => import('@/client/partner/pages/PartnerNewLocationPage'));
const PartnerLocationPage = lazy(() => import('@/client/partner/pages/PartnerLocationPage'));
const PartnerBusinessProfilePage = lazy(
  () => import('@/client/partner/pages/PartnerBusinessProfilePage'),
);

const travellerSoon = (path: string, title: string, description: string): RouteObject => ({
  path,
  element: (
    <ComingSoonPage
      eyebrow="KHÁCH DU LỊCH"
      title={title}
      description={description}
      backTo={CLIENT_ROUTES.HOME}
      backLabel="Về trang chủ"
    />
  ),
});

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
          { path: CLIENT_ROUTES.LOGIN, element: <LoginPage /> },
          { path: CLIENT_ROUTES.REGISTER, element: <RegisterPage /> },
        ],
      },
      {
        element: <ClientAppLayout />,
        children: [
          // Du khách
          { path: CLIENT_ROUTES.HOME, element: <HomePage /> },
          travellerSoon(
            CLIENT_ROUTES.EXPLORE,
            'Khám phá',
            'Tìm kiếm và lọc điểm đến trên khắp Việt Nam.',
          ),
          travellerSoon(
            CLIENT_ROUTES.TRIPS,
            'Chuyến đi',
            'Lập kế hoạch và theo dõi lịch trình của bạn.',
          ),
          travellerSoon(CLIENT_ROUTES.FAVORITES, 'Yêu thích', 'Những địa điểm bạn đã lưu.'),
          { path: CLIENT_ROUTES.PROFILE, element: <ProfilePage /> },

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
];
