import { Pagination, VesselCard } from "../../../../components";
import type { VesselSummaryDTO } from "../../../../services/vesselcreate";
import { formatMetric } from "../form";
import {
  evaluateVesselCompliance,
  getVesselBasePortDisplay,
  getVesselStatusDisplay,
  resolveSafeVesselPhotoUrl,
} from "../utils";

export interface VesselFleetGridProps {
  vessels: VesselSummaryDTO[];
  safeCurrentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  isLoading: boolean;
  onOpenVessel: (vessel: VesselSummaryDTO) => void;
  onPageChange: (page: number) => void;
}

export function VesselFleetGrid({
  vessels,
  safeCurrentPage,
  totalPages,
  totalElements,
  pageSize,
  isLoading,
  onOpenVessel,
  onPageChange,
}: VesselFleetGridProps) {
  return (
    <>
      <section
        className="vessel-fleet-grid"
        aria-label="Grade de embarcações"
      >
        {vessels.map((vessel) => {
          const status = getVesselStatusDisplay(vessel.operationalStatus);
          const compliance = evaluateVesselCompliance(
            vessel.certificateExpiryDate
          );
          const basePort = getVesselBasePortDisplay(vessel);

          return (
            <VesselCard
              key={vessel.idVessel}
              name={vessel.vesselName}
              subtitle={vessel.companyName || "Empresa não informada"}
              imo={vessel.imoNumber || "—"}
              photoUrl={resolveSafeVesselPhotoUrl(vessel.photoUrl)}
              status={{
                label: status.label,
                tone: status.tone,
              }}
              metrics={[
                {
                  label: "Passageiros",
                  value: formatMetric(vessel.maxPassengerCapacity),
                },
                {
                  label: "Conveses",
                  value: String(vessel.deckCount ?? 0),
                },
                {
                  label: "Tripulação",
                  value: formatMetric(vessel.maxCrewCapacity),
                },
              ]}
              idleInfo={{
                icon: "pi-anchor",
                text:
                  basePort !== "—"
                    ? `Sem viagem ativa · Base: ${basePort}`
                    : "Sem viagem ativa · Porto base não informado",
              }}
              compliance={{
                label: compliance.cardLabel,
                tone: compliance.badgeTone,
              }}
              openLabel="Abrir ficha"
              onOpen={() => onOpenVessel(vessel)}
            />
          );
        })}
      </section>

      <div className="vessel-fleet-pagination-bar">
        <Pagination
          page={safeCurrentPage}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={pageSize}
          itemLabel="embarcações"
          disabled={isLoading}
          onPageChange={onPageChange}
        />
      </div>
    </>
  );
}
