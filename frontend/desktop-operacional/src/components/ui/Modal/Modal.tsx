import {
  useEffect,
  useId,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Button, type ButtonVariant } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";
import { cx } from "../utils/cx";
import "./Modal.css";

export type ModalSize = "sm" | "md" | "lg";

export interface ModalProps {
  /** Controla se o modal está visível. */
  open: boolean;
  /** Disparado ao clicar no botão fechar (X), no overlay ou ao pressionar Esc. */
  onClose: () => void;
  title: ReactNode;
  subtitle?: ReactNode;
  size?: ModalSize;
  /** Fecha ao clicar fora do card (no fundo escurecido). Padrão: true. */
  closeOnBackdropClick?: boolean;
  /** Conteúdo personalizado do rodapé. Se omitido, pode usar confirmLabel/cancelLabel. */
  footer?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Variante do botão de confirmação (use "danger" para exclusões). */
  confirmVariant?: ButtonVariant;
  confirmDisabled?: boolean;
  onConfirm?: () => void;
  children?: ReactNode;
  className?: string;
}

/**
 * Modal / Dialog (Fase 05).
 * Usa createPortal para renderizar diretamente no <body>, evitando problemas de z-index
 * ou overflow: hidden em containers pais.
 */
export function Modal({
  open,
  onClose,
  title,
  subtitle,
  size = "md",
  closeOnBackdropClick = true,
  footer,
  confirmLabel,
  cancelLabel = "Cancelar",
  confirmVariant = "primary",
  confirmDisabled = false,
  onConfirm,
  children,
  className,
}: ModalProps) {
  const titleId = useId();
  const subtitleId = useId();

  // Fecha com a tecla Escape e trava a rolagem da página de fundo enquanto aberto
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (event: MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  const hasDefaultFooter = footer === undefined && Boolean(confirmLabel);

  return createPortal(
    <div
      className="ui-modal__backdrop"
      onMouseDown={handleBackdropClick}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={subtitle ? subtitleId : undefined}
        className={cx("ui-modal", `ui-modal--${size}`, className)}
      >
        <header className="ui-modal__header">
          <div className="ui-modal__heading">
            <h2 id={titleId} className="ui-modal__title">
              {title}
            </h2>
            {subtitle && (
              <p id={subtitleId} className="ui-modal__subtitle">
                {subtitle}
              </p>
            )}
          </div>

          <IconButton
            variant="ghost"
            size="sm"
            icon="pi-times"
            aria-label="Fechar janela"
            onClick={onClose}
          />
        </header>

        {children !== undefined && (
          <div className="ui-modal__body">{children}</div>
        )}

        {footer !== undefined ? (
          <footer className="ui-modal__footer">{footer}</footer>
        ) : (
          hasDefaultFooter && (
            <footer className="ui-modal__footer">
              <Button variant="secondary" size="md" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant={confirmVariant}
                size="md"
                disabled={confirmDisabled}
                onClick={onConfirm}
              >
                {confirmLabel}
              </Button>
            </footer>
          )
        )}
      </div>
    </div>,
    document.body
  );
}

/** Alias Dialog / DialogProps para compatibilidade com a nomenclatura Modal/Dialog. */
export { Modal as Dialog };
export type { ModalProps as DialogProps };
