/**
 * Barrel File (Arquivo Barril) de Componentes Globais de UI (Fases 01, 02, 04 e 05):
 * Centraliza a exportação dos componentes reutilizáveis do Design System.
 */

// Fase 01 — Fundação
export {
  Button,
  type ButtonProps,
  type ButtonVariant,
  type ButtonSize,
  type ButtonIconPosition,
} from "./Button/Button";

export {
  Input,
  type InputProps,
  type InputType,
  type InputSize,
} from "./Input/Input";

export {
  Select,
  type SelectProps,
  type SelectOption,
  type SelectSize,
} from "./Select/Select";

export {
  Alert,
  type AlertProps,
  type AlertVariant,
} from "./Alert/Alert";

export {
  KPI,
  type KPIProps,
  type KPIHighlightTone,
} from "./KPI/KPI";

// Fase 02 — Componentes Simples
export {
  Badge,
  type BadgeProps,
  type BadgeTone,
  type BadgeSize,
} from "./Badge/Badge";

export {
  IconButton,
  type IconButtonProps,
  type IconButtonVariant,
  type IconButtonSize,
} from "./IconButton/IconButton";

export {
  Checkbox,
  type CheckboxProps,
} from "./Checkbox/Checkbox";

export {
  Switch,
  type SwitchProps,
  type SwitchLabelPosition,
} from "./Switch/Switch";

export {
  FilterChip,
  type FilterChipProps,
} from "./FilterChip/FilterChip";

export {
  Tabs,
  TabPanel,
  type TabsProps,
  type TabPanelProps,
  type TabItem,
  type TabCountTone,
} from "./Tabs/Tabs";

// Componentes de Apoio (Avatar & Icon)
export {
  Avatar,
  type AvatarProps,
  type AvatarSize,
} from "./Avatar/Avatar";

export {
  Icon,
  type IconProps,
  type IconSource,
} from "./Icon/Icon";

// Fase 04 — Container Genérico de Seção
export {
  SectionCard,
  type SectionCardProps,
  type SectionCardHeadingLevel,
} from "./SectionCard/SectionCard";

// Fase 05 — Infraestrutura
export {
  Modal,
  Dialog,
  type ModalProps,
  type DialogProps,
  type ModalSize,
} from "./Modal/Modal";

export {
  Toast,
  type ToastProps,
  type ToastVariant,
} from "./Toast/Toast";

export {
  Pagination,
  type PaginationProps,
} from "./Pagination/Pagination";

export {
  DataTable,
  type DataTableProps,
  type DataTableColumn,
  type DataTableAlign,
} from "./DataTable/DataTable";

export {
  EmptyState,
  type EmptyStateProps,
} from "./EmptyState/EmptyState";
