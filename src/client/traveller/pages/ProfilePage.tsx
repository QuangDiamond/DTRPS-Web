import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import type { RoleName } from '@/client/api/types';
import { ACCEPTED_IMAGE_TYPES } from '@/client/api/uploadApi';
import { useClientAuth } from '@/client/auth/clientAuthContext';
import { CLIENT_ROUTES } from '@/client/routePaths';
import Avatar from '@/client/traveller/components/Avatar';
import { useTraveller } from '@/client/traveller/travellerContext';
import { useAvatarUpload } from '@/client/traveller/useAvatarUpload';
import { ConfirmDialog, NoticeToast } from '@/client/ui/Overlay';
import { useNotice } from '@/client/ui/useNotice';

const ROLE_LABELS: Record<RoleName, string> = {
  TRAVELLER: 'Du khách',
  BUSINESS_OWNER: 'Đối tác',
  ADMIN: 'Quản trị viên',
};

type BadgeTone = 'mint' | 'gray' | 'red' | 'plain';

const BADGE_STYLES: Record<BadgeTone, string> = {
  mint: 'bg-[#BEF9F0] text-[#006A6F]',
  gray: 'bg-[#EFF0FB] text-[#445577]',
  red: 'bg-[#FFE0DD] text-[#C63E32]',
  plain: 'text-[#13756C]',
};

interface MenuItemProps {
  title: string;
  subtitle: string;
  icon: string;
  badge?: string;
  badgeTone?: BadgeTone;
  danger?: boolean;
  to?: string;
  onClick?: () => void;
}

function MenuItem({
  title,
  subtitle,
  icon,
  badge,
  badgeTone = 'gray',
  danger = false,
  to,
  onClick,
}: MenuItemProps) {
  const content = (
    <>
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
          danger ? 'bg-[#FFE1DE] text-[#D94848]' : 'bg-[#C3F7F1] text-[#087A78]'
        }`}
      >
        <Icon name={icon} className="text-[21px]" />
      </span>
      <span className="ml-3 min-w-0 flex-1">
        <span
          className={`block truncate text-[15px] font-bold ${danger ? 'text-[#D32C35]' : 'text-[#13364A]'}`}
        >
          {title}
        </span>
        <span
          className={`mt-1 block truncate text-[11px] ${danger ? 'text-[#DB6060]' : 'text-[#72818C]'}`}
        >
          {subtitle}
        </span>
      </span>
      {badge && (
        <span
          className={`ml-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${BADGE_STYLES[badgeTone]}`}
        >
          {badge}
        </span>
      )}
      <Icon
        name={danger ? 'arrow_forward' : 'chevron_right'}
        className={`ml-1 text-[22px] ${danger ? 'text-[#E36A66]' : 'text-[#7D9AA9]'}`}
      />
    </>
  );
  const className =
    'flex min-h-[70px] w-full items-center px-4 py-3 text-left transition-colors hover:bg-[#F7F8FF]';
  return to ? (
    <Link to={to} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  );
}

function SectionTitle({ children }: { children: string }) {
  return <h2 className="mt-6 mb-2 px-1 text-[12px] font-extrabold text-[#075C66]">{children}</h2>;
}

/** Hồ sơ du khách — theo ProfileScreen của mobile; thông tin tài khoản lấy từ phiên đăng nhập */
export default function ProfilePage() {
  const { user, logout, hasRole } = useClientAuth();
  const { trips, favorites } = useTraveller();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [notice, showNotice] = useNotice();
  const fileRef = useRef<HTMLInputElement>(null);
  const avatar = useAvatarUpload(() => showNotice('Đã cập nhật ảnh đại diện'));
  if (!user) return null;

  const upcoming = trips.filter((trip) => trip.status === 'upcoming' || trip.status === 'planned');
  const comingSoon = (title: string) => () =>
    showNotice(`${title}: chức năng đang được phát triển.`);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center rounded-[22px] bg-linear-to-r from-white to-[#E2FCF8] p-4">
        <div className="relative mr-4">
          <Avatar url={user.avatarUrl} size={82} iconSize={62} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={avatar.uploading}
            aria-label="Đổi ảnh đại diện"
            className="absolute -right-1 -bottom-1 flex h-8 w-8 items-center justify-center rounded-full border-[3px] border-white bg-[#00827F] text-white"
          >
            {avatar.uploading ? (
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              <Icon name="photo_camera" className="text-[16px]" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file) avatar.upload(file);
            }}
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] font-extrabold text-[#13364A]">{user.name}</p>
          <p className="mb-2 truncate text-[11px] text-[#5D7782]">{user.email}</p>
          <div className="flex flex-wrap gap-1.5">
            {user.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-primary"
              >
                {ROLE_LABELS[role] ?? role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-[20px] bg-white px-3 py-4">
        {[
          { value: trips.length, label: 'Chuyến đi' },
          { value: favorites.length, label: 'Điểm đã lưu' },
        ].map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center justify-center rounded-xl bg-[#F3F4FF] py-2"
          >
            <span className="text-[24px] font-extrabold text-[#006E78]">{item.value}</span>
            <span className="text-[10px] font-semibold text-[#13364A]">{item.label}</span>
          </div>
        ))}
      </div>

      <SectionTitle>HÀNH TRÌNH & YÊU THÍCH</SectionTitle>
      <div className="overflow-hidden rounded-[20px] bg-white">
        <MenuItem
          icon="badge"
          title="Chỉnh sửa hồ sơ"
          subtitle="Cập nhật thông tin cá nhân & ảnh"
          to={CLIENT_ROUTES.PROFILE_EDIT}
        />
        <MenuItem
          icon="luggage"
          title="Chuyến đi của tôi"
          subtitle="Quản lý lịch trình & vé máy bay"
          badge={upcoming.length > 0 ? `${upcoming.length} sắp tới` : undefined}
          badgeTone="mint"
          to={CLIENT_ROUTES.TRIPS}
        />
        <MenuItem
          icon="favorite"
          title="Địa điểm yêu thích"
          subtitle="Bộ sưu tập điểm đến & quán ăn"
          badge={`${favorites.length} điểm`}
          to={CLIENT_ROUTES.FAVORITES}
        />
        <MenuItem
          icon="tune"
          title="Sở thích du lịch"
          subtitle="Trải nghiệm, ngân sách, phong cách"
          to={CLIENT_ROUTES.PREFERENCES}
        />
        <MenuItem
          icon="notifications_active"
          title="Thông báo"
          subtitle="Cập nhật thời tiết & gợi ý hành trình"
          onClick={comingSoon('Thông báo')}
        />
      </div>

      <SectionTitle>CÀI ĐẶT & TIỆN ÍCH</SectionTitle>
      <div className="overflow-hidden rounded-[20px] bg-white">
        <MenuItem
          icon="shield_lock"
          title="Bảo mật tài khoản"
          subtitle="Đổi mật khẩu đăng nhập"
          to={CLIENT_ROUTES.PROFILE_PASSWORD}
        />
        <MenuItem
          icon="settings"
          title="Cài đặt ứng dụng"
          subtitle="Ngôn ngữ, giao diện, thông báo"
          to={CLIENT_ROUTES.PROFILE_SETTINGS}
        />
        <MenuItem
          icon="storefront"
          title="Khu vực đối tác"
          subtitle="Đăng ký và quản lý địa điểm kinh doanh"
          to={CLIENT_ROUTES.PARTNER}
        />
        {hasRole('ADMIN') && (
          <MenuItem
            icon="admin_panel_settings"
            title="Trang quản trị"
            subtitle="Dành cho quản trị viên"
            onClick={() => window.location.assign('/admin/dashboard')}
          />
        )}
        <MenuItem
          icon="support_agent"
          title="Trợ giúp & Hỗ trợ"
          subtitle="Tổng đài cứu hộ du lịch 24/7 & FAQ"
          badge="● 24/7"
          badgeTone="plain"
          onClick={comingSoon('Trợ giúp & Hỗ trợ')}
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-[20px] bg-white">
        <MenuItem
          icon="logout"
          title="Đăng xuất"
          subtitle="Đăng xuất khỏi thiết bị này"
          danger
          onClick={() => setConfirmLogout(true)}
        />
      </div>

      <div className="pt-5 pb-4 text-center">
        <p className="text-[11px] font-semibold text-[#728493]">Smart Travel Vietnam AI • Web</p>
        <p className="text-[10px] text-[#63A3B0]">Khám phá Việt Nam theo cách thông minh nhất ✨</p>
      </div>

      {confirmLogout && (
        <ConfirmDialog
          title="Đăng xuất"
          message="Bạn có chắc chắn muốn đăng xuất?"
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
