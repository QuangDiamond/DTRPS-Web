import Icon from '../../../components/common/Icon';
import Modal from '../../../components/common/Modal';
import {
  PERMISSION_LEVEL_CONFIG,
  PERMISSION_MATRIX,
  PERMISSION_ROLES,
} from '../../../constants/settings';
import type { PermissionLevel } from '../../../types/admin';

function PermissionBadge({ level }: { level: PermissionLevel }) {
  const config = PERMISSION_LEVEL_CONFIG[level];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-label-sm text-label-sm font-semibold whitespace-nowrap ${config.className}`}
    >
      <Icon name={config.icon} className="text-[14px]" />
      {config.label}
    </span>
  );
}

/** Ma trận phân quyền theo vai trò quản trị (chỉ xem) */
export default function PermissionMatrixModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal
      title="Ma trận phân quyền quản trị"
      description="Quyền truy cập từng phân hệ theo vai trò. Chỉ Super Admin được thay đổi phân quyền."
      size="lg"
      onClose={onClose}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="font-label-sm text-label-sm tracking-wider text-on-surface-variant uppercase">
              <th className="py-2 pr-3 font-semibold">Phân hệ</th>
              {PERMISSION_ROLES.map((role) => (
                <th key={role.key} className="px-2 py-2 font-semibold whitespace-nowrap">
                  {role.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container">
            {PERMISSION_MATRIX.map((row) => (
              <tr key={row.module}>
                <td className="py-2.5 pr-3">
                  <span className="flex items-center gap-2 font-label-md text-label-md text-on-surface">
                    <Icon name={row.icon} className="text-[18px] text-primary" />
                    {row.module}
                  </span>
                </td>
                {PERMISSION_ROLES.map((role) => (
                  <td key={role.key} className="px-2 py-2.5">
                    <PermissionBadge level={row[role.key]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Modal>
  );
}
