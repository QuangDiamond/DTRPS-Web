import { type ReactNode, useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { Brand } from '@/client/ui/Brand';

/** Khung màn đăng nhập / đăng ký của du khách + đối tác (theo Shell của mobile) */
export default function ClientAuthLayout({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  useEffect(() => {
    document.title = `${title} · SmartTravel`;
  }, [title]);

  return (
    <div className="min-h-screen bg-client-bg px-4 py-8 md:flex md:items-center md:justify-center md:py-12">
      <div className="mx-auto w-full max-w-[440px]">
        <Brand />
        {children}
      </div>
    </div>
  );
}

/** "Hoặc tiếp tục với" Google / Apple ID — chưa tích hợp */
export function SocialLogin() {
  const [note, setNote] = useState<string | null>(null);
  return (
    <div className="mt-4">
      <p className="mb-3 text-center text-[11px] text-[#89939C]">HOẶC TIẾP TỤC VỚI</p>
      <div className="flex gap-3">
        {['Google', 'Apple ID'].map((provider) => (
          <button
            key={provider}
            type="button"
            onClick={() => setNote(`Đăng nhập bằng ${provider} sẽ được tích hợp sau.`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#E9ECF2] bg-white py-3 text-[12px] font-semibold text-[#293A48] hover:bg-client-soft"
          >
            <Icon
              name={provider === 'Google' ? 'g_mobiledata' : 'phone_iphone'}
              className="text-[18px]"
            />
            {provider}
          </button>
        ))}
      </div>
      {note && <p className="mt-2 text-center text-[11px] text-client-muted">{note}</p>}
    </div>
  );
}
