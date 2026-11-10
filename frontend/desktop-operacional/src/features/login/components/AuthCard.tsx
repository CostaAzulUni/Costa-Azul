import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../../../components/ui/utils/cx";
import "./AuthCard.css";

export interface AuthCardProps extends HTMLAttributes<HTMLElement> {
  /** id do título, para associar o cartão via aria-labelledby. */
  labelledBy?: string;
  children: ReactNode;
}

/** Cartão branco das telas de autenticação (Figma "Frame 1417" · 557 px, padding 57 × 50). */
export function AuthCard({ labelledBy, className, children, ...rest }: AuthCardProps) {
  return (
    <section
      className={cx("auth-card", className)}
      aria-labelledby={labelledBy}
      {...rest}
    >
      <div className="auth-card__body">{children}</div>
    </section>
  );
}

export interface AuthHeaderProps {
  titleId: string;
  title: ReactNode;
  description?: ReactNode;
  /** Texto complementar em preto, abaixo da descrição (ex.: "Sua senha temporária…"). */
  note?: ReactNode;
  align?: "left" | "center";
  className?: string;
}

/** Bloco "Boas-vindas": título Manrope 28 + instrução Inter 14. */
export function AuthHeader({
  titleId,
  title,
  description,
  note,
  align = "left",
  className,
}: AuthHeaderProps) {
  return (
    <header className={cx("auth-header", `auth-header--${align}`, className)}>
      <h1 id={titleId} className="auth-header__title">
        {title}
      </h1>
      {description && <p className="auth-header__description">{description}</p>}
      {note && <p className="auth-header__note">{note}</p>}
    </header>
  );
}
