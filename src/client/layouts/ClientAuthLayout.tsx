import { type ReactNode, useEffect } from 'react';
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
      <div className="mx-auto w-full max-w-[460px]">
        <Brand />
        {children}
      </div>
    </div>
  );
}
