import { Outlet } from 'react-router-dom';
import { useIdleLogout } from '../../hooks/useIdleLogout';
import Header from './Header';
import Sidebar from './Sidebar';

/** Khung chung cho mọi trang admin: Sidebar cố định bên trái + Header cố định phía trên */
export default function AdminLayout() {
  useIdleLogout();

  return (
    <>
      <Sidebar />
      <div className="flex min-h-screen flex-col bg-surface pl-72">
        <Header />
        <main className="w-full flex-1 bg-surface px-space-xl pt-[calc(68px+var(--spacing-space-xl))] pb-space-xl">
          <div className="flex w-full flex-col">
            <Outlet />
          </div>
        </main>
      </div>
    </>
  );
}
