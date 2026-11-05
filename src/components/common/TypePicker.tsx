import Icon from './Icon';
import { GROUP_ICONS, type TypePickerGroup } from './typePickerUtils';

export interface TypePickerLabels {
  groups: string;
  types: string;
  pickGroupFirst: string;
  main: string;
  selected: string;
  /** Hàng chọn loại hình đại diện (khi showMain) */
  mainPick: string;
  /** Dòng gợi ý dưới nhóm chưa tích loại hình nào (chế độ allWhenEmpty) */
  wholeGroupHint: string;
  /** Trong dòng "Đã chọn": cả nhóm, ví dụ "Tất cả Ẩm thực" */
  wholeGroup: (group: string) => string;
}

const DEFAULT_LABELS: TypePickerLabels = {
  groups: 'Nhóm dịch vụ',
  types: 'Loại hình',
  pickGroupFirst: 'Tích nhóm dịch vụ bên trái để chọn loại hình',
  main: 'Đại diện',
  selected: 'Đã chọn',
  mainPick: 'Loại hình đại diện',
  wholeGroupHint: 'Không tích loại hình nào = thích tất cả loại hình của nhóm này',
  wholeGroup: (group) => `Tất cả ${group}`,
};

/**
 * Chọn dịch vụ & loại hình bằng tích chọn, không giới hạn số lượng.
 * Cột trái: các nhóm dịch vụ. Cột phải: loại hình của những nhóm đã tích.
 * Bỏ tích nhóm thì bỏ luôn các loại hình của nhóm đó. Loại hình đại diện chọn ở hàng dưới cùng
 * (mặc định là loại hình tích đầu tiên); gửi đi luôn đứng đầu danh sách.
 */
export default function TypePicker({
  groups,
  groupCodes,
  typeCodes,
  onChange,
  error,
  labels,
  showMain = true,
  allWhenEmpty = false,
}: {
  groups: TypePickerGroup[];
  groupCodes: string[];
  /** Theo thứ tự tích — phần tử đầu là loại hình đại diện */
  typeCodes: string[];
  onChange: (groupCodes: string[], typeCodes: string[]) => void;
  error?: string;
  labels?: Partial<TypePickerLabels>;
  /** Có loại hình đại diện (form địa điểm): nhãn "Đại diện" + hàng chọn đại diện */
  showMain?: boolean;
  /** Nhóm đã tích mà chưa chọn loại hình nào = cả nhóm (sở thích của du khách) */
  allWhenEmpty?: boolean;
}) {
  const text = { ...DEFAULT_LABELS, ...labels };
  const typeNames = new Map(groups.flatMap((g) => g.subtypes.map((s) => [s.code, s.name])));
  const pickedGroups = groups.filter((group) => groupCodes.includes(group.code));
  const summary = allWhenEmpty
    ? pickedGroups.flatMap((group) => {
        const picked = group.subtypes.filter((s) => typeCodes.includes(s.code));
        return picked.length > 0 ? picked.map((s) => s.name) : [text.wholeGroup(group.name)];
      })
    : typeCodes.map((code) => typeNames.get(code) ?? code);

  const toggleGroup = (group: TypePickerGroup) => {
    if (groupCodes.includes(group.code)) {
      const own = new Set(group.subtypes.map((s) => s.code));
      onChange(
        groupCodes.filter((code) => code !== group.code),
        typeCodes.filter((code) => !own.has(code)),
      );
    } else {
      onChange([...groupCodes, group.code], typeCodes);
    }
  };

  // Đưa loại hình được chọn làm đại diện lên đầu, giữ thứ tự các loại hình còn lại
  const setMain = (code: string) =>
    onChange(groupCodes, [code, ...typeCodes.filter((c) => c !== code)]);

  const toggleType = (code: string) =>
    onChange(
      groupCodes,
      typeCodes.includes(code) ? typeCodes.filter((c) => c !== code) : [...typeCodes, code],
    );

  return (
    <div>
      <div
        className={`grid gap-4 rounded-2xl border p-4 md:grid-cols-[minmax(12rem,15rem)_1fr] ${
          error ? 'border-red-400' : 'border-slate-200'
        }`}
      >
        <div>
          <p className="mb-2 text-[12px] font-bold tracking-wide text-slate-500 uppercase">
            {text.groups}
          </p>
          <div className="flex flex-col gap-2">
            {groups.map((group) => {
              const checked = groupCodes.includes(group.code);
              const count = group.subtypes.filter((s) => typeCodes.includes(s.code)).length;
              return (
                <label
                  key={group.code}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-colors select-none ${
                    checked
                      ? 'border-teal-500 bg-teal-50 text-teal-800'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-teal-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleGroup(group)}
                    className="h-4 w-4 shrink-0 accent-teal-700"
                  />
                  <Icon name={GROUP_ICONS[group.code] ?? 'category'} className="text-[19px]" />
                  <span className="flex-1 text-[13px] font-semibold">{group.name}</span>
                  {count > 0 && (
                    <span className="rounded-full bg-teal-700 px-2 py-0.5 text-[10px] font-bold text-white">
                      {count}
                    </span>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        <div className="min-w-0">
          <p className="mb-2 text-[12px] font-bold tracking-wide text-slate-500 uppercase">
            {text.types}
          </p>
          {pickedGroups.length === 0 ? (
            <div className="flex h-[calc(100%-1.75rem)] min-h-28 items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 text-center text-[13px] text-slate-500">
              <Icon name="arrow_back" className="hidden text-[18px] md:inline" />
              {text.pickGroupFirst}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pickedGroups.map((group) => (
                <div key={group.code}>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[13px] font-bold text-slate-700">
                    <Icon
                      name={GROUP_ICONS[group.code] ?? 'category'}
                      className="text-[16px] text-teal-700"
                    />
                    {group.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {group.subtypes.map((subtype) => {
                      const checked = typeCodes.includes(subtype.code);
                      const main = showMain && typeCodes[0] === subtype.code;
                      return (
                        <button
                          key={subtype.code}
                          type="button"
                          aria-pressed={checked}
                          onClick={() => toggleType(subtype.code)}
                          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                            checked
                              ? 'border-teal-700 bg-teal-700 text-white'
                              : 'border-slate-300 bg-white text-slate-600 hover:border-teal-500 hover:text-teal-700'
                          }`}
                        >
                          <Icon
                            name={checked ? 'check_circle' : 'add_circle'}
                            className="text-[16px]"
                          />
                          {subtype.name}
                          {main && (
                            <span className="ml-0.5 rounded-full bg-white/25 px-1.5 text-[10px]">
                              {text.main}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  {allWhenEmpty &&
                    !group.subtypes.some((subtype) => typeCodes.includes(subtype.code)) && (
                      <p className="mt-1.5 text-[11px] text-teal-700">{text.wholeGroupHint}</p>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showMain && typeCodes.length > 0 && (
        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-3">
          <p className="mb-2 flex items-center gap-1.5 text-[12px] font-bold tracking-wide text-amber-800 uppercase">
            <Icon name="star" filled className="text-[15px]" />
            {text.mainPick}
          </p>
          <div role="radiogroup" aria-label={text.mainPick} className="flex flex-wrap gap-2">
            {typeCodes.map((code, index) => {
              const active = index === 0;
              return (
                <button
                  key={code}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setMain(code)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-colors ${
                    active
                      ? 'border-amber-500 bg-amber-400 text-amber-950'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-amber-400 hover:text-amber-800'
                  }`}
                >
                  <Icon
                    name={active ? 'radio_button_checked' : 'radio_button_unchecked'}
                    className="text-[16px]"
                  />
                  {typeNames.get(code) ?? code}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {error ? (
        <p className="mt-1.5 flex items-center gap-1 text-[12px] text-red-600">
          <Icon name="error" className="text-[14px]" /> {error}
        </p>
      ) : (
        !showMain &&
        summary.length > 0 && (
          <p className="mt-1.5 text-[12px] text-slate-500">
            {text.selected}: {summary.join(' · ')}
          </p>
        )
      )}
    </div>
  );
}
