import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import type { AuthBrandContent } from '@/types';

/** Cột gradient thương hiệu bên trái các màn đăng nhập / khôi phục mật khẩu */
export default function AuthBrandPanel({ content }: { content: AuthBrandContent }) {
  const { t } = useTranslation();
  return (
    <div className="relative flex flex-col justify-between overflow-hidden bg-linear-to-br from-primary via-primary-container to-secondary p-space-xl text-on-primary lg:col-span-5">
      {/* Hiệu ứng ánh sáng trang trí */}
      <div className="pointer-events-none absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-secondary-container/20 blur-3xl" />
      <div className="pointer-events-none absolute -top-16 -left-16 h-60 w-60 rounded-full bg-primary-fixed-dim/20 blur-2xl" />

      {/* Logo + tiêu đề */}
      <div className="relative z-10 flex flex-col gap-space-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest text-brand shadow-sm">
            <Icon name="language" className="text-[24px]" />
          </div>
          <div className="flex flex-col">
            <span className="font-headline-sm text-headline-sm font-bold tracking-tight text-on-primary">
              Smart <span className="text-secondary-fixed">Travel</span>
            </span>
            <span className="font-label-sm text-label-sm font-semibold tracking-wider text-secondary-fixed uppercase">
              VIETNAM AI ADMIN
            </span>
          </div>
        </div>

        <div className="mt-space-md space-y-space-sm">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-on-primary/10 px-3 py-1 font-label-sm text-label-sm text-secondary-fixed backdrop-blur-md">
            <span className="h-2 w-2 animate-pulse rounded-full bg-secondary-fixed-dim" />
            {content.statusText}
          </div>
          <h1 className="font-display-sm text-display-sm leading-tight font-bold text-on-primary">
            {content.title}
          </h1>
          <p className="font-body-md text-body-md text-on-primary/80">{content.description}</p>
        </div>
      </div>

      {/* Thẻ tính năng */}
      <div className="relative z-10 my-space-lg space-y-space-md">
        {content.features.map((feature) => (
          <div
            key={feature.title}
            className="flex items-start gap-space-md rounded-xl bg-on-primary/10 p-space-md shadow-sm backdrop-blur-sm transition hover:bg-on-primary/15"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-lowest/20 text-on-primary">
              <Icon name={feature.icon} filled />
            </div>
            <div className="flex flex-col">
              <span className="font-title-md text-title-md text-on-primary">{feature.title}</span>
              <span className="mt-0.5 font-body-sm text-body-sm text-on-primary/80">
                {feature.description}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Chân cột */}
      <div className="relative z-10 flex items-center justify-between pt-space-md text-on-primary/70">
        <div className="flex items-center gap-2">
          <Icon name="hub" className="text-sm" />
          <span className="font-label-sm text-label-sm">
            {t('layout.authBrandPanel.viettelTier3Idc')}
          </span>
        </div>
        <span className="font-label-sm text-label-sm font-semibold text-secondary-fixed">
          TLS 1.3 / E2EE
        </span>
      </div>
    </div>
  );
}
