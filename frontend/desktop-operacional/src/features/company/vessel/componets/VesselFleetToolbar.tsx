import {
  Button,
  FilterChip,
  Input,
  Select,
  type SelectOption,
} from "../../../../components";
import {
  VESSEL_COMPLIANCE_FILTER_OPTIONS,
  VESSEL_STATUS_FILTER_OPTIONS,
  type FleetViewMode,
  type VesselComplianceFilterValue,
  type VesselStatusFilterValue,
} from "../utils";

export interface VesselFleetToolbarProps {
  searchQuery: string;
  statusFilter: VesselStatusFilterValue;
  basePortFilter: string;
  complianceFilter: VesselComplianceFilterValue;
  basePortOptions: SelectOption[];
  viewMode: FleetViewMode;
  hasActiveFilters: boolean;
  onSearchChange: (nextValue: string) => void;
  onClearSearchFilter: () => void;
  onStatusFilterChange: (nextStatus: VesselStatusFilterValue) => void;
  onBasePortFilterChange: (nextPort: string) => void;
  onComplianceFilterChange: (nextCompliance: VesselComplianceFilterValue) => void;
  onViewModeChange: (nextMode: FleetViewMode) => void;
  onClearAllFilters: () => void;
}

export function VesselFleetToolbar({
  searchQuery,
  statusFilter,
  basePortFilter,
  complianceFilter,
  basePortOptions,
  viewMode,
  hasActiveFilters,
  onSearchChange,
  onClearSearchFilter,
  onStatusFilterChange,
  onBasePortFilterChange,
  onComplianceFilterChange,
  onViewModeChange,
  onClearAllFilters,
}: VesselFleetToolbarProps) {
  return (
    <section
      className="vessel-fleet-toolbar-card"
      aria-label="Filtros e busca de embarcações"
    >
      <div className="vessel-fleet-toolbar">
        <div className="vessel-fleet-toolbar__search">
          <Input
            type="search"
            size="sm"
            placeholder="Buscar por nome ou IMO..."
            leftIcon="pi-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Buscar embarcação por nome ou número IMO"
          />
        </div>

        <div className="vessel-fleet-toolbar__filters">
          <div className="vessel-fleet-toolbar__select">
            <Select
              size="sm"
              prefixLabel="Status:"
              options={VESSEL_STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(e) =>
                onStatusFilterChange(e.target.value as VesselStatusFilterValue)
              }
              aria-label="Filtrar por status operacional"
            />
          </div>

          <div className="vessel-fleet-toolbar__select">
            <Select
              size="sm"
              prefixLabel="Porto base:"
              options={basePortOptions}
              value={basePortFilter}
              onChange={(e) => onBasePortFilterChange(e.target.value)}
              aria-label="Filtrar por porto base ou terminal"
            />
          </div>

          <div className="vessel-fleet-toolbar__select">
            <Select
              size="sm"
              prefixLabel="Conformidade:"
              options={VESSEL_COMPLIANCE_FILTER_OPTIONS}
              value={complianceFilter}
              onChange={(e) =>
                onComplianceFilterChange(
                  e.target.value as VesselComplianceFilterValue
                )
              }
              aria-label="Filtrar por situação de conformidade"
            />
          </div>
        </div>

        <div
          className="vessel-fleet-view-switcher"
          role="group"
          aria-label="Alternar modo de visualização"
        >
          <button
            type="button"
            className={`vessel-fleet-view-switcher__btn ${
              viewMode === "grid"
                ? "vessel-fleet-view-switcher__btn--active"
                : ""
            }`}
            onClick={() => onViewModeChange("grid")}
            aria-pressed={viewMode === "grid"}
          >
            <i className="pi pi-th-large" aria-hidden="true" />
            <span>Grade</span>
          </button>
          <button
            type="button"
            className={`vessel-fleet-view-switcher__btn ${
              viewMode === "list"
                ? "vessel-fleet-view-switcher__btn--active"
                : ""
            }`}
            onClick={() => onViewModeChange("list")}
            aria-pressed={viewMode === "list"}
          >
            <i className="pi pi-list" aria-hidden="true" />
            <span>Lista</span>
          </button>
        </div>
      </div>

      {/* Linha de chips de filtros aplicados (Figma #5932:32017) */}
      {hasActiveFilters && (
        <div className="vessel-fleet-applied-filters">
          <span className="vessel-fleet-applied-filters__label">
            Filtros ativos:
          </span>

          <div className="vessel-fleet-applied-filters__chips">
            {searchQuery.trim() && (
              <FilterChip
                selected
                icon="pi-times"
                title="Remover filtro de busca"
                onClick={onClearSearchFilter}
              >
                Busca: &ldquo;{searchQuery.trim()}&rdquo;
              </FilterChip>
            )}

            {statusFilter !== "ALL" && (
              <FilterChip
                selected
                icon="pi-times"
                title="Remover filtro de status"
                onClick={() => onStatusFilterChange("ALL")}
              >
                Status:{" "}
                {VESSEL_STATUS_FILTER_OPTIONS.find(
                  (opt) => opt.value === statusFilter
                )?.label ?? statusFilter}
              </FilterChip>
            )}

            {basePortFilter !== "ALL" && (
              <FilterChip
                selected
                icon="pi-times"
                title="Remover filtro de porto base"
                onClick={() => onBasePortFilterChange("ALL")}
              >
                Porto base: {basePortFilter}
              </FilterChip>
            )}

            {complianceFilter !== "ALL" && (
              <FilterChip
                selected
                icon="pi-times"
                title="Remover filtro de conformidade"
                onClick={() => onComplianceFilterChange("ALL")}
              >
                Conformidade:{" "}
                {VESSEL_COMPLIANCE_FILTER_OPTIONS.find(
                  (opt) => opt.value === complianceFilter
                )?.label ?? complianceFilter}
              </FilterChip>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearAllFilters}
          >
            Limpar tudo
          </Button>
        </div>
      )}
    </section>
  );
}
