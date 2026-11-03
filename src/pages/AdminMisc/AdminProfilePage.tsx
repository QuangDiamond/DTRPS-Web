import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ErrorState, Icon, PageHeader, PageLoader } from '@/components/common';
import { ADMIN_ROOT_CRUMB } from '@/constants/navigation';
import { useAuth, useToast } from '@/hooks';
import { type AdminAccountInfo, adminAccountService } from '@/services/adminAccountService';
import { changePassword } from '@/services/authService';
import { getErrorMessage } from '@/utils/error';

const PHONE_PATTERN = /^\+?[0-9]{8,15}$/;
const INPUT_CLASS =
  'h-11 w-full rounded-xl bg-surface-container-low px-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-60';

function Card({ icon, title, children }: { icon: string; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-surface-container-lowest p-5 shadow-sm">
      <h2 className="flex items-center gap-2 font-headline-sm text-headline-sm text-on-surface">
        <Icon name={icon} className="text-[22px] text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 font-label-md text-label-md text-on-surface">
      {label}
      {children}
      {error ? (
        <span className="font-body-sm text-body-sm text-error">{error}</span>
      ) : (
        hint && <span className="font-body-sm text-body-sm text-on-surface-variant">{hint}</span>
      )}
    </label>
  );
}

/** Hồ sơ quản trị viên: /admin/profile — API thật /users/me + đổi mật khẩu + đăng xuất mọi nơi */
export default function AdminProfilePage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { admin, logout } = useAuth();
  const [account, setAccount] = useState<AdminAccountInfo | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [infoErrors, setInfoErrors] = useState<{ name?: string; phone?: string }>({});
  const [savingInfo, setSavingInfo] = useState(false);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    let active = true;
    adminAccountService
      .me()
      .then((me) => {
        if (!active) return;
        setAccount(me);
        setName(me.name);
        setPhone(me.phoneNumber ?? '');
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(getErrorMessage(error));
      });
    return () => {
      active = false;
    };
  }, [retry]);

  if (loadError && !account) {
    return (
      <ErrorState
        title={t('adminProfile.loadError')}
        message={loadError}
        onRetry={() => setRetry((n) => n + 1)}
      />
    );
  }
  if (!account) return <PageLoader />;

  const saveInfo = async (event: FormEvent) => {
    event.preventDefault();
    const cleanPhone = phone.replace(/[\s.-]/g, '');
    const errors: { name?: string; phone?: string } = {};
    if (name.trim().length < 2) errors.name = t('adminProfile.nameInvalid');
    if (cleanPhone && !PHONE_PATTERN.test(cleanPhone))
      errors.phone = t('adminProfile.phoneInvalid');
    setInfoErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSavingInfo(true);
    try {
      const saved = await adminAccountService.update(account, {
        name: name.trim(),
        phoneNumber: cleanPhone || null,
      });
      setAccount(saved);
      showToast(t('adminProfile.saved'));
    } catch (error) {
      showToast(t('adminProfile.failed', { message: getErrorMessage(error) }), 'error');
    } finally {
      setSavingInfo(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault();
    if (!current || !next || !confirm) {
      setPasswordError(t('adminProfile.passwordRequired'));
      return;
    }
    if (next !== confirm) {
      setPasswordError(t('adminProfile.passwordMismatch'));
      return;
    }
    setPasswordError('');
    setSavingPassword(true);
    try {
      await changePassword(account.email, current, next);
      setCurrent('');
      setNext('');
      setConfirm('');
      showToast(t('adminProfile.passwordChanged'));
    } catch (error) {
      setPasswordError(getErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="border-b border-surface-container-high/60 pb-6">
        <PageHeader
          breadcrumbs={[ADMIN_ROOT_CRUMB, { label: t('nav.profile'), icon: 'person' }]}
          eyebrow={t('adminProfile.eyebrow')}
          title={t('adminProfile.title')}
          description={t('adminProfile.description')}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <section className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest p-6 text-center shadow-sm">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <Icon name="person" className="text-[32px] text-on-primary" />
            </span>
            <div>
              <p className="font-headline-sm text-headline-sm text-on-surface">{account.name}</p>
              <p className="font-body-md text-body-md text-on-surface-variant">{account.email}</p>
            </div>
            <span className="rounded-full bg-tertiary-fixed px-3 py-1 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed">
              {admin?.role ?? 'ADMIN'}
            </span>
          </section>
        </div>

        <div className="flex flex-col gap-6 xl:col-span-8">
          <Card icon="badge" title={t('adminProfile.info')}>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void saveInfo(event)}>
              <Field label={t('adminProfile.name')} error={infoErrors.name}>
                <input
                  className={INPUT_CLASS}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </Field>
              <Field label={t('adminProfile.phone')} error={infoErrors.phone}>
                <input
                  className={INPUT_CLASS}
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </Field>
              <Field label={t('adminProfile.email')} hint={t('adminProfile.emailHint')}>
                <input className={INPUT_CLASS} value={account.email} disabled />
              </Field>
              <div className="flex items-end justify-end">
                <Button type="submit" icon="save" loading={savingInfo}>
                  {t('adminProfile.save')}
                </Button>
              </div>
            </form>
          </Card>

          <Card icon="password" title={t('adminProfile.password')}>
            <form
              className="grid gap-4 md:grid-cols-3"
              onSubmit={(event) => void savePassword(event)}
            >
              <Field label={t('adminProfile.currentPassword')}>
                <input
                  type="password"
                  autoComplete="current-password"
                  className={INPUT_CLASS}
                  value={current}
                  onChange={(event) => setCurrent(event.target.value)}
                />
              </Field>
              <Field label={t('adminProfile.newPassword')} hint={t('adminProfile.passwordHint')}>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={INPUT_CLASS}
                  value={next}
                  onChange={(event) => setNext(event.target.value)}
                />
              </Field>
              <Field label={t('adminProfile.confirmPassword')}>
                <input
                  type="password"
                  autoComplete="new-password"
                  className={INPUT_CLASS}
                  value={confirm}
                  onChange={(event) => setConfirm(event.target.value)}
                />
              </Field>
              {passwordError && (
                <p className="font-body-sm text-body-sm text-error md:col-span-3">
                  {passwordError}
                </p>
              )}
              <div className="flex justify-end md:col-span-3">
                <Button type="submit" icon="key" loading={savingPassword}>
                  {t('adminProfile.changePassword')}
                </Button>
              </div>
            </form>
          </Card>

          <Card icon="devices" title={t('adminProfile.sessions')}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-body-md text-body-md text-on-surface-variant">
                {t('adminProfile.sessionsText')}
              </p>
              <Button variant="danger" icon="logout" onClick={logout}>
                {t('adminProfile.logoutAll')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
