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


// erros de validação por exemplo: Esse nome embarcação já está em uso, ou o número IMO é inválido, etc.

export type VesselFieldKey = keyof VesselFormData;
export type VesselFieldErrors = Partial<Record<VesselFieldKey, string>>; // partial porque nem todos os campos terão erro ao mesmo tempo, e o valor do erro é uma string descrevendo o problema.



// cartão do status operacional da embarcação, com descrição e cor do ponto indicador
export interface OperationalStatusCardOption {
  value: string;
  label: string;
  description: string;
  dotColor: string;
}
