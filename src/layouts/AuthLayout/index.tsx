import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import BrandMark from '@/components/common/BrandMark';
import type { AuthBrandContent } from '@/types';
import AuthBrandPanel from './AuthBrandPanel';

interface AuthLayoutProps {
  brand: AuthBrandContent;
  children: ReactNode;
}

/** Khung chung cho Đăng nhập + 3 bước Quên mật khẩu */
export default function AuthLayout({ brand, children }: AuthLayoutProps) {
  const { t } = useTranslation();

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface p-space-md">
      <div className="mx-auto w-full max-w-6xl px-space-md py-space-xl">
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-surface-container-lowest shadow-lg lg:grid-cols-12">
          <AuthBrandPanel content={brand} />

          <div className="flex flex-col justify-between p-space-xl lg:col-span-7 lg:p-12">
            {/* Logo đã có ở cột trái trên màn rộng — chỉ hiện ở đây khi cột trái xuống dưới */}
            <div className="mb-space-lg lg:hidden">
              <BrandMark subtitle="VIETNAM TRAVEL ADMIN" />
            </div>

            <div className="mx-auto my-auto flex w-full max-w-md flex-col gap-space-lg">
              {children}
            </div>

            <p className="mt-space-xl text-center font-body-sm text-body-sm text-on-surface-variant">
              {t('layout.authLayout.copyright')}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
