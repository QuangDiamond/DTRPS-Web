import type { ReactNode } from 'react';
import AuthProvider from './auth/AuthProvider';
import ListingReviewProvider from './listingReview/ListingReviewProvider';
import PartnersProvider from './partners/PartnersProvider';
import ToastProvider from './toast/ToastProvider';

/** Store toàn cục — thứ tự lồng quan trọng: Toast → Auth → các store nghiệp vụ (đều dùng API thật) */
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <PartnersProvider>
          <ListingReviewProvider>{children}</ListingReviewProvider>
        </PartnersProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
