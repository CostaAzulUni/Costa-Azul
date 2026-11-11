import { useEffect, type HTMLAttributes, type ReactNode } from "react";
import { Icon, type IconSource } from "../Icon/Icon";
import { cx } from "../utils/cx";
import "./Toast.css";

export type ToastVariant = "success" | "warning" | "error" | "info";

const DEFAULT_TOAST_ICONS: Record<ToastVariant, string> = {
  success: "pi-check-circle",
  warning: "pi-exclamation-triangle",
  error: "pi-times-circle",
  info: "pi-info-circle",
};

export interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  /** Controla se a notificação está visível. Padrão: true. */
  open?: boolean;
  variant?: ToastVariant;
  message: ReactNode;
  description?: ReactNode;
  icon?: IconSource;
  /** Fecha automaticamente após X milissegundos (ex.: 4000). Se omitido, permanece até fechar. */
  durationMs?: number;
  /** Quando true (padrão), fixa o Toast no canto inferior direito da janela. */
  fixed?: boolean;
  onClose?: () => void;
}

/**
 * Toast ("Toast" #4422:16833 no Figma).
 * Notificação flutuante de feedback rápido (ex.: "Alterações salvas", "Rascunho salvo").
 */
export function Toast({
  open = true,
  variant = "success",
  message,
  description,
  icon,
  durationMs,
  fixed = true,
  onClose,
  className,
  ...rest
}: ToastProps) {
  useEffect(() => {
    if (!open || !durationMs || !onClose) return;

    const timer = window.setTimeout(() => {
      onClose();
    }, durationMs);

    return () => window.clearTimeout(timer);
  }, [open, durationMs, onClose]);

  if (!open) return null;

  const resolvedIcon = icon ?? DEFAULT_TOAST_ICONS[variant];

  return (
    <div
      role={variant === "error" || variant === "warning" ? "alert" : "status"}
      aria-live="polite"
      className={cx(
        "ui-toast",
        `ui-toast--${variant}`,
        fixed && "ui-toast--fixed",
        className
      )}
      {...rest}
    >
      <Icon icon={resolvedIcon} className="ui-toast__icon" />

      <div className="ui-toast__content">
        <span className="ui-toast__message">{message}</span>
        {description && (
          <span className="ui-toast__description">{description}</span>
        )}
      </div>

      {onClose && (
        <button
          type="button"
          className="ui-toast__close"
          onClick={onClose}
          aria-label="Fechar notificação"
        >
          <i className="pi pi-times" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
