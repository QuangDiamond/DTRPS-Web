import { type ReactNode, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import Avatar from '@/client/traveller/components/Avatar';
import { ConfirmDialog, NoticeToast } from '@/client/ui/Overlay';
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
    <h2 className="mt-6 mb-3 text-[12px] font-extrabold tracking-[0.04em] text-[#087B74]">
      {children}
    </h2>
  );
}

function SettingIcon({ name }: { name: string }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D7F8F4] text-[#087B74]">
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
          <span className="rounded-full bg-[#C6F3EB] px-2 py-0.5 text-[9px] font-bold text-[#087B74]">
            {badge}
          </span>
        )}
      </span>
      <span className="mt-1 block text-[10px] text-[#8C9AAE]">{subtitle}</span>
    </span>
  );
}

function SelectSetting({
  icon,
  title,
  subtitle,
  value,
  options,
  onChange,
}: {
  icon: string;
  title: string;
  subtitle: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <Row>
      <SettingIcon name={icon} />
      <Texts title={title} subtitle={subtitle} />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={title}
        className="ml-1 max-w-[150px] cursor-pointer rounded-lg bg-transparent text-right text-[11px] font-semibold text-[#087B74] focus:outline-none"
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </Row>
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
        className={`relative ml-1 h-6 w-11 shrink-0 rounded-full transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40 ${
          checked ? 'bg-[#0D9488]' : 'bg-[#D5D8E0]'
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
  const { user, logout } = useClientAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(readSettings);
  const [confirmLogout, setConfirmLogout] = useState(false);
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
    if (key === 'language' && value === 'English')
      showNotice('Tiếng Anh sẽ có trong phiên bản sau.');
    if (key === 'displayMode' && value !== DEFAULT_SETTINGS.displayMode)
      showNotice('Giao diện tối sẽ có trong phiên bản sau.');
  };
  const comingSoon = (title: string) => () =>
    showNotice(`${title}: chức năng đang được phát triển.`);

  return (
    <div className="mx-auto max-w-2xl">
      <PageBar title="Cài đặt ứng dụng" subtitle="SmartTravel" backTo={CLIENT_ROUTES.PROFILE} />

      <div className="flex items-center rounded-[20px] bg-linear-to-br from-[#DDFBF7] to-[#EAEDFF] p-3.5">
        <Avatar
          url={user.avatarUrl}
          size={48}
          iconSize={33}
          className="mr-3 bg-[#99EFE7] text-[#007B78]"
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
          className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#DFE8FF] text-[#087B74]"
        >
          <Icon name="edit" className="text-[18px]" />
        </Link>
      </div>

      <SectionTitle>TÙY CHỌN CHUNG</SectionTitle>
      <div className="overflow-hidden rounded-[18px] bg-white">
        <SelectSetting
          icon="translate"
          title="Ngôn ngữ"
          subtitle="Language & Localization"
          value={settings.language}
          options={['Tiếng Việt', 'English']}
          onChange={(value) => update('language', value)}
        />
        <SelectSetting
          icon="payments"
          title="Tiền tệ mặc định"
          subtitle="Định dạng giá vé & dịch vụ"
          value={settings.currency}
          options={['VND (₫)', 'USD ($)']}
          onChange={(value) => update('currency', value)}
        />
        <SelectSetting
          icon="light_mode"
          title="Chế độ hiển thị"
          subtitle="Giao diện màu sắc"
          value={settings.displayMode}
          options={['Sáng (Light Mode)', 'Tối (Dark Mode)']}
          onChange={(value) => update('displayMode', value)}
        />
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
        {[
          {
            icon: 'help',
            title: 'Trung tâm trợ giúp & FAQ',
            subtitle: 'Hướng dẫn sử dụng & CSKH 24/7',
          },
          {
            icon: 'description',
            title: 'Điều khoản dịch vụ & Chính sách',
            subtitle: 'Bảo vệ khách du lịch & bảo mật',
          },
        ].map((item) => (
          <button
            key={item.title}
            type="button"
            onClick={comingSoon(item.title)}
            className="flex w-full items-center border-b border-[#F0F1F7] px-3 py-3.5 text-left hover:bg-[#F7F8FF]"
          >
            <SettingIcon name={item.icon} />
            <Texts title={item.title} subtitle={item.subtitle} />
            <Icon name="chevron_right" className="ml-1 text-[21px] text-[#8C9CAC]" />
          </button>
        ))}
        <Row>
          <SettingIcon name="info" />
          <Texts title="Phiên bản ứng dụng" subtitle="Smart Travel AI Engine" />
          <span className="text-[11px] font-semibold text-[#087B74]">Web</span>
        </Row>
      </div>

      <button
        type="button"
        onClick={() => setConfirmLogout(true)}
        className="mt-5 flex w-full items-center rounded-[18px] bg-[#FFE5E5] px-4 py-4 text-left"
      >
        <span className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFD1D1] text-[#DF4E50]">
          <Icon name="logout" className="text-[21px]" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[14px] font-bold text-[#C83E43]">
            Đăng xuất khỏi tài khoản
          </span>
          <span className="mt-1 block text-[10px] text-[#D07579]">
            Kết thúc phiên trên thiết bị này
          </span>
        </span>
        <Icon name="arrow_forward" className="text-[21px] text-[#D35358]" />
      </button>

      {confirmLogout && (
        <ConfirmDialog
          title="Đăng xuất"
          message="Bạn có chắc chắn muốn đăng xuất khỏi tài khoản?"
          confirmLabel="Đăng xuất"
          danger
          onConfirm={() => {
            logout();
            navigate(CLIENT_ROUTES.LOGIN, { replace: true });
          }}
          onClose={() => setConfirmLogout(false)}
        />
      )}
      <NoticeToast message={notice} />
    </div>
  );
}
