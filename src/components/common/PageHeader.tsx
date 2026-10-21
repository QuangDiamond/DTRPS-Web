import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { BreadcrumbItem } from '@/types';
import Icon from './Icon';

interface PageHeaderProps {
  breadcrumbs: BreadcrumbItem[];
  eyebrow?: string;
  eyebrowNote?: string;
  title: string;
  /** Badge cạnh tiêu đề, ví dụ "Trực tiếp" */
  titleBadge?: ReactNode;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  breadcrumbs,
  eyebrow,
  eyebrowNote,
  title,
  titleBadge,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
      <div className="flex flex-col gap-1">
        <nav className="mb-3 flex items-center space-x-2 text-xs font-medium text-outline">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <Fragment key={crumb.label}>
                {index > 0 && <span className="text-outline-variant">/</span>}
                {crumb.icon && <Icon name={crumb.icon} className="text-[16px] text-outline" />}
                {isLast || !crumb.to ? (
                  <span className={isLast ? 'font-semibold text-on-primary-fixed-variant' : ''}>
                    {crumb.label}
                  </span>
                ) : (
                  <Link to={crumb.to} className="hover:text-primary">
                    {crumb.label}
                  </Link>
                )}
              </Fragment>
            );
          })}
        </nav>

        {eyebrow && (
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm font-bold tracking-widest text-primary uppercase">
              {eyebrow}
            </span>
            {eyebrowNote && (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-outline-variant" />
                <span className="font-label-sm text-label-sm font-medium text-on-surface-variant">
                  {eyebrowNote}
                </span>
              </>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-headline-lg text-headline-lg font-bold tracking-tight text-on-surface">
            {title}
          </h1>
          {titleBadge}
        </div>
        {description && (
          <p className="font-body-md text-body-md text-on-surface-variant">{description}</p>
        )}
      </div>

      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  );
}
