import type { CategoryGroup } from '@/client/api/types';

/**
 * Lựa chọn trong TypePicker → mã loại hình gửi Backend (categoryCodes).
 * Backend chỉ nhận mã loại con: nhóm đã tích mà chưa chọn loại nào = mọi loại của nhóm.
 */
export function typesToCategoryCodes(
  groups: CategoryGroup[],
  groupCodes: string[],
  typeCodes: string[],
): string[] {
  return [
    ...new Set(
      groups.flatMap((group) => {
        if (!groupCodes.includes(group.code)) return [];
        const picked = group.subtypes.filter((type) => typeCodes.includes(type.code));
        return (picked.length > 0 ? picked : group.subtypes).map((type) => type.code);
      }),
    ),
  ];
}

/**
 * Ngược lại: categoryCodes đã lưu → lựa chọn để điền sẵn TypePicker.
 * Nhóm có đủ mọi loại con được hiển thị là "cả nhóm" (không tích loại nào).
 */
export function categoryCodesToTypes(
  groups: CategoryGroup[],
  categoryCodes: string[],
): { groupCodes: string[]; typeCodes: string[] } {
  const saved = new Set(categoryCodes);
  const groupCodes: string[] = [];
  const typeCodes: string[] = [];

  for (const group of groups) {
    const picked = group.subtypes.filter((type) => saved.has(type.code));
    if (picked.length === 0) continue;
    groupCodes.push(group.code);
    if (picked.length < group.subtypes.length) {
      typeCodes.push(...picked.map((type) => type.code));
    }
  }

  return { groupCodes, typeCodes };
}
