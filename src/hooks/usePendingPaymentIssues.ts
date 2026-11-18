import { useCallback, useEffect, useState } from 'react';
import { adAdminService } from '@/services/adAdminService';
import { useLiveRefresh } from './useLive';

const LIVE_EVENTS = ['AD_PAYMENT_'];

/** Số phiếu sự cố thanh toán chờ xử lý (badge menu "Gói & Thanh toán"), tự cập nhật realtime */
export function usePendingPaymentIssues(): number {
  const [count, setCount] = useState(0);
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((n) => n + 1), []);
  useLiveRefresh(LIVE_EVENTS, refresh);

  useEffect(() => {
    let active = true;
    adAdminService
      .paymentStats()
      .then((stats) => active && setCount(stats.openIssues))
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [reload]);

  return count;
}
