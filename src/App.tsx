import { RouterProvider } from 'react-router-dom';
import AuthProvider from './components/auth/AuthProvider';
import ToastProvider from './components/common/ToastProvider';
import ListingsProvider from './components/listings/ListingsProvider';
import NotificationsProvider from './components/notifications/NotificationsProvider';
import PartnersProvider from './components/partners/PartnersProvider';
import PoisProvider from './components/pois/PoisProvider';
import AdminProfileProvider from './components/profile/AdminProfileProvider';
import SettingsProvider from './components/settings/SettingsProvider';
import UsersProvider from './components/users/UsersProvider';
import { router } from './routes';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <ListingsProvider>
          <PartnersProvider>
            <UsersProvider>
              <PoisProvider>
                <NotificationsProvider>
                  <SettingsProvider>
                    <AdminProfileProvider>
                      <RouterProvider router={router} />
                    </AdminProfileProvider>
                  </SettingsProvider>
                </NotificationsProvider>
              </PoisProvider>
            </UsersProvider>
          </PartnersProvider>
        </ListingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
