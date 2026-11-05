import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/common';
import { errorMessage } from '@/client/api/http';
import { referenceApi } from '@/client/api/referenceApi';
import type { TravelPreferences } from '@/client/api/types';
import { userApi } from '@/client/api/userApi';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  type IconOption,
  type ImageOption,
  toInterestOptions,
  toSpecialNeedOptions,
} from '@/client/traveller/data/preferenceOptions';
import { FormAlert, Spinner } from '@/client/ui/Blocks';
import PageBar from '@/client/ui/PageBar';

const STEPS = [
  {
    title: 'Bạn thích trải nghiệm gì?',
    subtitle: 'Chọn những hoạt động bạn yêu thích nhất (Chọn nhiều mục)',
  },
  { title: 'Yêu cầu đặc biệt', subtitle: 'Bạn có yêu cầu đặc biệt nào không? (Chọn nếu có)' },
];

const EMPTY: TravelPreferences = {
  notes: null,
  interests: [],
  specialNeeds: [],
};

type ListKey = 'interests' | 'specialNeeds';

function CheckBadge() {
  return (
    <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-primary text-white">
      <Icon name="check" className="text-[15px]" />
    </span>
  );
}

/** Thẻ ảnh (bước 1) */
function ImageGrid({
  options,
  isSelected,
  onToggle,
}: {
  options: ImageOption[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
      {options.map((option) => {
        const selected = isSelected(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            aria-pressed={selected}
            className={`overflow-hidden rounded-2xl border-2 text-left ${
              selected ? 'border-primary bg-[#F0FAF8]' : 'border-[#E6EAF0] bg-white'
            }`}
          >
            <span className="relative block h-[105px]">
              <img src={option.image} alt="" className="h-full w-full object-cover" />
              {selected && (
                <span className="absolute top-1.5 right-1.5">
                  <CheckBadge />
                </span>
              )}
            </span>
            <span className="flex min-h-[44px] items-center px-2.5 py-2 text-[12px] font-semibold text-client-ink">
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/** Danh sách có icon (bước 2) */
function IconList({
  options,
  isSelected,
  onToggle,
  variant,
}: {
  options: IconOption[];
  isSelected: (id: string) => boolean;
  onToggle: (id: string) => void;
  variant: 'single' | 'multi';
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {options.map((option) => {
        const selected = isSelected(option.id);
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onToggle(option.id)}
            role={variant === 'single' ? 'radio' : 'checkbox'}
            aria-checked={selected}
            className={`flex items-center rounded-2xl px-4 text-left ${option.note ? 'py-4' : 'py-3.5'} ${
              selected ? 'border-2 border-primary bg-[#F0FAF8]' : 'border border-[#E6EAF0] bg-white'
            }`}
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full text-primary ${
                selected ? 'bg-[#D4F1EC]' : 'bg-[#F4F6F8]'
              }`}
            >
              <Icon name={option.icon} className="text-[22px]" />
            </span>
            <span className="ml-3 flex-1">
              <span
                className={`block text-[14px] text-client-ink ${option.note ? 'font-bold' : 'font-medium'}`}
              >
                {option.label}
              </span>
              {option.note && (
                <span className="mt-0.5 block text-[12px] text-client-muted">{option.note}</span>
              )}
            </span>
            {variant === 'multi' ? (
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-md ${
                  selected ? 'bg-primary text-white' : 'border-[1.5px] border-[#C5CDD3]'
                }`}
              >
                {selected && <Icon name="check" className="text-[15px]" />}
              </span>
            ) : (
              selected && <CheckBadge />
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Sở thích du lịch 2 bước — theo TravelPreferencesScreen của mobile, lưu qua API */
export default function TravelPreferencesPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
  const [interestOptions, setInterestOptions] = useState<ImageOption[] | null>(null);
  const [specialNeedOptions, setSpecialNeedOptions] = useState<IconOption[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let active = true;
    userApi
      .preferences()
      .then((result) => active && setPreferences({ ...EMPTY, ...result }))
      .catch((loadFailure: unknown) => {
        if (!active) return;
        setLoadError(errorMessage(loadFailure));
        setPreferences(EMPTY);
      });
    Promise.all([referenceApi.interests(), referenceApi.specialNeeds()])
      .then(([interests, specialNeeds]) => {
        if (!active) return;
        setInterestOptions(toInterestOptions(interests));
        setSpecialNeedOptions(toSpecialNeedOptions(specialNeeds));
      })
      .catch((loadFailure: unknown) => {
        if (!active) return;
        setLoadError(errorMessage(loadFailure));
        setInterestOptions([]);
        setSpecialNeedOptions([]);
      });
    return () => {
      active = false;
    };
  }, []);

  if (!preferences || !interestOptions || !specialNeedOptions) {
    return <Spinner />;
  }

  const isLastStep = step === STEPS.length - 1;
  const toggleIn = (key: ListKey, id: string) =>
    setPreferences((previous) =>
      previous
        ? {
            ...previous,
            [key]: previous[key].includes(id)
              ? previous[key].filter((item) => item !== id)
              : [...previous[key], id],
          }
        : previous,
    );

  // Bước cuối (yêu cầu đặc biệt) không bắt buộc
  const canContinue = [preferences.interests.length > 0, true][step];

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      await userApi.updatePreferences(preferences);
      setDone(true);
      window.setTimeout(() => navigate(CLIENT_ROUTES.HOME), 1500);
    } catch (saveError) {
      setError(errorMessage(saveError));
      setSaving(false);
    }
  };

  const goNext = () => {
    if (isLastStep) void finish();
    else setStep((previous) => previous + 1);
  };

  const handleContinue = () => {
    if (!canContinue) {
      setError('Hãy chọn ít nhất một mục hoặc bấm "Bỏ qua".');
      return;
    }
    setError(null);
    goNext();
  };

  const handleBack = () => {
    setError(null);
    if (step > 0) setStep((previous) => previous - 1);
    else navigate(-1);
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <ImageGrid
            options={interestOptions}
            isSelected={(id) => preferences.interests.includes(id)}
            onToggle={(id) => toggleIn('interests', id)}
          />
        );
      default:
        return (
          <IconList
            variant="multi"
            options={specialNeedOptions}
            isSelected={(id) => preferences.specialNeeds.includes(id)}
            onToggle={(id) => toggleIn('specialNeeds', id)}
          />
        );
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageBar title="Sở thích du lịch" onBack={handleBack} />

      <div className="flex items-center gap-3">
        <div className="h-[7px] flex-1 overflow-hidden rounded-full bg-[#E6EAF0]">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
        <span className="text-[12px] text-client-muted">
          {step + 1}/{STEPS.length}
        </span>
      </div>

      <div className="mt-5 rounded-[24px] bg-white p-5 md:p-7">
        {loadError && <FormAlert message={`Không tải được sở thích đã lưu: ${loadError}`} />}
        <h2 className="text-[19px] font-extrabold text-client-ink">{STEPS[step].title}</h2>
        <p className="mt-1 mb-5 text-[13px] leading-5 text-client-muted">{STEPS[step].subtitle}</p>
        {renderStep()}

        {error && (
          <p role="alert" className="mt-4 text-[12px] text-client-danger">
            {error}
          </p>
        )}
        {done && (
          <p
            role="status"
            className="mt-4 flex items-center gap-2 rounded-2xl bg-[#E5F5F0] p-3 text-[12px] text-[#356D64]"
          >
            <Icon name="check_circle" filled className="text-[18px]" />
            Đã lưu sở thích. SmartTravel sẽ gợi ý điểm đến và lịch trình phù hợp hơn với bạn.
          </p>
        )}

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={goNext}
            disabled={saving || done}
            className="h-12 flex-1 rounded-2xl bg-[#F2F4F6] text-[14px] font-semibold text-client-ink disabled:opacity-60"
          >
            Bỏ qua
          </button>
          <button
            type="button"
            onClick={handleContinue}
            disabled={saving || done}
            className={`flex h-12 flex-[1.6] items-center justify-center rounded-2xl bg-primary text-[14px] font-bold text-white ${
              canContinue ? '' : 'opacity-50'
            }`}
          >
            {saving ? (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : isLastStep ? (
              'Hoàn tất'
            ) : (
              'Tiếp tục'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
