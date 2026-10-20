import { useCallback, useMemo, useRef, useState, type ReactNode } from 'react';
import { UsersContext } from '../../contexts/users';
import { useAuth } from '../../hooks/useAuth';
import { useInitialData } from '../../hooks/useInitialData';
import { usePersist } from '../../hooks/usePersist';
import { userService, usersSource } from '../../services/userService';
import type { AppUser, UserAuditEntry, UserFormValues, UserStats } from '../../types/admin';
import { todayIsoDate } from '../../utils/format';

const EMPTY_STATS: UserStats = { total: 0, active: 0, newThisMonth: 0, newToday: 0, suspended: 0 };
const ZERO_DELTA = { created: 0, locked: 0 };

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
 */
export default function UsersProvider({ children }: { children: ReactNode }) {
  const { admin } = useAuth();
  const seed = usersSource.seed;
  const [users, setUsers] = useState<AppUser[]>(seed?.users ?? []);
  const [baseStats, setBaseStats] = useState<UserStats>(seed?.stats ?? EMPTY_STATS);
  const [delta, setDelta] = useState(ZERO_DELTA);
  const [auditLogs, setAuditLogs] = useState<Record<string, UserAuditEntry[]>>({});
  const nextAuditId = useRef(0);

  const dataStatus = useInitialData(
    usersSource,
    (snapshot) => {
      setUsers(snapshot.users);
      setBaseStats(snapshot.stats);
      setDelta(ZERO_DELTA);
    },
    Boolean(admin),
  );
  const persist = usePersist(dataStatus.reload);

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
      persist(userService.create(user), 'Không lưu được tài khoản mới');
      return user;
    },
    [logAudit, persist],
  );

  const updateUser = useCallback(
    (id: string, values: UserFormValues) => {
      setUsers((current) =>
        current.map((user) => (user.id === id ? { ...user, ...values } : user)),
      );
      logAudit(id, 'manage_accounts', 'Cập nhật hồ sơ / quyền tài khoản');
      persist(userService.update(id, values), 'Không lưu được hồ sơ người dùng');
    },
    [logAudit, persist],
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
      persist(userService.lock([...targetIds], reason), 'Không khóa được tài khoản');
      return targets.length;
    },
    [logAudit, persist],
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
      persist(userService.unlock([...targetIds]), 'Không mở khóa được tài khoản');
      return targets.length;
    },
    [logAudit, persist],
  );

  const stats: UserStats = useMemo(
    () => ({
      total: baseStats.total + delta.created,
      active: baseStats.active + delta.created - delta.locked,
      newThisMonth: baseStats.newThisMonth + delta.created,
      newToday: baseStats.newToday + delta.created,
      suspended: Math.max(0, baseStats.suspended + delta.locked),
    }),
    [baseStats, delta],
  );

  const value = useMemo(
    () => ({
      users,
      stats,
      dataStatus,
      createUser,
      updateUser,
      lockUsers,
      unlockUsers,
      auditLogs,
      logAudit,
    }),
    [users, stats, dataStatus, createUser, updateUser, lockUsers, unlockUsers, auditLogs, logAudit],
  );

  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}
