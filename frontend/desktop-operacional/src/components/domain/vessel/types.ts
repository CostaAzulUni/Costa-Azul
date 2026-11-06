import type { BadgeTone } from "../../ui/Badge/Badge";
import type { IconSource } from "../../ui/Icon/Icon";

/**
 * Tipos compartilhados pelos componentes de domínio de embarcação.
 * Ficam em um arquivo .ts (sem JSX) para poderem ser importados por vários componentes
 * e, no futuro, mapeados a partir dos DTOs de src/services sem acoplar os componentes à API.
 */
export interface DomainStatus {
  label: string;
  tone: BadgeTone;
}

export interface DomainMetric {
  label: string;
  value: string | number;
  icon?: IconSource;
}

export interface DomainMetaItem {
  label: string;
  icon?: IconSource;
}
