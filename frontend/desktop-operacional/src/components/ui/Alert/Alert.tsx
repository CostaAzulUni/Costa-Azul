import type { HTMLAttributes, ReactNode } from "react";
import { Button } from "../Button/Button";
import "./Alert.css";

/**
 * Variantes semânticas correspondentes à propriedade "Tom" no Figma:
 * warning (Alerta), success (Sucesso), info (Info) e error (Erro).
 */
export type AlertVariant = "warning" | "success" | "info" | "error";

/**
 * Record<AlertVariant, string> garante que caso uma nova variante seja adicionada a AlertVariant
 * no futuro, o TypeScript exigirá que um ícone padrão seja mapeado para ela aqui.
 */
const DEFAULT_ALERT_ICONS: Record<AlertVariant, string> = {
  warning: "pi-exclamation-triangle",
  success: "pi-check-circle",
  info: "pi-info-circle",
  error: "pi-times-circle",
};

export interface AlertProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  variant?: AlertVariant;
  title: string;
  description?: ReactNode;
  icon?: string | ReactNode;
  actionLabel?: string;
  actionIcon?: string | ReactNode;
  onAction?: () => void;
}

export function Alert({
  variant = "info",
  title,
  description,
  icon,
  actionLabel,
  actionIcon,
  onAction,
  className = "",
  ...rest
}: AlertProps) {
  const resolvedIcon = icon ?? DEFAULT_ALERT_ICONS[variant];

  const classes = ["ui-alert", `ui-alert--${variant}`, className]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    if (typeof resolvedIcon === "string") {
      const iconClass = resolvedIcon.startsWith("pi ")
        ? resolvedIcon
        : `pi ${resolvedIcon}`;
      return <i className={`ui-alert__icon ${iconClass}`} aria-hidden="true" />;
    }

    return (
      <span className="ui-alert__icon" aria-hidden="true">
        {resolvedIcon}
      </span>
    );
  };

  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      className={classes}
      {...rest}
    >
      <div className="ui-alert__main">
        {renderIcon()}

        <div className="ui-alert__content">
          <p className="ui-alert__title">{title}</p>
          {description && (
            <div className="ui-alert__description">{description}</div>
          )}
        </div>
      </div>

      {/* Composição de Componentes: reutilizamos o nosso próprio <Button> para a ação do Alert */}
      {actionLabel && (
        <div className="ui-alert__actions">
          <Button
            variant="secondary"
            size="sm"
            icon={actionIcon}
            onClick={onAction}
          >
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
