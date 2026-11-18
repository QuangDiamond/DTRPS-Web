import { type ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Modal } from '@/components/common';

const MAX_REASON_LENGTH = 1000;

/** Nhãn trạng thái */
export function Pill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}

/** Ô tìm kiếm của các tab */
export function SearchBox({
  value,
  placeholder,
  onChange,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <span className="flex h-10 flex-1 items-center gap-2 rounded-xl bg-surface-container-low px-3 focus-within:ring-2 focus-within:ring-primary">
      <Icon name="search" className="text-[20px] text-outline" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-full flex-1 bg-transparent font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none"
      />
    </span>
  );
}

/** Dòng trống khi bảng không có dữ liệu */
export function EmptyRow({ colSpan }: { colSpan: number }) {
  const { t } = useTranslation();
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14 text-center">
        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
          <Icon name="receipt_long" className="text-[40px] text-outline" />
          <span className="font-title-md text-title-md">{t('adAdmin.empty')}</span>
        </div>
      </td>
    </tr>
  );
}

/** Khung bảng dùng chung */
export function TableCard({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
      <div className="table-scroll w-full overflow-x-auto">
        <table className="w-full border-collapse text-left">{children}</table>
      </div>
      {footer}
    </div>
  );
}

interface ReasonModalProps {
  title: string;
  description?: string;
  confirmLabel: string;
  danger?: boolean;
  busy: boolean;
  /** Hiện thêm ô mã chuyển khoản (khi ghi nhận hoàn tiền) */
  withReference?: boolean;
  referenceLabel?: string;
  onConfirm: (reason: string, reference: string) => void;
  onClose: () => void;
}

/** Hộp thoại bắt buộc nhập lý do trước các thao tác của admin */
export function ReasonModal({
  title,
  description,
  confirmLabel,
  danger = false,
  busy,
  withReference = false,
  referenceLabel,
  onConfirm,
  onClose,
}: ReasonModalProps) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [reference, setReference] = useState('');
  const [error, setError] = useState('');

  const submit = () => {
    if (!reason.trim() || (withReference && !reference.trim())) {
      setError(t('adAdmin.reasonRequired'));
      return;
    }
    onConfirm(reason.trim(), reference.trim());
  };

  const field =
    'w-full rounded-xl bg-surface-container-low p-3 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none';

  return (
    <Modal
      title={title}
      description={description}
      onClose={busy ? () => undefined : onClose}
      footer={
        <>
          <Button variant="neutral" onClick={onClose} disabled={busy}>
            {t('actions.cancel')}
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} loading={busy} onClick={submit}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
        {t('adAdmin.reason')}
        <textarea
          rows={3}
          autoFocus
          maxLength={MAX_REASON_LENGTH}
          value={reason}
          onChange={(event) => {
            setReason(event.target.value);
            setError('');
          }}
          className={`${field} resize-none`}
        />
      </label>
      {withReference && (
        <label className="mt-3 flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
          {referenceLabel ?? t('adAdmin.payments.refundReference')}
          <input
            value={reference}
            maxLength={255}
            onChange={(event) => {
              setReference(event.target.value);
              setError('');
            }}
            className={field}
          />
        </label>
      )}
      {error && <p className="mt-2 font-body-sm text-body-sm text-error">{error}</p>}
    </Modal>
  );
}
