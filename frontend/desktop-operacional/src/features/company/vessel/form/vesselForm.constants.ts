import type { SelectOption, WizardStep } from "../../../../components";
import type { OperationalStatusCardOption, VesselFormData } from "./vesselForm.type";


// arquivo referente a configuração do formulário de cadastro de embarcação, incluindo dados iniciais, etapas do wizard e opções de seleção para campos específicos.


// etapa inicial do forms
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
 * Definição das 6 etapas do WizardStepper
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

//define o texto do botão de próximo passo para cada etapa do wizard, permitindo que o usuário saiba qual será a próxima seção do formulário.

export const NEXT_STEP_BUTTON_LABELS: Record<number, string> = {
  0: "Continuar para Especificações",
  1: "Continuar para Capacidade",
  2: "Continuar para Conformidade",
  3: "Continuar para Base e documentos",
  4: "Revisar cadastro",
};

// opções de bandeira para o campo de seleção de bandeira da embarcação, incluindo o nome do país e o código ISO correspondente.
export const VESSEL_FLAG_OPTIONS: SelectOption[] = [
  { label: "Brasil (BRA)", value: "BR" },
  { label: "Panamá (PAN)", value: "PA" },
  { label: "Libéria (LBR)", value: "LR" },
  { label: "Bahamas (BHS)", value: "BS" },
  { label: "Portugal (PRT)", value: "PT" },
  { label: "Malta (MLT)", value: "MT" },
];

// opções de tipo de propulsão para o campo de seleção de propulsão da embarcação, incluindo diferentes tecnologias de propulsão marítima.
export const PROPULSION_TYPE_OPTIONS: SelectOption[] = [
  { label: "Diesel-Elétrica (Azipod)", value: "DIESEL_ELECTRIC" },
  { label: "Motor Diesel Marítimo Convencional", value: "DIESEL" },
  { label: "Gás Natural Liquefeito (GNL / LNG)", value: "LNG" },
  { label: "Híbrida (Diesel + Baterias)", value: "HYBRID" },
  { label: "Turbina a Gás", value: "GAS_TURBINE" },
];

// opções de sociedade classificadora para o campo de seleção de sociedade classificadora da embarcação, incluindo diferentes organizações internacionais de classificação naval.
export const CLASSIFICATION_SOCIETY_OPTIONS: SelectOption[] = [
  { label: "DNV (Det Norske Veritas)", value: "DNV" },
  { label: "Lloyd's Register (LR)", value: "LR" },
  { label: "Bureau Veritas (BV)", value: "BV" },
  { label: "American Bureau of Shipping (ABS)", value: "ABS" },
  { label: "RINA Services", value: "RINA" },
  { label: "RBNA (Registro Brasileiro de Navios)", value: "RBNA" },
];


// opção de status operacional da embarcação, incluindo diferentes estados de operação e manutenção, com cores indicativas para cada status.

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