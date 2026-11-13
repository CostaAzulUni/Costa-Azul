import type { SelectOption } from "../../../../components";
import type { VesselSummaryDTO } from "../../../../services/vesselcreate";
import { evaluateVesselCompliance } from "./vessel.compliance";
import type { FleetKpiSummary } from "./vessel.type";

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
