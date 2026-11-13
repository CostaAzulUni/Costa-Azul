import { CLASSIFICATION_SOCIETY_OPTIONS, getOptionLabel, PROPULSION_TYPE_OPTIONS, VESSEL_FLAG_OPTIONS } from "../form";

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