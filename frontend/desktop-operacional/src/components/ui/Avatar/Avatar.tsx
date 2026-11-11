import { useState, type HTMLAttributes } from "react";
import { cx } from "../utils/cx";
import "./Avatar.css";

export type AvatarSize = "sm" | "md" | "lg";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  name: string;
  src?: string;
  size?: AvatarSize;
  /** Borda branca de 2px, usada sobre fundos escuros (Sidebar/Topbar). */
  bordered?: boolean;
}

/** "Eliza Souza" -> "ES"; "Eliza" -> "E" */
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return `${first}${last}`.toUpperCase();
}

/**
 * Componente de apoio (não listado nas fases, mas necessário para Sidebar e Topbar).
 * Mostra a foto; se não houver foto ou ela falhar ao carregar, exibe as iniciais.
 */
export function Avatar({
  name,
  src,
  size = "md",
  bordered = false,
  className,
  ...rest
}: AvatarProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // Se a URL mudar, voltamos a tentar carregar a imagem automaticamente
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <span
      className={cx(
        "ui-avatar",
        `ui-avatar--${size}`,
        bordered && "ui-avatar--bordered",
        className
      )}
      role="img"
      aria-label={name}
      {...rest}
    >
      {showImage ? (
        <img
          src={src}
          alt=""
          className="ui-avatar__image"
          onError={() => setFailedSrc(src ?? null)}
        />
      ) : (
        <span aria-hidden="true">{getInitials(name)}</span>
      )}
    </span>
  );
}
