import { type ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import Avatar from '@/client/traveller/components/Avatar';
import { NoticeToast } from '@/client/ui/Overlay';
import { useNotice } from '@/client/ui/useNotice';
import PageBar from '@/client/ui/PageBar';

/**
 * Tuỳ chọn ứng dụng — chỉ lưu trên trình duyệt này (BE chưa có API cài đặt cho du khách).
 * Ngôn ngữ / giao diện tối sẽ được áp dụng khi khu client hỗ trợ.
 */
interface AppSettings {
  language: string;
  currency: string;
  displayMode: string;
  pushNotification: boolean;
  tripReminder: boolean;
  weatherNotification: boolean;
  locationEnabled: boolean;
}

const STORAGE_KEY = 'smarttravel.client.settings';

const DEFAULT_SETTINGS: AppSettings = {
  language: 'Tiếng Việt',
  currency: 'VND (₫)',
  displayMode: 'Sáng (Light Mode)',
  pushNotification: true,
  tripReminder: true,
  weatherNotification: true,
  locationEnabled: true,
};

function readSettings(): AppSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<AppSettings>) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2 className="mt-6 mb-3 text-[12px] font-extrabold tracking-[0.04em] text-[#0891B2]">
      {children}
    </h2>
  );
}

function SettingIcon({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D5F6FA] text-[#0891B2]">
      <Icon name={name} className="text-[21px]" />
    </span>
  );
}

function Row({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center border-b border-[#F0F1F7] px-3 py-3.5 last:border-b-0">
      {children}
    </div>
  );
}

function Texts({ title, subtitle, badge }: { title: string; subtitle: string; badge?: string }) {
  return (
    <span className="ml-3 min-w-0 flex-1">
      <span className="flex items-center gap-2">
        <span className="truncate text-[13px] font-bold text-[#173C50]">{title}</span>
        {badge && (
          <span className="rounded-full bg-[#C4F0F5] px-2 py-0.5 text-[9px] font-bold text-[#0891B2]">
            {badge}
          </span>
        )}
      </span>
      <span className="mt-1 block text-[10px] text-[#8C9AAE]">{subtitle}</span>
    </span>
  );
}

function SwitchSetting({
  icon,
  title,
  subtitle,
  badge,
  checked,
  onChange,
}: {
  icon: string;
  title: string;
  subtitle: string;
  badge?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center border-b border-[#F0F1F7] px-3 py-3 last:border-b-0">
      <SettingIcon name={icon} />
      <Texts title={title} subtitle={subtitle} badge={badge} />
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className={`relative ml-1 h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-client-primary/40 ${
          checked ? 'bg-[#0891B2]' : 'bg-[#D5D8E0]'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
            checked ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </span>
    </label>
  );
}

/** Cài đặt ứng dụng — theo SettingsScreen của mobile */
export default function SettingsPage() {
  const { user } = useClientAuth();
  const [settings, setSettings] = useState<AppSettings>(readSettings);
  const [notice, showNotice] = useNotice();
  if (!user) return null;

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const next = { ...settings, [key]: value };
    setSettings(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Không lưu được thì chỉ áp dụng trong phiên này
    }
    showNotice('Đã lưu cài đặt.');
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageBar title="Cài đặt ứng dụng" subtitle="SmartTravel" backTo={CLIENT_ROUTES.PROFILE} />

      <div className="flex items-center rounded-[20px] bg-[#DCF9FD] p-3.5">
        <Avatar
          url={user.avatarUrl}
          size={48}
          iconSize={33}
          className="mr-3 bg-[#95EAF3] text-[#0891B2]"
        />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2">
            <span className="truncate text-[15px] font-bold text-[#15384D]">{user.name}</span>
          </p>
          <p className="mt-1 truncate text-[10px] text-[#75869C]">{user.email}</p>
        </div>
        <Link
          to={CLIENT_ROUTES.PROFILE_EDIT}
          aria-label="Chỉnh sửa hồ sơ"
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#DFE8FF] text-[#0891B2]"
        >
          <Icon name="edit" className="text-[18px]" />
        </Link>
      </div>

      <SectionTitle>THÔNG BÁO & ĐỊNH VỊ</SectionTitle>
      <div className="overflow-hidden rounded-[18px] bg-white">
        <SwitchSetting
          icon="notifications"
          title="Thông báo đẩy"
          subtitle="Tin tức & ưu đãi khách sạn, điểm đến"
          checked={settings.pushNotification}
          onChange={(value) => update('pushNotification', value)}
        />
        <SwitchSetting
          icon="event_upcoming"
          title="Nhắc nhở lịch trình & Chuyến đi"
          subtitle="Thông báo trước giờ khởi hành 2 giờ"
          checked={settings.tripReminder}
          onChange={(value) => update('tripReminder', value)}
        />
        <SwitchSetting
          icon="partly_cloudy_day"
          title="Cập nhật thời tiết điểm đến"
          subtitle="Dự báo mưa bão hoặc nắng đẹp tại VN"
          checked={settings.weatherNotification}
          onChange={(value) => update('weatherNotification', value)}
        />
        <SwitchSetting
          icon="my_location"
          title="Dịch vụ định vị"
          subtitle="Dùng khi theo dõi hành trình trên bản đồ"
          badge="GPS"
          checked={settings.locationEnabled}
          onChange={(value) => update('locationEnabled', value)}
        />
      </div>

      <SectionTitle>HỖ TRỢ & THÔNG TIN</SectionTitle>
      <div className="overflow-hidden rounded-[18px] bg-white">
        <a
          href="tel:0973954275"
          className="flex w-full items-center border-b border-[#F0F1F7] px-3 py-3.5 text-left hover:bg-[#F7F8FF]"
        >
          <SettingIcon name="support_agent" />
          <Texts title="Tổng đài hỗ trợ" subtitle="0973954275" />
          <Icon name="chevron_right" className="ml-1 text-[21px] text-[#8C9CAC]" />
        </a>
        <a
          href="mailto:smarttravel.dtrps@gmail.com"
          className="flex w-full items-center border-b border-[#F0F1F7] px-3 py-3.5 text-left hover:bg-[#F7F8FF]"
        >
          <SettingIcon name="mail" />
          <Texts title="Email hỗ trợ" subtitle="smarttravel.dtrps@gmail.com" />
          <Icon name="chevron_right" className="ml-1 text-[21px] text-[#8C9CAC]" />
        </a>
        <Row>
          <SettingIcon name="info" />
          <Texts title="Phiên bản ứng dụng" subtitle="Smart Travel AI Engine" />
          <span className="text-[11px] font-semibold text-[#0891B2]">Web</span>
        </Row>
      </div>

      <NoticeToast message={notice} />
    </div>
  );
}
