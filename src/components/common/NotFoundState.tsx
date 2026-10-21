import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Icon from './Icon';

interface NotFoundStateProps {
  title: string;
  /** Đường dẫn quay lại danh sách */
  backTo: string;
  backLabel: string;
  icon?: string;
}

/** Trạng thái "Không tìm thấy bản ghi" cho các trang chi tiết (người dùng, đối tác, niêm yết, POI) */
export default function NotFoundState({
  title,
  backTo,
  backLabel,
  icon = 'search_off',
}: NotFoundStateProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl bg-surface-container-lowest py-16 text-center shadow-sm">
      <Icon name={icon} className="text-[48px] text-outline" />
      <h1 className="font-headline-lg text-headline-lg text-on-surface">{title}</h1>
      <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
        {t('components.notFoundState.theRecordMayHave')}
      </p>
      <Link to={backTo} className="font-label-md text-label-md text-primary hover:underline">
        {backLabel}
      </Link>
    </div>
  );
}
