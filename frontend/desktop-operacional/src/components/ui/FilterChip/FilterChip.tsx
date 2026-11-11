import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon, type IconSource } from "../Icon/Icon";
import { cx } from "../utils/cx";
import "./FilterChip.css";

export interface FilterChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  selected?: boolean;
  count?: number;
  icon?: IconSource;
}

/**
 * Chip de filtro (pill 32px). É um botão "alternável": aria-pressed informa ao leitor de tela
 * se o filtro está ativo. Quem controla `selected` é a tela (componente controlado).
 */
export function FilterChip({
  children,
  selected = false,
  count,
  icon,
  type = "button",
  className,
  ...rest
}: FilterChipProps) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        "ui-filter-chip",
        selected && "ui-filter-chip--selected",
        className
      )}
      {...rest}
    >
      {icon !== undefined && <Icon icon={icon} className="ui-filter-chip__icon" />}
      <span>{children}</span>
      {typeof count === "number" && (
        <span className="ui-filter-chip__count">{count}</span>
      )}
    </button>
  );
}
