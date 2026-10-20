import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../../components/common/Icon';
import {
  NOTIFICATION_PAGE_SIZE,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_TABS,
} from '../../constants/notification';
import { ROUTES } from '../../constants/routes';
import { useListings } from '../../hooks/useListings';
import { useNotifications } from '../../hooks/useNotifications';
import { useToast } from '../../hooks/useToast';
import type {
  AdminNotification,
  NotificationPriority,
  NotificationRules,
  NotificationTab,
} from '../../types/admin';
import { formatNumber } from '../../utils/format';
import NotificationGroup from './components/NotificationGroup';
import NotificationPagination from './components/NotificationPagination';
import NotificationRulesModal from './components/NotificationRulesModal';
import NotificationStatsCards from './components/NotificationStatsCards';
import PriorityFilterMenu from './components/PriorityFilterMenu';
import UrgentChannelBanner from './components/UrgentChannelBanner';
import { filterNotifications, isToday } from './notificationUtils';

const HEADER_BUTTON_CLASS =
  'flex h-10 items-center gap-space-xs rounded-full px-space-md font-label-md text-label-md font-semibold transition-all';

/** Trung tâm Thông báo Quản trị: /admin/notifications */
export default function NotificationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { stats: listingStats } = useListings();
  const { notifications, stats, rules, markAsRead, markAllAsRead, updateRules } =
    useNotifications();

  const [tab, setTab] = useState<NotificationTab>('all');
  const [priority, setPriority] = useState<NotificationPriority | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [rulesOpen, setRulesOpen] = useState(false);

  const filtered = useMemo(
    () => filterNotifications(notifications, tab, priority, search),
    [notifications, tab, priority, search],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / NOTIFICATION_PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageItems = filtered.slice(
    (currentPage - 1) * NOTIFICATION_PAGE_SIZE,
    currentPage * NOTIFICATION_PAGE_SIZE,
  );
  const todayItems = pageItems.filter((item) => isToday(item.createdAt));
  const earlierItems = pageItems.filter((item) => !isToday(item.createdAt));

  const priorityCounts = useMemo(() => {
    const counts = Object.fromEntries(NOTIFICATION_PRIORITIES.map((key) => [key, 0])) as Record<
      NotificationPriority,
      number
    >;
    notifications
      .filter((item) => tab === 'all' || item.category === tab)
      .forEach((item) => {
        counts[item.priority] += 1;
      });
    return counts;
  }, [notifications, tab]);

  const changeTab = (next: NotificationTab) => {
    setTab(next);
    setPage(1);
  };

  const handleMarkAll = () => {
    const count = markAllAsRead();
    showToast(
      count > 0 ? `Đã đánh dấu ${count} thông báo là đã đọc` : 'Không còn thông báo chưa đọc',
      count > 0 ? 'success' : 'info',
    );
  };

  const handleMarkRead = (notification: AdminNotification) => {
    markAsRead(notification.id);
    showToast(`Đã đánh dấu "${notification.title}" là đã đọc`, 'info');
  };

  // Mở trang xử lý tương ứng, đồng thời đánh dấu đã đọc
  const handleAction = (notification: AdminNotification) => {
    markAsRead(notification.id);
    navigate(notification.action.to);
  };

  const toggleUrgentChannels = (enabled: boolean) => {
    updateRules({ ...rules, urgentChannelsEnabled: enabled });
    showToast(
      enabled
        ? 'Đã bật kênh cảnh báo khẩn qua Telegram & SMS'
        : 'Đã tạm tắt kênh cảnh báo khẩn qua Telegram & SMS',
      enabled ? 'success' : 'info',
    );
  };

  const saveRules = (next: NotificationRules) => {
    updateRules(next);
    setRulesOpen(false);
    showToast('Đã lưu quy tắc thông báo');
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-space-lg">
      {/* Breadcrumb */}
      <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
        <Link
          to={ROUTES.DASHBOARD}
          className="flex items-center gap-1.5 transition-colors hover:text-primary"
        >
          <Icon name="home" className="text-[18px]" />
          <span>Quản trị hệ thống</span>
        </Link>
        <span className="font-normal text-outline-variant">/</span>
        <div className="flex items-center gap-1.5">
          <Icon name="notifications" className="text-[18px] text-primary" />
          <span className="font-semibold text-on-surface">Thông báo</span>
        </div>
        <span className="font-normal text-outline-variant">/</span>
        <span className="text-outline">Trung tâm thông báo hệ thống</span>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-space-md lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-col">
          <div className="flex flex-wrap items-center gap-space-sm">
            <h1 className="font-display-sm text-display-sm tracking-tight text-on-surface">
              Trung tâm Thông báo Quản trị
            </h1>
            <span className="flex items-center gap-1 rounded-full bg-primary-fixed px-space-sm py-0.5 font-label-sm text-label-sm font-bold text-on-primary-fixed">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              Trực tiếp AI Ops
            </span>
          </div>
          <p className="mt-1 max-w-3xl font-body-md text-body-md text-on-surface-variant">
            Cập nhật kịp thời mọi biến động dữ liệu, yêu cầu niêm yết mới và cảnh báo an ninh vận
            hành hệ thống toàn quốc.
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-space-sm">
          <button
            type="button"
            onClick={handleMarkAll}
            className={`${HEADER_BUTTON_CLASS} bg-surface-container-low text-primary hover:bg-surface-container-high`}
          >
            <Icon name="done_all" className="text-[19px]" />
            <span>Đánh dấu tất cả đã đọc</span>
          </button>
          <PriorityFilterMenu
            value={priority}
            counts={priorityCounts}
            onChange={(next) => {
              setPriority(next);
              setPage(1);
            }}
          />
          <button
            type="button"
            onClick={() => setRulesOpen(true)}
            className={`${HEADER_BUTTON_CLASS} bg-primary-container text-on-primary-container shadow-sm hover:bg-primary`}
          >
            <Icon name="tune" className="text-[19px]" />
            <span>Cài đặt quy tắc</span>
          </button>
        </div>
      </div>

      <NotificationStatsCards stats={stats} pendingListings={listingStats.pending} />

      {/* Tab lọc + ô tìm nhanh */}
      <div className="flex flex-col items-stretch justify-between gap-space-md sm:flex-row sm:items-center">
        <div className="flex items-center gap-space-xs overflow-x-auto pb-1 sm:pb-0">
          {NOTIFICATION_TABS.map((item) => {
            const active = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => changeTab(item.id)}
                className={`flex h-10 items-center gap-2 rounded-full px-space-md font-label-md text-label-md whitespace-nowrap transition-all ${
                  active
                    ? 'bg-primary-container font-semibold text-on-primary-container shadow-sm'
                    : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <span>{item.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 font-label-sm text-label-sm ${
                    active
                      ? 'bg-surface-container-lowest/30'
                      : 'bg-surface-container-highest font-semibold'
                  }`}
                >
                  {formatNumber(stats.byTab[item.id])}
                </span>
              </button>
            );
          })}
        </div>
        <div className="relative w-full shrink-0 sm:w-64">
          <Icon name="search" className="absolute top-2.5 left-3 text-[18px] text-outline" />
          <input
            type="text"
            value={search}
            placeholder="Lọc thông báo..."
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="h-9 w-full rounded-full bg-surface-container-low pr-3 pl-9 font-body-sm text-body-sm text-on-surface shadow-sm transition-all placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none"
          />
        </div>
      </div>

      {/* Danh sách thông báo theo ngày */}
      <div className="flex flex-col gap-space-lg">
        <NotificationGroup
          variant="today"
          notifications={todayItems}
          onAction={handleAction}
          onMarkRead={handleMarkRead}
        />
        <NotificationGroup
          variant="earlier"
          notifications={earlierItems}
          onAction={handleAction}
          onMarkRead={handleMarkRead}
        />
        {pageItems.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-surface-container-lowest py-14 text-center shadow-sm">
            <Icon name="notifications_off" className="text-[40px] text-outline" />
            <span className="font-body-md text-body-md text-on-surface-variant">
              Không có thông báo phù hợp
            </span>
            <button
              type="button"
              onClick={() => {
                setTab('all');
                setPriority('all');
                setSearch('');
                setPage(1);
              }}
              className="font-label-md text-label-md text-primary hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Banner kênh khẩn + phân trang */}
      <div className="mt-2 grid grid-cols-1 items-center gap-space-md lg:grid-cols-3">
        <UrgentChannelBanner
          enabled={rules.urgentChannelsEnabled}
          aiLoadThreshold={rules.aiLoadThreshold}
          onToggle={toggleUrgentChannels}
        />
        <NotificationPagination
          page={currentPage}
          pageSize={NOTIFICATION_PAGE_SIZE}
          totalItems={filtered.length}
          onPageChange={setPage}
        />
      </div>

      {rulesOpen && (
        <NotificationRulesModal
          rules={rules}
          onSave={saveRules}
          onClose={() => setRulesOpen(false)}
        />
      )}
    </div>
  );
}
