import type { SelectOption } from "../../../../components";
import type { VesselSummaryDTO } from "../../../../services/vesselcreate";
import { evaluateVesselCompliance } from "./vessel.compliance";
import {
  VESSEL_COMPLIANCE_FILTER_OPTIONS,
  VESSEL_STATUS_FILTER_OPTIONS,
} from "./vessel.constants";
import type {
  FleetComplianceKpiPresentation,
  FleetKpiSummary,
  VesselComplianceFilterValue,
  VesselStatusFilterValue,
} from "./vessel.type";

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
 * Prepara os textos e tom visual do KPI de alertas de conformidade da frota.
 */
export function getFleetComplianceKpiPresentation(
  fleetKpis: FleetKpiSummary
): FleetComplianceKpiPresentation {
  const tone =
    fleetKpis.expiredCertificatesCount > 0
      ? "error"
      : fleetKpis.expiringSoonCertificatesCount > 0
        ? "warning"
        : fleetKpis.totalCount > 0 && fleetKpis.missingCertificatesCount === 0
          ? "success"
          : "neutral";

  const highlightText =
    fleetKpis.totalCount === 0
      ? "Sem registros"
      : fleetKpis.totalComplianceAlerts > 0
        ? `${fleetKpis.expiredCertificatesCount} vencido(s) · ${fleetKpis.expiringSoonCertificatesCount} em até 30d`
        : fleetKpis.missingCertificatesCount > 0
          ? `${fleetKpis.missingCertificatesCount} sem validade`
          : "Conformidade em dia";

  const detailText =
    fleetKpis.missingCertificatesCount > 0
      ? `${fleetKpis.missingCertificatesCount} certificado(s) sem data informada`
      : "Monitoramento da validade do certificado ISM";

  return {
    tone,
    highlightText,
    detailText,
  };
}

/**
 * Monta descrição dos filtros ativos para o estado vazio de busca (Figma N · 03 #5932:32022).
 */
export function buildActiveFilterSummaryText(params: {
  searchQuery: string;
  statusFilter: VesselStatusFilterValue;
  basePortFilter: string;
  complianceFilter: VesselComplianceFilterValue;
}): string {
  const { searchQuery, statusFilter, basePortFilter, complianceFilter } =
    params;
  const parts: string[] = [];

  if (searchQuery.trim()) {
    parts.push(`Busca = "${searchQuery.trim()}"`);
  }
  if (statusFilter !== "ALL") {
    const label =
      VESSEL_STATUS_FILTER_OPTIONS.find((o) => o.value === statusFilter)
        ?.label ?? statusFilter;
    parts.push(`Status = ${label}`);
  }
  if (basePortFilter !== "ALL") {
    parts.push(`Porto base = ${basePortFilter}`);
  }
  if (complianceFilter !== "ALL") {
    const label =
      VESSEL_COMPLIANCE_FILTER_OPTIONS.find(
        (o) => o.value === complianceFilter
      )?.label ?? complianceFilter;
    parts.push(`Conformidade = ${label}`);
  }

  return parts.join(", ");
}

