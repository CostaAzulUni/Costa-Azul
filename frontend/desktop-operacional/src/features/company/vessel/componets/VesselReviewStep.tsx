import { Alert, Button, SectionCard } from "../../../../components";
import { CLASSIFICATION_SOCIETY_OPTIONS, formatIsoDateBr, formatMetric, getOptionLabel, isVesselStepValid, OPERATIONAL_STATUS_OPTIONS, PROPULSION_TYPE_OPTIONS, VESSEL_FLAG_OPTIONS, VESSEL_WIZARD_STEPS, type VesselFormData } from "../form";

export interface VesselReviewStepProps {
  formData: VesselFormData;
  documentsCount: number;
  onEditStep: (stepIndex: number) => void;
}

export function VesselReviewStep({
  formData,
  documentsCount,
  onEditStep,
}: VesselReviewStepProps) {
  const statusLabel =
    OPERATIONAL_STATUS_OPTIONS.find(
      (opt) => opt.value === formData.operationalStatus
    )?.label ?? "—";

  const documentsSummary =
    documentsCount > 0
      ? `${documentsCount} arquivo(s) anexado(s)`
      : "Nenhum arquivo anexado · 1 recomendado pendente";

  const pendingSteps = [0, 1, 2, 3, 4]
    .filter((stepIndex) => !isVesselStepValid(stepIndex, formData))
    .map((stepIndex) => ({
      index: stepIndex,
      title: VESSEL_WIZARD_STEPS[stepIndex].title,
    }));

  const isReadyToSubmit = pendingSteps.length === 0;

  return (
    <div className="vessel-step-stack">
      {isReadyToSubmit ? (
        <Alert
          variant="success"
          title="Cadastro pronto para envio"
          description="Todos os campos obrigatórios das etapas anteriores foram validados. Confira os dados abaixo antes de cadastrar."
        />
      ) : (
        <Alert
          variant="warning"
          title="Existem etapas com campos obrigatórios pendentes"
          description={`Preencha todas as informações obrigatórias nas etapas pendentes (${pendingSteps.map((s) => s.title).join(", ")}) antes de concluir o cadastro.`}
          actionLabel={`Ir para ${pendingSteps[0].title}`}
          onAction={() => onEditStep(pendingSteps[0].index)}
        />
      )}

      <SectionCard
        title="Identificação"
        icon="pi-compass"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon="pi-pencil"
            onClick={() => onEditStep(0)}
          >
            Editar
          </Button>
        }
      >
        <div className="vessel-review-grid">
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Nome oficial</span>
            <span className="vessel-review-item__value">
              {formData.vesselName.trim() || "—"}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Registro nacional</span>
            <span className="vessel-review-item__value">
              {formData.nationalRegistrationNumber.trim() || "—"}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Número IMO</span>
            <span className="vessel-review-item__value">
              {formData.imoNumber.trim() || "—"}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Bandeira</span>
            <span className="vessel-review-item__value">
              {getOptionLabel(VESSEL_FLAG_OPTIONS, formData.flag)}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Ano de fabricação</span>
            <span className="vessel-review-item__value">
              {formData.yearBuilt ?? "—"}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">
              Empresa responsável
            </span>
            <span className="vessel-review-item__value">
              Costa Azul Cruzeiros (Automático)
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Especificações"
        icon="pi-sliders-h"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon="pi-pencil"
            onClick={() => onEditStep(1)}
          >
            Editar
          </Button>
        }
      >
        <div className="vessel-review-grid">
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">
              Arqueação bruta (GT)
            </span>
            <span className="vessel-review-item__value">
              {formatMetric(formData.grossTonnage, "GT")}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Comprimento (LOA)</span>
            <span className="vessel-review-item__value">
              {formatMetric(formData.lengthOverall, "m", 2)}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">
              Calado operacional
            </span>
            <span className="vessel-review-item__value">
              {formatMetric(formData.operatingDraft, "m", 2)}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">
              Boca máx. / Porte bruto
            </span>
            <span className="vessel-review-item__value">
              {`${formatMetric(formData.maxBeam, "m", 2)} · ${formatMetric(formData.deadweightTonnage, "t")}`}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Estaleiro</span>
            <span className="vessel-review-item__value">
              {formData.shipyard.trim() || "—"}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">
              Velocidade / Propulsão
            </span>
            <span className="vessel-review-item__value">
              {`${formatMetric(formData.maxServiceSpeed, "nós", 1)} · ${getOptionLabel(PROPULSION_TYPE_OPTIONS, formData.mainPropulsion)}`}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Capacidade"
        icon="pi-users"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon="pi-pencil"
            onClick={() => onEditStep(2)}
          >
            Editar
          </Button>
        }
      >
        <div className="vessel-review-grid">
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Passageiros</span>
            <span className="vessel-review-item__value">
              {formatMetric(formData.maxPassengerCapacity, "pessoas")}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Tripulação</span>
            <span className="vessel-review-item__value">
              {formatMetric(formData.maxCrewCapacity, "pessoas")}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Salvatagem</span>
            <span className="vessel-review-item__value">
              {formatMetric(formData.lifeboatTotalCapacity, "pessoas")}
            </span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Conformidade"
        icon="pi-shield"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon="pi-pencil"
            onClick={() => onEditStep(3)}
          >
            Editar
          </Button>
        }
      >
        <div className="vessel-review-grid">
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Classificadora</span>
            <span className="vessel-review-item__value">
              {getOptionLabel(
                CLASSIFICATION_SOCIETY_OPTIONS,
                formData.classificationSociety
              )}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">
              Código ISM / Validade
            </span>
            <span className="vessel-review-item__value">
              {`${formData.ismCertification.trim() || "—"} · ${formatIsoDateBr(formData.certificateExpiryDate)}`}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Status inicial</span>
            <span className="vessel-review-item__value">{statusLabel}</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard
        title="Base e documentos"
        icon="pi-map-marker"
        actions={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            icon="pi-pencil"
            onClick={() => onEditStep(4)}
          >
            Editar
          </Button>
        }
      >
        <div className="vessel-review-grid">
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">
              Terminal / Berço principal
            </span>
            <span className="vessel-review-item__value">
              {formData.mainTerminal.trim() || "—"}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">
              E-mail operacional
            </span>
            <span className="vessel-review-item__value">
              {formData.operationalEmail.trim() || "—"}
            </span>
          </div>
          <div className="vessel-review-item">
            <span className="vessel-review-item__label">Documentos</span>
            <span className="vessel-review-item__value">
              {documentsSummary}
            </span>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
