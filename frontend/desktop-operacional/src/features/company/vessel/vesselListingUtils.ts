import axios from "axios";
import type { BadgeTone, SelectOption } from "../../../components";
import type {
  VesselResponseDTO,
  VesselSummaryDTO,
} from "../../../services/vesselcreate";
import {
  CLASSIFICATION_SOCIETY_OPTIONS,
  formatIsoDateBr,
  formatMetric,
  getOptionLabel,
  PROPULSION_TYPE_OPTIONS,
  VESSEL_FLAG_OPTIONS,
} from "./vesselFormConfig";

export type VesselStatusFilterValue =
  | "ALL"
  | "ACTIVE"
  | "MAINTENANCE"
  | "INACTIVE"
  | "DRY_DOCK";

export type VesselComplianceState =
  | "valid"
  | "expiring_soon"
  | "expired"
  | "missing";

export type VesselComplianceFilterValue = "ALL" | VesselComplianceState;

export type VesselComplianceVisualTone =
  | "ok"
  | "warning"
  | "error"
  | "neutral";

export interface VesselStatusDisplay {
  value: string;
  label: string;
  tone: BadgeTone;
}

export interface VesselComplianceEvaluation {
  state: VesselComplianceState;
  daysDifference: number | null;
  shortLabel: string;
  cardLabel: string;
  cardTone: VesselComplianceVisualTone;
  iconName: string;
  badgeTone: BadgeTone;
  expiryFormatted: string;
}

export interface FleetKpiSummary {
  totalCount: number;
  activeCount: number;
  maintenanceCount: number;
  inactiveCount: number;
  totalPassengerCapacity: number;
  expiredCertificatesCount: number;
  expiringSoonCertificatesCount: number;
  missingCertificatesCount: number;
  totalComplianceAlerts: number;
}

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

/**
 * Converte o código de status operacional retornado pela API para o rótulo e tom visual do Design System.
 */
export function getVesselStatusDisplay(
  operationalStatus: string | null | undefined
): VesselStatusDisplay {
  const normalized = (operationalStatus ?? "").trim().toUpperCase();

  switch (normalized) {
    case "ACTIVE":
      return {
        value: "ACTIVE",
        label: "Em operação",
        tone: "success",
      };
    case "MAINTENANCE":
      return {
        value: "MAINTENANCE",
        label: "Em manutenção",
        tone: "warning",
      };
    case "DRY_DOCK":
      return {
        value: "DRY_DOCK",
        label: "Doca seca",
        tone: "warning",
      };
    case "INACTIVE":
      return {
        value: "INACTIVE",
        label: "Fora de serviço",
        tone: "neutral",
      };
    default:
      return {
        value: normalized || "UNKNOWN",
        label: operationalStatus?.trim() || "Não informado",
        tone: "neutral",
      };
  }
}

/**
 * Avalia a validade do certificado ISM (`certificateExpiryDate`) em relação à data local atual.
 * Alinhado com a regra de 30 dias do `VesselService.evaluateCompliance` no backend.
 */
export function evaluateVesselCompliance(
  certificateExpiryDate: string | null | undefined
): VesselComplianceEvaluation {
  const rawDate = (certificateExpiryDate ?? "").trim();
  if (!rawDate) {
    return {
      state: "missing",
      daysDifference: null,
      shortLabel: "Sem certificado registrado",
      cardLabel: "Validade não informada",
      cardTone: "neutral",
      iconName: "pi-info-circle",
      badgeTone: "neutral",
      expiryFormatted: "—",
    };
  }

  const parts = rawDate.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return {
      state: "missing",
      daysDifference: null,
      shortLabel: "Data inválida",
      cardLabel: "Validade não identificada",
      cardTone: "neutral",
      iconName: "pi-info-circle",
      badgeTone: "neutral",
      expiryFormatted: rawDate,
    };
  }

  const [year, month, day] = parts;
  const expiryLocal = new Date(year, month - 1, day);
  expiryLocal.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffMs = expiryLocal.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  const expiryFormatted = formatIsoDateBr(rawDate);

  if (diffDays < 0) {
    const expiredDays = Math.abs(diffDays);
    return {
      state: "expired",
      daysDifference: diffDays,
      shortLabel:
        expiredDays === 1
          ? "Vencido há 1 dia"
          : `Vencido há ${expiredDays} dias`,
      cardLabel: `Certificado ISM vencido (${expiryFormatted})`,
      cardTone: "error",
      iconName: "pi-times-circle",
      badgeTone: "error",
      expiryFormatted,
    };
  }

  if (diffDays <= 30) {
    return {
      state: "expiring_soon",
      daysDifference: diffDays,
      shortLabel:
        diffDays === 0
          ? "Vence hoje"
          : diffDays === 1
            ? "Vence em 1 dia"
            : `Vence em ${diffDays} dias`,
      cardLabel:
        diffDays === 0
          ? "Certificado ISM vence hoje"
          : `Certificado ISM vence em ${diffDays}d`,
      cardTone: "warning",
      iconName: "pi-exclamation-triangle",
      badgeTone: "warning",
      expiryFormatted,
    };
  }

  return {
    state: "valid",
    daysDifference: diffDays,
    shortLabel: "Conformidade em dia",
    cardLabel: "Conformidade em dia",
    cardTone: "ok",
    iconName: "pi-check-circle",
    badgeTone: "success",
    expiryFormatted,
  };
}

/**
 * Filtra URLs internas temporárias (`pending-upload://...`) para que os componentes
 * `VesselCard` e `VesselHeader` exibam seu placeholder vetorial quando não houver URL HTTP/data válida.
 */
export function resolveSafeVesselPhotoUrl(
  photoUrl: string | null | undefined
): string | undefined {
  if (!photoUrl) return undefined;
  const trimmed = photoUrl.trim();
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("data:image/") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }
  return undefined;
}

/**
 * Retorna a identificação legível do porto base / terminal da embarcação.
 * Aceita tanto `VesselSummaryDTO` (listagem) quanto `VesselResponseDTO` (detalhes).
 */
export function getVesselBasePortDisplay(
  vessel: Pick<VesselSummaryDTO, "mainTerminal" | "idHomePort">
): string {
  const terminal = vessel.mainTerminal?.trim();
  if (terminal) return terminal;
  const homePort = vessel.idHomePort?.trim();
  if (homePort) return `Porto ID ${homePort.slice(0, 8)}`;
  return "—";
}

/**
 * Extrai a lista de opções únicas de Porto Base a partir da frota cadastrada.
 */
export function extractBasePortOptions(
  vessels: Array<Pick<VesselSummaryDTO, "mainTerminal" | "idHomePort">>,
  selectedPort?: string
): SelectOption[] {
  const uniquePorts = new Set<string>();
  vessels.forEach((vessel) => {
    const portLabel = getVesselBasePortDisplay(vessel);
    if (portLabel !== "—") {
      uniquePorts.add(portLabel);
    }
  });

  if (selectedPort && selectedPort !== "ALL") {
    uniquePorts.add(selectedPort);
  }

  const sortedPorts = Array.from(uniquePorts).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  return [
    { label: "Todos", value: "ALL" },
    ...sortedPorts.map((port) => ({ label: port, value: port })),
  ];
}

/**
 * Calcula os indicadores reais da frota (KPIs) a partir da lista resumida de embarcações
 * e do total de elementos retornados pela API.
 */
export function calculateFleetKpis(
  vessels: VesselSummaryDTO[],
  totalFleetElements?: number
): FleetKpiSummary {
  const totalCount =
    typeof totalFleetElements === "number"
      ? Math.max(totalFleetElements, vessels.length)
      : vessels.length;

  let activeCount = 0;
  let maintenanceCount = 0;
  let inactiveCount = 0;
  let totalPassengerCapacity = 0;
  let expiredCertificatesCount = 0;
  let expiringSoonCertificatesCount = 0;
  let missingCertificatesCount = 0;

  vessels.forEach((vessel) => {
    const status = (vessel.operationalStatus ?? "").trim().toUpperCase();
    if (status === "ACTIVE") {
      activeCount += 1;
    } else if (status === "MAINTENANCE" || status === "DRY_DOCK") {
      maintenanceCount += 1;
    } else {
      inactiveCount += 1;
    }

    if (
      vessel.maxPassengerCapacity !== null &&
      vessel.maxPassengerCapacity !== undefined &&
      !Number.isNaN(vessel.maxPassengerCapacity)
    ) {
      totalPassengerCapacity += vessel.maxPassengerCapacity;
    }

    const compliance = evaluateVesselCompliance(vessel.certificateExpiryDate);
    if (compliance.state === "expired") {
      expiredCertificatesCount += 1;
    } else if (compliance.state === "expiring_soon") {
      expiringSoonCertificatesCount += 1;
    } else if (compliance.state === "missing") {
      missingCertificatesCount += 1;
    }
  });

  const totalComplianceAlerts =
    expiredCertificatesCount + expiringSoonCertificatesCount;

  return {
    totalCount,
    activeCount,
    maintenanceCount,
    inactiveCount,
    totalPassengerCapacity,
    expiredCertificatesCount,
    expiringSoonCertificatesCount,
    missingCertificatesCount,
    totalComplianceAlerts,
  };
}

/**
 * Extrai mensagem de erro amigável a partir de falhas HTTP/Axios.
 */
export function parseVesselApiError(
  error: unknown,
  fallbackMessage = "Não foi possível carregar a listagem de embarcações. Verifique sua conexão com o servidor."
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return "Sua sessão expirou ou você não possui permissão para consultar as embarcações.";
    }
    if (status === 404) {
      return "O recurso de embarcações solicitado não foi encontrado no servidor.";
    }
    if (
      typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data &&
      typeof (error.response.data as { message?: unknown }).message === "string"
    ) {
      return (error.response.data as { message: string }).message;
    }
  }
  if (error instanceof Error && error.message.includes("Formato de resposta")) {
    return error.message;
  }
  return fallbackMessage;
}

export function formatFlagDisplay(flag: string | null | undefined): string {
  if (!flag) return "—";
  return getOptionLabel(VESSEL_FLAG_OPTIONS, flag);
}

export function formatPropulsionDisplay(
  propulsion: string | null | undefined
): string {
  if (!propulsion) return "—";
  return getOptionLabel(PROPULSION_TYPE_OPTIONS, propulsion);
}

export function formatClassificationDisplay(
  society: string | null | undefined
): string {
  if (!society) return "—";
  return getOptionLabel(CLASSIFICATION_SOCIETY_OPTIONS, society);
}

export function formatDateTimeBr(
  isoDateTime: string | null | undefined
): string {
  if (!isoDateTime) return "—";
  const parsed = new Date(isoDateTime);
  if (Number.isNaN(parsed.getTime())) return isoDateTime;
  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export interface VesselProfileReadinessItem {
  id: string;
  label: string;
  completed: boolean;
  detail: string;
  targetTab: string;
}

export interface VesselProfileReadiness {
  percentage: number;
  completedCount: number;
  totalCount: number;
  items: VesselProfileReadinessItem[];
}

/**
 * Calcula a prontidão real do cadastro da embarcação a partir dos campos retornados pela API.
 */
export function evaluateVesselProfileReadiness(
  vessel: VesselResponseDTO
): VesselProfileReadiness {
  const hasBasicInfo = Boolean(
    vessel.vesselName?.trim() &&
      vessel.nationalRegistrationNumber?.trim() &&
      vessel.flag?.trim() &&
      vessel.imoNumber?.trim() &&
      vessel.yearBuilt !== null
  );

  const hasSpecs = Boolean(
    vessel.grossTonnage !== null &&
      vessel.lengthOverall !== null &&
      vessel.operatingDraft !== null &&
      vessel.shipyard?.trim()
  );

  const hasCapacity = Boolean(
    vessel.maxPassengerCapacity !== null &&
      vessel.maxCrewCapacity !== null &&
      vessel.lifeboatTotalCapacity !== null
  );

  const hasDecksAndAreas = (vessel.deckCount ?? 0) > 0;

  const compliance = evaluateVesselCompliance(vessel.certificateExpiryDate);
  const hasValidCompliance = Boolean(
    vessel.classificationSociety?.trim() &&
      vessel.ismCertification?.trim() &&
      compliance.state === "valid"
  );

  const hasOperationalBase = Boolean(
    vessel.operationalEmail?.trim() &&
      (vessel.mainTerminal?.trim() || vessel.idHomePort?.trim())
  );

  const items: VesselProfileReadinessItem[] = [
    {
      id: "identificacao",
      label: "Identificação e registro IMO",
      completed: hasBasicInfo,
      detail: hasBasicInfo ? "Completo" : "Pendente",
      targetTab: "visao-geral",
    },
    {
      id: "especificacoes",
      label: "Especificações técnicas",
      completed: hasSpecs,
      detail: hasSpecs ? "Completo" : "Incompleto",
      targetTab: "especificacoes",
    },
    {
      id: "capacidade",
      label: "Capacidade e salvatagem",
      completed: hasCapacity,
      detail: hasCapacity
        ? `${formatMetric(vessel.maxPassengerCapacity)} pass. · ${formatMetric(vessel.lifeboatTotalCapacity)} salvatagem`
        : "Pendente",
      targetTab: "capacidade",
    },
    {
      id: "certificacoes",
      label: "Classificadora e certificado ISM em dia",
      completed: hasValidCompliance,
      detail: hasValidCompliance ? "Em dia" : compliance.shortLabel,
      targetTab: "certificacoes",
    },
    {
      id: "base-operacional",
      label: "Base operacional e contato",
      completed: hasOperationalBase,
      detail: hasOperationalBase ? "Configurado" : "Terminal opcional pendente",
      targetTab: "visao-geral",
    },
    {
      id: "conveses-areas",
      label: "Conveses e áreas cadastradas",
      completed: hasDecksAndAreas,
      detail: hasDecksAndAreas
        ? `${vessel.deckCount} conveses · ${vessel.totalAreas} áreas`
        : "0 conveses cadastrados",
      targetTab: "conveses-areas",
    },
  ];

  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return {
    percentage,
    completedCount,
    totalCount,
    items,
  };
}
