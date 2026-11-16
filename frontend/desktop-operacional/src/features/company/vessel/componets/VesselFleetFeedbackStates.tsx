import { Alert, EmptyState } from "../../../../components";
import type { FleetViewMode } from "../utils";

export interface VesselFleetFeedbackStatesProps {
  errorMessage: string | null;
  isLoading: boolean;
  viewMode: FleetViewMode;
  isEmptyFleet: boolean;
  isEmptyFilteredSearch: boolean;
  activeFilterSummaryText: string;
  onRetry: () => void;
  onClearAllFilters: () => void;
  onCreateVessel: () => void;
}

export function VesselFleetFeedbackStates({
  errorMessage,
  isLoading,
  viewMode,
  isEmptyFleet,
  isEmptyFilteredSearch,
  activeFilterSummaryText,
  onRetry,
  onClearAllFilters,
  onCreateVessel,
}: VesselFleetFeedbackStatesProps) {
  return (
    <>
      {/* Tratamento de Erro da API */}
      {errorMessage && (
        <Alert
          variant="error"
          title="Falha ao carregar embarcações"
          description={errorMessage}
          actionLabel="Tentar novamente"
          onAction={onRetry}
        />
      )}

      {/* Estado de Carregamento no modo Grade */}
      {isLoading && !errorMessage && viewMode === "grid" && (
        <div className="vessel-fleet-loading" role="status" aria-live="polite">
          <i className="pi pi-spin pi-spinner" aria-hidden="true" />
          <span>Carregando embarcações cadastradas...</span>
        </div>
      )}

      {/* Estado Vazio: nenhuma embarcação cadastrada no banco */}
      {isEmptyFleet && (
        <div className="vessel-fleet-empty-wrapper">
          <EmptyState
            icon="pi-compass"
            title="Nenhuma embarcação cadastrada"
            description="Cadastre a primeira embarcação da sua empresa para acompanhar especificações técnicas, capacidade, certificações e viagens."
            actionLabel="Cadastrar embarcação"
            actionIcon="pi-plus"
            onAction={onCreateVessel}
          />
        </div>
      )}

      {/* Estado Vazio: busca ou filtros não encontraram resultados (Figma N · 03 #5932:32022) */}
      {isEmptyFilteredSearch && (
        <div className="vessel-fleet-empty-wrapper">
          <EmptyState
            icon="pi-search"
            title="Nenhuma embarcação encontrada"
            description={`Não há embarcações com os filtros atuais (${activeFilterSummaryText}). Ajuste os filtros ou limpe tudo para voltar à lista completa.`}
            secondaryActionLabel="Limpar filtros"
            onSecondaryAction={onClearAllFilters}
            actionLabel="Cadastrar embarcação"
            actionIcon="pi-plus"
            onAction={onCreateVessel}
          />
        </div>
      )}
    </>
  );
}
