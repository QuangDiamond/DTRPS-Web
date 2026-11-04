import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useLocation } from 'react-router-dom';
import { PageLoader } from '@/components/common';
import { ADMIN_NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle, useIdleLogout } from '@/hooks';
import DataStatusGate from './DataStatusGate';
import Header from './Header';
import Sidebar from './Sidebar';

/** Tên trang hiện tại theo mục menu khớp dài nhất với đường dẫn (nhãn menu đã theo ngôn ngữ) */
function getPageTitle(pathname: string, profileTitle: string): string | undefined {
  if (pathname.startsWith(ROUTES.PROFILE)) return profileTitle;
  return [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathname.startsWith(item.path))?.label;
}

/** Khung chung cho mọi trang admin: Sidebar cố định bên trái + Header cố định phía trên */
export default function AdminLayout() {
  useIdleLogout();
  // Đăng ký theo dõi ngôn ngữ để Sidebar, Header và tiêu đề tab đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  useDocumentTitle(getPageTitle(useLocation().pathname, t('nav.profile')));

  return (
    <>
      <Sidebar />
      <div className="flex min-h-screen flex-col bg-[#F3F5F9] pl-72 print:pl-0">
        <Header />
        <main className="w-full flex-1 bg-[#F3F5F9] px-space-xl pt-[calc(68px+var(--spacing-space-xl))] pb-space-xl print:pt-0">
          <div className="flex w-full flex-col">
            <DataStatusGate>
              <Suspense fallback={<PageLoader />}>
                <Outlet />
              </Suspense>
            </DataStatusGate>
          </div>
        </main>
      </div>
    </>
  );
}
