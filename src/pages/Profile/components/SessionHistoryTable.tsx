import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/common';
import { SESSION_STATUS_LABELS } from '@/constants/adminProfile';
import type { AdminSession } from '@/types';
import { formatDayTime } from '@/utils/format';

interface SessionHistoryTableProps {
  sessions: AdminSession[];
  onRevokeOthers: () => void;
}

const MAX_ROWS = 5;

export default function SessionHistoryTable({
  sessions,
  onRevokeOthers,
}: SessionHistoryTableProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-space-sm pt-space-xs">
      <div className="flex items-center justify-between">
        <span className="font-label-md text-label-md font-semibold text-on-surface">
          {t('profile.sessionHistoryTable.lastSignSessions', { MAX_ROWS })}
        </span>
        <button
          type="button"
          onClick={onRevokeOthers}
          className="font-label-sm text-label-sm font-semibold text-error hover:underline"
        >
          {t('profile.sessionHistoryTable.signOutAllOther')}
        </button>
      </div>
      <div className="table-scroll overflow-x-auto rounded-xl bg-surface-container-low">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="font-label-sm text-label-sm text-on-surface-variant">
              <th className="px-space-md py-2.5 font-semibold">
                {t('profile.sessionHistoryTable.deviceBrowser')}
              </th>
              <th className="px-space-md py-2.5 font-semibold">
                {t('profile.sessionHistoryTable.ipAddress')}
              </th>
              <th className="px-space-md py-2.5 font-semibold">
                {t('profile.sessionHistoryTable.location')}
              </th>
              <th className="px-space-md py-2.5 font-semibold">
                {t('profile.sessionHistoryTable.time')}
              </th>
              <th className="px-space-md py-2.5 text-right font-semibold">
                {t('profile.sessionHistoryTable.status')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container font-body-sm text-body-sm">
            {sessions.slice(0, MAX_ROWS).map((session) => {
              const isCurrent = session.status === 'current';
              return (
                <tr key={session.id} className="transition-colors hover:bg-surface-container/50">
                  <td className="px-space-md py-2.5 font-medium text-on-surface">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <Icon
                        name={session.icon}
                        className={`text-[16px] ${isCurrent ? 'text-primary' : 'text-on-surface-variant'}`}
                      />
                      {session.device}
                    </span>
                  </td>
                  <td className="px-space-md py-2.5 text-on-surface-variant">{session.ip}</td>
                  <td className="px-space-md py-2.5 whitespace-nowrap text-on-surface-variant">
                    {session.location}
                  </td>
                  <td
                    className={`px-space-md py-2.5 whitespace-nowrap ${isCurrent ? 'text-on-surface' : 'text-on-surface-variant'}`}
                  >
                    {isCurrent
                      ? t('profile.sessionHistoryTable.active')
                      : formatDayTime(session.signedInAt)}
                  </td>
                  <td className="px-space-md py-2.5 text-right whitespace-nowrap">
                    {isCurrent ? (
                      <span className="inline-flex items-center gap-1 font-label-sm text-label-sm font-bold text-primary">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
                        {t('profile.sessionHistoryTable.thisSession')}
                      </span>
                    ) : (
                      <span
                        className={`font-label-sm text-label-sm ${session.status === 'revoked' ? 'font-semibold text-error' : 'text-on-surface-variant'}`}
                      >
                        {SESSION_STATUS_LABELS[session.status]}
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
