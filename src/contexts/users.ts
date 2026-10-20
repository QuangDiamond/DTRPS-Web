import { createContext } from 'react';
import type { AppUser, UserAuditEntry, UserFormValues, UserStats } from '../types/admin';

export interface UsersContextValue {
  users: AppUser[];
  /** Số liệu toàn hệ thống, cập nhật theo thao tác trong phiên */
  stats: UserStats;
  createUser: (values: UserFormValues) => AppUser;
  updateUser: (id: string, values: UserFormValues) => void;
  /** Khóa một hoặc nhiều tài khoản đang hoạt động, trả về số tài khoản đã khóa */
  lockUsers: (ids: string[], reason: string) => number;
  /** Mở khóa một hoặc nhiều tài khoản, trả về số tài khoản đã mở */
  unlockUsers: (ids: string[]) => number;
  /** Nhật ký thao tác admin phát sinh trong phiên (mới nhất trước) */
  auditLogs: Record<string, UserAuditEntry[]>;
  logAudit: (userId: string, icon: string, text: string) => void;
}

export const UsersContext = createContext<UsersContextValue | null>(null);
