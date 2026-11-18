import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { Button, Icon, PageHeader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { useLiveRefresh } from '@/hooks';
import { AD_TAB_ICONS, AD_TABS, type AdTab, isAdTab } from './adPaymentUtils';
import AdvertisementsTab from './components/AdvertisementsTab';
import PackagesTab from './components/PackagesTab';
import PaymentsTab from './components/PaymentsTab';
import SubscriptionsTab from './components/SubscriptionsTab';

const LIVE_EVENTS = ['AD_'];

/** Gói & Thanh toán: /admin/payments — giao dịch PayOS, gói đang chạy, quảng cáo, bảng giá */
export default function AdPaymentsPage() {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab');
  const tab: AdTab = isAdTab(tabParam) ? tabParam : 'payments';
  const [reload, setReload] = useState(0);
  const refresh = useCallback(() => setReload((n) => n + 1), []);
  useLiveRefresh(LIVE_EVENTS, refresh);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.payments'), icon: 'payments' }]}
          eyebrow={t('adAdmin.header.eyebrow')}
          title={t('adAdmin.header.title')}
          description={t('adAdmin.header.description')}
          actions={
            <Button variant="neutral" icon="refresh" onClick={refresh}>
              {t('adAdmin.header.refresh')}
            </Button>
          }
        />
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl bg-surface-container-lowest p-3 shadow-sm">
        {AD_TABS.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setParams(value === 'payments' ? {} : { tab: value }, { replace: true })}
            className={`flex items-center gap-2 rounded-full px-4 py-2 font-label-md text-label-md transition-colors ${
              tab === value
                ? 'bg-primary font-semibold text-on-primary'
                : 'text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            <Icon name={AD_TAB_ICONS[value]} className="text-[18px]" />
            {t(`adAdmin.tabs.${value}`)}
          </button>
        ))}
      </div>

      {tab === 'payments' && (
        <PaymentsTab
          reload={reload}
          onChanged={refresh}
          initialReview={params.get('review') === 'true'}
        />
      )}
      {tab === 'subscriptions' && <SubscriptionsTab reload={reload} onChanged={refresh} />}
      {tab === 'advertisements' && <AdvertisementsTab reload={reload} onChanged={refresh} />}
      {tab === 'packages' && <PackagesTab reload={reload} />}
    </div>
  );
}
