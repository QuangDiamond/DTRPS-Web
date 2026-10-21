import type { ReactNode } from 'react';
import { Icon } from '@/components/common';

interface AuthSubmitButtonProps {
  loading: boolean;
  loadingText: string;
  children: ReactNode;
  disabled?: boolean;
  icon?: string;
}

export default function AuthSubmitButton({
  loading,
  loadingText,
  children,
  disabled = false,
  icon = 'arrow_forward',
}: AuthSubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className="group flex h-13 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 font-title-md text-title-md text-on-primary shadow-md transition-all hover:bg-primary-container hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? (
        <>
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-on-primary border-t-transparent" />
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          <Icon name={icon} className="text-lg transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}
