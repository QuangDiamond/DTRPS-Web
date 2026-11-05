import Icon from './Icon';
import { GROUP_ICONS, type PlaceTypeRef, type TypeRef } from './typePickerUtils';

interface TypeChipsLabels {
  main: string;
  added: string;
  removed: string;
  empty: string;
}

const DEFAULT_LABELS: TypeChipsLabels = {
  main: 'Đại diện',
  added: 'Thêm mới',
  removed: 'Bị bỏ',
  empty: 'Chưa chọn loại hình',
};

/**
 * Dịch vụ & loại hình của một địa điểm: mỗi nhóm một dòng, loại hình là chip,
 * loại hình đại diện (phần tử đầu) có nhãn ★. Truyền {@code previous} để so sánh với bản cũ:
 * loại hình thêm mới tô xanh, loại hình bị bỏ gạch ngang đỏ.
 */
export default function TypeChips({
  groups,
  categories,
  previous,
  labels,
}: {
  groups: TypeRef[];
  categories: PlaceTypeRef[];
  previous?: { groups: TypeRef[]; categories: PlaceTypeRef[] };
  labels?: Partial<TypeChipsLabels>;
}) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const now = new Set(categories.map((type) => type.code));
  const before = previous ? new Set(previous.categories.map((type) => type.code)) : null;
  const removed = previous ? previous.categories.filter((type) => !now.has(type.code)) : [];

  // Nhóm hiện có, rồi nhóm chỉ còn ở bản cũ (để hiện loại hình bị bỏ)
  const rows: TypeRef[] = [...groups];
  for (const group of previous?.groups ?? []) {
    if (!rows.some((row) => row.code === group.code)) rows.push(group);
  }
  const inGroup = (list: PlaceTypeRef[], group: string | null) =>
    list.filter((type) => (type.groupCode ?? null) === group);
  const orphans = [...categories, ...removed].filter(
    (type) => !type.groupCode || !rows.some((row) => row.code === type.groupCode),
  );
  if (orphans.length > 0) rows.push({ code: '', name: '—' });

  if (categories.length === 0 && removed.length === 0) {
    return <p className="text-[13px] text-slate-500 italic">{text.empty}</p>;
  }

  return (
    // @container: chỗ hẹp (cột so sánh) thì tên nhóm nằm trên, loại hình xuống dòng dưới
    <div className="@container flex flex-col gap-2.5">
      {rows.map((group) => {
        const code = group.code || null;
        const current = code ? inGroup(categories, code) : orphans.filter((t) => now.has(t.code));
        const gone = code ? inGroup(removed, code) : orphans.filter((t) => !now.has(t.code));
        if (current.length === 0 && gone.length === 0) return null;
        return (
          <div key={group.code || 'other'} className="flex flex-wrap items-start gap-x-3 gap-y-1.5">
            <span className="flex w-full items-center gap-1.5 pt-1 text-[13px] font-bold text-slate-700 @md:w-40 @md:shrink-0">
              <Icon
                name={GROUP_ICONS[group.code] ?? 'category'}
                className="text-[17px] text-teal-700"
              />
              {group.name}
            </span>
            <div className="flex min-w-0 flex-1 flex-wrap gap-1.5">
              {current.map((type) => {
                const main = categories[0]?.code === type.code;
                const isNew = before !== null && !before.has(type.code);
                return (
                  <span
                    key={type.code}
                    title={isNew ? text.added : undefined}
                    className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap ${
                      isNew
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : main
                          ? 'border-teal-700 bg-teal-700 text-white'
                          : 'border-teal-300 bg-teal-50 text-teal-800'
                    }`}
                  >
                    {isNew && <Icon name="add" className="text-[14px]" />}
                    {type.name}
                    {main && (
                      <span
                        className={`ml-0.5 inline-flex shrink-0 items-center gap-0.5 rounded-full px-1.5 text-[10px] ${
                          isNew ? 'bg-emerald-100' : 'bg-white/25'
                        }`}
                      >
                        <Icon name="star" filled className="text-[11px]" />
                        {text.main}
                      </span>
                    )}
                  </span>
                );
              })}
              {gone.map((type) => (
                <span
                  key={type.code}
                  title={text.removed}
                  className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-50 px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap text-red-700 line-through"
                >
                  <Icon name="remove" className="text-[14px]" />
                  {type.name}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
