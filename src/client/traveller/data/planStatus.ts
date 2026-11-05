import type { PlanStatus, TravelPlanResponse } from '@/client/api/tripFlowApi';

/** Nhãn, icon và màu của từng trạng thái kế hoạch. */
export const PLAN_STATUS_INFO: Record<
  PlanStatus,
  { label: string; icon: string; className: string }
> = {
  DRAFT: {
    label: 'Bản nháp',
    icon: 'edit_note',
    className: 'bg-[#FFE8C7] text-[#8A4B00]',
  },
  PLANNED: {
    label: 'Đã lên kế hoạch',
    icon: 'calendar_today',
    className: 'bg-[#D7FBF3] text-[#06695F]',
  },
  IN_PROGRESS: {
    label: 'Đang diễn ra',
    icon: 'directions_walk',
    className: 'bg-[#D9F4FF] text-[#156486]',
  },
  COMPLETED: {
    label: 'Đã hoàn thành',
    icon: 'check_circle',
    className: 'bg-[#E3F6E5] text-[#23793A]',
  },
  CANCELLED: {
    label: 'Đã hủy',
    icon: 'cancel',
    className: 'bg-[#FCE4E3] text-[#AD3232]',
  },
};

/** Nút chuyển sang từng trạng thái: tên thao tác và câu xác nhận. */
export const PLAN_STATUS_ACTION: Record<
  PlanStatus,
  { label: string; icon: string; confirm: string; danger?: boolean }
> = {
  DRAFT: {
    label: 'Về bản nháp',
    icon: 'edit_note',
    confirm: 'Đưa kế hoạch về bản nháp?',
  },
  PLANNED: {
    label: 'Chốt kế hoạch',
    icon: 'event_available',
    confirm:
      'Chốt kế hoạch này? Sau khi chốt vẫn sửa được thông tin, nhưng không quay lại bản nháp được.',
  },
  IN_PROGRESS: {
    label: 'Bắt đầu chuyến đi',
    icon: 'flight_takeoff',
    confirm:
      'Bắt đầu chuyến đi? Khi chuyến đi đang diễn ra, bạn không sửa hoặc xóa kế hoạch được nữa.',
  },
  COMPLETED: {
    label: 'Hoàn thành chuyến đi',
    icon: 'task_alt',
    confirm: 'Đánh dấu chuyến đi đã hoàn thành? Không thể đổi trạng thái sau bước này.',
  },
  CANCELLED: {
    label: 'Hủy kế hoạch',
    icon: 'event_busy',
    confirm:
      'Hủy kế hoạch này? Kế hoạch đã hủy không mở lại được, nhưng vẫn được lưu trong mục Đã kết thúc.',
    danger: true,
  },
};

export function planStatusInfo(status: string) {
  return (
    PLAN_STATUS_INFO[status as PlanStatus] ?? {
      label: status || 'Chưa rõ',
      icon: 'info',
      className: 'bg-[#EBEDFF] text-[#506581]',
    }
  );
}

/** Giống quy tắc ở Backend: chỉ sửa khi chuyến đi chưa bắt đầu. */
export const canEditPlan = (plan: TravelPlanResponse) =>
  plan.status === 'DRAFT' || plan.status === 'PLANNED';

/** Giống quy tắc ở Backend: không xóa khi chuyến đi đang diễn ra. */
export const canDeletePlan = (plan: TravelPlanResponse) => plan.status !== 'IN_PROGRESS';

export const isPlanFinished = (plan: TravelPlanResponse) =>
  plan.status === 'COMPLETED' || plan.status === 'CANCELLED';
