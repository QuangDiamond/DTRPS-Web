import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, ErrorState, Icon, PageHeader, PageLoader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { useAuth } from '@/hooks';
import { Row, Section } from '@/pages/PlaceReview/components/PlaceContentView';
import { displayDate } from '@/pages/PlaceReview/placeReviewUtils';
import { adminUserService } from '@/services/adminUserService';
import type { AdminUser } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { UserAvatar, UserRoleBadges, UserStatusBadge } from './components/UserBadges';
import { useUserLock } from './components/useUserLock';
import { userCode } from './userAdminUtils';

/** Chi tiết tài khoản: /admin/users/:id — xem, khóa / mở khóa */
export default function UserAdminDetailPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id = '' } = useParams();
  const { admin } = useAuth();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const access = useUserLock(setUser);

  useEffect(() => {
    let active = true;
    adminUserService
      .get(id)
      .then((next) => {
        if (!active) return;
        setUser(next);
        setError(null);
      })
      .catch((loadError: unknown) => {
        if (active) setError(getErrorMessage(loadError));
      });
    return () => {
      active = false;
    };
  }, [id, retry]);

  if (error && !user) {
    return (
      <ErrorState
        title={t('userAdmin.detail.loadError')}
        message={error}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!user) return <PageLoader />;

  const isSelf = admin?.email === user.email;
  const missing = t('userAdmin.detail.notProvided');

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[
            ADMIN_ROOT_CRUMB,
            { label: t('userAdmin.detail.back'), icon: 'group', to: ROUTES.USERS },
            { label: user.name },
          ]}
          title={user.name}
          titleBadge={<UserStatusBadge status={user.status} />}
          description={t('userAdmin.detail.code', { code: userCode(user.id) })}
          actions={
            isSelf ? undefined : user.status === 'active' ? (
              <Button variant="danger" icon="lock" onClick={() => access.lock(user)}>
                {t('userAdmin.lock.confirm')}
              </Button>
            ) : (
              <Button icon="lock_open" onClick={() => access.unlock(user)}>
                {t('userAdmin.unlock.confirm')}
              </Button>
            )
          }
        />
      </div>

      {user.status === 'suspended' && (
        <div className="flex items-start gap-3 rounded-2xl bg-error-container p-4 text-on-error-container">
          <Icon name="lock" className="text-[22px]" />
          <div className="font-body-md text-body-md">
            <p className="font-semibold">{t('userAdmin.detail.lockedNotice')}</p>
            <p>
              {t('userAdmin.detail.lockReason')}:{' '}
              {user.statusNote ?? t('userAdmin.detail.noReason')}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <section className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest p-6 text-center shadow-sm">
            <UserAvatar user={user} size="lg" />
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface">{user.name}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{user.email}</p>
            </div>
            <UserRoleBadges roles={user.roles} />
          </section>
        </div>
        <div className="flex flex-col gap-6 xl:col-span-8">
          <Section icon="badge" title={t('userAdmin.detail.info')}>
            <dl>
              <Row label={t('userAdmin.detail.email')} value={user.email} />
              <Row label={t('userAdmin.detail.phone')} value={user.phone ?? missing} />
              <Row
                label={t('userAdmin.detail.dateOfBirth')}
                value={user.dateOfBirth ? displayDate(user.dateOfBirth) : missing}
              />
              <Row
                label={t('userAdmin.detail.joined')}
                value={user.createdAt ? displayDate(user.createdAt) : '—'}
              />
              <Row
                label={t('userAdmin.detail.roles')}
                value={<UserRoleBadges roles={user.roles} />}
              />
              <Row
                label={t('userAdmin.detail.status')}
                value={<UserStatusBadge status={user.status} />}
              />
            </dl>
          </Section>
          {user.roles.includes('business_owner') && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface-container-low p-4">
              <p className="flex items-center gap-2 font-body-md text-body-md text-on-surface-variant">
                <Icon name="storefront" className="text-[20px] text-primary" />
                {t('userAdmin.detail.ownerNote')}
              </p>
              <Button
                variant="neutral"
                icon="business_center"
                onClick={() => navigate(ROUTES.PARTNERS)}
              >
                {t('userAdmin.detail.openPartners')}
              </Button>
            </div>
          )}
        </div>
      </div>

      {access.dialogs}
    </div>
  );
}
