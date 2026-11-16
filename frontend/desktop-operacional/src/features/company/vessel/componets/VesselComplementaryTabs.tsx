import {
  Badge,
  EmptyState,
  FilterChip,
  SectionCard,
} from "../../../../components";
import type { VesselResponseDTO } from "../../../../services/vesselcreate";
import {
  formatDateTimeBr,
  type TripFilterType,
  type VesselStatusDisplay,
} from "../utils";

export interface VesselDecksAreasTabProps {
  vessel: VesselResponseDTO;
}

export function VesselDecksAreasTab({ vessel }: VesselDecksAreasTabProps) {
  return (
    <div className="vessel-details-tab-stack">
      <div className="vessel-details-summary-strip">
        <div className="vessel-details-summary-strip__info">
          <i className="pi pi-info-circle" aria-hidden="true" />
          <span>
            O número de conveses (<strong>{vessel.deckCount ?? 0}</strong>),
            cabines (<strong>{vessel.cabinCount ?? 0}</strong>) e áreas (
            <strong>{vessel.totalAreas ?? 0}</strong>) é calculado
            automaticamente pelo backend a partir da estrutura interna da
            embarcação.
          </span>
        </div>
        <Badge tone="automatic" size="sm">
          Cálculo automático
        </Badge>
      </div>

      <SectionCard
        title="Conveses e áreas da embarcação"
        subtitle="Listagem de conveses, cabines e áreas comuns/operacionais a bordo."
        icon="pi-sitemap"
      >
        <EmptyState
          compact
          icon="pi-clone"
          title="Nenhum convés ou área cadastrada"
          description="A API retornou 0 conveses e 0 áreas para esta embarcação. Ainda não existem endpoints de leitura de conveses e áreas detalhadas disponíveis no backend."
        />
      </SectionCard>
    </div>
  );
}

export function VesselDocumentsDetailTab() {
  return (
    <SectionCard
      title="Documentação técnica"
      subtitle="Plantas de arranjo geral, plano de salvatagem e manuais da embarcação."
      icon="pi-folder"
    >
      <EmptyState
        compact
        icon="pi-folder-open"
        title="Listagem de documentos não disponível na API"
        description="Os metadados de documentos anexados no cadastro são persistidos na tabela vessel_document, mas ainda não são retornados pelo contrato GET /api/erp/vessels (VesselResponseDTO)."
      />
    </SectionCard>
  );
}

export interface VesselTripsTabProps {
  tripFilter: TripFilterType;
  onTripFilterChange: (filter: TripFilterType) => void;
}

export function VesselTripsTab({
  tripFilter,
  onTripFilterChange,
}: VesselTripsTabProps) {
  return (
    <SectionCard
      title="Viagens da embarcação"
      subtitle="Viagens programadas, em andamento e histórico de travessias."
      icon="pi-send"
      actions={
        <div className="vessel-details-chip-group">
          <FilterChip
            count={0}
            selected={tripFilter === "ALL"}
            onClick={() => onTripFilterChange("ALL")}
          >
            Todas
          </FilterChip>
          <FilterChip
            count={0}
            selected={tripFilter === "SCHEDULED"}
            onClick={() => onTripFilterChange("SCHEDULED")}
          >
            Programadas
          </FilterChip>
          <FilterChip
            count={0}
            selected={tripFilter === "COMPLETED"}
            onClick={() => onTripFilterChange("COMPLETED")}
          >
            Concluídas e canceladas
          </FilterChip>
        </div>
      }
    >
      <EmptyState
        compact
        icon="pi-calendar"
        title="Nenhuma viagem registrada para esta embarcação"
        description="O módulo de viagens ainda não possui registros vinculados a este navio na API."
      />
    </SectionCard>
  );
}

export interface VesselHistoryTabProps {
  vessel: VesselResponseDTO;
  statusDisplay: VesselStatusDisplay;
}

export function VesselHistoryTab({
  vessel,
  statusDisplay,
}: VesselHistoryTabProps) {
  return (
    <SectionCard
      title="Histórico de alterações"
      subtitle="Eventos auditáveis registrados para esta embarcação."
      icon="pi-history"
    >
      <div className="vessel-details-timeline">
        <div className="vessel-details-timeline__item">
          <div
            className="vessel-details-timeline__marker"
            aria-hidden="true"
          >
            <i className="pi pi-plus-circle" />
          </div>
          <div className="vessel-details-timeline__content">
            <div className="vessel-details-timeline__header">
              <strong>Embarcação cadastrada no sistema</strong>
              <span className="vessel-details-tabular">
                {formatDateTimeBr(vessel.createdAt)}
              </span>
            </div>
            <p className="vessel-details-timeline__desc">
              Registro inicial de <strong>{vessel.vesselName}</strong> (IMO{" "}
              {vessel.imoNumber || "—"}, Registro Nacional{" "}
              {vessel.nationalRegistrationNumber || "—"}) vinculado à empresa{" "}
              <strong>{vessel.companyName || "Não informada"}</strong> com
              status operacional <strong>{statusDisplay.label}</strong>.
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}
