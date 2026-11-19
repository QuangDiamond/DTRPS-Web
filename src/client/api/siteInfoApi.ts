import { clientRequest } from './http';

export type SiteAnnouncementLevel = 'INFO' | 'WARNING' | 'CRITICAL';
export type SiteAnnouncementAudience = 'ALL' | 'TRAVELLER' | 'PARTNER';

/** GET /api/site-info — công khai, không cần đăng nhập */
export interface SiteInfo {
  siteName: string;
  supportEmail: string;
  supportPhone: string;
  supportHours: string;
  limits: { maxPlaceImages: number; maxImageMb: number };
  /** null = không có thông báo đang hiện */
  announcement: {
    message: string;
    level: SiteAnnouncementLevel;
    audience: SiteAnnouncementAudience;
    endsAt: string | null;
    /** Đổi mỗi lần admin lưu: dùng để nhớ người dùng đã đóng bản nào */
    version: number;
  } | null;
}

export const siteInfoApi = {
  get: () => clientRequest<SiteInfo>('/site-info', { auth: false }),
};
