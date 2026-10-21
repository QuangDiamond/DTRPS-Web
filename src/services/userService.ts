import {
  buildMockUserProfile,
  buildMockUserSessionHistory,
} from '@/mocks/builders/userProfileMock';
import { MOCK_USERS, USER_STATS } from '@/mocks/data/mockData';
import type { AppUser, UserAuditEntry, UserFormValues, UserProfile, UsersSnapshot } from '@/types';
import { ENDPOINTS } from './endpoints';
import { createSource, peek, readRequest, writeRequest } from './request';

const MOCK_SNAPSHOT: UsersSnapshot = { users: MOCK_USERS, stats: USER_STATS };

/** Dữ liệu khởi tạo của store người dùng */
export const usersSource = createSource(ENDPOINTS.users.snapshot, MOCK_SNAPSHOT);

export const userService = {
  peekProfile: (user: AppUser): UserProfile | undefined => peek(() => buildMockUserProfile(user)),
  getProfile: (user: AppUser): Promise<UserProfile> =>
    readRequest(ENDPOINTS.users.profile(user.id), () => buildMockUserProfile(user)),
  peekSessionHistory: (user: AppUser): UserAuditEntry[] | undefined =>
    peek(() => buildMockUserSessionHistory(user)),
  getSessionHistory: (user: AppUser): Promise<UserAuditEntry[]> =>
    readRequest(ENDPOINTS.users.sessionHistory(user.id), () => buildMockUserSessionHistory(user)),

  create: (user: AppUser) => writeRequest(ENDPOINTS.users.create, 'POST', user),
  update: (id: string, values: UserFormValues) =>
    writeRequest(ENDPOINTS.users.update(id), 'PUT', values),
  lock: (ids: string[], reason: string) =>
    writeRequest(ENDPOINTS.users.lock, 'POST', { ids, reason }),
  unlock: (ids: string[]) => writeRequest(ENDPOINTS.users.unlock, 'POST', { ids }),
};
