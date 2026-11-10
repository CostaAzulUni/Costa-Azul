import "./AuthCard.css";

export interface AuthErrorMessageProps {
  id: string;
  message: string | null;
}

/** Mensagem de erro em pílula (Figma "Frame 1390"), anunciada por leitores de tela. */
export function AuthErrorMessage({ id, message }: AuthErrorMessageProps) {
  if (!message) return null;

  return (
    <p id={id} className="auth-error" role="alert">
      {message}
    </p>
  );
}
