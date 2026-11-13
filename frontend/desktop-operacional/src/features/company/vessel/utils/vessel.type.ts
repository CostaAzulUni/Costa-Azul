import type { BadgeTone } from "../../../../components";

export type VesselStatusFilterValue =
  | "ALL"
  | "ACTIVE"
  | "MAINTENANCE"
  | "INACTIVE"
  | "DRY_DOCK";

export type VesselComplianceState =
  | "valid"
  | "expiring_soon"
  | "expired"
  | "missing";

export type VesselComplianceFilterValue = "ALL" | VesselComplianceState;

export type VesselComplianceVisualTone =
  | "ok"
  | "warning"
  | "error"
  | "neutral";

export interface VesselStatusDisplay {
  value: string;
  label: string;
  tone: BadgeTone;
}

export interface VesselComplianceEvaluation {
  state: VesselComplianceState;
  daysDifference: number | null;
  shortLabel: string;
  cardLabel: string;
  cardTone: VesselComplianceVisualTone;
  iconName: string;
  badgeTone: BadgeTone;
  expiryFormatted: string;
}

export interface FleetKpiSummary {
  totalCount: number;
  activeCount: number;
  maintenanceCount: number;
  inactiveCount: number;
  totalPassengerCapacity: number;
  expiredCertificatesCount: number;
  expiringSoonCertificatesCount: number;
  missingCertificatesCount: number;
  totalComplianceAlerts: number;
}


export interface VesselProfileReadinessItem {
  id: string;
  label: string;
  completed: boolean;
  detail: string;
  targetTab: string;
}

export interface VesselProfileReadiness {
  percentage: number;
  completedCount: number;
  totalCount: number;
  items: VesselProfileReadinessItem[];
}
