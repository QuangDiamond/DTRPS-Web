import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Button,
  ErrorState,
  Icon,
  NotFoundState,
  PageHeader,
  PageLoader,
} from '@/components/common';
import { usePartnerReview } from '@/components/partners/usePartnerReview';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { usePartners } from '@/hooks';
import PartnerStatusBadge from '@/pages/Partners/components/PartnerStatusBadge';
import { toDisplayDate } from '@/pages/Partners/partnerUtils';
import { ApiError } from '@/services/httpClient';
import { partnerService } from '@/services/partnerService';
import type { Partner } from '@/types';
import { getErrorMessage } from '@/utils/error';

function Section({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
        <Icon name={icon} className="text-[22px] text-primary" />
        {title}
      </h2>
      <dl>{children}</dl>
    </section>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-t border-surface-container py-3 first:border-t-0">
      <dt className="font-body-md text-body-md text-on-surface-variant">{label}</dt>
      <dd className="text-right font-body-md text-body-md font-semibold break-all text-on-surface">
        {value}
      </dd>
    </div>
  );
}

const profileCode = (partner: Partner) => `BO-${partner.id.padStart(4, '0')}`;

function PartnerDetailContent({
  partner,
  onChanged,
}: {
  partner: Partner;
  onChanged: (p: Partner) => void;
}) {
  const { t } = useTranslation();
  const review = usePartnerReview(onChanged);

  const actions = (
    <>
      {partner.status === 'pending' && (
        <>
          <Button variant="danger" icon="block" onClick={() => review.reject(partner)}>
            {t('partnerAdmin.actions.reject')}
          </Button>
          <Button icon="verified" onClick={() => review.approve(partner)}>
            {t('partnerAdmin.actions.approve')}
          </Button>
        </>
      )}
      {partner.status === 'active' && (
        <Button variant="danger" icon="lock" onClick={() => review.lock(partner)}>
          {t('partnerAdmin.actions.lock')}
        </Button>
      )}
      {partner.status === 'suspended' && (
        <Button icon="lock_open" onClick={() => review.unlock(partner)}>
          {t('partnerAdmin.actions.unlock')}
        </Button>
      )}
    </>
  );

  const notice =
    partner.status === 'pending'
      ? {
          tone: 'bg-tertiary-fixed/60 text-on-tertiary-fixed',
          icon: 'pending_actions',
          text: t('partnerAdmin.detail.pendingNotice'),
        }
      : partner.status === 'rejected'
        ? {
            tone: 'bg-surface-container-high text-on-surface',
            icon: 'undo',
            text: t('partnerAdmin.detail.rejectedNotice'),
          }
        : partner.status === 'suspended'
          ? {
              tone: 'bg-error-container text-on-error-container',
              icon: 'lock',
              text: t('partnerAdmin.detail.suspendedNotice'),
            }
          : null;

  const reasonLabel =
    partner.status === 'rejected'
      ? t('partnerAdmin.detail.rejectReason')
      : partner.status === 'suspended'
        ? t('partnerAdmin.detail.lockReason')
        : null;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('nav.partners'), icon: 'business_center', to: ROUTES.PARTNERS },
            { label: partner.name },
          ]}
          title={partner.name}
          titleBadge={<PartnerStatusBadge status={partner.status} />}
          description={`${t('partnerAdmin.detail.profileCode')}: ${profileCode(partner)}`}
          actions={actions}
        />
      </div>

      {notice && (
        <div className={`flex items-start gap-3 rounded-2xl p-4 ${notice.tone}`}>
          <Icon name={notice.icon} className="text-[22px]" />
          <p className="font-body-md text-body-md">{notice.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Section icon="corporate_fare" title={t('partnerAdmin.detail.businessInfo')}>
          <Row label={t('partnerAdmin.detail.businessName')} value={partner.name} />
          <Row label={t('partnerAdmin.detail.taxCode')} value={partner.taxCode || '—'} />
          <Row label={t('partnerAdmin.detail.contactEmail')} value={partner.email || '—'} />
          <Row label={t('partnerAdmin.detail.contactPhone')} value={partner.phone || '—'} />
        </Section>

        <div className="flex flex-col gap-6">
          <Section icon="person" title={t('partnerAdmin.detail.ownerAccount')}>
            <Row label={t('partnerAdmin.detail.ownerName')} value={partner.ownerName} />
            <Row label={t('partnerAdmin.detail.ownerEmail')} value={partner.ownerEmail} />
          </Section>

          <Section icon="fact_check" title={t('partnerAdmin.detail.review')}>
            <Row
              label={t('partnerAdmin.table.status')}
              value={<PartnerStatusBadge status={partner.status} />}
            />
            <Row
              label={t('partnerAdmin.detail.submittedAt')}
              value={toDisplayDate(partner.joinedAt)}
            />
            <Row
              label={t('partnerAdmin.detail.approvedAt')}
              value={
                partner.approvedAt
                  ? toDisplayDate(partner.approvedAt)
                  : t('partnerAdmin.detail.notApproved')
              }
            />
            <Row
              label={t('partnerAdmin.detail.updatedAt')}
              value={toDisplayDate(partner.updatedAt)}
            />
            {reasonLabel && (
              <Row
                label={reasonLabel}
                value={partner.statusNote ?? t('partnerAdmin.detail.noReason')}
              />
            )}
          </Section>
        </div>
      </div>

      <section className="flex items-center gap-4 rounded-2xl border border-dashed border-outline-variant bg-surface-container-lowest p-5">
        <Icon name="location_on" className="text-[28px] text-outline" />
        <div>
          <p className="font-title-md text-title-md text-on-surface">
            {t('partnerAdmin.detail.placeTitle')}
          </p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            {t('partnerAdmin.detail.placeSoon')}
          </p>
        </div>
      </section>

      {review.dialogs}
    </div>
  );
}

/** Chi tiết đối tác: /admin/partners/:id — dữ liệu thật từ /api/admin/business-profiles/{id} */
export default function PartnerDetailPage() {
  const { t } = useTranslation();
  const { id = '' } = useParams();
  const { version } = usePartners();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [error, setError] = useState<{ message: string; notFound: boolean } | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    partnerService
      .get(id)
      .then((next) => {
        if (!active) return;
        setPartner(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (!active) return;
        const notFound =
          loadError instanceof ApiError && (loadError.status === 404 || loadError.status === 400);
        setError({ message: getErrorMessage(loadError), notFound });
      });
    return () => {
      active = false;
    };
  }, [id, version, retry]);

  if (error?.notFound) {
    return (
      <NotFoundState
        title={t('partnerDetail.page.partnerNotFound', { id })}
        backTo={ROUTES.PARTNERS}
        backLabel={t('partnerDetail.page.backPartnerList')}
      />
    );
  }
  if (error && !partner) {
    return (
      <ErrorState
        title={t('partnerDetail.page.couldNotLoadPartner')}
        message={error.message}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!partner || partner.id !== id) return <PageLoader />;
  return <PartnerDetailContent partner={partner} onChanged={setPartner} />;
}
