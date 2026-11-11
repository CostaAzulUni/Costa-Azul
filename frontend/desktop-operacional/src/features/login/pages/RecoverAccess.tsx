import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_PATHS } from "../../../routes/paths";
import { requestPasswordReset } from "../../../services/passwordRecovery";
import { AuthButton } from "../components/AuthButton";
import { AuthCard, AuthHeader } from "../components/AuthCard";
import { AuthErrorMessage } from "../components/AuthErrorMessage";
import { AuthField } from "../components/AuthField";
import { AUTH_ERROR_MESSAGES, classifyAuthError, isValidEmail } from "../utils/authUtils";
import type { AuthLocationState } from "../utils/authState";

const ERROR_ID = "recover-error";

/** Tela "Recuperação de Acesso" (Figma #3967:1039) e variante de erro (#3977:6111). */
export function RecoverAccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as AuthLocationState | null;

  const [email, setEmail] = useState(state?.email ?? "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (error) setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Informe o e-mail cadastrado.");
      return;
    }
    if (!isValidEmail(trimmedEmail)) {
      setError("Email incorreto, por favor tente novamente!");
      return;
    }

    setIsSubmitting(true);
    try {
      await requestPasswordReset(trimmedEmail);
      navigate(AUTH_PATHS.verifyEmail, {
        state: { email: trimmedEmail } satisfies AuthLocationState,
      });
    } catch (requestError) {
      const kind = classifyAuthError(requestError);
      setError(
        kind === "invalid"
          ? "Email incorreto, por favor tente novamente!"
          : AUTH_ERROR_MESSAGES[kind]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard labelledBy="recover-title">
      <AuthHeader
        titleId="recover-title"
        title="Recupere seu acesso"
        description="Informe o e-mail cadastrado. Enviaremos o código de verificação para criar uma nova senha."
      />

      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="recover-email"
          type="email"
          size="lg"
          label="Insira seu email"
          placeholder="Digite aqui"
          autoComplete="email"
          autoFocus
          value={email}
          onValueChange={handleEmailChange}
          invalid={error !== null}
          errorId={ERROR_ID}
          disabled={isSubmitting}
          required
        />

        <AuthErrorMessage id={ERROR_ID} message={error} />

        <AuthButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Enviando..." : "Enviar código"}
        </AuthButton>
      </form>

      <p className="auth-footnote">
        Caso não receba o código, verifique se esse e-mail está correto.
      </p>
    </AuthCard>
  );
}
