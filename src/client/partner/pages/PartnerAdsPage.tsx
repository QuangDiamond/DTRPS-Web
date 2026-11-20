import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '@/components/common';
import {
  adApi,
  type AdPackage,
  type AdPartnerState,
  type AdPayment,
  type AdPaymentStatus,
  type AdSlots,
} from '@/client/api/adApi';
import { errorMessage } from '@/client/api/http';
import { useClientLiveRefresh } from '@/client/live/clientLiveContext';
import AdPaymentActions from '@/client/partner/components/AdPaymentActions';
import { formatDate } from '@/client/partner/profileStatus';
import { CLIENT_ROUTES } from '@/client/routePaths';
import {
  type BadgeTone,
  Card,
  CardTitle,
  FormAlert,
  Heading,
  Notice,
  Spinner,
  StatusBadge,
} from '@/client/ui/Blocks';
import { PrimaryButton, SecondaryButton } from '@/client/ui/Buttons';
import { ConfirmDialog } from '@/client/ui/Overlay';

const money = (value: number) => `${Math.round(value).toLocaleString('vi-VN')}đ`;

const PAYMENT_STATUS: Record<AdPaymentStatus, { label: string; tone: BadgeTone }> = {
  PENDING: { label: 'Chờ thanh toán', tone: 'pending' },
  SUCCESS: { label: 'Thành công', tone: 'approved' },
  FAILED: { label: 'Thất bại', tone: 'rejected' },
  CANCELLED: { label: 'Đã huỷ', tone: 'draft' },
  REFUNDED: { label: 'Đã hoàn tiền', tone: 'locked' },
};

function PackageCard({
  item,
  eligiblePlaces,
  busy,
  onBuy,
}: {
  item: AdPackage;
  eligiblePlaces: number;
  busy: boolean;
  onBuy: () => void;
}) {
  const short = eligiblePlaces > 0 && eligiblePlaces < item.maxPlaces;
  return (
    <div className="flex flex-col rounded-[20px] border border-client-line bg-white p-5">
      <p className="text-[16px] font-extrabold text-client-ink">{item.name}</p>
      <p className="mt-2 text-[26px] font-extrabold text-client-primary">{money(item.price)}</p>
      {item.description && (
        <p className="mt-1 text-[12px] leading-[19px] text-client-muted">{item.description}</p>
      )}
      <ul className="mt-4 flex-1 space-y-2 text-[13px] text-client-ink">
        <li className="flex items-center gap-2">
          <Icon name="location_on" className="text-[18px] text-client-primary" />
          Quảng cáo {item.maxPlaces} địa điểm cùng lúc
        </li>
        <li className="flex items-center gap-2">
          <Icon name="event" className="text-[18px] text-client-primary" />
          Trong {item.durationDays} ngày
        </li>
        <li className="flex items-center gap-2">
          <Icon name="home" className="text-[18px] text-client-primary" />
          Hiện ở trang chủ du khách
        </li>
      </ul>
      {short && (
        <p className="mt-3 rounded-xl bg-[#FFF4DD] p-2.5 text-[11px] leading-[17px] text-[#7A5410]">
          Bạn mới có {eligiblePlaces} địa điểm đủ điều kiện, gói này có {item.maxPlaces} lượt.
        </p>
      )}
      <PrimaryButton
        className="mt-4"
        loading={busy}
        disabled={eligiblePlaces === 0}
        onClick={onBuy}
      >
        Mua gói
      </PrimaryButton>
    </div>
  );
}

function SlotPicker({ slots, onSaved }: { slots: AdSlots; onSaved: (next: AdSlots) => void }) {
  const initial = useMemo(
    () => slots.places.filter((place) => place.selected).map((place) => place.listingId),
    [slots],
  );
  const [selected, setSelected] = useState<number[]>(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => setSelected(initial), [initial]);

  const full = selected.length >= slots.maxPlaces;
  const changed =
    selected.length !== initial.length || selected.some((id) => !initial.includes(id));

  const toggle = (listingId: number) => {
    setSaved(false);
    setSelected((current) =>
      current.includes(listingId)
        ? current.filter((id) => id !== listingId)
        : [...current, listingId],
    );
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      onSaved(await adApi.saveSlots(selected));
      setSaved(true);
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <CardTitle>Chọn địa điểm quảng cáo</CardTitle>
        <StatusBadge tone={full ? 'approved' : 'pending'}>
          Đã chọn {selected.length}/{slots.maxPlaces}
        </StatusBadge>
      </div>
      <p className="mt-1 text-[12px] text-client-muted">
        Bạn có thể đổi địa điểm bất cứ lúc nào trong thời hạn gói.
      </p>

      {slots.places.length === 0 ? (
        <p className="mt-4 text-[13px] text-client-muted">Bạn chưa có địa điểm nào.</p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {slots.places.map((place) => {
            const checked = selected.includes(place.listingId);
            const locked = !checked && (!place.eligible || full);
            return (
              <label
                key={place.listingId}
                className={`flex items-center gap-3 rounded-2xl border p-3 transition-colors ${
                  checked ? 'border-client-primary bg-[#E6F5F7]' : 'border-client-line bg-white'
                } ${locked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={locked}
                  onChange={() => toggle(place.listingId)}
                  className="h-5 w-5 shrink-0 accent-[#0E7490]"
                />
                {place.coverUrl ? (
                  <img
                    src={place.coverUrl}
                    alt=""
                    className="h-14 w-14 shrink-0 rounded-xl object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-client-field text-client-muted">
                    <Icon name="image" className="text-[22px]" />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-bold text-client-ink">
                    {place.name}
                  </span>
                  <span className="block truncate text-[12px] text-client-muted">
                    {place.province ?? place.address}
                  </span>
                  {place.ineligibleReason && !place.selected && (
                    <span className="mt-1 block text-[11px] font-semibold text-[#976207]">
                      {place.ineligibleReason}
                    </span>
                  )}
                  {place.suspended && (
                    <span className="mt-1 block text-[11px] font-semibold text-[#AD3232]">
                      Admin đã gỡ: {place.suspendReason}
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      )}

      {error && (
        <div className="mt-4">
          <FormAlert message={error} />
        </div>
      )}
      {saved && !changed && (
        <p className="mt-3 text-[12px] font-semibold text-client-primary">Đã lưu địa điểm quảng cáo.</p>
      )}
      <PrimaryButton
        className="mt-4 md:w-56"
        arrow={false}
        loading={saving}
        disabled={!changed}
        onClick={() => void save()}
      >
        Lưu địa điểm
      </PrimaryButton>
    </Card>
  );
}

/** Quảng cáo của đối tác: /partner/ads — mua gói, thanh toán, chọn địa điểm, gia hạn */
export default function PartnerAdsPage() {
  const [state, setState] = useState<AdPartnerState | null>(null);
  const [packages, setPackages] = useState<AdPackage[]>([]);
  const [slots, setSlots] = useState<AdSlots | null>(null);
  const [history, setHistory] = useState<AdPayment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const load = useCallback(async () => {
    try {
      const [nextState, nextPackages, nextSlots, nextHistory] = await Promise.all([
        adApi.state(),
        adApi.packages(),
        adApi.slots(),
        adApi.payments(),
      ]);
      setState(nextState);
      setPackages(nextPackages);
      setSlots(nextSlots);
      setHistory(nextHistory.items);
      setError(null);
    } catch (failure) {
      setError(errorMessage(failure));
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);
  useClientLiveRefresh(['AD_'], () => void load());

  /** Tạo đơn rồi chuyển sang trang thanh toán của PayOS */
  const pay = async (key: string, start: () => Promise<{ checkoutUrl: string }>) => {
    setBusyKey(key);
    setActionError(null);
    try {
      const { checkoutUrl } = await start();
      window.location.assign(checkoutUrl);
    } catch (failure) {
      setActionError(errorMessage(failure));
      setBusyKey(null);
    }
  };

  const cancelPending = async (orderCode: string) => {
    setBusyKey('cancel');
    setActionError(null);
    try {
      await adApi.cancelPayment(orderCode);
      await load();
    } catch (failure) {
      setActionError(errorMessage(failure));
    } finally {
      setBusyKey(null);
    }
  };

  if (error && !state) {
    return (
      <div>
        <Heading eyebrow="BUSINESS OWNER" title="Quảng cáo" />
        <FormAlert message={error} />
        <SecondaryButton className="md:w-48" onClick={() => void load()}>
          Thử lại
        </SecondaryButton>
      </div>
    );
  }
  if (!state || !slots) return <Spinner />;

  const { subscription, pendingPayment, renewable, eligiblePlaces } = state;
  const freeSlots = subscription ? subscription.maxPlaces - subscription.usedSlots : 0;

  return (
    <div>
      <Heading
        eyebrow="BUSINESS OWNER"
        title="Quảng cáo"
        description="Mua gói để địa điểm của bạn hiện nổi bật ở trang chủ du khách."
      />

      {actionError && <FormAlert message={actionError} />}

      {pendingPayment && (
        <Card className="border-[#F2D9A8] bg-[#FFFAF0]">
          <CardTitle>Đơn đang chờ thanh toán</CardTitle>
          <p className="mt-1 text-[13px] text-client-ink">
            {pendingPayment.packageName} · <b>{money(pendingPayment.amount)}</b>
          </p>
          <p className="mt-2 text-[12px] leading-[19px] text-[#7A5410]">
            Quét đúng mã QR, không sửa số tiền và nội dung chuyển khoản để gói được kích hoạt tự
            động.
          </p>
          <div className="mt-3 flex flex-col gap-2 md:flex-row">
            <PrimaryButton
              className="md:w-56"
              onClick={() => {
                if (pendingPayment.checkoutUrl) {
                  window.location.assign(pendingPayment.checkoutUrl);
                }
              }}
            >
              Tiếp tục thanh toán
            </PrimaryButton>
            <SecondaryButton
              className="md:w-40"
              disabled={busyKey === 'cancel'}
              onClick={() => setConfirmCancel(true)}
            >
              Huỷ đơn
            </SecondaryButton>
          </div>
          <AdPaymentActions payment={pendingPayment} onChanged={() => void load()} />
        </Card>
      )}

      {subscription ? (
        <>
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle>{subscription.packageName}</CardTitle>
                <p className="mt-1 text-[13px] text-client-muted">
                  Hết hạn {formatDate(subscription.endDate)} · còn {subscription.daysLeft} ngày
                </p>
              </div>
              <StatusBadge tone="approved">Đang chạy</StatusBadge>
            </div>
            {freeSlots > 0 && (
              <p className="mt-3 text-[13px] font-semibold text-[#976207]">
                Còn {freeSlots} lượt chưa dùng, hãy chọn địa điểm bên dưới.
              </p>
            )}
            {renewable && !pendingPayment && (
              <div className="mt-4">
                <Notice tone="warning">
                  Gói sắp hết hạn. Gia hạn để giữ các địa điểm đang quảng cáo.
                </Notice>
                <PrimaryButton
                  className="md:w-64"
                  loading={busyKey === 'renew'}
                  onClick={() => void pay('renew', adApi.renew)}
                >
                  Gia hạn {money(subscription.price)}
                </PrimaryButton>
              </div>
            )}
          </Card>
          <SlotPicker
            slots={slots}
            onSaved={(next) => {
              setSlots(next);
              void load();
            }}
          />
        </>
      ) : (
        !pendingPayment && (
          <>
            {eligiblePlaces === 0 && (
              <Notice tone="warning">
                Bạn cần có ít nhất 1 địa điểm đã được duyệt trước khi mua gói.{' '}
                <Link to={CLIENT_ROUTES.PARTNER_LOCATIONS} className="font-bold underline">
                  Xem địa điểm của bạn
                </Link>
              </Notice>
            )}
            <Notice>
              Khi thanh toán, hãy quét đúng mã QR, không sửa số tiền và nội dung chuyển khoản.
            </Notice>
            {packages.length === 0 ? (
              <Card>
                <p className="text-[13px] text-client-muted">Hiện chưa có gói nào được mở bán.</p>
              </Card>
            ) : (
              <div className="mb-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {packages.map((item) => (
                  <PackageCard
                    key={item.id}
                    item={item}
                    eligiblePlaces={eligiblePlaces}
                    busy={busyKey === `buy-${item.id}`}
                    onBuy={() => void pay(`buy-${item.id}`, () => adApi.checkout(item.id))}
                  />
                ))}
              </div>
            )}
          </>
        )
      )}

      {history.length > 0 && (
        <Card>
          <CardTitle>Lịch sử thanh toán</CardTitle>
          <ul className="mt-2 divide-y divide-client-line">
            {history.map((payment) => {
              const status = PAYMENT_STATUS[payment.status];
              return (
                <li key={payment.id} className="flex items-start justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <span className="block truncate text-[13px] font-bold text-client-ink">
                      {payment.packageName}
                      {payment.type === 'RENEWAL' && ' (gia hạn)'}
                    </span>
                    <span className="block text-[12px] text-client-muted">
                      #{payment.orderCode} · {formatDate(payment.paidAt ?? payment.createdAt)}
                    </span>
                    <AdPaymentActions payment={payment} onChanged={() => void load()} />
                  </div>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="text-[13px] font-bold text-client-ink">
                      {money(payment.amount)}
                    </span>
                    <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
                  </span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {confirmCancel && pendingPayment && (
        <ConfirmDialog
          title="Huỷ đơn thanh toán?"
          message="Nếu bạn đã chuyển khoản thì đừng huỷ, hệ thống sẽ tự xác nhận."
          confirmLabel="Huỷ đơn"
          cancelLabel="Giữ đơn"
          danger
          onConfirm={() => void cancelPending(pendingPayment.orderCode)}
          onClose={() => setConfirmCancel(false)}
        />
      )}
    </div>
  );
}
