import type { ReactNode } from "react";
import { cx } from "../../../components/ui/utils/cx";
import { AuthCard, AuthHeader } from "./AuthCard";
import "./AuthStatus.css";

export type AuthStatusVariant = "alert" | "illustrated" | "success";

export interface AuthStatusProps {
  titleId: string;
  /** Ilustração/ícone exibido no topo do cartão. */
  illustration: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Linha extra do cabeçalho, em preto (ex.: tela de link expirado). */
  note?: ReactNode;
  /** Orientação complementar (texto em preto). */
  message?: ReactNode;
  messageAlign?: "left" | "center";
  /** Botões de ação, já na ordem do design. */
  actions: ReactNode;
  footnote?: ReactNode;
  /**
   * alert       → ícone 96 × 85 (conta bloqueada, acesso negado)
   * illustrated → ilustração 200 × 300 com cantos arredondados (conta desativada, sessão expirada)
   * success     → ilustração livre (senha redefinida, link expirado)
   */
  variant?: AuthStatusVariant;
  className?: string;
}

/** Cartão de status das telas de autenticação (bloqueio, acesso negado, sessão expirada etc.). */
export function AuthStatus({
  titleId,
  illustration,
  title,
  description,
  note,
  message,
  messageAlign = "center",
  actions,
  footnote,
  variant = "illustrated",
  className,
}: AuthStatusProps) {
  return (
    <AuthCard
      labelledBy={titleId}
      className={cx("auth-status", `auth-status--${variant}`, className)}
    >
      <div className="auth-status__illustration">{illustration}</div>

      <AuthHeader
        titleId={titleId}
        title={title}
        description={description}
        note={note}
        align="center"
        className="auth-status__header"
      />

      {message && (
        <p className={cx("auth-status__message", `auth-status__message--${messageAlign}`)}>
          {message}
        </p>
      )}

      <div className="auth-status__actions">{actions}</div>

      {footnote && <p className="auth-footnote">{footnote}</p>}
    </AuthCard>
  );
}
