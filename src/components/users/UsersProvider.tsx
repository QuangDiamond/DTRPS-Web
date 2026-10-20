import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { MOCK_USERS, USER_STATS } from '../../constants/mockData';
import { UsersContext } from '../../contexts/users';
import { useAuth } from '../../hooks/useAuth';
import type { AppUser, UserAuditEntry, UserFormValues, UserStats } from '../../types/admin';
import { todayIsoDate } from '../../utils/format';

function nextUserId(users: AppUser[]): string {
  const maxNumber = users.reduce(
    (max, user) => Math.max(max, Number(user.id.replace('USR-', '')) || 0),
    0,
  );
  return `USR-${String(maxNumber + 1).padStart(4, '0')}`;
}

/**
 * Store người dùng dùng chung cho Quản lý người dùng & Chi tiết người dùng.
 * Thao tác của admin trên tài khoản được ghi vào nhật ký của người dùng đó.
 * Khi có backend: thay state bằng dữ liệu gọi API.
 */
export default function UsersProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const [users, setUsers] = useState<AppUser[]>(MOCK_USERS);
  const [delta, setDelta] = useState({ created: 0, locked: 0 });
  const [auditLogs, setAuditLogs] = useState<Record<string, UserAuditEntry[]>>({});
  const nextAuditId = useRef(0);

  const usersRef = useRef(users);
  usersRef.current = users;
  const actor = admin?.name ?? 'Quản trị viên';

  const logAudit = useCallback(
    (userId: string, icon: string, text: string) => {
      const entry: UserAuditEntry = {
        id: `user-audit-${nextAuditId.current++}`,
        time: new Date().toISOString(),
        icon,
        text: `${text} (bởi ${actor})`,
      };
      setAuditLogs((current) => ({ ...current, [userId]: [entry, ...(current[userId] ?? [])] }));
    },
    [actor],
  );

  const createUser = useCallback(
    (values: UserFormValues) => {
      const user: AppUser = {
        ...values,
        id: nextUserId(usersRef.current),
        joinedAt: todayIsoDate(),
        status: 'active',
        tripCount: 0,
        tripNote: 'Chưa có chuyến đi',
        avatarTone: 'teal',
      };
      setUsers((current) => [user, ...current]);
      setDelta((current) => ({ ...current, created: current.created + 1 }));
      logAudit(user.id, 'person_add', 'Tạo tài khoản');
      return user;
    },
    [logAudit],
  );

  const updateUser = useCallback(
    (id: string, values: UserFormValues) => {
      setUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, ...values } : user)),
      );
      logAudit(id, 'manage_accounts', 'Cập nhật hồ sơ / quyền tài khoản');
    },
    [logAudit],
  );

  const lockUsers = useCallback(
    (ids: string[], reason: string) => {
      const targets = usersRef.current.filter(
        (user) => ids.includes(user.id) && user.status === 'active',
      );
      if (targets.length === 0) return 0;
      const targetIds = new Set(targets.map((user) => user.id));
      setUsers((current) =>
        current.map((user) =>
          targetIds.has(user.id) ? { ...user, status: 'suspended', suspendReason: reason } : user,
        ),
      );
      setDelta((current) => ({ ...current, locked: current.locked + targets.length }));
      targets.forEach((user) => logAudit(user.id, 'lock_person', `Khóa tài khoản — ${reason}`));
      return targets.length;
    },
    [logAudit],
  );

  const unlockUsers = useCallback(
    (ids: string[]) => {
      const targets = usersRef.current.filter(
        (user) => ids.includes(user.id) && user.status === 'suspended',
      );
      if (targets.length === 0) return 0;
      const targetIds = new Set(targets.map((user) => user.id));
      setUsers((current) =>
        current.map((user) =>
          targetIds.has(user.id) ? { ...user, status: 'active', suspendReason: undefined } : user,
        ),
      );
      setDelta((current) => ({ ...current, locked: current.locked - targets.length }));
      targets.forEach((user) => logAudit(user.id, 'lock_open', 'Mở khóa tài khoản'));
      return targets.length;
    },
    [logAudit],
  );

  const stats: UserStats = useMemo(
    () => ({
      total: USER_STATS.total + delta.created,
      active: USER_STATS.active + delta.created - delta.locked,
      newThisMonth: USER_STATS.newThisMonth + delta.created,
      newToday: USER_STATS.newToday + delta.created,
      suspended: Math.max(0, USER_STATS.suspended + delta.locked),
    }),
    [delta],
  );

  const value = useMemo(
    () => ({
      users,
      stats,
      createUser,
      updateUser,
      lockUsers,
      unlockUsers,
      auditLogs,
      logAudit,
    }),
    [users, stats, createUser, updateUser, lockUsers, unlockUsers, auditLogs, logAudit],
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}
