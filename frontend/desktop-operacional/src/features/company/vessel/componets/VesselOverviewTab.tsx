import { Alert, Badge, Button, Input, SectionCard, Select } from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import { OPERATIONAL_STATUS_OPTIONS, parseNullableNumber, VESSEL_FLAG_OPTIONS, type VesselFieldErrors, type VesselFieldKey, type VesselFormData } from "../form";
import { formatClassificationDisplay, formatDateTimeBr, formatFlagDisplay, getVesselStatusDisplay, type VesselComplianceEvaluation, type VesselProfileReadiness } from "../utils";

export interface VesselOverviewTabProps {
  vessel: VesselResponseDTO;
  compliance: VesselComplianceEvaluation;
  readiness: VesselProfileReadiness | null;
  isEditing: boolean;
  editFormData: VesselFormData;
  editErrors: VesselFieldErrors;
  onStartEdit: (targetTab?: string) => void;
  onEditFieldChange: <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => void;
  onNavigateTab: (tabId: string) => void;
}

export function VesselOverviewTab({
  vessel,
  compliance,
  readiness,
  isEditing,
  editFormData,
  editErrors,
  onStartEdit,
  onEditFieldChange,
  onNavigateTab,
}: VesselOverviewTabProps) {
  const statusDisplay = getVesselStatusDisplay(vessel.operationalStatus);

  return (
    <div className="vessel-details-tab-stack">
      {(compliance.state === "expired" ||
        compliance.state === "expiring_soon") && (
        <Alert
          variant={compliance.state === "expired" ? "error" : "warning"}
          title={
            compliance.state === "expired"
              ? `Certificado Código ISM vencido (${compliance.expiryFormatted})`
              : `Certificado Código ISM vence em breve (${compliance.expiryFormatted})`
          }
          description={`Certificação ISM (${vessel.ismCertification || "—"}) emitida por ${formatClassificationDisplay(
            vessel.classificationSociety
          )}. Verifique a aba de Certificações para acompanhar a regularização.`}
          actionLabel="Ver certificações"
          onAction={() => onNavigateTab("certificacoes")}
        />
      )}

      <div className="vessel-details-layout-grid">
        <div className="vessel-details-main-col">
          <SectionCard
            title="Informações básicas"
            icon="pi-compass"
            subtitle="Identificação oficial e registro marítimo da embarcação."
            className={
              isEditing ? "vessel-details-card--editing" : undefined
            }
            actions={
              !isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon="pi-pencil"
                  onClick={() => onStartEdit("visao-geral")}
                >
                  Editar
                </Button>
              ) : undefined
            }
          >
            {isEditing ? (
              <div className="vessel-details-edit-grid vessel-details-edit-grid--3cols">
                <Input
                  id="edit-vesselName"
                  label="Nome oficial da embarcação"
                  required
                  size="md"
                  value={editFormData.vesselName}
                  errorMessage={editErrors.vesselName}
                  onChange={(e) =>
                    onEditFieldChange("vesselName", e.target.value)
                  }
                />
                <Input
                  id="edit-nationalRegistrationNumber"
                  label="Número do registro nacional"
                  required
                  size="md"
                  maxLength={30}
                  value={editFormData.nationalRegistrationNumber}
                  errorMessage={editErrors.nationalRegistrationNumber}
                  onChange={(e) =>
                    onEditFieldChange(
                      "nationalRegistrationNumber",
                      e.target.value
                    )
                  }
                  helperText="Entre 5 e 30 caracteres (letras, números, ponto, hífen ou barra)."
                />
                <Input
                  id="edit-imoNumber"
                  label="Número IMO"
                  required
                  size="md"
                  maxLength={7}
                  inputMode="numeric"
                  value={editFormData.imoNumber}
                  errorMessage={editErrors.imoNumber}
                  onChange={(e) =>
                    onEditFieldChange(
                      "imoNumber",
                      e.target.value.replace(/\D/g, "")
                    )
                  }
                  helperText="Informe exatamente 7 dígitos numéricos (com dígito verificador IMO)."
                />
                <Select
                  id="edit-flag"
                  label="Bandeira"
                  required
                  size="md"
                  value={editFormData.flag}
                  errorMessage={editErrors.flag}
                  options={VESSEL_FLAG_OPTIONS}
                  onChange={(e) => onEditFieldChange("flag", e.target.value)}
                  placeholder="Selecione a bandeira"
                />
                <Input
                  id="edit-yearBuilt"
                  label="Ano de fabricação"
                  required
                  size="md"
                  type="number"
                  min={1900}
                  max={2100}
                  value={editFormData.yearBuilt ?? ""}
                  errorMessage={editErrors.yearBuilt}
                  onChange={(e) =>
                    onEditFieldChange("yearBuilt", parseNullableNumber(e))
                  }
                />
                <Input
                  id="edit-companyName"
                  label="Empresa responsável"
                  isAutomatic
                  readOnly
                  disabled
                  size="md"
                  value={vessel.companyName || "—"}
                  helperText="Calculado pelo sistema."
                />
                <Select
                  id="edit-overview-operationalStatus"
                  label="Status operacional"
                  required
                  size="md"
                  value={editFormData.operationalStatus}
                  errorMessage={editErrors.operationalStatus}
                  options={OPERATIONAL_STATUS_OPTIONS.map((opt) => ({
                    label: opt.label,
                    value: opt.value,
                  }))}
                  onChange={(e) =>
                    onEditFieldChange("operationalStatus", e.target.value)
                  }
                />
              </div>
            ) : (
              <dl className="vessel-details-dl-grid vessel-details-dl-grid--3cols">
                <div className="vessel-details-dl-item">
                  <dt>Nome oficial da embarcação</dt>
                  <dd>{vessel.vesselName || "—"}</dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Número do registro nacional</dt>
                  <dd className="vessel-details-tabular">
                    {vessel.nationalRegistrationNumber || "—"}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Número IMO</dt>
                  <dd className="vessel-details-tabular">
                    {vessel.imoNumber || "—"}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Bandeira</dt>
                  <dd>{formatFlagDisplay(vessel.flag)}</dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Ano de fabricação</dt>
                  <dd className="vessel-details-tabular">
                    {vessel.yearBuilt ?? "—"}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Status operacional</dt>
                  <dd>
                    <Badge tone={statusDisplay.tone} size="sm" dot>
                      {statusDisplay.label}
                    </Badge>
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>
                    <span>Empresa responsável</span>
                    <Badge tone="automatic" size="sm">
                      Automático
                    </Badge>
                  </dt>
                  <dd>{vessel.companyName || "—"}</dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Data de cadastro</dt>
                  <dd className="vessel-details-tabular">
                    {formatDateTimeBr(vessel.createdAt)}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>ID interno da embarcação</dt>
                  <dd className="vessel-details-mono">
                    {vessel.idVessel || "—"}
                  </dd>
                </div>
              </dl>
            )}
          </SectionCard>

          <SectionCard
            title="Base operacional & gestão"
            icon="pi-map-marker"
            subtitle="Alocação portuária, terminal de referência e contato operacional."
            className={
              isEditing ? "vessel-details-card--editing" : undefined
            }
            actions={
              !isEditing ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  icon="pi-pencil"
                  onClick={() => onStartEdit("visao-geral")}
                >
                  Editar
                </Button>
              ) : undefined
            }
          >
            {isEditing ? (
              <div className="vessel-details-edit-grid">
                <Input
                  id="edit-idHomePort"
                  label="Porto base"
                  size="md"
                  disabled
                  readOnly
                  value={editFormData.idHomePort}
                  errorMessage={editErrors.idHomePort}
                  placeholder="Indisponível · aguarda módulo de Portos"
                  helperText="A seleção de porto base estará disponível posteriormente."
                />
                <Input
                  id="edit-mainTerminal"
                  label="Terminal / berço principal"
                  size="md"
                  maxLength={100}
                  value={editFormData.mainTerminal}
                  errorMessage={editErrors.mainTerminal}
                  onChange={(e) =>
                    onEditFieldChange("mainTerminal", e.target.value)
                  }
                  onBlur={(e) =>
                    onEditFieldChange("mainTerminal", e.target.value.trim().replace(/\s+/g, " "))
                  }
                  placeholder="Ex.: Terminal Concais · Berço 3"
                  helperText="Opcional · até 100 caracteres."
                />
                <Input
                  id="edit-idManager"
                  label="Gerente da embarcação"
                  size="md"
                  disabled
                  readOnly
                  value={editFormData.idManager}
                  errorMessage={editErrors.idManager}
                  placeholder="Indisponível · aguarda módulo de Pessoas"
                  helperText="A seleção de gerente responsável estará disponível posteriormente."
                />
                <Input
                  id="edit-operationalEmail"
                  label="E-mail operacional"
                  required
                  size="md"
                  type="email"
                  maxLength={255}
                  value={editFormData.operationalEmail}
                  errorMessage={editErrors.operationalEmail}
                  onChange={(e) =>
                    onEditFieldChange("operationalEmail", e.target.value)
                  }
                  placeholder="operacoes@costaazul.com.br"
                />
              </div>
            ) : (
              <dl className="vessel-details-dl-grid">
                <div className="vessel-details-dl-item">
                  <dt>Terminal principal</dt>
                  <dd>{vessel.mainTerminal || "Não informado"}</dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Porto base (UUID)</dt>
                  <dd className="vessel-details-mono">
                    {vessel.idHomePort || "Não informado"}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Gerente responsável (UUID)</dt>
                  <dd className="vessel-details-mono">
                    {vessel.idManager || "Não informado"}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>E-mail operacional</dt>
                  <dd>{vessel.operationalEmail || "—"}</dd>
                </div>
              </dl>
            )}
          </SectionCard>
        </div>

        <aside className="vessel-details-side-col">
          <SectionCard title="Viagem em andamento" icon="pi-send">
            <div className="vessel-details-side-placeholder">
              <div className="vessel-details-side-placeholder__badge">
                <Badge tone="neutral" dot>
                  Sem viagem ativa
                </Badge>
              </div>
              <p className="vessel-details-side-placeholder__text">
                Não há viagem em curso registrada para esta embarcação.
                O módulo de programação de viagens ainda não está
                integrado à API de navios.
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Conformidade" icon="pi-shield">
            <div className="vessel-details-kv-list">
              <div className="vessel-details-kv-row">
                <span>Certificados válidos</span>
                <strong className="vessel-details-tabular">
                  {compliance.state === "valid" ? "1" : "0"}
                </strong>
              </div>
              <div className="vessel-details-kv-row">
                <span>Vencem em até 30 dias</span>
                <strong className="vessel-details-tabular">
                  {compliance.state === "expiring_soon" ? "1" : "0"}
                </strong>
              </div>
              <div className="vessel-details-kv-row">
                <span>Vencidos</span>
                <strong className="vessel-details-tabular">
                  {compliance.state === "expired" ? "1" : "0"}
                </strong>
              </div>
              <div className="vessel-details-kv-row">
                <span>Classificadora (IACS)</span>
                <strong>
                  {formatClassificationDisplay(vessel.classificationSociety)}
                </strong>
              </div>
            </div>
            <div className="vessel-details-side-footer">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon="pi-arrow-right"
                iconPosition="right"
                onClick={() => onNavigateTab("certificacoes")}
              >
                Ver certificações
              </Button>
            </div>
          </SectionCard>

          {readiness && (
            <SectionCard
              title="Prontidão do cadastro"
              icon="pi-check-circle"
            >
              <div className="vessel-details-readiness">
                <div className="vessel-details-readiness__top">
                  <span>
                    {readiness.completedCount} de {readiness.totalCount} etapas
                    completas
                  </span>
                  <strong className="vessel-details-tabular">
                    {readiness.percentage}%
                  </strong>
                </div>
                <div
                  className="vessel-details-progress-track"
                  role="progressbar"
                  aria-valuenow={readiness.percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="vessel-details-progress-fill"
                    style={{ width: `${readiness.percentage}%` }}
                  />
                </div>

                <ul className="vessel-details-readiness__list">
                  {readiness.items.map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="vessel-details-readiness__item"
                        onClick={() => onNavigateTab(item.targetTab)}
                      >
                        <i
                          className={`pi ${
                            item.completed
                              ? "pi-check-circle vessel-details-readiness__icon--ok"
                              : "pi-clock vessel-details-readiness__icon--pending"
                          }`}
                          aria-hidden="true"
                        />
                        <div className="vessel-details-readiness__texts">
                          <span>{item.label}</span>
                          <small>{item.detail}</small>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </SectionCard>
          )}
        </aside>
      </div>
    </div>
  );
}
