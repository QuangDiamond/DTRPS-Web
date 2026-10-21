import type { ReactNode } from 'react';
import AdminProfileProvider from './adminProfile/AdminProfileProvider';
import AuthProvider from './auth/AuthProvider';
import ListingsProvider from './listings/ListingsProvider';
import NotificationsProvider from './notifications/NotificationsProvider';
import PartnersProvider from './partners/PartnersProvider';
import PoisProvider from './pois/PoisProvider';
import SettingsProvider from './settings/SettingsProvider';
import ToastProvider from './toast/ToastProvider';
import UsersProvider from './users/UsersProvider';

/** Toàn bộ store toàn cục — thứ tự lồng quan trọng: Toast → Auth → các store nghiệp vụ */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <ListingsProvider>
          <PartnersProvider>
            <UsersProvider>
              <PoisProvider>
                <NotificationsProvider>
                  <SettingsProvider>
                    <AdminProfileProvider>{children}</AdminProfileProvider>
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
