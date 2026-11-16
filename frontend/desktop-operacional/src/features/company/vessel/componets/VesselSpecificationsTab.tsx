import {
  Badge,
  Button,
  Input,
  SectionCard,
  Select,
} from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import {
  formatMetric,
  parseNullableNumber,
  PROPULSION_TYPE_OPTIONS,
  type VesselFieldErrors,
  type VesselFieldKey,
  type VesselFormData,
} from "../form";
import {
  formatPropulsionDisplay,
  type VesselDerivedMetrics,
} from "../utils";

export interface VesselSpecificationsTabProps {
  vessel: VesselResponseDTO;
  derivedMetrics: VesselDerivedMetrics;
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

export function VesselSpecificationsTab({
  vessel,
  derivedMetrics,
  isEditing,
  editFormData,
  editErrors,
  onStartEdit,
  onEditFieldChange,
  onNavigateTab,
}: VesselSpecificationsTabProps) {
  const { loaBeamRatio, gtPerPassenger, vesselAgeText } = derivedMetrics;

  return (
    <div className="vessel-details-layout-grid">
      <div className="vessel-details-main-col">
        <SectionCard
          title="Dimensões e tonelagem"
          icon="pi-arrows-h"
          subtitle="Medidas estruturais do casco e arqueação oficial."
          className={isEditing ? "vessel-details-card--editing" : undefined}
          actions={
            !isEditing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon="pi-pencil"
                onClick={() => onStartEdit("especificacoes")}
              >
                Editar
              </Button>
            ) : undefined
          }
        >
          {isEditing ? (
            <div className="vessel-details-edit-grid vessel-details-edit-grid--3cols">
              <Input
                id="edit-lengthOverall"
                label="Comprimento total (LOA)"
                required
                size="md"
                type="number"
                min={0.01}
                step="0.01"
                unitSuffix="m"
                value={editFormData.lengthOverall ?? ""}
                errorMessage={editErrors.lengthOverall}
                onChange={(e) =>
                  onEditFieldChange("lengthOverall", parseNullableNumber(e))
                }
              />
              <Input
                id="edit-maxBeam"
                label="Boca máxima"
                size="md"
                type="number"
                min={0.01}
                step="0.01"
                unitSuffix="m"
                value={editFormData.maxBeam ?? ""}
                errorMessage={editErrors.maxBeam}
                onChange={(e) =>
                  onEditFieldChange("maxBeam", parseNullableNumber(e))
                }
              />
              <Input
                id="edit-operatingDraft"
                label="Calado operacional"
                required
                size="md"
                type="number"
                min={0.01}
                step="0.01"
                unitSuffix="m"
                value={editFormData.operatingDraft ?? ""}
                errorMessage={editErrors.operatingDraft}
                onChange={(e) =>
                  onEditFieldChange("operatingDraft", parseNullableNumber(e))
                }
              />
              <Input
                id="edit-grossTonnage"
                label="Arqueação bruta (GT)"
                required
                size="md"
                type="number"
                min={0.01}
                step="0.01"
                unitSuffix="GT"
                value={editFormData.grossTonnage ?? ""}
                errorMessage={editErrors.grossTonnage}
                onChange={(e) =>
                  onEditFieldChange("grossTonnage", parseNullableNumber(e))
                }
              />
              <Input
                id="edit-deadweightTonnage"
                label="Porte bruto (DWT)"
                size="md"
                type="number"
                min={0.01}
                step="0.01"
                unitSuffix="t"
                value={editFormData.deadweightTonnage ?? ""}
                errorMessage={editErrors.deadweightTonnage}
                onChange={(e) =>
                  onEditFieldChange("deadweightTonnage", parseNullableNumber(e))
                }
              />
            </div>
          ) : (
            <dl className="vessel-details-dl-grid">
              <div className="vessel-details-dl-item">
                <dt>Comprimento total (LOA)</dt>
                <dd className="vessel-details-tabular">
                  {formatMetric(vessel.lengthOverall, "m", 2)}
                </dd>
              </div>
              <div className="vessel-details-dl-item">
                <dt>Boca máxima</dt>
                <dd className="vessel-details-tabular">
                  {formatMetric(vessel.maxBeam, "m", 2)}
                </dd>
              </div>
              <div className="vessel-details-dl-item">
                <dt>Calado operacional</dt>
                <dd className="vessel-details-tabular">
                  {formatMetric(vessel.operatingDraft, "m", 2)}
                </dd>
              </div>
              <div className="vessel-details-dl-item">
                <dt>Arqueação bruta (GT)</dt>
                <dd className="vessel-details-tabular">
                  {formatMetric(vessel.grossTonnage, "GT", 2)}
                </dd>
              </div>
              <div className="vessel-details-dl-item">
                <dt>Porte bruto (DWT)</dt>
                <dd className="vessel-details-tabular">
                  {formatMetric(vessel.deadweightTonnage, "t", 2)}
                </dd>
              </div>
            </dl>
          )}
        </SectionCard>

        <SectionCard
          title="Construção e propulsão"
          icon="pi-wrench"
          subtitle="Dados do estaleiro construtor e sistema propulsor principal."
          className={isEditing ? "vessel-details-card--editing" : undefined}
          actions={
            !isEditing ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                icon="pi-pencil"
                onClick={() => onStartEdit("especificacoes")}
              >
                Editar
              </Button>
            ) : undefined
          }
        >
          {isEditing ? (
            <div className="vessel-details-edit-grid">
              <Input
                id="edit-shipyard"
                label="Estaleiro construtor"
                required
                size="md"
                value={editFormData.shipyard}
                errorMessage={editErrors.shipyard}
                onChange={(e) => onEditFieldChange("shipyard", e.target.value)}
              />
              <Select
                id="edit-mainPropulsion"
                label="Propulsão principal"
                size="md"
                value={editFormData.mainPropulsion}
                errorMessage={editErrors.mainPropulsion}
                options={PROPULSION_TYPE_OPTIONS}
                onChange={(e) =>
                  onEditFieldChange("mainPropulsion", e.target.value)
                }
                placeholder="Selecione o sistema"
              />
              <Input
                id="edit-maxServiceSpeed"
                label="Velocidade máx. de serviço"
                size="md"
                type="number"
                min={0.1}
                step="0.1"
                unitSuffix="nós"
                value={editFormData.maxServiceSpeed ?? ""}
                errorMessage={editErrors.maxServiceSpeed}
                onChange={(e) =>
                  onEditFieldChange("maxServiceSpeed", parseNullableNumber(e))
                }
              />
              <Input
                id="edit-yearBuilt-spec"
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
            </div>
          ) : (
            <dl className="vessel-details-dl-grid">
              <div className="vessel-details-dl-item">
                <dt>Estaleiro construtor</dt>
                <dd>{vessel.shipyard || "—"}</dd>
              </div>
              <div className="vessel-details-dl-item">
                <dt>Propulsão principal</dt>
                <dd>{formatPropulsionDisplay(vessel.mainPropulsion)}</dd>
              </div>
              <div className="vessel-details-dl-item">
                <dt>Velocidade máx. de serviço</dt>
                <dd className="vessel-details-tabular">
                  {formatMetric(vessel.maxServiceSpeed, "nós", 1)}
                </dd>
              </div>
              <div className="vessel-details-dl-item">
                <dt>Ano de fabricação</dt>
                <dd className="vessel-details-tabular">
                  {vessel.yearBuilt ?? "—"}
                </dd>
              </div>
            </dl>
          )}
        </SectionCard>
      </div>

      <aside className="vessel-details-side-col">
        <SectionCard title="Calculado pelo sistema" icon="pi-sitemap">
          <div className="vessel-details-kv-list">
            <div className="vessel-details-kv-row">
              <span className="vessel-details-kv-row__with-badge">
                Número de conveses
                <Badge tone="automatic" size="sm">
                  Automático
                </Badge>
              </span>
              <strong className="vessel-details-tabular">
                {vessel.deckCount ?? 0}
              </strong>
            </div>
            <div className="vessel-details-kv-row">
              <span className="vessel-details-kv-row__with-badge">
                Total de áreas
                <Badge tone="automatic" size="sm">
                  Automático
                </Badge>
              </span>
              <strong className="vessel-details-tabular">
                {vessel.totalAreas ?? 0}
              </strong>
            </div>
          </div>
          <p className="vessel-details-side-note">
            Atualizados automaticamente a partir dos conveses e áreas
            cadastradas na embarcação.
          </p>
          <div className="vessel-details-side-footer">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              icon="pi-arrow-right"
              iconPosition="right"
              onClick={() => onNavigateTab("conveses-areas")}
            >
              Abrir Conveses & áreas
            </Button>
          </div>
        </SectionCard>

        <SectionCard title="Relações de projeto" icon="pi-gauge">
          <div className="vessel-details-kv-list">
            <div className="vessel-details-kv-row">
              <span>LOA / boca</span>
              <strong className="vessel-details-tabular">
                {loaBeamRatio}
              </strong>
            </div>
            <div className="vessel-details-kv-row">
              <span>GT por passageiro (espaço)</span>
              <strong className="vessel-details-tabular">
                {gtPerPassenger}
              </strong>
            </div>
            <div className="vessel-details-kv-row">
              <span>Idade da embarcação</span>
              <strong>{vesselAgeText}</strong>
            </div>
          </div>
        </SectionCard>
      </aside>
    </div>
  );
}
