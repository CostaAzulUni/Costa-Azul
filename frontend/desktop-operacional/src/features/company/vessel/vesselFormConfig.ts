import type { SelectOption, WizardStep } from "../../../components";

/**
 * Estado unificado do formulário de cadastro de embarcação.
 * Reflete fielmente os campos do contrato `VesselRequestDTO` (backend Java / PostgreSQL `vessel.vessel`).
 */
export interface VesselFormData {
  // Etapa 1 — Identificação
  vesselName: string;
  nationalRegistrationNumber: string;
  flag: string;
  imoNumber: string;
  yearBuilt: number | null;

  // Etapa 2 — Especificações Técnicas
  grossTonnage: number | null;
  lengthOverall: number | null;
  operatingDraft: number | null;
  maxBeam: number | null;
  deadweightTonnage: number | null;
  shipyard: string;
  maxServiceSpeed: number | null;
  mainPropulsion: string;

  // Etapa 3 — Capacidade e Acomodação
  maxPassengerCapacity: number | null;
  maxCrewCapacity: number | null;
  lifeboatTotalCapacity: number | null;

  // Etapa 4 — Conformidade e Status Inicial
  classificationSociety: string;
  ismCertification: string;
  certificateExpiryDate: string;
  operationalStatus: string;

  // Etapa 5 — Base Operacional e Gestão
  idHomePort: string;
  mainTerminal: string;
  idManager: string;
  operationalEmail: string;
}

export type VesselFieldKey = keyof VesselFormData;
export type VesselFieldErrors = Partial<Record<VesselFieldKey, string>>;

export const INITIAL_VESSEL_FORM_DATA: VesselFormData = {
  vesselName: "",
  nationalRegistrationNumber: "",
  flag: "",
  imoNumber: "",
  yearBuilt: null,
  grossTonnage: null,
  lengthOverall: null,
  operatingDraft: null,
  maxBeam: null,
  deadweightTonnage: null,
  shipyard: "",
  maxServiceSpeed: null,
  mainPropulsion: "",
  maxPassengerCapacity: null,
  maxCrewCapacity: null,
  lifeboatTotalCapacity: null,
  classificationSociety: "",
  ismCertification: "",
  certificateExpiryDate: "",
  operationalStatus: "ACTIVE",
  idHomePort: "",
  mainTerminal: "",
  idManager: "",
  operationalEmail: "",
};

/**
 * Definição das 6 etapas do WizardStepper (Figma #5932:32057).
 * Os títulos não repetem o número porque o indicador circular do WizardStepper já o exibe.
 */
export const VESSEL_WIZARD_STEPS: WizardStep[] = [
  { id: "identificacao", title: "Identificação" },
  { id: "especificacoes", title: "Especificações" },
  { id: "capacidade", title: "Capacidade" },
  { id: "conformidade", title: "Conformidade" },
  { id: "base-documentos", title: "Base e documentos" },
  { id: "revisao", title: "Revisão" },
];

export const NEXT_STEP_BUTTON_LABELS: Record<number, string> = {
  0: "Continuar para Especificações",
  1: "Continuar para Capacidade",
  2: "Continuar para Conformidade",
  3: "Continuar para Base e documentos",
  4: "Revisar cadastro",
};

export const VESSEL_FLAG_OPTIONS: SelectOption[] = [
  { label: "Brasil (BRA)", value: "BR" },
  { label: "Panamá (PAN)", value: "PA" },
  { label: "Libéria (LBR)", value: "LR" },
  { label: "Bahamas (BHS)", value: "BS" },
  { label: "Portugal (PRT)", value: "PT" },
  { label: "Malta (MLT)", value: "MT" },
];

export const PROPULSION_TYPE_OPTIONS: SelectOption[] = [
  { label: "Diesel-Elétrica (Azipod)", value: "DIESEL_ELECTRIC" },
  { label: "Motor Diesel Marítimo Convencional", value: "DIESEL" },
  { label: "Gás Natural Liquefeito (GNL / LNG)", value: "LNG" },
  { label: "Híbrida (Diesel + Baterias)", value: "HYBRID" },
  { label: "Turbina a Gás", value: "GAS_TURBINE" },
];

export const CLASSIFICATION_SOCIETY_OPTIONS: SelectOption[] = [
  { label: "DNV (Det Norske Veritas)", value: "DNV" },
  { label: "Lloyd's Register (LR)", value: "LR" },
  { label: "Bureau Veritas (BV)", value: "BV" },
  { label: "American Bureau of Shipping (ABS)", value: "ABS" },
  { label: "RINA Services", value: "RINA" },
  { label: "RBNA (Registro Brasileiro de Navios)", value: "RBNA" },
];

export interface OperationalStatusCardOption {
  value: string;
  label: string;
  description: string;
  dotColor: string;
}

export const OPERATIONAL_STATUS_OPTIONS: OperationalStatusCardOption[] = [
  {
    value: "ACTIVE",
    label: "Em operação",
    description: "Disponível para programar viagens.",
    dotColor: "var(--color-success-500)",
  },
  {
    value: "MAINTENANCE",
    label: "Em manutenção",
    description: "Ainda em preparação ou docagem.",
    dotColor: "var(--color-warning-500)",
  },
  {
    value: "INACTIVE",
    label: "Fora de serviço",
    description: "Cadastrada, mas fora da frota ativa.",
    dotColor: "var(--color-gray-500)",
  },
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMO_REGEX = /^\d{7}$/;

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

/**
 * Valida os campos de uma etapa específica (0 a 4) de acordo com as regras da interface
 * e as constraints do banco de dados (`V2__vessel.sql` e `Vessel.java`).
 */
export function validateVesselStep(
  stepIndex: number,
  data: VesselFormData
): VesselFieldErrors {
  const errors: VesselFieldErrors = {};

  if (stepIndex === 0) {
    if (!data.vesselName.trim()) {
      errors.vesselName = "Informe o nome oficial da embarcação.";
    } else if (data.vesselName.trim().length > 150) {
      errors.vesselName = "O nome deve ter no máximo 150 caracteres.";
    }

    if (!data.nationalRegistrationNumber.trim()) {
      errors.nationalRegistrationNumber =
        "Informe o número do registro nacional.";
    } else if (data.nationalRegistrationNumber.trim().length > 150) {
      errors.nationalRegistrationNumber =
        "O registro deve ter no máximo 150 caracteres.";
    }

    if (!data.flag) {
      errors.flag = "Selecione a bandeira da embarcação.";
    }

    const cleanImo = data.imoNumber.trim();
    if (!cleanImo) {
      errors.imoNumber = "Informe o número IMO.";
    } else if (!IMO_REGEX.test(cleanImo)) {
      errors.imoNumber = "O número IMO deve conter exatamente 7 dígitos numéricos.";
    }

    if (data.yearBuilt === null || Number.isNaN(data.yearBuilt)) {
      errors.yearBuilt = "Informe o ano de fabricação.";
    } else if (
      !Number.isInteger(data.yearBuilt) ||
      data.yearBuilt < 1900 ||
      data.yearBuilt > 2100
    ) {
      errors.yearBuilt = "O ano de fabricação deve estar entre 1900 e 2100.";
    }
  }

  if (stepIndex === 1) {
    if (data.grossTonnage === null || Number.isNaN(data.grossTonnage)) {
      errors.grossTonnage = "Informe a arqueação bruta (GT).";
    } else if (data.grossTonnage <= 0) {
      errors.grossTonnage = "A arqueação bruta deve ser maior que zero.";
    } else if (data.grossTonnage > 99999999.99) {
      errors.grossTonnage = "Valor excede o limite permitido (99.999.999,99 GT).";
    }

    if (data.lengthOverall === null || Number.isNaN(data.lengthOverall)) {
      errors.lengthOverall = "Informe o comprimento total (LOA).";
    } else if (data.lengthOverall <= 0) {
      errors.lengthOverall = "O comprimento total deve ser maior que zero.";
    } else if (data.lengthOverall > 99999.99) {
      errors.lengthOverall = "Valor excede o limite permitido (99.999,99 m).";
    }

    if (data.operatingDraft === null || Number.isNaN(data.operatingDraft)) {
      errors.operatingDraft = "Informe o calado operacional.";
    } else if (data.operatingDraft <= 0) {
      errors.operatingDraft = "O calado operacional deve ser maior que zero.";
    } else if (data.operatingDraft > 999.99) {
      errors.operatingDraft = "Valor excede o limite permitido (999,99 m).";
    }

    if (data.maxBeam !== null && !Number.isNaN(data.maxBeam)) {
      if (data.maxBeam <= 0) {
        errors.maxBeam = "A boca máxima deve ser maior que zero.";
      } else if (data.maxBeam > 9999.99) {
        errors.maxBeam = "Valor excede o limite permitido (9.999,99 m).";
      }
    }

    if (
      data.deadweightTonnage !== null &&
      !Number.isNaN(data.deadweightTonnage)
    ) {
      if (data.deadweightTonnage <= 0) {
        errors.deadweightTonnage = "O porte bruto deve ser maior que zero.";
      } else if (data.deadweightTonnage > 99999999.99) {
        errors.deadweightTonnage =
          "Valor excede o limite permitido (99.999.999,99 t).";
      }
    }

    if (!data.shipyard.trim()) {
      errors.shipyard = "Informe o estaleiro construtor.";
    } else if (data.shipyard.trim().length > 150) {
      errors.shipyard = "O estaleiro deve ter no máximo 150 caracteres.";
    }

    if (data.maxServiceSpeed !== null && !Number.isNaN(data.maxServiceSpeed)) {
      if (data.maxServiceSpeed <= 0) {
        errors.maxServiceSpeed = "A velocidade máxima deve ser maior que zero.";
      } else if (data.maxServiceSpeed > 999.9) {
        errors.maxServiceSpeed = "Valor excede o limite permitido (999,9 nós).";
      }
    }
  }

  if (stepIndex === 2) {
    if (
      data.maxPassengerCapacity === null ||
      Number.isNaN(data.maxPassengerCapacity)
    ) {
      errors.maxPassengerCapacity =
        "Informe a capacidade máxima de passageiros.";
    } else if (
      !Number.isInteger(data.maxPassengerCapacity) ||
      data.maxPassengerCapacity <= 0
    ) {
      errors.maxPassengerCapacity =
        "Informe um número inteiro maior que zero.";
    }

    if (data.maxCrewCapacity === null || Number.isNaN(data.maxCrewCapacity)) {
      errors.maxCrewCapacity = "Informe a capacidade máxima de tripulantes.";
    } else if (
      !Number.isInteger(data.maxCrewCapacity) ||
      data.maxCrewCapacity < 0
    ) {
      errors.maxCrewCapacity =
        "Informe um número inteiro igual ou maior que zero.";
    }

    if (
      data.lifeboatTotalCapacity === null ||
      Number.isNaN(data.lifeboatTotalCapacity)
    ) {
      errors.lifeboatTotalCapacity =
        "Informe a capacidade total de botes salva-vidas.";
    } else if (
      !Number.isInteger(data.lifeboatTotalCapacity) ||
      data.lifeboatTotalCapacity <= 0
    ) {
      errors.lifeboatTotalCapacity =
        "A capacidade de botes deve ser um inteiro maior que zero.";
    } else {
      const totalAboard =
        (data.maxPassengerCapacity ?? 0) + (data.maxCrewCapacity ?? 0);
      if (totalAboard > 0 && data.lifeboatTotalCapacity < totalAboard) {
        errors.lifeboatTotalCapacity = `Pela regra SOLAS, a capacidade de botes deve ser no mínimo ${totalAboard.toLocaleString("pt-BR")} pessoas (passageiros + tripulantes).`;
      }
    }
  }

  if (stepIndex === 3) {
    if (!data.classificationSociety) {
      errors.classificationSociety = "Selecione a classificadora naval (IACS).";
    }

    if (!data.ismCertification.trim()) {
      errors.ismCertification = "Informe a certificação Código ISM.";
    } else if (data.ismCertification.trim().length > 150) {
      errors.ismCertification =
        "A certificação ISM deve ter no máximo 150 caracteres.";
    }

    if (!data.certificateExpiryDate) {
      errors.certificateExpiryDate = "Informe a data de validade do certificado.";
    }

    if (!data.operationalStatus) {
      errors.operationalStatus = "Selecione o status operacional inicial.";
    }
  }

  if (stepIndex === 4) {
    if (data.idHomePort.trim() && !isValidUuid(data.idHomePort)) {
      errors.idHomePort =
        "O identificador do porto base deve ser um UUID válido.";
    }

    if (data.mainTerminal.trim().length > 150) {
      errors.mainTerminal =
        "O terminal principal deve ter no máximo 150 caracteres.";
    }

    if (data.idManager.trim() && !isValidUuid(data.idManager)) {
      errors.idManager =
        "O identificador do gerente deve ser um UUID válido.";
    }

    if (!data.operationalEmail.trim()) {
      errors.operationalEmail = "Informe o e-mail operacional da embarcação.";
    } else if (data.operationalEmail.trim().length > 255) {
      errors.operationalEmail =
        "O e-mail operacional deve ter no máximo 255 caracteres.";
    } else if (!EMAIL_REGEX.test(data.operationalEmail.trim())) {
      errors.operationalEmail = "Informe um endereço de e-mail válido.";
    }
  }

  return errors;
}

/**
 * Determina se uma etapa de preenchimento (0 a 4) está concluída (válida)
 * exclusivamente a partir dos dados preenchidos e validados.
 * A etapa 5 (Revisão) retorna `false` durante a edição para permanecer como
 * "Pendente" quando não visualizada e "Em andamento" quando visualizada.
 */
export function isVesselStepValid(
  stepIndex: number,
  data: VesselFormData
): boolean {
  if (stepIndex >= 0 && stepIndex <= 4) {
    return Object.keys(validateVesselStep(stepIndex, data)).length === 0;
  }

  return false;
}

/**
 * Retorna a quantidade de etapas de dados (0 a 4) efetivamente concluídas/válidas.
 * Usado pela barra de progresso para refletir o progresso real de preenchimento (0% a 83%).
 */
export function getCompletedVesselStepsCount(data: VesselFormData): number {
  return [0, 1, 2, 3, 4].filter((stepIndex) =>
    isVesselStepValid(stepIndex, data)
  ).length;
}

/**
 * Verifica se todas as 5 etapas obrigatórias de dados (0 a 4) estão válidas.
 */
export function areAllVesselStepsValid(data: VesselFormData): boolean {
  return getCompletedVesselStepsCount(data) === 5;
}

export function getOptionLabel(options: SelectOption[], value: string): string {
  if (!value) return "—";
  return options.find((opt) => String(opt.value) === value)?.label ?? value;
}

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

export function formatIsoDateBr(isoDate: string): string {
  if (!isoDate) return "—";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}
