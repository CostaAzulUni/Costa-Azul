import type { ChangeEvent } from "react";
import type { SelectOption } from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import type { VesselFormData } from "./vesselForm.type";


// encontra texto de exibição (label) correspondente a um valor específico em uma lista de opções do Select. Se o valor não for encontrado, retorna o próprio valor como fallback.
export function getOptionLabel(options: SelectOption[], value: string): string {
  if (!value) return "—";
  return options.find((opt) => String(opt.value) === value)?.label ?? value;
}


// formata valores numéricos para exibição, aplicando separadores de milhar e casas decimais conforme a localidade brasileira, e adicionando uma unidade opcional ao final.
export function formatMetric(
  value: number | null,
  unit?: string,
  decimals = 0
): string {
  if (value === null || Number.isNaN(value)) return "—";
  const formatted = value.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return unit ? `${formatted} ${unit}` : formatted;
}

// formata uma data no formato ISO (YYYY-MM-DD) para o formato brasileiro (DD/MM/YYYY). Se a data não estiver no formato esperado, retorna a própria string de entrada.

export function formatIsoDateBr(isoDate: string): string {
  if (!isoDate) return "—";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

/**
 * Converte um evento de input numérico em `number | null`, retornando `null` quando vazio.
 */
export function parseNullableNumber(
  event: ChangeEvent<HTMLInputElement>
): number | null {
  const raw = event.target.value;
  return raw === "" ? null : Number(raw);
}

/**
 * Mapeia os dados de `VesselResponseDTO` retornados pela API para o estado `VesselFormData` do modo de edição.
 */
export function mapVesselToFormData(vessel: VesselResponseDTO): VesselFormData {
  return {
    vesselName: vessel.vesselName ?? "",
    nationalRegistrationNumber: vessel.nationalRegistrationNumber ?? "",
    flag: vessel.flag ?? "",
    imoNumber: vessel.imoNumber ?? "",
    yearBuilt: vessel.yearBuilt ?? null,
    grossTonnage: vessel.grossTonnage ?? null,
    lengthOverall: vessel.lengthOverall ?? null,
    operatingDraft: vessel.operatingDraft ?? null,
    maxBeam: vessel.maxBeam ?? null,
    deadweightTonnage: vessel.deadweightTonnage ?? null,
    shipyard: vessel.shipyard ?? "",
    maxServiceSpeed: vessel.maxServiceSpeed ?? null,
    mainPropulsion: vessel.mainPropulsion ?? "",
    maxPassengerCapacity: vessel.maxPassengerCapacity ?? null,
    maxCrewCapacity: vessel.maxCrewCapacity ?? null,
    lifeboatTotalCapacity: vessel.lifeboatTotalCapacity ?? null,
    classificationSociety: vessel.classificationSociety ?? "",
    ismCertification: vessel.ismCertification ?? "",
    certificateExpiryDate: vessel.certificateExpiryDate
      ? vessel.certificateExpiryDate.slice(0, 10)
      : "",
    operationalStatus: vessel.operationalStatus ?? "ACTIVE",
    idHomePort: vessel.idHomePort ?? "",
    mainTerminal: vessel.mainTerminal ?? "",
    idManager: vessel.idManager ?? "",
    operationalEmail: vessel.operationalEmail ?? "",
  };
}

