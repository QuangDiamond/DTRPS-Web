import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

interface SettingsCardProps {
  icon: string;
  title: string;
  description: string;
  /** Badge hoặc icon bên phải tiêu đề */
  aside?: ReactNode;
  children: ReactNode;
}

export const SETTINGS_CARD_SHADOW = 'shadow-[0_4px_24px_-4px_rgba(15,118,110,0.06)]';

export default function SettingsCard({
  icon,
  title,
  description,
  aside,
  children,
}: SettingsCardProps) {
  return (
    <section
      className={`flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg ${SETTINGS_CARD_SHADOW}`}
    >
      <div className="flex items-center justify-between gap-space-sm pb-space-xs">
        <div className="flex items-center gap-space-sm">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary">
            <Icon name={icon} className="text-[20px]" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
            <span className="font-body-sm text-body-sm text-on-surface-variant">{description}</span>
          </div>
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}
