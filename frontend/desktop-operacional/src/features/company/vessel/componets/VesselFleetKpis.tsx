import { KPI } from "../../../../components";
import {
  getFleetComplianceKpiPresentation,
  type FleetKpiSummary,
} from "../utils";

export interface VesselFleetKpisProps {
  fleetKpis: FleetKpiSummary;
  isOverviewLoading: boolean;
}

export function VesselFleetKpis({
  fleetKpis,
  isOverviewLoading,
}: VesselFleetKpisProps) {
  const compliancePresentation = getFleetComplianceKpiPresentation(fleetKpis);

  return (
    <section
      className="vessel-fleet-kpis"
      aria-label="Indicadores operacionais da frota"
    >
      <KPI
        label="Embarcações em operação"
        icon="pi-compass"
        loading={isOverviewLoading}
        value={String(fleetKpis.activeCount)}
        highlightText={`de ${fleetKpis.totalCount} na frota`}
        highlightTone={fleetKpis.activeCount > 0 ? "success" : "neutral"}
        detailText={
          fleetKpis.totalCount > 0
            ? `${fleetKpis.maintenanceCount} em manutenção · ${fleetKpis.inactiveCount} fora de serviço`
            : "Nenhuma embarcação cadastrada"
        }
      />

      <KPI
        label="Viagens em curso"
        icon="pi-send"
        loading={isOverviewLoading}
        value="—"
        highlightText="Não integrado"
        highlightTone="neutral"
        detailText="Módulo de viagens ainda não integrado à API"
      />

      <KPI
        label="Passageiros a bordo"
        icon="pi-users"
        loading={isOverviewLoading}
        value="—"
        highlightText={
          fleetKpis.totalPassengerCapacity > 0
            ? `Cap. frota: ${fleetKpis.totalPassengerCapacity.toLocaleString("pt-BR")}`
            : "Sem capacidade nominal"
        }
        highlightTone="neutral"
        detailText="Embarque em tempo real indisponível no backend"
      />

      <KPI
        label="Alertas de conformidade"
        icon="pi-shield"
        loading={isOverviewLoading}
        value={String(fleetKpis.totalComplianceAlerts)}
        highlightText={compliancePresentation.highlightText}
        highlightTone={compliancePresentation.tone}
        detailText={compliancePresentation.detailText}
      />
    </section>
  );
}
