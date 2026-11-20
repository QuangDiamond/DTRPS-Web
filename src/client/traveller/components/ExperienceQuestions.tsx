import type { ExperienceQuestionOption } from '@/client/traveller/data/planTrip';

/** Lưới đáp án của một câu hỏi cá nhân hóa (mỗi câu là một bước riêng ở Sở thích du lịch). */
export default function ExperienceQuestions({
  options,
  selected,
  onToggle,
}: {
  options: ExperienceQuestionOption[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  const selectedSet = new Set(selected);

  return (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selectedSet.has(option.code);
        return (
          <label
            key={option.code}
            className={`flex min-h-[64px] cursor-pointer items-center gap-3 rounded-2xl border p-3 transition-colors focus-within:ring-2 focus-within:ring-[#0891B2]/30 ${
              isSelected
                ? 'border-[#0891B2] bg-[#E9F7F9]'
                : 'border-[#E3E7F0] bg-white hover:border-[#9ADAE1] hover:bg-[#F8FCFA]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[19px] ${
                isSelected ? 'bg-[#D4F0F3]' : 'bg-[#F1F4F6]'
              }`}
            >
              {option.emoji}
            </span>
            <span className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-[#13364A]">
              {option.label}
            </span>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => onToggle(option.code)}
              className="h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#0891B2]"
            />
          </label>
        );
      })}
    </div>
  );
}
