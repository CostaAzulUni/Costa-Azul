import { CLASSIFICATION_SOCIETY_OPTIONS } from "./vesselForm.constants";
import type { VesselFieldErrors, VesselFieldKey, VesselFormData } from "./vesselForm.type";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const IMO_REGEX = /^\d{7}$/;
const REG_NUMBER_REGEX = /^[A-Za-z0-9.\-/]+$/;
const VALID_IACS = new Set(CLASSIFICATION_SOCIETY_OPTIONS.map((o) => String(o.value)));

export function isValidUuid(value: string): boolean {
  return UUID_REGEX.test(value.trim());
}

export function isValidImoCheckDigit(imo: string): boolean {
  if (!IMO_REGEX.test(imo)) return false;
  const sum = [7, 6, 5, 4, 3, 2].reduce((acc, w, i) => acc + Number(imo[i]) * w, 0);
  return sum % 10 === Number(imo[6]);
}

function hasMaxDecimals(value: number, max: number): boolean {
  const decimals = String(value).split(".")[1];
  return !decimals || decimals.length <= max;
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

    const cleanReg = data.nationalRegistrationNumber.trim();
    if (!cleanReg) {
      errors.nationalRegistrationNumber = "Informe o número do registro nacional.";
    } else if (!REG_NUMBER_REGEX.test(cleanReg)) {
      errors.nationalRegistrationNumber = "Use apenas letras, números, ponto (.), hífen (-) ou barra (/).";
    } else if (cleanReg.length < 5 || cleanReg.length > 30) {
      errors.nationalRegistrationNumber = "O registro nacional deve ter entre 5 e 30 caracteres.";
    }

    if (!data.flag) {
      errors.flag = "Selecione a bandeira da embarcação.";
    }

    const cleanImo = data.imoNumber.trim();
    if (!cleanImo) {
      errors.imoNumber = "Informe o número IMO.";
    } else if (!IMO_REGEX.test(cleanImo)) {
      errors.imoNumber = "O número IMO deve conter exatamente 7 dígitos numéricos.";
    } else if (!isValidImoCheckDigit(cleanImo)) {
      errors.imoNumber = "Número IMO inválido (dígito verificador incorreto).";
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
    } else if (!hasMaxDecimals(data.grossTonnage, 2)) {
      errors.grossTonnage = "A arqueação bruta deve ter até 2 casas decimais.";
    } else if (data.grossTonnage > 99999999.99) {
      errors.grossTonnage = "Valor excede o limite permitido (99.999.999,99 GT).";
    }

    if (data.lengthOverall === null || Number.isNaN(data.lengthOverall)) {
      errors.lengthOverall = "Informe o comprimento total (LOA).";
    } else if (data.lengthOverall <= 0) {
      errors.lengthOverall = "O comprimento total deve ser maior que zero.";
    } else if (!hasMaxDecimals(data.lengthOverall, 2)) {
      errors.lengthOverall = "O comprimento total deve ter até 2 casas decimais.";
    } else if (data.lengthOverall < 10 || data.lengthOverall > 450) {
      errors.lengthOverall = "O comprimento total (LOA) deve estar entre 10,00 m e 450,00 m.";
    }

    if (data.maxBeam !== null && !Number.isNaN(data.maxBeam)) {
      if (data.maxBeam <= 0) {
        errors.maxBeam = "A boca máxima deve ser maior que zero.";
      } else if (!hasMaxDecimals(data.maxBeam, 2)) {
        errors.maxBeam = "A boca máxima deve ter até 2 casas decimais.";
      } else if (data.maxBeam < 3 || data.maxBeam > 100) {
        errors.maxBeam = "A boca máxima deve estar entre 3,00 m e 100,00 m.";
      } else if (
        data.lengthOverall !== null &&
        !Number.isNaN(data.lengthOverall) &&
        data.lengthOverall > 0 &&
        data.maxBeam >= data.lengthOverall
      ) {
        errors.maxBeam = "A boca máxima deve ser inferior ao comprimento total (LOA).";
      }
    }

    if (data.operatingDraft === null || Number.isNaN(data.operatingDraft)) {
      errors.operatingDraft = "Informe o calado operacional.";
    } else if (data.operatingDraft <= 0) {
      errors.operatingDraft = "O calado operacional deve ser maior que zero.";
    } else if (!hasMaxDecimals(data.operatingDraft, 2)) {
      errors.operatingDraft = "O calado operacional deve ter até 2 casas decimais.";
    } else if (data.operatingDraft < 0.5 || data.operatingDraft > 25) {
      errors.operatingDraft = "O calado operacional deve estar entre 0,50 m e 25,00 m.";
    } else if (
      data.maxBeam !== null &&
      !Number.isNaN(data.maxBeam) &&
      data.maxBeam > 0 &&
      data.operatingDraft >= data.maxBeam
    ) {
      errors.operatingDraft = "O calado operacional deve ser inferior à boca máxima.";
    } else if (
      (data.maxBeam === null || Number.isNaN(data.maxBeam)) &&
      data.lengthOverall !== null &&
      !Number.isNaN(data.lengthOverall) &&
      data.lengthOverall > 0 &&
      data.operatingDraft >= data.lengthOverall
    ) {
      errors.operatingDraft = "O calado operacional deve ser inferior ao comprimento total (LOA).";
    }

    if (
      data.deadweightTonnage !== null &&
      !Number.isNaN(data.deadweightTonnage)
    ) {
      if (data.deadweightTonnage <= 0) {
        errors.deadweightTonnage = "O porte bruto deve ser maior que zero.";
      } else if (!hasMaxDecimals(data.deadweightTonnage, 2)) {
        errors.deadweightTonnage = "O porte bruto deve ter até 2 casas decimais.";
      } else if (data.deadweightTonnage > 99999999.99) {
        errors.deadweightTonnage = "Valor excede o limite permitido (99.999.999,99 t).";
      }
    }

    const cleanShipyard = data.shipyard.trim();
    if (!cleanShipyard) {
      errors.shipyard = "Informe o estaleiro construtor.";
    } else if (cleanShipyard.length < 2 || cleanShipyard.length > 120) {
      errors.shipyard = "O estaleiro construtor deve ter entre 2 e 120 caracteres.";
    }

    if (data.maxServiceSpeed !== null && !Number.isNaN(data.maxServiceSpeed)) {
      if (data.maxServiceSpeed < 1 || data.maxServiceSpeed > 45) {
        errors.maxServiceSpeed = "A velocidade de serviço deve estar entre 1,0 e 45,0 nós.";
      } else if (!hasMaxDecimals(data.maxServiceSpeed, 1)) {
        errors.maxServiceSpeed = "A velocidade de serviço deve ter até 1 casa decimal.";
      }
    }

    if (data.mainPropulsion.trim().length > 150) {
      errors.mainPropulsion = "A propulsão principal deve ter no máximo 150 caracteres.";
    }
  }

  if (stepIndex === 2) {
    if (
      data.maxPassengerCapacity === null ||
      Number.isNaN(data.maxPassengerCapacity)
    ) {
      errors.maxPassengerCapacity = "Informe a capacidade máxima de passageiros.";
    } else if (
      !Number.isInteger(data.maxPassengerCapacity) ||
      data.maxPassengerCapacity <= 0
    ) {
      errors.maxPassengerCapacity = "Informe um número inteiro maior que zero.";
    }

    if (data.maxCrewCapacity === null || Number.isNaN(data.maxCrewCapacity)) {
      errors.maxCrewCapacity = "Informe a capacidade máxima de tripulantes.";
    } else if (
      !Number.isInteger(data.maxCrewCapacity) ||
      data.maxCrewCapacity < 0
    ) {
      errors.maxCrewCapacity = "Informe um número inteiro igual ou maior que zero.";
    }

    if (
      data.lifeboatTotalCapacity === null ||
      Number.isNaN(data.lifeboatTotalCapacity)
    ) {
      errors.lifeboatTotalCapacity = "Informe a capacidade total de botes salva-vidas.";
    } else if (
      !Number.isInteger(data.lifeboatTotalCapacity) ||
      data.lifeboatTotalCapacity <= 0
    ) {
      errors.lifeboatTotalCapacity = "A capacidade de botes deve ser um inteiro maior que zero.";
    } else {
      const totalAboard =
        (data.maxPassengerCapacity ?? 0) + (data.maxCrewCapacity ?? 0);
      if (totalAboard > 0 && data.lifeboatTotalCapacity < totalAboard) {
        errors.lifeboatTotalCapacity = `Pela regra SOLAS, a capacidade de botes deve ser no mínimo ${totalAboard.toLocaleString("pt-BR")} pessoas (passageiros + tripulantes).`;
      }
    }
  }

  if (stepIndex === 3) {
    const cleanSociety = data.classificationSociety.trim();
    if (!cleanSociety) {
      errors.classificationSociety = "Selecione a classificadora naval (IACS).";
    } else if (cleanSociety.length > 60 || !VALID_IACS.has(cleanSociety)) {
      errors.classificationSociety = "Selecione uma sociedade classificadora membro da IACS válida.";
    }

    if (!data.ismCertification.trim()) {
      errors.ismCertification = "Informe a certificação Código ISM.";
    } else if (data.ismCertification.trim().length > 150) {
      errors.ismCertification = "A certificação ISM deve ter no máximo 150 caracteres.";
    }

    if (!data.certificateExpiryDate) {
      errors.certificateExpiryDate = "Informe a data de validade do certificado.";
    } else {
      const expiryYear = Number(data.certificateExpiryDate.split("-")[0]);
      if (Number.isNaN(Date.parse(data.certificateExpiryDate)) || Number.isNaN(expiryYear)) {
        errors.certificateExpiryDate = "Informe uma data de validade válida.";
      } else if (
        data.yearBuilt !== null &&
        !Number.isNaN(data.yearBuilt) &&
        data.yearBuilt >= 1900 &&
        expiryYear < data.yearBuilt
      ) {
        errors.certificateExpiryDate = `A validade não pode ser anterior ao ano de fabricação (${data.yearBuilt}).`;
      }
    }

    if (!data.operationalStatus) {
      errors.operationalStatus = "Selecione o status operacional inicial.";
    }
  }

  if (stepIndex === 4) {
    if (data.idHomePort.trim() && !isValidUuid(data.idHomePort)) {
      errors.idHomePort = "O identificador do porto base deve ser um UUID válido.";
    }

    if (data.mainTerminal.trim().replace(/\s+/g, " ").length > 100) {
      errors.mainTerminal = "O terminal principal deve ter no máximo 100 caracteres.";
    }

    if (data.idManager.trim() && !isValidUuid(data.idManager)) {
      errors.idManager = "O identificador do gerente deve ser um UUID válido.";
    }

    if (!data.operationalEmail.trim()) {
      errors.operationalEmail = "Informe o e-mail operacional da embarcação.";
    } else if (data.operationalEmail.trim().length > 255) {
      errors.operationalEmail = "O e-mail operacional deve ter no máximo 255 caracteres.";
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

/**
 * Executa a validação de todas as etapas obrigatórias (0 a 4), consolidando os erros
 * e identificando o índice da primeira etapa inválida.
 */
export function validateAllVesselSteps(data: VesselFormData): {
  allErrors: VesselFieldErrors;
  firstInvalidStep: number | null;
} {
  let allErrors: VesselFieldErrors = {};
  let firstInvalidStep: number | null = null;

  for (let step = 0; step <= 4; step += 1) {
    const stepErrors = validateVesselStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      allErrors = { ...allErrors, ...stepErrors };
      if (firstInvalidStep === null) {
        firstInvalidStep = step;
      }
    }
  }

  return { allErrors, firstInvalidStep };
}

export function syncVesselErrors(
  prevErrors: VesselFieldErrors,
  data: VesselFormData
): VesselFieldErrors {
  const { allErrors } = validateAllVesselSteps(data);
  const nextErrors: VesselFieldErrors = {};
  for (const key of Object.keys(data) as VesselFieldKey[]) {
    const isFilled = data[key] !== null && String(data[key]).trim() !== "";
    if (allErrors[key] && (key in prevErrors || isFilled)) {
      nextErrors[key] = allErrors[key];
    }
  }
  return nextErrors;
}

