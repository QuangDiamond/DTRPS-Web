import { createContext } from 'react';
import type { NotificationCenter } from '@/utils/useNotificationCenter';

/** Thông báo + sự kiện realtime của admin đang đăng nhập */
export const LiveContext = createContext<NotificationCenter | null>(null);
