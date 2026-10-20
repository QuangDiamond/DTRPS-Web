import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes';
import { useAuth } from '../../hooks/useAuth';
import { getStateString } from '../../utils/routeState';

/** Chỉ cho vào khi đã đăng nhập, ngược lại chuyển về /login (nhớ trang đang mở) */
export function RequireAuth() {
  const { admin } = useAuth();
  const location = useLocation();

  if (!admin) {
    return (
      <Navigate
        to={ROUTES.LOGIN}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  return <Outlet />;
}

/** Các màn đăng nhập / quên mật khẩu: đã đăng nhập thì chuyển vào trang quản trị */
export function GuestOnly() {
  const { admin } = useAuth();
  const location = useLocation();

  if (admin) {
    return <Navigate to={getStateString(location.state, 'from') ?? ROUTES.DASHBOARD} replace />;
  }
  return <Outlet />;
}
