import type { ReactNode } from "react";
import { Breadcrumb, type BreadcrumbItem } from "../../../layout/Breadcrumb/Breadcrumb";
import { Badge } from "../../../ui/Badge/Badge";
import { Button } from "../../../ui/Button/Button";
import { Icon } from "../../../ui/Icon/Icon";
import { Tabs, type TabItem } from "../../../ui/Tabs/Tabs";
import { cx } from "../../../ui/utils/cx";
import type { DomainMetaItem, DomainMetric, DomainStatus } from "../types";
import "./VesselHeader.css";

export interface VesselHeaderTabs {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** Mesmo prefixo usado nos <TabPanel> da página. */
  idPrefix?: string;
}

export interface VesselHeaderProps {
  name: string;
  breadcrumb?: BreadcrumbItem[];
  photoUrl?: string;
  /** Sem foto + callback = mostra o botão "Enviar foto" no placeholder. */
  onPhotoUpload?: () => void;
  /** Badges ao lado do nome (ex.: status operacional e viagem ativa). */
  badges?: DomainStatus[];
  /** Metadados com ícone (tipo, IMO, bandeira, porto base...). */
  meta?: DomainMetaItem[];
  /** "Números-chave" (o Figma usa 6). */
  keyMetrics?: DomainMetric[];
  /** Ações do topo (ex.: Exportar ficha, Editar, Mais ações). */
  actions?: ReactNode;
  tabs?: VesselHeaderTabs;
  className?: string;
}

/**
 * Cabeçalho da ficha da embarcação ("Embarcação/Cabeçalho" no Figma).
 * É um componente de COMPOSIÇÃO: junta Breadcrumb, Badge, Button e Tabs já existentes.
 * Não busca dados — a página converte o DTO da API nas props abaixo.
 */
export function VesselHeader({
  name,
  breadcrumb,
  photoUrl,
  onPhotoUpload,
  badges = [],
  meta = [],
  keyMetrics = [],
  actions,
  tabs,
  className,
}: VesselHeaderProps) {
  return (
    <header className={cx("vessel-header", className)}>
      {(breadcrumb || actions) && (
        <div className="vessel-header__top">
          {breadcrumb ? <Breadcrumb items={breadcrumb} /> : <span />}
          {actions && <div className="vessel-header__actions">{actions}</div>}
        </div>
      )}

      <div className="vessel-header__summary">
        <div className="vessel-header__photo">
          {photoUrl ? (
            <img src={photoUrl} alt={`Foto da embarcação ${name}`} />
          ) : (
            <div className="vessel-header__photo-placeholder">
              <i className="pi pi-image" aria-hidden="true" />
              {onPhotoUpload && (
                <Button variant="ghost" size="sm" onClick={onPhotoUpload}>
                  Enviar foto
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="vessel-header__identity">
          <div className="vessel-header__name-row">
            <h1 className="vessel-header__name">{name}</h1>
            {badges.map((badge) => (
              <Badge key={badge.label} tone={badge.tone}>
                {badge.label}
              </Badge>
            ))}
          </div>

          {meta.length > 0 && (
            <ul className="vessel-header__meta">
              {meta.map((item) => (
                <li key={item.label}>
                  <Icon icon={item.icon} className="vessel-header__meta-icon" />
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {keyMetrics.length > 0 && (
        // <dl> (lista de definição) é a tag semântica para pares "rótulo → valor"
        <dl className="vessel-header__metrics">
          {keyMetrics.map((metric) => (
            <div key={metric.label} className="vessel-header__metric">
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {tabs && (
        <Tabs
          aria-label={`Seções da embarcação ${name}`}
          items={tabs.items}
          activeId={tabs.activeId}
          onChange={tabs.onChange}
          idPrefix={tabs.idPrefix}
          className="vessel-header__tabs"
        />
      )}
    </header>
  );
}
