import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Icon } from '@/components/common';
import { ROUTES } from '@/constants/routes';
import { useDocumentTitle } from '@/hooks';

/** Trang 404 cho mọi đường dẫn không tồn tại */
export default function NotFoundPage() {
  // Theo dõi ngôn ngữ để nhãn trạng thái/danh mục trong trang đổi ngay khi chuyển VI / EN
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle(t('notFound.page.pageNotFound'));

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/40 text-primary">
        <Icon name="travel_explore" className="text-[36px]" />
      </div>
      <p className="font-display-lg text-display-lg font-bold text-primary">404</p>
      <h1 className="font-headline-lg text-headline-lg text-on-surface">
        {t('notFound.page.pageNotFound')}
      </h1>
      <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
        {t('notFound.page.thePageYouLooking')}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-space-sm">
        <Button variant="neutral" icon="arrow_back" onClick={() => navigate(-1)}>
          {t('notFound.page.goBack')}
        </Button>
        <Button icon="dashboard" onClick={() => navigate(ROUTES.DASHBOARD)}>
          {t('notFound.page.goDashboard')}
        </Button>
      </div>
    </main>
  );
}
