import { Icon } from '@/components/common';
import BrandMark from '@/components/common/BrandMark';
import type { AuthBrandContent } from '@/types';

/** Cột thương hiệu bên trái các màn đăng nhập / khôi phục mật khẩu */
export default function AuthBrandPanel({ content }: { content: AuthBrandContent }) {
  return (
    <div className="flex flex-col gap-space-xl bg-linear-to-br from-primary to-[#0B5E62] p-space-xl text-on-primary lg:col-span-5 lg:p-10">
      <BrandMark tone="inverse" subtitle="VIETNAM TRAVEL ADMIN" />

      <div className="space-y-space-sm">
        <h1 className="font-display-sm text-display-sm leading-tight font-bold">{content.title}</h1>
        <p className="font-body-md text-body-md text-on-primary/80">{content.description}</p>
      </div>

      {content.features.length > 0 && (
        <ul className="space-y-space-md">
          {content.features.map((feature) => (
            <li key={feature.title} className="flex items-start gap-space-md">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/12">
                <Icon name={feature.icon} className="text-[20px]" />
              </span>
              <span className="flex flex-col">
                <span className="text-[15px] font-semibold">{feature.title}</span>
                <span className="mt-0.5 font-body-sm text-body-sm text-on-primary/75">
                  {feature.description}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
