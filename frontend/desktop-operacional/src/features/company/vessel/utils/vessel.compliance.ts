import { formatIsoDateBr } from "../form";
import type { VesselComplianceEvaluation } from "./vessel.type";

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