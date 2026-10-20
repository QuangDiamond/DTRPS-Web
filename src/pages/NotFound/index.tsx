import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
      <p className="font-display-lg text-display-lg font-bold text-primary">404</p>
      <p className="font-body-md text-body-md text-on-surface-variant">Không tìm thấy trang</p>
      <button
        type="button"
        onClick={() => navigate(ROUTES.DASHBOARD)}
        className="rounded-full bg-primary px-5 py-2.5 font-label-md text-label-md font-semibold text-on-primary hover:bg-primary-container"
      >
        Về Bảng điều khiển
      </button>
    </div>
  );
}
