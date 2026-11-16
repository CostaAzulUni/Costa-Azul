import { useMemo } from "react";
import { Badge, Button, DataTable, EmptyState, FilterChip, Input, SectionCard, Select, type DataTableColumn } from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import { CLASSIFICATION_SOCIETY_OPTIONS, OPERATIONAL_STATUS_OPTIONS, type VesselFieldErrors, type VesselFieldKey, type VesselFormData } from "../form";
import { evaluateVesselCompliance, formatClassificationDisplay, type CertificateFilterType, type StatutoryCertificateRow, type VesselComplianceEvaluation, type VesselStatusDisplay } from "../utils";

export interface VesselCertificationsTabProps {
  vessel: VesselResponseDTO;
  compliance: VesselComplianceEvaluation;
  statusDisplay: VesselStatusDisplay;
  certificateRows: StatutoryCertificateRow[];
  filteredCertificateRows: StatutoryCertificateRow[];
  certificateFilter: CertificateFilterType;
  isEditing: boolean;
  editFormData: VesselFormData;
  editErrors: VesselFieldErrors;
  onStartEdit: (targetTab?: string) => void;
  onEditFieldChange: <K extends VesselFieldKey>(
    field: K,
    value: VesselFormData[K]
  ) => void;
  onCertificateFilterChange: (filter: CertificateFilterType) => void;
}

export function VesselCertificationsTab({
  vessel,
  compliance,
  statusDisplay,
  certificateRows,
  filteredCertificateRows,
  certificateFilter,
  isEditing,
  editFormData,
  editErrors,
  onStartEdit,
  onEditFieldChange,
  onCertificateFilterChange,
}: VesselCertificationsTabProps) {
  const certificateColumns = useMemo<
    DataTableColumn<StatutoryCertificateRow>[]
  >(
    () => [
      {
        key: "certificateName",
        header: "Certificado",
        render: (row) => (
          <div className="vessel-details-cert-cell">
            <span className="vessel-details-cert-cell__title">
              {row.certificateName}
            </span>
            <span className="vessel-details-cert-cell__code">
              Código: {row.code}
            </span>
          </div>
        ),
      },
      {
        key: "issuer",
        header: "Órgão / Classificadora",
        width: "240px",
        render: (row) => <span>{row.issuer}</span>,
      },
      {
        key: "expiry",
        header: "Validade",
        width: "150px",
        render: (row) => (
          <span className="vessel-details-tabular">{row.expiryFormatted}</span>
        ),
      },
      {
        key: "status",
        header: "Situação",
        width: "190px",
        render: (row) => (
          <Badge tone={row.badgeTone} dot>
            {row.statusLabel}
          </Badge>
        ),
      },
    ],
    []
  );

  const editCompliance = evaluateVesselCompliance(editFormData.certificateExpiryDate);
  const expiryHelper =
    editCompliance.state === "expired" || editCompliance.state === "expiring_soon"
      ? `${editCompliance.cardLabel} · alerta automático em até 30 dias.`
      : "Não pode ser anterior ao ano de fabricação · alerta em até 30 dias.";

  return (
    <div className="vessel-details-tab-stack">
      <SectionCard
        title="Classificação e conformidade"
        subtitle="Dados de classe naval (IACS) e certificação internacional de gestão de segurança."
        icon="pi-shield"
        className={isEditing ? "vessel-details-card--editing" : undefined}
        actions={
          !isEditing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon="pi-pencil"
              onClick={() => onStartEdit("certificacoes")}
            >
              Editar
            </Button>
          ) : undefined
        }
      >
        {isEditing ? (
          <div className="vessel-details-edit-grid">
            <Select
              id="edit-classificationSociety"
              label="Sociedade classificadora (IACS)"
              required
              size="md"
              value={editFormData.classificationSociety}
              errorMessage={editErrors.classificationSociety}
              options={CLASSIFICATION_SOCIETY_OPTIONS}
              onChange={(e) =>
                onEditFieldChange("classificationSociety", e.target.value)
              }
              placeholder="Selecione a classificadora"
            />
            <Input
              id="edit-ismCertification"
              label="Certificação Código ISM"
              required
              size="md"
              maxLength={150}
              value={editFormData.ismCertification}
              errorMessage={editErrors.ismCertification}
              onChange={(e) =>
                onEditFieldChange("ismCertification", e.target.value)
              }
              placeholder="Ex.: DOC/SMC nº 3310-SMC-BR"
            />
            <Input
              id="edit-certificateExpiryDate"
              label="Data de validade do certificado"
              required
              size="md"
              type="date"
              value={editFormData.certificateExpiryDate}
              errorMessage={editErrors.certificateExpiryDate}
              onChange={(e) =>
                onEditFieldChange("certificateExpiryDate", e.target.value)
              }
              helperText={expiryHelper}
            />
            <Select
              id="edit-operationalStatus"
              label="Status operacional atual"
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
          <dl className="vessel-details-dl-grid">
            <div className="vessel-details-dl-item">
              <dt>Sociedade classificadora (IACS)</dt>
              <dd>
                {formatClassificationDisplay(vessel.classificationSociety)}
              </dd>
            </div>
            <div className="vessel-details-dl-item">
              <dt>Certificação Código ISM</dt>
              <dd className="vessel-details-tabular">
                {vessel.ismCertification || "—"}
              </dd>
            </div>
            <div className="vessel-details-dl-item">
              <dt>Data de validade do certificado</dt>
              <dd className="vessel-details-dl-inline">
                <span className="vessel-details-tabular">
                  {compliance.expiryFormatted}
                </span>
                <Badge tone={compliance.badgeTone} size="sm" dot>
                  {compliance.shortLabel}
                </Badge>
              </dd>
            </div>
            <div className="vessel-details-dl-item">
              <dt>Status operacional atual</dt>
              <dd>
                <Badge tone={statusDisplay.tone} size="sm" dot>
                  {statusDisplay.label}
                </Badge>
              </dd>
            </div>
          </dl>
        )}
      </SectionCard>

      <SectionCard
        title="Certificados estatutários"
        subtitle="Registro oficial de certificados retornado pela API para esta embarcação."
        icon="pi-file"
        flush
        actions={
          <div className="vessel-details-chip-group">
            <FilterChip
              count={certificateRows.length}
              selected={certificateFilter === "ALL"}
              onClick={() => onCertificateFilterChange("ALL")}
            >
              Todos
            </FilterChip>
            <FilterChip
              count={certificateRows.filter((row) => row.hasAlert).length}
              selected={certificateFilter === "ALERT"}
              onClick={() => onCertificateFilterChange("ALERT")}
            >
              Com alerta
            </FilterChip>
            <FilterChip
              count={certificateRows.filter((row) => !row.hasAlert).length}
              selected={certificateFilter === "VALID"}
              onClick={() => onCertificateFilterChange("VALID")}
            >
              Válidos
            </FilterChip>
          </div>
        }
      >
        {filteredCertificateRows.length > 0 ? (
          <DataTable<StatutoryCertificateRow>
            columns={certificateColumns}
            data={filteredCertificateRows}
            rowKey={(row) => row.id}
          />
        ) : (
          <EmptyState
            compact
            icon="pi-shield"
            title="Nenhum certificado neste filtro"
            description="Não há certificados correspondentes ao filtro selecionado."
            secondaryActionLabel={
              certificateFilter !== "ALL" ? "Exibir todos" : undefined
            }
            onSecondaryAction={
              certificateFilter !== "ALL"
                ? () => onCertificateFilterChange("ALL")
                : undefined
            }
          />
        )}
      </SectionCard>
    </div>
  );
}
