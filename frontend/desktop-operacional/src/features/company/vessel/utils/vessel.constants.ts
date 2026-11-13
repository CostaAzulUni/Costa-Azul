import type { SelectOption } from "../../../../components";

export const VESSEL_STATUS_FILTER_OPTIONS: SelectOption[] = [
  { label: "Todos", value: "ALL" },
  { label: "Em operação", value: "ACTIVE" },
  { label: "Em manutenção", value: "MAINTENANCE" },
  { label: "Fora de serviço", value: "INACTIVE" },
  { label: "Doca seca", value: "DRY_DOCK" },
];

export const VESSEL_COMPLIANCE_FILTER_OPTIONS: SelectOption[] = [
  { label: "Todas", value: "ALL" },
  { label: "Em dia", value: "valid" },
  { label: "Vence em até 30 dias", value: "expiring_soon" },
  { label: "Vencido", value: "expired" },
  { label: "Não informado", value: "missing" },
];