import { Link } from 'react-router-dom';
import Icon from '../../../components/common/Icon';
import { REVIEW_STATUS_BANNER } from '../../../constants/listing';
import { ROUTES } from '../../../constants/routes';
import type { Listing, ListingDetail } from '../../../types/admin';
import { formatSubmittedAt, formatWaitDuration } from '../reviewUtils';

interface ReviewHeaderProps {
  listing: Listing;
  detail: ListingDetail;
}

export default function ReviewHeader({ listing, detail }: ReviewHeaderProps) {
  const status = REVIEW_STATUS_BANNER[listing.status];

  return (
    <>
      {/* Breadcrumb + quay lại */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3">
        <nav className="flex items-center gap-2 text-[13px] font-medium text-on-surface-variant">
          <Link
            to={ROUTES.DASHBOARD}
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Icon name="home" className="text-[18px]" />
            <span>Quản trị hệ thống</span>
          </Link>
          <Icon name="chevron_right" className="text-[16px]" />
          <Link
            to={ROUTES.LISTINGS}
            className="flex items-center gap-1.5 transition-colors hover:text-primary"
          >
            <Icon name="store_mall_directory" className="text-[18px]" />
            <span>Quản lý niêm yết</span>
          </Link>
          <Icon name="chevron_right" className="text-[16px]" />
          <span className="flex items-center gap-1.5 font-bold text-primary">
            <span className="max-w-lg truncate">{listing.name}</span>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-primary">
              {listing.id}
            </span>
          </span>
        </nav>
        <Link
          to={ROUTES.LISTINGS}
          className="inline-flex items-center gap-1.5 rounded-full border border-surface-container-high bg-surface-container-lowest px-3.5 py-1.5 text-[12.5px] font-bold text-on-surface-variant shadow-xs transition-all hover:bg-surface-container-low hover:text-on-surface"
        >
          <Icon name="arrow_back" className="text-[17px]" />
          <span>Quay lại danh sách niêm yết</span>
        </Link>
      </div>

      {/* Banner tiêu đề & trạng thái */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-surface-container-high/90 bg-surface-container-lowest p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary-fixed/80 bg-primary-fixed/20 text-primary shadow-xs">
            <Icon name={listing.icon} className="text-[32px]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-[23px] leading-tight font-extrabold tracking-tight text-on-surface">
                {listing.name}
              </h1>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase shadow-2xs ${status.badgeClass}`}
              >
                <span className={`h-2 w-2 rounded-full ${status.dotClass}`} />
                {status.label}
              </span>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-[12.5px] font-medium text-on-surface-variant">
              <span className="flex items-center gap-1">
                <Icon name="schedule" className="text-[16px] text-primary" />
                Nộp hồ sơ:{' '}
                <strong className="ml-1 text-on-surface">
                  {formatSubmittedAt(listing.submittedAt)}
                </strong>
              </span>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-1">
                <Icon name="verified_user" className="text-[16px] text-primary" />
                Cấp độ kiểm duyệt:{' '}
                <strong className="ml-1 text-on-surface">{detail.reviewLevel}</strong>
              </span>
              <span className="text-outline-variant">•</span>
              <span className="flex items-center gap-1">
                <Icon name="pin_drop" className="text-[16px] text-primary" />
                Địa bàn: <strong className="ml-1 text-on-surface">{detail.areaLabel}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-surface-container-high bg-surface-container-low px-4 py-2 text-right">
            <div className="text-[11px] font-semibold text-on-surface-variant uppercase">
              Độ hoàn thiện hồ sơ
            </div>
            <div className="mt-0.5 text-[20px] leading-none font-extrabold tracking-tight text-primary">
              {detail.completeness}%
            </div>
          </div>
          <div className="rounded-xl border border-surface-container-high bg-surface-container-low px-4 py-2 text-right">
            <div className="text-[11px] font-semibold text-on-surface-variant uppercase">
              {listing.status === 'pending' ? 'Thời gian chờ' : 'Thời gian xử lý'}
            </div>
            <div className="mt-0.5 text-[20px] leading-none font-extrabold tracking-tight text-on-tertiary-fixed-variant">
              {formatWaitDuration(listing.submittedAt, listing.reviewedAt)}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
