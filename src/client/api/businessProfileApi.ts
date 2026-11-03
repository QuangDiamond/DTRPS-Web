import { ClientApiError, clientRequest } from './http';
import type { BusinessProfile, BusinessProfileInput } from './types';

export const businessProfileApi = {
  /** Hồ sơ doanh nghiệp của user đang đăng nhập; null khi chưa đăng ký */
  getOwn: async (): Promise<BusinessProfile | null> => {
    try {
      return await clientRequest<BusinessProfile>('/business-profile');
    } catch (error) {
      if (error instanceof ClientApiError && error.status === 404) return null;
      throw error;
    }
  },

  register: (input: BusinessProfileInput) =>
    clientRequest<BusinessProfile>('/business-profile', { method: 'POST', body: input }),

  /** Hồ sơ bị từ chối (INACTIVE) sẽ tự quay về PENDING sau khi sửa */
  update: (input: BusinessProfileInput) =>
    clientRequest<BusinessProfile>('/business-profile', { method: 'PUT', body: input }),
};
