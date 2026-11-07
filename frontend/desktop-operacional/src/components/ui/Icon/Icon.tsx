import type { ReactNode } from "react";
import { cx } from "../utils/cx";

/**
 * Um ícone pode ser o nome de um PrimeIcon ("pi-ship" ou "pi pi-ship")
 * ou qualquer elemento React (ex.: um SVG customizado).
 */
export type IconSource = string | ReactNode;

export interface IconProps {
  icon: IconSource;
  className?: string;
}

/**
 * Componente interno de apoio que padroniza a renderização de ícones nos componentes
 * do Design System. Ícones são decorativos (aria-hidden); o significado deve vir do texto
 * visível ou de um aria-label no elemento interativo.
 */
export function Icon({ icon, className }: IconProps) {
  if (icon === null || icon === undefined || icon === false || icon === "") {
    return null;
  }

  if (typeof icon === "string") {
    const iconClass = icon.startsWith("pi ") ? icon : `pi ${icon}`;
    return <i className={cx(className, iconClass)} aria-hidden="true" />;
  }

  return (
    <span className={className} aria-hidden="true">
      {icon}
    </span>
  );
}
