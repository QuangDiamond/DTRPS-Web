import type { ReactNode } from 'react';
import Icon from '../../../components/common/Icon';

interface TabPlaceholderProps {
  icon: string;
  title: string;
  description: string;
  action?: ReactNode;
}

/** Tab chưa có thiết kế Stitch — TODO: thay bằng UI khi có HTML */
export default function TabPlaceholder({ icon, title, description, action }: TabPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest px-6 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-container text-outline">
        <Icon name={icon} className="text-[30px]" />
      </div>
      <h2 className="font-headline-sm text-headline-sm text-on-surface">{title}</h2>
      <p className="max-w-md font-body-sm text-body-sm text-on-surface-variant">{description}</p>
      {action}
    </div>
  );
}
