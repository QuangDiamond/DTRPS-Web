import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ErrorState, Icon } from '@/components/common';
import { useToast } from '@/hooks';
import { formatBytes } from '@/pages/SystemSettings/systemSettingsUtils';
import { systemAdminService } from '@/services/systemAdminService';
import type { IntegrationState, IntegrationStatus } from '@/types';
import { getErrorMessage } from '@/utils/error';
import { formatTimestamp } from '@/utils/format';

const STATE_STYLE: Record<IntegrationState, { pill: string; dot: string; icon: string }> = {
  OK: { pill: 'bg-emerald-100 text-emerald-800', dot: 'bg-emerald-500', icon: 'check_circle' },
  ERROR: { pill: 'bg-rose-100 text-rose-800', dot: 'bg-rose-500', icon: 'error' },
  NOT_CONFIGURED: {
    pill: 'bg-surface-container-high text-on-surface-variant',
    dot: 'bg-outline',
    icon: 'block',
  },
  UNCHECKED: { pill: 'bg-sky-100 text-sky-800', dot: 'bg-sky-500', icon: 'help' },
  CONFIGURED: { pill: 'bg-teal-50 text-teal-800', dot: 'bg-teal-500', icon: 'task_alt' },
};

const SERVICE_ICON: Record<string, string> = {
  PAYOS: 'payments',
  CLOUDINARY: 'cloud',
  MAIL: 'mail',
  WEATHER: 'partly_cloudy_day',
  GOONG: 'map',
  GOOGLE: 'login',
  OPENAI: 'auto_awesome',
};

const num = (value: unknown): number | null => (typeof value === 'number' ? value : null);

/** Dòng chi tiết an toàn (không có khoá) cho từng dịch vụ */
function DetailLines({ item }: { item: IntegrationStatus }) {
  const { t } = useTranslation();
  const lines: { text: string; tone?: 'warn' }[] = [];
  const details = item.details ?? {};
  if (item.key === 'PAYOS') {
    const last = typeof details.lastWebhookAt === 'string' ? details.lastWebhookAt : null;
    lines.push(
      last
        ? { text: t('systemSettings.integrations.lastWebhook', { time: formatTimestamp(last) }) }
        : { text: t('systemSettings.integrations.noWebhook'), tone: 'warn' },
    );
    if (details.jobsEnabled === false)
      lines.push({ text: t('systemSettings.integrations.jobsOff') });
  }
  const used = num(details.creditsUsed);
  const limit = num(details.creditsLimit);
  if (used !== null && limit !== null) {
    const percent = num(details.creditsPercent) ?? (limit ? (used / limit) * 100 : 0);
    lines.push({
      text: t('systemSettings.integrations.usage', {
        used: used.toFixed(2),
        limit: limit.toFixed(0),
        percent: percent.toFixed(1),
      }),
      tone: percent >= 80 ? 'warn' : undefined,
    });
  }
  const resources = num(details.resources);
  const storage = num(details.storageBytes);
  if (resources !== null && storage !== null)
    lines.push({
      text: t('systemSettings.integrations.resources', {
        count: resources,
        size: formatBytes(storage),
      }),
    });
  if (typeof details.plan === 'string' && details.plan)
    lines.push({ text: t('systemSettings.integrations.plan', { plan: details.plan }) });
  if (typeof details.host === 'string')
    lines.push({ text: t('systemSettings.integrations.host', { host: details.host }) });

  if (lines.length === 0) return null;
  return (
    <ul className="flex flex-col gap-1 font-body-sm text-[12px]">
      {lines.map((line) => (
        <li
          key={line.text}
          className={`flex items-start gap-1.5 ${line.tone === 'warn' ? 'text-amber-700' : 'text-on-surface-variant'}`}
        >
          <Icon
            name={line.tone === 'warn' ? 'warning' : 'chevron_right'}
            className="mt-px text-[14px]"
          />
          {line.text}
        </li>
      ))}
    </ul>
  );
}

/** Thẻ trạng thái PayOS, Cloudinary, Email, thời tiết… + nút kiểm tra kết nối thật */
export default function IntegrationsTab() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [items, setItems] = useState<IntegrationStatus[] | null>(null);
  const [failed, setFailed] = useState('');
  const [checking, setChecking] = useState<Set<string>>(new Set());

  const load = useCallback(() => {
    setFailed('');
    systemAdminService
      .integrations()
      .then(setItems)
      .catch((failure: unknown) => setFailed(getErrorMessage(failure)));
  }, []);

  useEffect(load, [load]);

  const setBusy = (key: string, busy: boolean) =>
    setChecking((current) => {
      const next = new Set(current);
      if (busy) next.add(key);
      else next.delete(key);
      return next;
    });

  const check = async (key: string, quiet = false) => {
    setBusy(key, true);
    try {
      const result = await systemAdminService.checkIntegration(key);
      setItems((current) => current?.map((item) => (item.key === key ? result : item)) ?? null);
      if (!quiet && result.status === 'ERROR') showToast(`${result.name}: ${result.message}`, 'error');
    } catch (failure) {
      if (!quiet) showToast(getErrorMessage(failure), 'error');
    } finally {
      setBusy(key, false);
    }
  };

  const checkable = (items ?? []).filter((item) => item.checkable && item.configured);
  const checkAll = async () => {
    // Lần lượt từng dịch vụ để không dồn nhiều request ra ngoài cùng lúc
    for (const item of checkable) await check(item.key, true);
  };

  if (failed) return <ErrorState message={failed} onRetry={load} />;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest px-6 py-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-headline-sm text-[18px] font-bold text-on-surface">
            {t('systemSettings.integrations.title')}
          </h2>
          <p className="max-w-2xl font-body-sm text-body-sm text-on-surface-variant">
            {t('systemSettings.integrations.subtitle')}
          </p>
        </div>
        <Button
          variant="secondary"
          icon="network_check"
          loading={checking.size > 0}
          disabled={checkable.length === 0 || checking.size > 0}
          onClick={() => void checkAll()}
        >
          {checking.size > 0
            ? t('systemSettings.integrations.checking')
            : t('systemSettings.integrations.checkAll')}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {items === null
          ? [0, 1, 2].map((row) => (
              <div
                key={row}
                className="h-44 animate-pulse rounded-2xl bg-surface-container-lowest shadow-sm"
              />
            ))
          : items.map((item) => {
              const style = STATE_STYLE[item.status];
              const busy = checking.has(item.key);
              return (
                <article
                  key={item.key}
                  className="flex flex-col gap-3 rounded-2xl bg-surface-container-lowest p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon name={SERVICE_ICON[item.key] ?? 'hub'} className="text-[22px]" />
                      </span>
                      <div>
                        <h3 className="font-label-lg text-[15px] font-bold text-on-surface">
                          {item.name}
                        </h3>
                        <p className="font-body-sm text-[12px] text-on-surface-variant">
                          {item.purpose}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 font-label-sm text-[11px] font-bold ${style.pill}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                      {t(`systemSettings.integrations.status.${item.status}`)}
                    </span>
                  </div>

                  <p
                    className={`flex items-start gap-1.5 font-body-sm text-body-sm ${
                      item.status === 'ERROR' ? 'text-error' : 'text-on-surface'
                    }`}
                  >
                    <Icon name={style.icon} className="mt-px text-[16px]" />
                    {item.message}
                  </p>

                  <DetailLines item={item} />

                  <div className="mt-auto flex items-center justify-between gap-2 border-t border-surface-container pt-3">
                    <span className="min-w-0 font-label-sm text-[11px] text-outline">
                      {item.checkedAt
                        ? `${t('systemSettings.integrations.checkedAt', {
                            time: formatTimestamp(item.checkedAt),
                          })}${
                            item.latencyMs !== null
                              ? ` · ${t('systemSettings.integrations.latency', { ms: item.latencyMs })}`
                              : ''
                          }`
                        : !item.checkable
                          ? t('systemSettings.integrations.configOnly')
                          : ''}
                    </span>
                    {item.checkable && item.configured && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon="sync"
                        className="shrink-0 whitespace-nowrap"
                        loading={busy}
                        disabled={busy}
                        onClick={() => void check(item.key)}
                      >
                        {t('systemSettings.integrations.check')}
                      </Button>
                    )}
                  </div>
                </article>
              );
            })}
      </div>
    </div>
  );
}
