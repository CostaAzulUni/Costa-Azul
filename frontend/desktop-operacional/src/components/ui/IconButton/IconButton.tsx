import type { ButtonHTMLAttributes } from "react";
import { Icon, type IconSource } from "../Icon/Icon";
import { cx } from "../utils/cx";
import "./IconButton.css";

export type IconButtonVariant = "outline" | "ghost";
export type IconButtonSize = "sm" | "md";

/**
 * Um botão só com ícone não tem texto visível. Por isso, "aria-label" é OBRIGATÓRIO aqui:
 * sem ele, leitores de tela anunciariam apenas "botão". Removemos o "aria-label" opcional
 * herdado (Omit) e o declaramos novamente como string obrigatória.
 */
export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> {
  icon: IconSource;
  "aria-label": string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  /** Ponto de notificação no canto superior direito (ex.: sino da Topbar). */
  badgeDot?: boolean;
  /** Contador numérico; valores acima de 99 são exibidos como "99+". */
  badgeCount?: number;
}

export function IconButton({
  icon,
  variant = "ghost",
  size = "md",
  badgeDot = false,
  badgeCount,
  type = "button",
  className,
  title,
  ...rest
}: IconButtonProps) {
  const hasCount = typeof badgeCount === "number" && badgeCount > 0;
  const countLabel = hasCount && badgeCount > 99 ? "99+" : String(badgeCount);

  return (
    <button
      type={type}
      // O title mostra uma dica nativa ao passar o mouse; usamos o aria-label como padrão
      title={title ?? rest["aria-label"]}
      className={cx(
        "ui-icon-button",
        `ui-icon-button--${variant}`,
        `ui-icon-button--${size}`,
        className
      )}
      {...rest}
    >
      <Icon icon={icon} className="ui-icon-button__icon" />
      {hasCount ? (
        <span className="ui-icon-button__count" aria-hidden="true">
          {countLabel}
        </span>
      ) : (
        badgeDot && <span className="ui-icon-button__dot" aria-hidden="true" />
      )}
    </button>
  );
}
