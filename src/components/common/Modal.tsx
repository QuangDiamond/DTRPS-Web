import { useEffect, type ReactNode } from 'react';
import Icon from './Icon';

interface ModalProps {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg';
}

/** Modal cơ bản — render có điều kiện ở component cha: {open && <Modal ... />} */
export default function Modal({
  title,
  description,
  onClose,
  children,
  footer,
  size = 'md',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-inverse-surface/40 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-xl ${
          size === 'lg' ? 'max-w-2xl' : 'max-w-lg'
        }`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-surface-container px-6 py-5">
          <div className="flex flex-col gap-1">
            <h2 className="font-headline-sm text-headline-sm font-bold text-on-surface">{title}</h2>
            {description && (
              <p className="font-body-sm text-body-sm text-on-surface-variant">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-all hover:bg-surface-container hover:text-on-surface"
            title="Đóng"
          >
            <Icon name="close" className="text-[20px]" />
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-surface-container bg-surface-container-low/40 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
