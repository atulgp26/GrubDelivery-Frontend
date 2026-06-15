import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  Ref,
  TextareaHTMLAttributes,
  RefObject,
} from "react";

export type ButtonVariant =
  | "primary"
  | "success"
  | "warning"
  | "error"
  | "neutral";

export type ButtonSize = "sm" | "md" | "lg" | "xl" | "default" | "icon";

export type ButtonAppearance = "solid" | "outlined" | "ghost";

export type ButtonState = "default" | "hover" | "press" | "active" | "disabled";

interface ButtonCommonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  size?: ButtonSize;
  bgColor?: string;
  borderColor?: string;
  style?: CSSProperties;
  className?: string;
}

export type ButtonProps =
  | (ButtonCommonProps &
      ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
  | (ButtonCommonProps &
      AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" });

export interface AccordionItem {
  icon: ReactNode;
  question: ReactNode;
  answer?: ReactNode;
  subject?: ReactNode;
  body?: ReactNode;
  attachments?: string[];
}

export interface AccordionProps {
  items: AccordionItem[];
  className?: string;
  helpaccordian?: boolean;
  escalation?: boolean;
  openIndex?: number;
}

export type BadgeColor =
  | "orange"
  | "red"
  | "green"
  | "gray"
  | "medical"
  | "delivery"
  | "hospitality"
  | "camping";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  className?: string;
  color?: BadgeColor;
}

export interface BoxCountBadgeProps {
  count: number;
  icon?: ReactElement;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  children?: ReactNode;
  asText?: boolean;
  textClassName?: string;
  iconColor?: string;
  iconName?: string;
}

export interface CheckBoxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  checked: boolean;
  indeterminate?: boolean;
  checkedBgColor?: string;
}

export interface CollapsePagination {
  rangeText?: string;
  onPrev?: () => void;
  onNext?: () => void;
  disablePrev?: boolean;
  disableNext?: boolean;
  showPrev?: boolean;
  showNext?: boolean;
}

export interface CollapseProps {
  onTitleClick?: (e: React.MouseEvent<HTMLElement>) => void;
  title: ReactNode;
  titleColor?: string;
  isSettings?: boolean;
  icon?: string;
  children: ReactNode;
  align?: string;
  open?: boolean;
  onClick?: () => void;
  detailsAccordian?: boolean;
  restaurantTable?: boolean;
  pagination?: CollapsePagination;
}

export interface DetailsCollapseProps {
  title: ReactNode;
  isSettings?: boolean;
  icon?: string;
  exportModal?: boolean;
  children: ReactNode;
  align?: string;
  open?: boolean;
  onClick?: () => void;
  detailsAccordian?: boolean;
  grubpacsFilter?: boolean;
}

export type TooltipPlacement = "top" | "right" | "bottom" | "left";
export type TooltipArrowPosition = "left" | "center" | "right";

export interface CustomTooltipProps {
  title: ReactNode;
  placement?: TooltipPlacement;
  arrowPosition?: TooltipArrowPosition;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export interface EmptyStateProps {
  title: ReactNode;
  description?: ReactNode;
  buttonLabel?: ReactNode;
  onButtonClick?: () => void;
  className?: string;
}

export interface FilterButtonProps {
  open: boolean;
  handleFilterClick: () => void;
}

export interface FullPageModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
}

export interface HandleSliderProps {
  minTemp?: number;
  maxTemp?: number;
  initialTemp?: number;
  height?: number;
  onChange?: (value: number) => void;
}

export interface HelpSearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  clearable?: boolean;
  onClear?: () => void;
}

export interface IconProps extends HTMLAttributes<HTMLElement> {
  name: string;
  viewBox?: string;
  strokeWidth?: number;
}

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  disabledClass?: string;
  margin?: string;
  width?: string;
  border?: string;
  padding?: string;
  className?: string;
  loginprops?: boolean;
  isFocused?: boolean;
  label?: ReactNode;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  error?: string;
  description?: ReactNode;
}

export interface MobileNotSupportedProps {
  title?: string;
  description?: string;
  illustration?: ReactNode;
}

export interface MobileNumberInputProps
  extends Omit<InputProps, "onChange" | "value" | "onBlur"> {
  value: string;
  onChange: (value: string) => void;
  isValid?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  onBlur?: () => void;
  padding?: string;
}

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  width?: string;
  height?: string;
  customClass?: string;
  modalClassName?: string;
  positionClass?: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  noBlur?: boolean;
  closeOnOutsideClick?: boolean;
  noXPadding?: boolean;
  hideClose?: boolean;
  /** When true, renders the app logo on the left of the modal header with the close button on the right */
  showLogo?: boolean;
  /** Custom node to render on the left side of the modal header */
  headerLeft?: ReactNode;
}

export interface DropdownOption {
  label: string;
  value: string | number;
  icon?: ReactElement;
  description?: ReactNode;
}

export interface DropdownPortalProps {
  targetRef: RefObject<HTMLElement>;
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  containerRef?: RefObject<HTMLElement>;
}

export interface MultiSelectOption {
  id: string | number;
  label: string;
  code?: string;
}

export interface MultiSelectDropdownProps {
  options: MultiSelectOption[];
  selected: Array<string | number>;
  setSelected: (values: Array<string | number>) => void;
  placeholder?: string;
  className?: string;
  style?: CSSProperties;
  hideComponent?: boolean;
  hideSearch?: boolean;
  notificationIcon?: boolean;
  padding?: string;
  placeholderColor?: string;
  fontsize?: string;
  dropdownwidth?: string;
  closeSignal?: unknown;
  onOpenChange?: (open: boolean) => void;
}

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}

export interface RadioProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "gray";
}

export interface SearchInputProps
  extends Omit<InputProps, "onChange" | "value"> {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void;
  isLoading?: boolean;
  clearable?: boolean;
  onfocus?: () => void;
  help?: boolean;
  icon?: ReactNode;
  height?: string;
  padding?: string;
  searchIconHidden?: boolean;
  searchText?: string;
  borderType?: "full" | "bottom";
  showSuggestions?: boolean;
}

export interface SearchWithSuggestionsProps<T = Record<string, unknown>> {
  data: T[];
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (item: T) => void;
  getLabel?: (item: T) => string;
  getSubLabel?: (item: T) => string;
  placeholder?: string;
  clearable?: boolean;
  onClear?: () => void;
  className?: string;
  subLabelClassName?: string;
  openOnFocus?: boolean;
  minChars?: number;
}

export interface SelectOption extends DropdownOption {
  description?: string;
  isRemove?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  showSearch?: boolean;
  className?: string;
  fontSize?: string;
  padding?: string;
  onOpenChange?: (open: boolean) => void;
}

export interface SelectedActionProps {
  open: boolean;
  activeAction: string;
  onClose: () => void;
  selectedCount: number;
  isChecked: boolean;
  setIsChecked: (value: boolean) => void;
  zone1Temp: number;
  zone2Temp: number;
  setZone1Temp: (value: number) => void;
  setZone2Temp: (value: number) => void;
}

export interface SwitchProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick" | "type" | "onChange"> {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: ReactNode;
  variant?: "default" | "neutral";
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  header: ReactNode;
  render?: (row: T) => ReactNode;
  width?: string | number;
  className?: string;
}

export interface TableProps<T = Record<string, unknown>> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (row: T, index: number) => string | number;
  emptyState?: ReactNode;
  className?: string;
  onRowClick?: (row: T) => void;
}

export interface CollapseTableProps<T = Record<string, unknown>> {
  title: ReactNode;
  columns: TableColumn<T>[];
  data?: T[];
  rowKey: (row: T, index: number) => string | number;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  emptyState?: ReactNode;
  collapseProps?: Partial<Omit<CollapseProps, "children" | "title" | "open" | "onClick">>;
  tableClassName?: string;
  contentClassName?: string;
  rowClassName?: (row: T, index: number) => string;
  onRowClick?: (row: T) => void;
}

export interface GroupCollapseTableGroup<TItem = unknown> {
  name: ReactNode;
  items?: TItem[];
  emptyMessage?: ReactNode;
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
  [key: string]: unknown;
}

export interface GroupCollapseTableProps<TItem = unknown, TGroup extends GroupCollapseTableGroup<TItem> = GroupCollapseTableGroup<TItem>> {
  groups: TGroup[];
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
  renderTable: (group: TGroup, index: number) => ReactNode;
  noResultsMessage?: ReactNode;
  tableContainerClass?: string;
  restaurantTable?: boolean;
  titleColor?: string;
  pageSize?: number;
  isPageLoading?: boolean;
  onGroupClick?: (group: TGroup, index: number) => void;
  onPageChange?: (group: TGroup, page: number) => void;
  showPaginationPrev?: boolean;
  showPaginationNext?: boolean;
}

export interface TableActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onSuspend?: () => void;
  onRemoveVehicles?: () => void;
  onReassignRole?: () => void;
  onRemoveRoom?: () => void;
  rightActionLabel?: string;
  rightActionIcon?: ReactNode;
  onRightAction?: () => void;
  suspended?: boolean;
  rightActionVariant?: ButtonVariant;
  onActivate?: () => void;
  onDelete?: () => void;
  onRoles?: boolean;
  employeeList?: boolean;
  allowActivate?: boolean;
  allowDelete?: boolean;
  allowSuspend?: boolean;
  allowReassign?: boolean;
  reassignLabel?: string;
  className?: string;
}

export interface TableCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  indeterminate?: boolean;
  colorVar?: string;
  tone?: "default" | "neutral";
}

export interface TextAreaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  description?: ReactNode;
  error?: string;
}

export interface ToastProviderProps {
  children: ReactNode;
}

export interface InfoPanelButtonConfig {
  text: ReactNode;
  onClick: () => void;
  variant?: ButtonVariant;
  appearance?: ButtonAppearance;
  state?: ButtonState;
  className?: string;
  icon?: string;
  iconClassName?: string;
  size?: ButtonSize;
}

export interface InfoPanelProps {
  title: ReactNode;
  description?: ReactNode;
  subDescription?: ReactNode;
  buttonText?: ReactNode;
  onButtonClick?: () => void;
  image?: string;
  imageAlt?: string;
  name?: ReactNode;
  children?: ReactNode;
  topRight?: ReactNode;
  buttons?: InfoPanelButtonConfig[];
  className?: string;
}

export type TemperatureLevel = "low" | "mid" | "high";

export interface TemperatureSetProps extends HTMLAttributes<HTMLSpanElement> {
  value: number | string;
  unit?: string;
  level?: TemperatureLevel;
  showIcon?: boolean;
  label?: string;
  className?: string;
}

