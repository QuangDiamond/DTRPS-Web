import { useState } from 'react';
import { Icon } from '@/components/common';

/** Ảnh đại diện tròn; chưa có ảnh hoặc ảnh lỗi thì hiện icon người */
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
  // Nhớ URL bị lỗi: đổi sang ảnh khác thì thử tải lại
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
    >
      {url && url !== failedUrl ? (
        // Ảnh Google (lh3.googleusercontent.com) chặn khi có Referer localhost/domain lạ → không gửi Referer
        <img
          src={url}
          alt=""
          referrerPolicy="no-referrer"
          onError={() => setFailedUrl(url)}
          className="h-full w-full object-cover"
        />
      ) : (
        <span style={{ fontSize: iconSize }}>
          <Icon name="account_circle" filled className="text-[1em]" />
        </span>
      )}
    </span>
  );
}
