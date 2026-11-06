import { Alert, Input, SectionCard, Select } from "../../../../components";
import {
  CLASSIFICATION_SOCIETY_OPTIONS,
  OPERATIONAL_STATUS_OPTIONS,
  type VesselFieldErrors,
  type VesselFieldKey,
  type VesselFormData,
} from "../vesselFormConfig";

export interface VesselCertificationProps {
  formData: VesselFormData;
  errors: VesselFieldErrors;
  onFieldChange: <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => void;
}

export function VesselCertification({
  formData,
  errors,
  onFieldChange,
}: VesselCertificationProps) {
  return (
    <div className="vessel-step-stack">
      <SectionCard
        title="Classificação e certificações"
        subtitle="Classificadora e Código ISM"
        icon="pi-shield"
      >
        <div className="vessel-form-grid vessel-form-grid--3cols">
          <Select
            id="classificationSociety"
            label="Classificadora naval (IACS)"
            required
            size="lg"
            value={formData.classificationSociety}
            errorMessage={errors.classificationSociety}
            options={CLASSIFICATION_SOCIETY_OPTIONS}
            onChange={(e) =>
              onFieldChange("classificationSociety", e.target.value)
            }
            placeholder="Selecione a classificadora"
          />

          <Input
            id="ismCertification"
            label="Certificação Código ISM"
            required
            size="lg"
            value={formData.ismCertification}
            errorMessage={errors.ismCertification}
            onChange={(e) => onFieldChange("ismCertification", e.target.value)}
            placeholder="Ex.: DOC/SMC nº 3310-SMC-BR"
          />

          <Input
            id="certificateExpiryDate"
            label="Validade do certificado"
            required
            size="lg"
            type="date"
            value={formData.certificateExpiryDate}
            errorMessage={errors.certificateExpiryDate}
            onChange={(e) =>
              onFieldChange("certificateExpiryDate", e.target.value)
            }
            helperText="Alertas 60, 30 e 15 dias antes."
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Status operacional inicial"
        subtitle="Obrigatório · pode ser alterado depois na ficha da embarcação"
        icon="pi-wrench"
      >
        <div
          className="vessel-status-grid"
          role="radiogroup"
          aria-label="Status operacional inicial"
        >
          {OPERATIONAL_STATUS_OPTIONS.map((option) => {
            const isSelected = formData.operationalStatus === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={isSelected}
                className={`vessel-status-card ${
                  isSelected ? "vessel-status-card--selected" : ""
                }`}
                onClick={() => onFieldChange("operationalStatus", option.value)}
              >
                <span
                  className={`vessel-status-card__radio ${
                    isSelected ? "vessel-status-card__radio--checked" : ""
                  }`}
                  aria-hidden="true"
                >
                  {isSelected && (
                    <span className="vessel-status-card__radio-dot" />
                  )}
                </span>

                <span className="vessel-status-card__body">
                  <span className="vessel-status-card__title-row">
                    <span
                      className="vessel-status-card__status-dot"
                      style={{ backgroundColor: option.dotColor }}
                      aria-hidden="true"
                    />
                    <span className="vessel-status-card__title">
                      {option.label}
                    </span>
                  </span>
                  <span className="vessel-status-card__desc">
                    {option.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      <Alert
        variant="info"
        title="Os demais certificados entram na ficha"
        description="SOLAS, ISPS, MARPOL e MLC podem ser anexados na aba Certificações depois do cadastro."
      />
    </div>
  );
}
