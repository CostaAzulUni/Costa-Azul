import type { TabItem } from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import { formatMetric } from "../form";
import { evaluateVesselCompliance } from "./vessel.compliance";
import { formatClassificationDisplay } from "./vessel.formatters";
import type {
  CertificateFilterType,
  StatutoryCertificateRow,
  VesselComplianceEvaluation,
  VesselDerivedMetrics,
  VesselProfileReadiness,
  VesselProfileReadinessItem,
} from "./vessel.type";

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

/**
 * Monta as abas da ficha da embarcação (Figma #5932:33231 — E · 01 a E · 08).
 */
export function buildVesselDetailTabs(
  vessel: VesselResponseDTO | null,
  compliance: VesselComplianceEvaluation
): TabItem[] {
  const deckCount = vessel?.deckCount ?? 0;
  const certCount = vessel?.ismCertification ? 1 : 0;
  const hasCertAlert =
    compliance.state === "expired" || compliance.state === "expiring_soon";

  return [
    { id: "visao-geral", label: "Visão geral" },
    { id: "especificacoes", label: "Especificações" },
    { id: "capacidade", label: "Capacidade" },
    {
      id: "conveses-areas",
      label: "Conveses & áreas",
      count: deckCount,
    },
    {
      id: "certificacoes",
      label: "Certificações",
      count: certCount,
      countTone: hasCertAlert ? "warning" : "neutral",
    },
    { id: "documentos", label: "Documentos" },
    { id: "viagens", label: "Viagens" },
    { id: "historico", label: "Histórico" },
  ];
}

/**
 * Monta as linhas reais de certificado ISM para a tabela da Aba 05 (E · 05).
 */
export function buildStatutoryCertificateRows(
  vessel: VesselResponseDTO | null,
  compliance: VesselComplianceEvaluation
): StatutoryCertificateRow[] {
  if (!vessel || !vessel.ismCertification?.trim()) return [];
  const hasAlert =
    compliance.state === "expired" ||
    compliance.state === "expiring_soon" ||
    compliance.state === "missing";

  return [
    {
      id: `ism-${vessel.idVessel}`,
      certificateName: "Certificado de Gestão de Segurança (Código ISM)",
      code: vessel.ismCertification,
      issuer: formatClassificationDisplay(vessel.classificationSociety),
      expiryFormatted: compliance.expiryFormatted,
      statusLabel: compliance.shortLabel,
      badgeTone: compliance.badgeTone,
      hasAlert,
    },
  ];
}

/**
 * Filtra as linhas de certificados estatutários conforme o filtro selecionado na Aba 05.
 */
export function filterStatutoryCertificateRows(
  rows: StatutoryCertificateRow[],
  filter: CertificateFilterType
): StatutoryCertificateRow[] {
  if (filter === "ALERT") {
    return rows.filter((row) => row.hasAlert);
  }
  if (filter === "VALID") {
    return rows.filter((row) => !row.hasAlert);
  }
  return rows;
}

/**
 * Calcula as métricas derivadas de especificações (E · 02) e capacidade/SOLAS (E · 03).
 */
export function calculateVesselDerivedMetrics(
  vessel: VesselResponseDTO
): VesselDerivedMetrics {
  const loaBeamRatio =
    vessel.lengthOverall &&
    vessel.maxBeam &&
    vessel.lengthOverall > 0 &&
    vessel.maxBeam > 0
      ? `${(vessel.lengthOverall / vessel.maxBeam).toLocaleString("pt-BR", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1,
        })} : 1`
      : "—";

  const gtPerPassenger =
    vessel.grossTonnage &&
    vessel.maxPassengerCapacity &&
    vessel.grossTonnage > 0 &&
    vessel.maxPassengerCapacity > 0
      ? `${(vessel.grossTonnage / vessel.maxPassengerCapacity).toLocaleString(
          "pt-BR",
          {
            minimumFractionDigits: 1,
            maximumFractionDigits: 1,
          }
        )} GT/pass.`
      : "—";

  const currentYear = new Date().getFullYear();
  const vesselAgeText =
    vessel.yearBuilt && vessel.yearBuilt <= currentYear
      ? `${currentYear - vessel.yearBuilt} ${
          currentYear - vessel.yearBuilt === 1 ? "ano" : "anos"
        } (construída em ${vessel.yearBuilt})`
      : vessel.yearBuilt
        ? `Ano ${vessel.yearBuilt}`
        : "—";

  const totalAboard =
    (vessel.maxPassengerCapacity ?? 0) + (vessel.maxCrewCapacity ?? 0);
  const lifeboatCap = vessel.lifeboatTotalCapacity ?? 0;
  const lifeboatCoveragePct =
    totalAboard > 0 && lifeboatCap > 0
      ? Math.round((lifeboatCap / totalAboard) * 100)
      : null;

  return {
    loaBeamRatio,
    gtPerPassenger,
    vesselAgeText,
    totalAboard,
    lifeboatCap,
    lifeboatCoveragePct,
  };
}
