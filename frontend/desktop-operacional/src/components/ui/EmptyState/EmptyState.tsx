import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../Button/Button";
import { Icon, type IconSource } from "../Icon/Icon";
import { cx } from "../utils/cx";
import "./EmptyState.css";

export interface EmptyStateProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconSource;
  /** Rótulo do botão de ação principal (CTA). */
  actionLabel?: string;
  actionIcon?: IconSource;
  onAction?: () => void;
  /** Rótulo opcional de ação secundária (ex.: "Limpar filtros"). */
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  /** Renderiza sem borda externa quando já está dentro de um Card ou DataTable. */
  compact?: boolean;
}

/**
 * Estado Vazio ("Empty State" das listagens de Navios, Cabines, Certificados e Viagens no Figma).
 * Exibe ícone ilustrativo, título, descrição orientativa e botões de ação (composição com <Button>).
 */
export function EmptyState({
  title,
  description,
  icon = "pi-inbox",
  actionLabel,
  actionIcon = "pi-plus",
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  compact = false,
  className,
  ...rest
}: EmptyStateProps) {
  return (
    <div
      className={cx(
        "ui-empty-state",
        compact && "ui-empty-state--compact",
        className
      )}
      {...rest}
    >
      <span className="ui-empty-state__icon-box" aria-hidden="true">
        <Icon icon={icon} className="ui-empty-state__icon" />
      </span>

      <div className="ui-empty-state__text">
        <h3 className="ui-empty-state__title">{title}</h3>
        {description && (
          <p className="ui-empty-state__description">{description}</p>
        )}
      </div>

      {(actionLabel || secondaryActionLabel) && (
        <div className="ui-empty-state__actions">
          {secondaryActionLabel && (
            <Button
              variant="secondary"
              size="md"
              onClick={onSecondaryAction}
            >
              {secondaryActionLabel}
            </Button>
          )}
          {actionLabel && (
            <Button
              variant="primary"
              size="md"
              icon={actionIcon}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
