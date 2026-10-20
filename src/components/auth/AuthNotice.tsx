import type { ReactNode } from 'react';
import Icon from '../common/Icon';

interface AuthNoticeProps {
  icon: string;
  title?: string;
  children: ReactNode;
}

/** Hộp ghi chú bảo mật (nền xám nhạt) */
export default function AuthNotice({ icon, title, children }: AuthNoticeProps) {
  return (
    <div className="flex items-start gap-space-sm rounded-xl bg-surface-container-low p-space-md">
      <Icon name={icon} filled className="shrink-0 text-xl text-primary" />
      <div className="space-y-0.5">
        {title && (
          <p className="font-label-sm text-label-sm font-semibold text-on-surface">{title}</p>
        )}
        <p className="font-body-sm text-body-sm leading-relaxed text-on-surface-variant">
          {children}
        </p>
      </div>
    </div>
  );
}
