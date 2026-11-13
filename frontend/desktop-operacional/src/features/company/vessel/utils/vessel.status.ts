import type { VesselStatusDisplay } from "./vessel.type"

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