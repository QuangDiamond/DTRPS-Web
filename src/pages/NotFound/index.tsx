import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Icon from '../../components/common/Icon';
import { ROUTES } from '../../constants/routes';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

/** Trang 404 cho mọi đường dẫn không tồn tại */
export default function NotFoundPage() {
  const navigate = useNavigate();
  useDocumentTitle('Không tìm thấy trang');

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed/40 text-primary">
        <Icon name="travel_explore" className="text-[36px]" />
      </div>
      <p className="font-display-lg text-display-lg font-bold text-primary">404</p>
      <h1 className="font-headline-lg text-headline-lg text-on-surface">Không tìm thấy trang</h1>
      <p className="max-w-md font-body-md text-body-md text-on-surface-variant">
        Đường dẫn bạn truy cập không tồn tại hoặc đã được di chuyển. Vui lòng kiểm tra lại địa chỉ.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-space-sm">
        <Button variant="neutral" icon="arrow_back" onClick={() => navigate(-1)}>
          Quay lại trang trước
        </Button>
        <Button icon="dashboard" onClick={() => navigate(ROUTES.DASHBOARD)}>
          Về Bảng điều khiển
        </Button>
      </div>
    </main>
  );
}
