import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Input,
  KPI,
  SectionCard,
} from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import {
  formatMetric,
  parseNullableNumber,
  type VesselFieldErrors,
  type VesselFieldKey,
  type VesselFormData,
} from "../form";
import type { VesselDerivedMetrics } from "../utils";

export interface VesselCapacityTabProps {
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
}

export function VesselCapacityTab({
  vessel,
  derivedMetrics,
  isEditing,
  editFormData,
  editErrors,
  onStartEdit,
  onEditFieldChange,
}: VesselCapacityTabProps) {
  const { totalAboard, lifeboatCoveragePct } = derivedMetrics;

  return (
    <div className="vessel-details-tab-stack">
      <div className="vessel-details-kpis-row">
        <KPI
          label="Passageiros (máx.)"
          icon="pi-users"
          value={formatMetric(vessel.maxPassengerCapacity)}
          detailText="Capacidade máxima certificada"
        />
        <KPI
          label="Tripulação (máx.)"
          icon="pi-id-card"
          value={formatMetric(vessel.maxCrewCapacity)}
          detailText="Dotação máxima operacional"
        />
        <KPI
          label="Total de cabines"
          value={String(vessel.cabinCount ?? 0)}
          highlightText="Automático"
          highlightTone="info"
          detailText="Soma das cabines dos conveses"
        />
        <KPI
          label="Salvatagem"
          icon="pi-shield"
          value={formatMetric(vessel.lifeboatTotalCapacity)}
          detailText="Capacidade total de botes e balsas"
        />
      </div>

      <div className="vessel-details-layout-grid">
        <div className="vessel-details-main-col">
          <SectionCard
            title="Capacidade e lotação"
            icon="pi-users"
            subtitle="Limites operacionais e de segurança cadastrados para a embarcação."
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
                  onClick={() => onStartEdit("capacidade")}
                >
                  Editar
                </Button>
              ) : undefined
            }
          >
            {isEditing ? (
              <div className="vessel-details-edit-grid">
                <Input
                  id="edit-maxPassengerCapacity"
                  label="Capacidade máx. de passageiros"
                  required
                  size="md"
                  type="number"
                  min={1}
                  step={1}
                  unitSuffix="pessoas"
                  value={editFormData.maxPassengerCapacity ?? ""}
                  errorMessage={editErrors.maxPassengerCapacity}
                  onChange={(e) =>
                    onEditFieldChange(
                      "maxPassengerCapacity",
                      parseNullableNumber(e)
                    )
                  }
                />
                <Input
                  id="edit-maxCrewCapacity"
                  label="Capacidade máx. de tripulantes"
                  required
                  size="md"
                  type="number"
                  min={0}
                  step={1}
                  unitSuffix="tripulantes"
                  value={editFormData.maxCrewCapacity ?? ""}
                  errorMessage={editErrors.maxCrewCapacity}
                  onChange={(e) =>
                    onEditFieldChange(
                      "maxCrewCapacity",
                      parseNullableNumber(e)
                    )
                  }
                />
                <Input
                  id="edit-cabinCount"
                  label="Total de cabines"
                  isAutomatic
                  readOnly
                  disabled
                  size="md"
                  value={String(vessel.cabinCount ?? 0)}
                  helperText="Calculado pelo sistema."
                />
                <Input
                  id="edit-lifeboatTotalCapacity"
                  label="Capacidade total de botes salva-vidas"
                  required
                  size="md"
                  type="number"
                  min={1}
                  step={1}
                  unitSuffix="lugares"
                  value={editFormData.lifeboatTotalCapacity ?? ""}
                  errorMessage={editErrors.lifeboatTotalCapacity}
                  onChange={(e) =>
                    onEditFieldChange(
                      "lifeboatTotalCapacity",
                      parseNullableNumber(e)
                    )
                  }
                  helperText="Deve ser igual ou superior à soma de passageiros e tripulantes."
                />
              </div>
            ) : (
              <dl className="vessel-details-dl-grid">
                <div className="vessel-details-dl-item">
                  <dt>Capacidade máx. de passageiros</dt>
                  <dd className="vessel-details-tabular">
                    {formatMetric(vessel.maxPassengerCapacity, "pessoas")}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Capacidade máx. de tripulantes</dt>
                  <dd className="vessel-details-tabular">
                    {formatMetric(vessel.maxCrewCapacity, "tripulantes")}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>
                    <span>Total de cabines</span>
                    <Badge tone="automatic" size="sm">
                      Automático
                    </Badge>
                  </dt>
                  <dd className="vessel-details-tabular">
                    {vessel.cabinCount ?? 0}
                  </dd>
                </div>
                <div className="vessel-details-dl-item">
                  <dt>Capacidade total de botes salva-vidas</dt>
                  <dd className="vessel-details-tabular">
                    {formatMetric(vessel.lifeboatTotalCapacity, "lugares")}
                  </dd>
                </div>
              </dl>
            )}
          </SectionCard>

          <SectionCard
            title="Cabines por categoria"
            subtitle="Distribuição calculada a partir das cabines cadastradas nos conveses."
            icon="pi-th-large"
          >
            <EmptyState
              compact
              icon="pi-th-large"
              title="Nenhuma cabine cadastrada nos conveses"
              description="O detalhamento por categoria (Interna, Externa, Varanda, Suíte e Acessível) não possui registros porque a embarcação ainda possui 0 cabines cadastradas na API."
            />
          </SectionCard>
        </div>

        <aside className="vessel-details-side-col">
          <SectionCard title="Cobertura de salvatagem" icon="pi-shield">
            <div className="vessel-details-kv-list">
              <div className="vessel-details-kv-row">
                <span>Lotação máxima (pass. + trip.)</span>
                <strong className="vessel-details-tabular">
                  {totalAboard > 0
                    ? `${totalAboard.toLocaleString("pt-BR")} pessoas`
                    : "—"}
                </strong>
              </div>
              <div className="vessel-details-kv-row">
                <span>Capacidade de botes salva-vidas</span>
                <strong className="vessel-details-tabular">
                  {formatMetric(vessel.lifeboatTotalCapacity, "lugares")}
                </strong>
              </div>
              <div className="vessel-details-kv-row">
                <span>Índice de cobertura SOLAS</span>
                <strong className="vessel-details-tabular">
                  {lifeboatCoveragePct !== null
                    ? `${lifeboatCoveragePct}%`
                    : "—"}
                </strong>
              </div>
            </div>

            {lifeboatCoveragePct !== null && (
              <div className="vessel-details-solas-box">
                <div
                  className="vessel-details-progress-track"
                  role="progressbar"
                  aria-valuenow={Math.min(lifeboatCoveragePct, 100)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="vessel-details-progress-fill"
                    style={{
                      width: `${Math.min(lifeboatCoveragePct, 100)}%`,
                    }}
                  />
                </div>

                <Alert
                  variant={lifeboatCoveragePct >= 100 ? "success" : "warning"}
                  title={
                    lifeboatCoveragePct >= 100
                      ? `Cobertura de ${lifeboatCoveragePct}% em conformidade`
                      : `Cobertura de ${lifeboatCoveragePct}% abaixo de 100%`
                  }
                  description={
                    lifeboatCoveragePct >= 100
                      ? "A capacidade de salvatagem atende ou supera a lotação máxima de pessoas a bordo exigida pela convenção SOLAS."
                      : "A capacidade de botes salva-vidas informada é inferior à soma de passageiros e tripulantes."
                  }
                />
              </div>
            )}
          </SectionCard>
        </aside>
      </div>
    </div>
  );
}
