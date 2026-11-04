import type { AppUser, UserAuditEntry, UserFormValues, UserProfile, UsersSnapshot } from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, readRequest, writeRequest } from './request';

/** Dữ liệu khởi tạo của store người dùng */
export const usersSource = createSource<UsersSnapshot>(ENDPOINTS.users.snapshot);

export const userService = {
  getProfile: (user: AppUser): Promise<UserProfile> =>
    readRequest(ENDPOINTS.users.profile(user.id)),
  getSessionHistory: (user: AppUser): Promise<UserAuditEntry[]> =>
    readRequest(ENDPOINTS.users.sessionHistory(user.id)),

  create: (user: AppUser) => writeRequest(ENDPOINTS.users.create, 'POST', user),
  update: (id: string, values: UserFormValues) =>
    writeRequest(ENDPOINTS.users.update(id), 'PUT', values),
  lock: (ids: string[], reason: string) =>
    writeRequest(ENDPOINTS.users.lock, 'POST', { ids, reason }),
  unlock: (ids: string[]) => writeRequest(ENDPOINTS.users.unlock, 'POST', { ids }),
};
