import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Icon } from '@/components/common';
import { adApi, type AdPayment } from '@/client/api/adApi';
import { errorMessage } from '@/client/api/http';
import { CLIENT_ROUTES } from '@/client/routePaths';
import { Card, FormAlert, Spinner } from '@/client/ui/Blocks';

const POLL_MS = 3_000;
const MAX_POLLS = 20;

/**
 * PayOS đưa đối tác về đây sau khi thanh toán hoặc huỷ. Chỉ lấy mã đơn trên URL; kết quả luôn do
 * backend xác nhận với PayOS.
 */
export default function PartnerAdPaymentResultPage() {
  const [params] = useSearchParams();
  const orderCode = params.get('orderCode');
  const [payment, setPayment] = useState<AdPayment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!orderCode) return;
    let active = true;
    let polls = 0;
    let timer: number | undefined;
    const check = async () => {
      try {
        const next = await adApi.payment(orderCode);
        if (!active) return;
        setPayment(next);
        setError(null);
        if (next.status !== 'PENDING') return;
      } catch (failure) {
        if (!active) return;
        setError(errorMessage(failure));
      }
      polls += 1;
      if (polls >= MAX_POLLS) setTimedOut(true);
      else timer = window.setTimeout(() => void check(), POLL_MS);
    };
    void check();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [orderCode]);

  const backLink = (label: string) => (
    <Link
      to={CLIENT_ROUTES.PARTNER_ADS}
      className="mt-5 flex h-[50px] w-full items-center justify-center rounded-2xl bg-primary text-[14px] font-extrabold text-white hover:bg-primary-container md:w-72"
    >
      {label}
    </Link>
  );

  if (!orderCode) {
    return (
      <Card className="flex flex-col items-center py-10 text-center">
        <FormAlert message="Không tìm thấy mã đơn thanh toán." />
        {backLink('Về trang quảng cáo')}
      </Card>
    );
  }

  if (!payment && !error) return <Spinner label="Đang xác nhận thanh toán…" />;

  const status = payment?.status;
  const view =
    status === 'SUCCESS'
      ? {
          icon: 'check_circle',
          color: 'text-primary',
          title: 'Thanh toán thành công',
          text: 'Gói của bạn đã kích hoạt. Hãy chọn địa điểm để bắt đầu quảng cáo.',
          action: 'Chọn địa điểm quảng cáo',
        }
      : status === 'CANCELLED' || status === 'FAILED'
        ? {
            icon: 'cancel',
            color: 'text-[#AD3232]',
            title: 'Đơn đã huỷ hoặc hết hạn',
            text: 'Bạn chưa bị trừ tiền cho đơn này và có thể mua lại bất cứ lúc nào.',
            action: 'Chọn lại gói',
          }
        : {
            icon: 'hourglass_top',
            color: 'text-[#976207]',
            title: 'Đang xác nhận thanh toán…',
            text: timedOut
              ? 'Việc xác nhận lâu hơn bình thường. Nếu bạn đã chuyển khoản, hệ thống sẽ tự cập nhật và gửi thông báo.'
              : 'Vui lòng đợi trong giây lát.',
            action: 'Về trang quảng cáo',
          };

  return (
    <Card className="flex flex-col items-center px-6 py-12 text-center">
      <Icon name={view.icon} filled className={`text-[56px] ${view.color}`} />
      <h1 className="mt-3 text-[22px] font-extrabold text-client-ink">{view.title}</h1>
      <p className="mt-2 max-w-md text-[13px] leading-[21px] text-client-muted">{view.text}</p>
      {payment && <p className="mt-2 text-[12px] text-client-muted">Mã đơn #{payment.orderCode}</p>}
      {backLink(view.action)}
    </Card>
  );
}
