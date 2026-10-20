import { Suspense } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PageLoader from '../../components/common/PageLoader';
import { ADMIN_NAV_ITEMS } from '../../constants/navigation';
import { ROUTES } from '../../constants/routes';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useIdleLogout } from '../../hooks/useIdleLogout';
import DataStatusGate from './DataStatusGate';
import Header from './Header';
import Sidebar from './Sidebar';

/** Tên trang hiện tại theo mục menu khớp dài nhất với đường dẫn */
function getPageTitle(pathname: string): string | undefined {
  if (pathname.startsWith(ROUTES.PROFILE)) return 'Hồ sơ quản trị viên';
  return [...ADMIN_NAV_ITEMS]
    .sort((a, b) => b.path.length - a.path.length)
    .find((item) => pathname.startsWith(item.path))?.label;
}

/** Khung chung cho mọi trang admin: Sidebar cố định bên trái + Header cố định phía trên */
export default function AdminLayout() {
  useIdleLogout();
  useDocumentTitle(getPageTitle(useLocation().pathname));

  return (
    <>
      <Sidebar />
      <div className="flex min-h-screen flex-col bg-surface pl-72">
        <Header />
        <main className="w-full flex-1 bg-surface px-space-xl pt-[calc(68px+var(--spacing-space-xl))] pb-space-xl">
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
