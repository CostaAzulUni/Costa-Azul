/**
 * Barrel File da Fase 04 — Componentes de Domínio (Embarcações):
 * Exporta VesselHeader, VesselCard, AreaCard, DeckItem e tipos compartilhados.
 */

export type {
  DomainStatus,
  DomainMetric,
  DomainMetaItem,
} from "./types";

export {
  VesselHeader,
  type VesselHeaderProps,
  type VesselHeaderTabs,
} from "./VesselHeader/VesselHeader";

export {
  VesselCard,
  type VesselCardProps,
  type VesselCardTrip,
  type VesselCardIdleInfo,
} from "./VesselCard/VesselCard";

export {
  AreaCard,
  type AreaCardProps,
} from "./AreaCard/AreaCard";

export {
  DeckItem,
  type DeckItemProps,
  type DeckStatusTone,
} from "./DeckItem/DeckItem";
