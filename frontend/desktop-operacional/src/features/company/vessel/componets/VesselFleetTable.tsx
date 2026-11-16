import { useMemo } from "react";
import {
  Badge,
  DataTable,
  IconButton,
  type DataTableColumn,
} from "../../../../components";
import type { VesselSummaryDTO } from "../../../../services/vesselcreate";
import { formatMetric } from "../form";
import {
  evaluateVesselCompliance,
  getVesselBasePortDisplay,
  getVesselStatusDisplay,
  resolveSafeVesselPhotoUrl,
} from "../utils";

export interface VesselFleetTableProps {
  vessels: VesselSummaryDTO[];
  isLoading: boolean;
  safeCurrentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onOpenVessel: (vessel: VesselSummaryDTO) => void;
  onPageChange: (page: number) => void;
}

export function VesselFleetTable({
  vessels,
  isLoading,
  safeCurrentPage,
  totalPages,
  totalElements,
  pageSize,
  onOpenVessel,
  onPageChange,
}: VesselFleetTableProps) {
  // Colunas da visualização em Lista (Figma N · 02 #5932:31796)
  const tableColumns = useMemo<DataTableColumn<VesselSummaryDTO>[]>(
    () => [
      {
        key: "vessel",
        header: "Navio",
        width: "260px",
        render: (vessel) => {
          const safePhoto = resolveSafeVesselPhotoUrl(vessel.photoUrl);
          return (
            <div className="vessel-table-ship">
              <div className="vessel-table-ship__thumb" aria-hidden="true">
                {safePhoto ? (
                  <img src={safePhoto} alt="" />
                ) : (
                  <i className="pi pi-compass" />
                )}
              </div>
              <div className="vessel-table-ship__info">
                <button
                  type="button"
                  className="vessel-table-ship__name"
                  onClick={() => onOpenVessel(vessel)}
                >
                  {vessel.vesselName}
                </button>
                <span className="vessel-table-ship__imo">
                  IMO {vessel.imoNumber || "—"}
                </span>
              </div>
            </div>
          );
        },
      },
      {
        key: "status",
        header: "Status",
        width: "150px",
        render: (vessel) => {
          const status = getVesselStatusDisplay(vessel.operationalStatus);
          return (
            <Badge tone={status.tone} dot>
              {status.label}
            </Badge>
          );
        },
      },
      {
        key: "currentTrip",
        header: "Viagem atual",
        render: () => (
          <div className="vessel-table-trip">
            <span className="vessel-table-trip__empty">Sem viagem ativa</span>
            <span className="vessel-table-trip__sub">
              Módulo de viagens não integrado
            </span>
          </div>
        ),
      },
      {
        key: "occupancy",
        header: "Ocupação",
        width: "120px",
        render: () => (
          <span
            className="vessel-table-placeholder"
            title="Dados de embarque em tempo real ainda não disponíveis na API"
          >
            —
          </span>
        ),
      },
      {
        key: "capacity",
        header: "Capacidade",
        align: "right",
        tabular: true,
        width: "120px",
        render: (vessel) => (
          <div className="vessel-table-capacity">
            <span className="vessel-table-capacity__main">
              {formatMetric(vessel.maxPassengerCapacity)}
            </span>
            <span className="vessel-table-capacity__sub">
              {formatMetric(vessel.maxCrewCapacity)} trip.
            </span>
          </div>
        ),
      },
      {
        key: "basePort",
        header: "Porto base",
        width: "170px",
        render: (vessel) => (
          <span className="vessel-table-port">
            {getVesselBasePortDisplay(vessel)}
          </span>
        ),
      },
      {
        key: "compliance",
        header: "Conformidade",
        width: "200px",
        render: (vessel) => {
          const compliance = evaluateVesselCompliance(
            vessel.certificateExpiryDate
          );
          return (
            <div
              className={`vessel-table-compliance vessel-table-compliance--${compliance.cardTone}`}
            >
              <i className={`pi ${compliance.iconName}`} aria-hidden="true" />
              <div className="vessel-table-compliance__texts">
                <span className="vessel-table-compliance__label">
                  {compliance.shortLabel}
                </span>
                {compliance.expiryFormatted !== "—" && (
                  <span className="vessel-table-compliance__date">
                    Validade: {compliance.expiryFormatted}
                  </span>
                )}
              </div>
            </div>
          );
        },
      },
      {
        key: "actions",
        header: "Ações",
        align: "right",
        width: "76px",
        render: (vessel) => (
          <div className="vessel-table-actions">
            <IconButton
              icon="pi-arrow-right"
              variant="ghost"
              size="sm"
              aria-label={`Abrir ficha de ${vessel.vesselName}`}
              title="Abrir ficha da embarcação"
              onClick={() => onOpenVessel(vessel)}
            />
          </div>
        ),
      },
    ],
    [onOpenVessel]
  );

  return (
    <section
      className="vessel-fleet-table-card"
      aria-label="Tabela de embarcações"
    >
      <DataTable<VesselSummaryDTO>
        columns={tableColumns}
        data={vessels}
        loading={isLoading}
        skeletonRows={6}
        rowKey={(vessel) => vessel.idVessel}
        pagination={{
          page: safeCurrentPage,
          totalPages,
          totalItems: totalElements,
          pageSize,
          itemLabel: "embarcações",
          disabled: isLoading,
          onPageChange,
        }}
      />
    </section>
  );
}
