import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../utils/cx";
import "./Badge.css";

/** Tons do Figma: Sucesso, Alerta, Erro, Info, Neutro e Automático. */
export type BadgeTone =
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral"
  | "automatic";

export type BadgeSize = "sm" | "md";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
  size?: BadgeSize;
  /** Exibe o ponto colorido de 6px antes do texto. Por padrão, só não aparece em "automatic". */
  dot?: boolean;
  children: ReactNode;
}

export function Badge({
  tone = "neutral",
  size,
  dot,
  children,
  className,
  ...rest
}: BadgeProps) {
  // Valores derivados: se a prop não foi informada, seguimos a regra do Figma para o tom
  const showDot = dot ?? tone !== "automatic";
  const resolvedSize = size ?? (tone === "automatic" ? "sm" : "md");

  return (
    <span
      className={cx(
        "ui-badge",
        `ui-badge--${tone}`,
        `ui-badge--${resolvedSize}`,
        className
      )}
      {...rest}
    >
      {showDot && <span className="ui-badge__dot" aria-hidden="true" />}
      <span className="ui-badge__label">{children}</span>
    </span>
  );
}
