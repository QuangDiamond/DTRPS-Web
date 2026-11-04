import { Icon } from '@/components/common';

/** Ảnh đại diện tròn; chưa có ảnh thì hiện icon người */
export default function Avatar({
  url,
  size,
  iconSize,
  className = 'bg-[#91F0E5] text-[#036C75]',
}: {
  url: string | null | undefined;
  size: number;
  iconSize: number;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        <span style={{ fontSize: iconSize }}>
          <Icon name="account_circle" filled className="text-[1em]" />
        </span>
      )}
    </span>
  );
}
