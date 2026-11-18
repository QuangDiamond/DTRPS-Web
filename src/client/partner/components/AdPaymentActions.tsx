import { type ChangeEvent, useState } from 'react';
import { Icon } from '@/components/common';
import { adApi, type AdPayment } from '@/client/api/adApi';
import { errorMessage } from '@/client/api/http';
import { ACCEPTED_IMAGE_TYPES, MAX_IMAGE_BYTES, uploadApi } from '@/client/api/uploadApi';
import { FormAlert } from '@/client/ui/Blocks';
import { PrimaryButton, SecondaryButton } from '@/client/ui/Buttons';
import Field from '@/client/ui/Field';
import { TextAreaField } from '@/client/ui/FormControls';
import { Dialog } from '@/client/ui/Overlay';

const MAX_NOTE_LENGTH = 1000;

/** Giờ máy theo định dạng của ô datetime-local */
const localDateTime = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

type IssueErrors = Partial<Record<'amount' | 'time' | 'reference' | 'receipt', string>>;

/** Phiếu báo sự cố: thông tin chuyển khoản + ảnh biên lai để admin đối chiếu */
function PaymentIssueDialog({
  payment,
  onClose,
  onSent,
}: {
  payment: AdPayment;
  onClose: () => void;
  onSent: () => void;
}) {
  const [amount, setAmount] = useState(String(Math.round(payment.amount)));
  const [time, setTime] = useState(() => localDateTime(new Date()));
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<IssueErrors>({});
  const [failure, setFailure] = useState<string | null>(null);

  const pickReceipt = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      setErrors((current) => ({ ...current, receipt: 'Chọn ảnh JPG, PNG hoặc WEBP, tối đa 5MB.' }));
      return;
    }
    setUploading(true);
    setErrors((current) => ({ ...current, receipt: undefined }));
    try {
      setReceiptUrl(await uploadApi.image(file));
    } catch (error) {
      setErrors((current) => ({ ...current, receipt: errorMessage(error) }));
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    const next: IssueErrors = {};
    if (!/^\d+$/.test(amount.trim()) || Number(amount) <= 0) {
      next.amount = 'Số tiền phải là số nguyên lớn hơn 0, không dùng dấu chấm hay phẩy.';
    }
    const transferredAt = new Date(time);
    if (!time || Number.isNaN(transferredAt.getTime())) {
      next.time = 'Vui lòng chọn thời gian chuyển khoản.';
    } else if (transferredAt.getTime() > Date.now()) {
      next.time = 'Thời gian chuyển khoản không được ở tương lai.';
    }
    if (!reference.trim()) next.reference = 'Vui lòng nhập mã giao dịch trên biên lai.';
    if (!receiptUrl) next.receipt = 'Vui lòng tải lên ảnh biên lai.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSending(true);
    setFailure(null);
    try {
      await adApi.reportIssue(payment.orderCode, {
        transferredAmount: Number(amount),
        transferredAt: transferredAt.toISOString(),
        bankReference: reference.trim(),
        note: note.trim() || null,
        receiptUrl,
      });
      onSent();
    } catch (error) {
      setFailure(errorMessage(error));
      setSending(false);
    }
  };

  return (
    <Dialog label="Báo sự cố thanh toán" onClose={sending ? () => undefined : onClose}>
      <div className="p-5">
        <p className="text-[17px] font-extrabold text-client-ink">Báo sự cố thanh toán</p>
        <p className="mt-1 mb-4 text-[13px] leading-5 text-client-muted">
          Đơn #{payment.orderCode}. Admin sẽ đối chiếu với ngân hàng và báo kết quả cho bạn.
        </p>

        {failure && <FormAlert message={failure} />}

        <Field
          label="Số tiền đã chuyển (VND)"
          icon="payments"
          inputMode="numeric"
          value={amount}
          onChange={setAmount}
          error={errors.amount}
        />
        <Field
          label="Thời gian chuyển khoản"
          icon="schedule"
          type="datetime-local"
          value={time}
          max={localDateTime(new Date())}
          onChange={setTime}
          error={errors.time}
        />
        <Field
          label="Mã giao dịch ngân hàng"
          icon="tag"
          maxLength={100}
          placeholder="Mã trên biên lai chuyển khoản"
          value={reference}
          onChange={setReference}
          error={errors.reference}
        />

        <div className="mb-4">
          <p className="mb-1.5 text-[12px] font-bold text-[#293E4A]">Ảnh biên lai</p>
          {receiptUrl ? (
            <div className="flex items-center gap-3">
              <img src={receiptUrl} alt="Biên lai" className="h-20 w-20 rounded-xl object-cover" />
              <label className="cursor-pointer text-[13px] font-bold text-primary">
                Đổi ảnh
                <input
                  type="file"
                  accept={ACCEPTED_IMAGE_TYPES.join(',')}
                  className="sr-only"
                  onChange={(event) => void pickReceipt(event)}
                />
              </label>
            </div>
          ) : (
            <label className="flex h-20 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-[#B9CBC9] text-[13px] font-semibold text-primary">
              <Icon name="upload" className="text-[20px]" />
              {uploading ? 'Đang tải ảnh…' : 'Chọn ảnh biên lai'}
              <input
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                disabled={uploading}
                className="sr-only"
                onChange={(event) => void pickReceipt(event)}
              />
            </label>
          )}
          {errors.receipt && <p className="mt-1 text-xs text-client-danger">{errors.receipt}</p>}
        </div>

        <TextAreaField
          label="Ghi chú (không bắt buộc)"
          placeholder="Ví dụ: tôi chuyển khoản tay, sai nội dung…"
          maxLength={MAX_NOTE_LENGTH}
          value={note}
          onChange={setNote}
        />

        <div className="flex gap-2">
          <SecondaryButton disabled={sending} onClick={onClose}>
            Hủy
          </SecondaryButton>
          <PrimaryButton
            arrow={false}
            loading={sending}
            disabled={uploading}
            onClick={() => void submit()}
          >
            Gửi phiếu
          </PrimaryButton>
        </div>
      </div>
    </Dialog>
  );
}

/**
 * Với đơn chưa được ghi nhận: tự kiểm tra lại với PayOS trước, vẫn chưa được thì cho gửi phiếu sự
 * cố. Đơn đang có phiếu thì chỉ hiện trạng thái xử lý.
 */
export default function AdPaymentActions({
  payment,
  onChanged,
}: {
  payment: AdPayment;
  onChanged: () => void;
}) {
  const [checking, setChecking] = useState(false);
  const [checked, setChecked] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [reporting, setReporting] = useState(false);

  const { issue } = payment;
  const unresolved =
    payment.status === 'PENDING' || payment.status === 'CANCELLED' || payment.status === 'FAILED';
  if (!unresolved) return null;

  if (issue?.status === 'OPEN') {
    return (
      <p className="mt-2 flex items-center gap-1 text-[12px] font-semibold text-[#976207]">
        <Icon name="hourglass_top" className="text-[15px]" />
        Phiếu sự cố đang chờ admin xử lý
      </p>
    );
  }

  const check = async () => {
    setChecking(true);
    setMessage(null);
    try {
      const next = await adApi.checkPayment(payment.orderCode);
      if (next.status === 'SUCCESS') {
        onChanged();
        return;
      }
      setChecked(true);
      setMessage('PayOS chưa ghi nhận thanh toán của đơn này.');
    } catch (error) {
      setChecked(true);
      setMessage(errorMessage(error));
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="mt-2">
      {issue?.status === 'REJECTED' && (
        <p className="mb-1 text-[12px] text-[#AD3232]">
          Phiếu trước bị từ chối: {issue.resolutionNote}
        </p>
      )}
      {message && <p className="mb-1 text-[12px] text-client-muted">{message}</p>}
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <button
          type="button"
          disabled={checking}
          onClick={() => void check()}
          className="text-[12px] font-bold text-primary hover:underline disabled:opacity-60"
        >
          {checking ? 'Đang kiểm tra…' : 'Tôi đã thanh toán, kiểm tra lại'}
        </button>
        {checked && (
          <button
            type="button"
            onClick={() => setReporting(true)}
            className="text-[12px] font-bold text-client-danger hover:underline"
          >
            Báo sự cố thanh toán
          </button>
        )}
      </div>
      {reporting && (
        <PaymentIssueDialog
          payment={payment}
          onClose={() => setReporting(false)}
          onSent={() => {
            setReporting(false);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
