import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import { formatMetric } from "../form";
import { evaluateVesselCompliance } from "./vessel.compliance";
import type { VesselProfileReadiness, VesselProfileReadinessItem } from "./vessel.type";

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