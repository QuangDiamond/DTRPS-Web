/**
 * UI dùng chung — import qua `@/components/common`.
 * LocationPicker và PlaceMap (MapLibre, nặng) import trực tiếp từ file để chỉ tải ở trang có bản đồ.
 */
export { AiMatchBadge, VectorIndexBadge } from './AiSearchBadges';
export { default as Button } from './Button';
export type { ButtonVariant, ButtonSize } from './Button';
export { default as ConfirmModal } from './ConfirmModal';
export { default as ErrorState } from './ErrorState';
export { default as FilterSelect } from './FilterSelect';
export { default as Icon } from './Icon';
export { default as LanguageSwitcher } from './LanguageSwitcher';
export type { LocationPickerLabels } from './LocationPicker';
export type { AddressSuggestion, GeoLocation, MapSearch } from './mapTypes';
export { default as Modal } from './Modal';
export { default as NotFoundState } from './NotFoundState';
export { default as PageHeader } from './PageHeader';
export { default as PageLoader } from './PageLoader';
export { default as Pagination } from './Pagination';
export { default as SendMessageModal } from './SendMessageModal';
export { default as SortableHeader } from './SortableHeader';
export { default as StatCard } from './StatCard';
export { default as ToggleSwitch } from './ToggleSwitch';
export { default as UnsavedChangesDialog } from './UnsavedChangesDialog';
