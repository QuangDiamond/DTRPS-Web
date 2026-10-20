import { RouterProvider } from 'react-router-dom';
import AuthProvider from './components/auth/AuthProvider';
import ToastProvider from './components/common/ToastProvider';
import ListingsProvider from './components/listings/ListingsProvider';
import PartnersProvider from './components/partners/PartnersProvider';
import PoisProvider from './components/pois/PoisProvider';
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
                <RouterProvider router={router} />
              </PoisProvider>
            </UsersProvider>
          </PartnersProvider>
        </ListingsProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
