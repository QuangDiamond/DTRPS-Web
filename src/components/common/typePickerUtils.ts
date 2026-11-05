/** Nhóm dịch vụ + loại hình con — dữ liệu cho TypePicker */
export interface TypePickerGroup {
  code: string;
  name: string;
  subtypes: { code: string; name: string }[];
}

/**
 * Kiểm tra lựa chọn trong TypePicker: cần ít nhất một loại hình, và mỗi nhóm đã tích
 * phải có ít nhất một loại hình. Trả về câu báo lỗi, hoặc null khi hợp lệ.
 */
export function checkTypes(
  groups: TypePickerGroup[],
  groupCodes: string[],
  typeCodes: string[],
  messages: { empty: string; groupWithoutType: (group: string) => string } = {
    empty: 'Vui lòng chọn ít nhất một loại hình',
    groupWithoutType: (group) => `Chọn loại hình cho nhóm "${group}" hoặc bỏ tích nhóm này`,
  },
): string | null {
  if (typeCodes.length === 0) return messages.empty;
  const lonely = groups.find(
    (group) =>
      groupCodes.includes(group.code) &&
      !group.subtypes.some((subtype) => typeCodes.includes(subtype.code)),
  );
  return lonely ? messages.groupWithoutType(lonely.name) : null;
}

export interface TypeRef {
  code: string;
  name: string;
}

/** Một loại hình của địa điểm kèm mã nhóm dịch vụ chứa nó */
export interface PlaceTypeRef extends TypeRef {
  groupCode?: string | null;
}

export const GROUP_ICONS: Record<string, string> = {
  lodging: 'hotel',
  fnb: 'restaurant',
  attraction: 'attractions',
  shopping: 'shopping_bag',
};

/**
 * Nhóm + loại hình của một địa điểm. Dữ liệu cũ chỉ có group / category (một loại hình)
 * thì dùng chúng.
 */
export function placeTypesOf(place: {
  group?: TypeRef | null;
  category?: TypeRef | null;
  groups?: TypeRef[];
  categories?: PlaceTypeRef[];
}): { groups: TypeRef[]; categories: PlaceTypeRef[] } {
  return {
    groups: place.groups ?? (place.group ? [place.group] : []),
    categories:
      place.categories ??
      (place.category ? [{ ...place.category, groupCode: place.group?.code ?? null }] : []),
  };
}
