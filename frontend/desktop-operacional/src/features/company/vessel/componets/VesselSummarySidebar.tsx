import { getCompletedVesselStepsCount, getOptionLabel, VESSEL_FLAG_OPTIONS, type VesselFormData } from "../form";


export interface VesselSummarySidebarProps {
  formData: VesselFormData;
  photoPreview: string | null;
  currentStep: number;
  totalSteps: number;
}

export function VesselSummarySidebar({
  formData,
  photoPreview,
  currentStep,
  totalSteps,
}: VesselSummarySidebarProps) {
  const completedStepsCount = getCompletedVesselStepsCount(formData);
  const progressPercent =
    totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;
  const selectedFlagLabel = formData.flag
    ? getOptionLabel(VESSEL_FLAG_OPTIONS, formData.flag)
    : "—";

  return (
    <aside className="vessel-side-column" aria-label="Resumo do cadastro">
      {/* Card · Resumo (#5932:32141) */}
      <div className="vessel-summary-card">
        <div className="vessel-summary-card__banner">
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Pré-visualização da embarcação"
              className="vessel-summary-card__banner-img"
            />
          ) : (
            <i
              className="pi pi-compass vessel-summary-card__banner-icon"
              aria-hidden="true"
            />
          )}
        </div>

        <div className="vessel-summary-card__identity">
          <h2 className="vessel-summary-card__name">
            {formData.vesselName.trim() || "Nova embarcação"}
          </h2>
          <p className="vessel-summary-card__meta">
            IMO {formData.imoNumber.trim() || "—"} · Bandeira:{" "}
            {selectedFlagLabel}
          </p>
        </div>

        <div className="vessel-summary-card__progress">
          <div className="vessel-summary-card__progress-row">
            <span className="vessel-summary-card__progress-step">
              Etapa {currentStep + 1} de {totalSteps}
            </span>
            <span className="vessel-summary-card__progress-pct">
              {progressPercent}% concluído
            </span>
          </div>
          <div
            className="vessel-summary-card__progress-track"
            role="progressbar"
            aria-label="Progresso das etapas do cadastro"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="vessel-summary-card__progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card · Calculados (#5932:32152) */}
      <div className="vessel-calculated-card">
        <div className="vessel-calculated-card__header">
          <i className="pi pi-info-circle" aria-hidden="true" />
          <h3 className="vessel-calculated-card__title">
            Preenchidos pelo sistema
          </h3>
        </div>

        <dl className="vessel-calculated-card__list">
          <div className="vessel-calculated-card__row">
            <dt>Empresa responsável</dt>
            <dd>Empresa do seu login</dd>
          </div>
          <div className="vessel-calculated-card__row">
            <dt>Número de conveses</dt>
            <dd>Ao cadastrar conveses</dd>
          </div>
          <div className="vessel-calculated-card__row">
            <dt>Número de áreas</dt>
            <dd>Ao cadastrar áreas</dd>
          </div>
          <div className="vessel-calculated-card__row">
            <dt>Total de cabines</dt>
            <dd>Ao cadastrar cabines</dd>
          </div>
        </dl>
      </div>
    </aside>
  );
}
