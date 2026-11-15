import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import { userDetailPath } from '@/constants/routes';
import { STATUS_STYLE } from '@/pages/ReviewAdmin/reviewAdminUtils';
import type { PlaceReviewStatus, ReviewAuthor } from '@/types';

/** Phần hiển thị dùng chung của các tab Quản lý đánh giá */

export function Author({ author }: { author: ReviewAuthor }) {
  return (
    <Link
      to={userDetailPath(author.id)}
      onClick={(event) => event.stopPropagation()}
      className="flex min-w-0 items-center gap-3 hover:underline"
    >
      {author.avatarUrl ? (
        <img
          src={author.avatarUrl}
          alt=""
          referrerPolicy="no-referrer"
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-fixed font-semibold text-on-primary-fixed">
          {author.name.trim().charAt(0).toUpperCase() || '?'}
        </span>
      )}
      <span className="flex min-w-0 flex-col">
        <span className="truncate font-title-md text-title-md text-on-surface">{author.name}</span>
        <span className="truncate font-body-sm text-body-sm text-on-surface-variant">
          {author.email}
        </span>
      </span>
    </Link>
  );
}

export function Comment({ comment, emptyLabel }: { comment: string | null; emptyLabel: string }) {
  return comment ? (
    <p
      className="line-clamp-3 font-body-sm text-body-sm whitespace-pre-line text-on-surface"
      title={comment}
    >
      {comment}
    </p>
  ) : (
    <p className="font-body-sm text-body-sm text-outline italic">{emptyLabel}</p>
  );
}

/** Nhãn trạng thái hiển thị của đánh giá (đang hiện / đã ẩn) */
export function ReviewStatusBadge({ status }: { status: PlaceReviewStatus }) {
  const { t } = useTranslation();
  const style = STATUS_STYLE[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 font-label-sm text-label-sm font-semibold whitespace-nowrap ${style.className}`}
    >
      <Icon name={style.icon} className="text-[14px]" />
      {t(style.labelKey)}
    </span>
  );
}

/** Ảnh đính kèm đánh giá — bấm để mở ảnh gốc */
export function ReviewPhotos({ urls }: { urls: string[] }) {
  if (urls.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {urls.map((url) => (
        <a key={url} href={url} target="_blank" rel="noreferrer">
          <img src={url} alt="" className="h-12 w-12 rounded-lg object-cover hover:opacity-80" />
        </a>
      ))}
    </div>
  );
}
