import Icon from '../common/Icon';

interface AuthHeadingProps {
  title: string;
  description: string;
  /** Hiển thị chip email đã xác thực bên dưới mô tả */
  email?: string;
}

export default function AuthHeading({ title, description, email }: AuthHeadingProps) {
  return (
    <div>
      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">{title}</h2>
      <p className="mt-1 font-body-md text-body-md text-on-surface-variant">{description}</p>
      {email && (
        <div className="mt-space-sm inline-flex items-center gap-space-xs rounded-full bg-secondary-container/40 px-space-md py-1.5 text-on-secondary-container">
          <Icon name="check_circle" className="text-[16px] text-primary" />
          <span className="font-title-md text-title-md font-semibold">{email}</span>
        </div>
      )}
    </div>
  );
}
