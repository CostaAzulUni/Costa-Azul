import type { HTMLAttributes, KeyboardEvent } from "react";
import { Badge } from "../../../ui/Badge/Badge";
import { Icon, type IconSource } from "../../../ui/Icon/Icon";
import { IconButton } from "../../../ui/IconButton/IconButton";
import { cx } from "../../../ui/utils/cx";
import type { DomainStatus } from "../types";
import "./AreaCard.css";

export interface AreaCardProps extends Omit<HTMLAttributes<HTMLElement>, "onClick"> {
  name: string;
  /** Categoria operacional da área (ex.: "Restaurante", "Piscina", "Lounge"). */
  category: string;
  categoryIcon?: IconSource;
  /** Localização na embarcação (ex.: "Convés 8 · Panorama"). */
  deckLabel?: string;
  /** Capacidade máxima (ex.: "180 pessoas" ou 180). */
  capacity?: string | number;
  /** Horário de funcionamento (ex.: "07:00 – 23:00"). */
  operatingHours?: string;
  photoUrl?: string;
  status: DomainStatus;
  /** Ação de edição rápida exibida no cabeçalho do card. */
  onEdit?: () => void;
  /** Torna o card clicável para abrir detalhes da área. */
  onClick?: () => void;
}

/**
 * Card de Área ("Card de área" #4422:27239 no Figma).
 * Exibe foto, categoria com ícone, nome da área, localização no convés,
 * capacidade, horário de funcionamento e Badge de status operacional.
 */
export function AreaCard({
  name,
  category,
  categoryIcon = "pi-compass",
  deckLabel,
  capacity,
  operatingHours,
  photoUrl,
  status,
  onEdit,
  onClick,
  className,
  ...rest
}: AreaCardProps) {
  const isInteractive = Boolean(onClick);

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isInteractive || !onClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  const formattedCapacity =
    typeof capacity === "number" ? `${capacity} pessoas` : capacity;

  return (
    <article
      className={cx(
        "area-card",
        isInteractive && "area-card--interactive",
        className
      )}
      onClick={onClick}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      {...rest}
    >
      <div className="area-card__media">
        {photoUrl ? (
          <img src={photoUrl} alt="" className="area-card__image" />
        ) : (
          <div className="area-card__placeholder" aria-hidden="true">
            <Icon icon={categoryIcon} />
          </div>
        )}

        <Badge tone={status.tone} className="area-card__status">
          {status.label}
        </Badge>

        {onEdit && (
          <div
            className="area-card__edit"
            onClick={(event) => event.stopPropagation()}
          >
            <IconButton
              variant="outline"
              size="sm"
              icon="pi-pencil"
              aria-label={`Editar área ${name}`}
              onClick={onEdit}
            />
          </div>
        )}
      </div>

      <div className="area-card__body">
        <div className="area-card__category">
          <Icon icon={categoryIcon} className="area-card__category-icon" />
          <span>{category}</span>
        </div>

        <h3 className="area-card__name">{name}</h3>

        {(deckLabel || formattedCapacity || operatingHours) && (
          <ul className="area-card__meta">
            {deckLabel && (
              <li>
                <i className="pi pi-sitemap" aria-hidden="true" />
                <span>{deckLabel}</span>
              </li>
            )}
            {formattedCapacity && (
              <li>
                <i className="pi pi-users" aria-hidden="true" />
                <span className="font-tabular">{formattedCapacity}</span>
              </li>
            )}
            {operatingHours && (
              <li>
                <i className="pi pi-clock" aria-hidden="true" />
                <span className="font-tabular">{operatingHours}</span>
              </li>
            )}
          </ul>
        )}
      </div>
    </article>
  );
}
