import type { ReactNode } from 'react';
import Icon from '../../components/common/Icon';
import { useToast } from '../../hooks/useToast';
import type { AuthBrandContent } from '../../types/auth';
import AuthBrandPanel from './AuthBrandPanel';

interface AuthLayoutProps {
  brand: AuthBrandContent;
  children: ReactNode;
}

const LEGAL_LINKS = ['Chính sách Bảo mật', 'Quy chế Vận hành'];

/** Khung chung cho Đăng nhập + 3 bước Quên mật khẩu */
export default function AuthLayout({ brand, children }: AuthLayoutProps) {
  const { showToast } = useToast();

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-surface p-space-md">
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-center px-space-md py-space-xl">
        <div className="grid grid-cols-1 items-stretch gap-8 overflow-hidden rounded-xl bg-surface-container-lowest shadow-xl lg:grid-cols-12">
          <AuthBrandPanel content={brand} />

          <div className="flex flex-col justify-between bg-surface-container-lowest p-space-xl lg:col-span-7 lg:p-12">
            {/* Thanh trên của thẻ */}
            <div className="mb-space-md flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-primary shadow-sm">
                  <Icon name="language" className="text-[24px]" />
                </div>
                <div className="flex flex-col">
                  <span className="font-title-md text-title-md leading-none font-bold tracking-tight text-on-surface">
                    Smart <span className="text-brand">Travel</span>
                  </span>
                  <span className="mt-1 block font-label-sm text-label-sm font-semibold tracking-wider text-on-surface-variant uppercase">
                    VIETNAM AI ADMIN
                  </span>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary-container/40 px-3 py-1 text-on-secondary-container">
                <Icon name="shield_person" filled className="text-sm" />
                <span className="font-label-sm text-label-sm font-semibold">
                  Quản trị viên hệ thống
                </span>
              </div>
            </div>

            {/* Nội dung từng màn */}
            <div className="mx-auto my-auto flex w-full max-w-md flex-col gap-space-lg">
              {children}
            </div>

            {/* Bản quyền */}
            <div className="mt-space-lg flex flex-col items-center justify-between gap-2 pt-space-md text-on-surface-variant sm:flex-row">
              <p className="font-body-sm text-body-sm">
                © 2025 Smart Travel Vietnam Co., Ltd. Tất cả quyền được bảo lưu.
              </p>
              <div className="flex items-center gap-4">
                {LEGAL_LINKS.map((label, index) => (
                  <span key={label} className="flex items-center gap-4">
                    {index > 0 && (
                      <span className="font-label-sm text-label-sm text-outline">•</span>
                    )}
                    <button
                      type="button"
                      onClick={() => showToast(`${label} đang được cập nhật`, 'info')}
                      className="cursor-pointer font-label-sm text-label-sm hover:underline"
                    >
                      {label}
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
