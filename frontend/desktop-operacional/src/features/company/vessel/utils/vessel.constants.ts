import type { SelectOption } from "../../../../components";
import type { PagedVesselResponseDTO } from "../../../../services/vesselcreate";

export const PAGE_SIZE_GRID = 6; // grid apenas 06
export const PAGE_SIZE_LIST = 10; // lista apenas 10
export const FLEET_SUMMARY_LIMIT = 1000;
export const SEARCH_DEBOUNCE_MS = 300; // limite para a pesquisa.

// pagina vazia inicial para evitar undefined
export const INITIAL_PAGED_STATE: PagedVesselResponseDTO = {
  content: [],
  currentPage: 1,
  pageSize: PAGE_SIZE_GRID,
  totalElements: 0,
  totalPages: 0,
};

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
