import { useContext } from 'react';
import {
  ListingReviewContext,
  type ListingReviewContextValue,
} from '@/contexts/listingReview/listingReviewContext';

export function useListingReview(): ListingReviewContextValue {
  const context = useContext(ListingReviewContext);
  if (!context) {
    throw new Error('useListingReview phải được dùng bên trong <ListingReviewProvider>');
  }
  return context;
}
