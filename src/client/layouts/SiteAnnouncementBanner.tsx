import { useCallback, useEffect, useState } from 'react';
import { Icon } from '@/components/common';
import { type SiteInfo, siteInfoApi } from '@/client/api/siteInfoApi';
import { useClientLiveRefresh } from '@/client/live/clientLiveContext';

type Announcement = NonNullable<SiteInfo['announcement']>;

const DISMISS_KEY = 'smarttravel.dismissedAnnouncement';
/** Khách chưa đăng nhập không nhận realtime: tải lại định kỳ */
const POLL_MS = 5 * 60 * 1000;
const LIVE_EVENTS = ['SITE_ANNOUNCEMENT_CHANGED'];

const STYLE: Record<Announcement['level'], { bar: string; icon: string }> = {
  INFO: { bar: 'bg-sky-50 text-sky-900 border-sky-200', icon: 'info' },
  WARNING: { bar: 'bg-amber-50 text-amber-900 border-amber-200', icon: 'warning' },
  CRITICAL: { bar: 'bg-rose-600 text-white border-rose-700', icon: 'error' },
};

function readDismissed(): number | null {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    return raw ? Number(raw) : null;
  } catch {
    return null;
  }
}

function writeDismissed(version: number) {
  try {
    window.localStorage.setItem(DISMISS_KEY, String(version));
  } catch {
    // Trình duyệt chặn lưu trữ: chỉ ẩn trong lần xem này
  }
}

/**
 * Banner thông báo toàn hệ thống (admin bật ở Cài đặt hệ thống). Mức Khẩn cấp không đóng được;
 * mức khác đóng thì không hiện lại cho tới khi admin sửa nội dung.
 */
export default function SiteAnnouncementBanner({ partnerMode }: { partnerMode: boolean }) {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState<number | null>(readDismissed);

  const load = useCallback(() => {
    siteInfoApi
      .get()
      .then((info) => setAnnouncement(info.announcement))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(load, POLL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  // Admin lưu banner → tab đang mở (đã đăng nhập) cập nhật ngay
  useClientLiveRefresh(LIVE_EVENTS, load);

  // Tự ẩn đúng lúc hết hạn, không chờ lần tải lại sau
  useEffect(() => {
    if (!announcement?.endsAt) return;
    const left = new Date(announcement.endsAt).getTime() - Date.now();
    if (left <= 0) {
      setAnnouncement(null);
      return;
    }
    const timer = window.setTimeout(() => setAnnouncement(null), Math.min(left, 2 ** 31 - 1));
    return () => window.clearTimeout(timer);
  }, [announcement]);

  if (!announcement) return null;
  const forAudience =
    announcement.audience === 'ALL' ||
    (announcement.audience === 'PARTNER') === partnerMode;
  const critical = announcement.level === 'CRITICAL';
  if (!forAudience || (!critical && dismissed === announcement.version)) return null;

  const style = STYLE[announcement.level];
  return (
    <div role={critical ? 'alert' : 'status'} className={`border-b ${style.bar}`}>
      <div className="mx-auto flex max-w-7xl items-start gap-2.5 px-4 py-2.5 text-[13px] leading-5 font-medium">
        <Icon name={style.icon} filled className="mt-px shrink-0 text-[18px]" />
        <p className="min-w-0 flex-1 break-words">{announcement.message}</p>
        {!critical && (
          <button
            type="button"
            aria-label="Đóng thông báo"
            onClick={() => {
              writeDismissed(announcement.version);
              setDismissed(announcement.version);
            }}
            className="-m-1 shrink-0 rounded-full p-1 opacity-70 transition-opacity hover:opacity-100"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        )}
      </div>
    </div>
  );
}
