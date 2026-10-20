import Icon from '../../../components/common/Icon';

export const PROFILE_CARD_CLASS =
  'flex flex-col gap-space-md rounded-2xl bg-surface-container-lowest p-space-lg shadow-sm';

interface ProfileCardHeaderProps {
  icon: string;
  title: string;
  description: string;
}

export default function ProfileCardHeader({ icon, title, description }: ProfileCardHeaderProps) {
  return (
    <div className="flex items-center justify-between pb-space-xs">
      <div className="flex items-center gap-space-sm">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-low text-primary">
          <Icon name={icon} className="text-[22px]" />
        </div>
        <div className="flex flex-col">
          <h2 className="font-title-md text-title-md text-on-surface">{title}</h2>
          <span className="font-body-sm text-body-sm text-on-surface-variant">{description}</span>
        </div>
      </div>
    </div>
  );
}
