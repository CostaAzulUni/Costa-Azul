import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import "./KPI.css";

/**
 * Tons semânticos do badge/pill inferior de destaque (delta percentual ou resumo operacional).
 */
export type KPIHighlightTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

export interface KPIProps extends HTMLAttributes<HTMLElement> {
  label: string;
  value: string | number;
  icon?: string | ReactNode;
  highlightText?: string;
  highlightTone?: KPIHighlightTone;
  detailText?: string;
  loading?: boolean;
  onClick?: () => void;
}

export function KPI({
  label,
  value,
  icon,
  highlightText,
  highlightTone = "neutral",
  detailText,
  loading = false,
  onClick,
  className = "",
  ...rest
}: KPIProps) {
  const isInteractive = Boolean(onClick) && !loading;

  const classes = [
    "ui-kpi",
    isInteractive ? "ui-kpi--interactive" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    if (!icon) return null;

    if (typeof icon === "string") {
      const iconClass = icon.startsWith("pi ") ? icon : `pi ${icon}`;
      return <i className={`ui-kpi__icon ${iconClass}`} aria-hidden="true" />;
    }

    return (
      <span className="ui-kpi__icon" aria-hidden="true">
        {icon}
      </span>
    );
  };

  /**
   * Acessibilidade por teclado: quando um card KPI possui onClick (funcionando como atalho
   * ou filtro rápido), permitimos acioná-lo também com as teclas Enter ou Espaço.
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!isInteractive || !onClick) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onClick();
    }
  };

  if (loading) {
    return (
      <article
        className={classes}
        aria-busy="true"
        aria-label={`Carregando indicador ${label}`}
        {...rest}
      >
        <span className="ui-kpi__skeleton-bar ui-kpi__skeleton-bar--label" />
        <span className="ui-kpi__skeleton-bar ui-kpi__skeleton-bar--value" />
        <span className="ui-kpi__skeleton-bar ui-kpi__skeleton-bar--detail" />
      </article>
    );
  }

  return (
    <article
      className={classes}
      onClick={isInteractive ? onClick : undefined}
      onKeyDown={isInteractive ? handleKeyDown : undefined}
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      {...rest}
    >
      <header className="ui-kpi__header">
        {renderIcon()}
        <h3 className="ui-kpi__label">{label}</h3>
      </header>

      <p className="ui-kpi__value">{value}</p>

      {(highlightText || detailText) && (
        <footer className="ui-kpi__footer">
          {highlightText && (
            <span
              className={`ui-kpi__highlight ui-kpi__highlight--${highlightTone}`}
            >
              {highlightText}
            </span>
          )}
          {detailText && <span className="ui-kpi__detail">{detailText}</span>}
        </footer>
      )}
    </article>
  );
}
