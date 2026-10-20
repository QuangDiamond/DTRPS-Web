import Icon from '../../../components/common/Icon';
import { USER_ACCOUNT_TYPE_LABELS, USER_STATUS_CONFIG } from '../../../constants/user';
import type { AppUser, UserProfile } from '../../../types/admin';
import { formatDate, formatDayTime } from '../../../utils/format';
import { formatMembership } from '../userProfileUtils';

interface UserProfileCardProps {
  user: AppUser;
  profile: UserProfile;
}

/** Vòng tròn điểm tín nhiệm (SVG) */
function TrustRing({ score, danger }: { score: number; danger: boolean }) {
  const path = 'M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831';
  return (
    <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
        <path
          className="text-surface-container-high"
          d={path}
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
        />
        <path
          className={danger ? 'text-error' : 'text-primary'}
          d={path}
          fill="none"
          stroke="currentColor"
          strokeDasharray={`${score}, 100`}
          strokeLinecap="round"
          strokeWidth="3.5"
        />
      </svg>
      <span className="absolute font-headline-sm text-headline-sm font-bold text-on-surface">
        {score}
      </span>
    </div>
  );
}

function VerifiedChip({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-surface-container px-1.5 py-0.5 text-[11px] font-semibold text-primary">
      <Icon name={icon} className="text-[12px]" /> {label}
    </span>
  );
}

export default function UserProfileCard({ user, profile }: UserProfileCardProps) {
  const status = USER_STATUS_CONFIG[user.status];
  const suspended = user.status === 'suspended';
  const danger = profile.trustScore < 50;

  return (
    <div className="relative flex flex-col items-start justify-between gap-space-xl overflow-hidden rounded-3xl bg-surface-container-lowest p-space-xl shadow-sm xl:flex-row">
      <div className="pointer-events-none absolute -top-20 -right-20 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />

      {/* Định danh & liên hệ */}
      <div className="relative flex min-w-0 flex-1 flex-col items-start gap-space-lg md:flex-row">
        <div className="relative shrink-0">
          <div
            className={`flex h-28 w-28 items-center justify-center rounded-full shadow-inner ${
              suspended
                ? 'bg-error-container text-error'
                : 'bg-linear-to-tr from-surface-container-highest via-surface-container to-secondary-container text-primary'
            }`}
          >
            <Icon name={suspended ? 'person_off' : 'person'} filled className="text-[64px]" />
          </div>
          {!suspended && (
            <div className="absolute right-1 bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm">
              <Icon name="verified" className="text-[14px]" />
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-space-sm">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-display-sm text-display-sm font-bold tracking-tight text-on-surface">
              {user.name}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-space-sm py-0.5 font-label-sm text-label-sm font-semibold ${status.badgeClass}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${status.dotClass}`} />
              {status.label}
            </span>
            {user.accountType !== 'standard' && (
              <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed px-space-sm py-0.5 font-label-sm text-label-sm font-semibold text-on-tertiary-fixed">
                <Icon name="workspace_premium" filled className="text-[14px] text-tertiary" />
                {USER_ACCOUNT_TYPE_LABELS[user.accountType]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-space-sm font-label-md text-label-md text-on-surface-variant">
            <span>Mã định danh:</span>
            <span className="rounded bg-surface-container px-2 py-0.5 font-mono font-semibold text-primary">
              {user.id}
            </span>
            <span className="text-outline-variant">•</span>
            <span>
              Hạng mức: <strong className="text-on-surface">{profile.tierLabel}</strong>
            </span>
          </div>

          {suspended && user.suspendReason && (
            <div className="flex items-center gap-2 rounded-xl bg-error-container/40 px-3 py-2 font-body-sm text-body-sm text-error">
              <Icon name="report" className="text-[18px]" />
              Lý do khóa: {user.suspendReason}
            </div>
          )}

          <div className="mt-space-xs grid grid-cols-1 gap-x-space-xl gap-y-2.5 font-body-sm text-body-sm text-on-surface-variant md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Icon name="mail" className="shrink-0 text-[18px] text-primary" />
              <span className="truncate font-medium text-on-surface">{user.email}</span>
              {profile.emailVerified && <VerifiedChip icon="check_circle" label="OTP" />}
            </div>
            <div className="flex items-center gap-2">
              <Icon name="call" className="shrink-0 text-[18px] text-primary" />
              <span className="font-medium text-on-surface">{user.phone}</span>
              {profile.phoneVerified && <VerifiedChip icon="verified" label="SMS" />}
            </div>
            <div className="flex items-center gap-2">
              <Icon name="location_on" className="shrink-0 text-[18px] text-outline" />
              <span>{profile.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="calendar_month" className="shrink-0 text-[18px] text-outline" />
              <span>
                Tham gia: <strong className="text-on-surface">{formatDate(user.joinedAt)}</strong> (
                {formatMembership(user.joinedAt)})
              </span>
            </div>
            <div className="flex items-center gap-2 md:col-span-2">
              <Icon name="devices" className="shrink-0 text-[18px] text-outline" />
              <span>
                Lần đăng nhập cuối:{' '}
                <strong className="text-on-surface">{formatDayTime(profile.lastLogin.time)}</strong>{' '}
                trên {profile.lastLogin.device}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Chỉ số tín nhiệm AI */}
      <div className="relative flex w-full shrink-0 flex-col justify-between rounded-2xl bg-surface-container-low p-space-lg shadow-sm xl:w-80">
        <div className="flex items-center justify-between">
          <span className="font-label-sm text-label-sm font-semibold tracking-wider text-outline uppercase">
            Chỉ số tín nhiệm AI
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-tertiary-fixed/80 px-2 py-0.5 text-[11px] font-bold text-tertiary">
            <Icon name="auto_awesome" filled className="text-[13px]" />
            AI Verified
          </span>
        </div>
        <div className="my-space-sm flex items-center gap-space-md">
          <TrustRing score={profile.trustScore} danger={danger} />
          <div className="flex flex-col">
            <span
              className={`font-title-md text-title-md font-bold ${danger ? 'text-error' : 'text-primary'}`}
            >
              {profile.trustTitle}
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant">
              {profile.trustNote}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between rounded-xl bg-surface-container-lowest px-space-md py-2 pt-space-xs font-label-sm text-label-sm text-on-surface-variant">
          <span className="flex items-center gap-1 font-medium">
            <Icon name="military_tech" className="text-[16px] text-tertiary" />
            Huy hiệu hành khách:
          </span>
          <span className="font-bold text-primary">{profile.badge}</span>
        </div>
      </div>
    </div>
  );
}
