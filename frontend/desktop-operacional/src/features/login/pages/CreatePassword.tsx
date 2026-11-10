import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { AUTH_PATHS } from "../../../routes/paths";
import { resetPassword } from "../../../services/passwordRecovery";
import { AuthButton } from "../components/AuthButton";
import { AuthCard, AuthHeader } from "../components/AuthCard";
import { AuthErrorMessage } from "../components/AuthErrorMessage";
import { AuthField } from "../components/AuthField";
import { PasswordRequirements } from "../components/PasswordRequirements";
import { AUTH_ERROR_MESSAGES, NEW_PASSWORD_INPUT_LIMIT, classifyAuthError } from "../utils/authUtils";
import type { AuthLocationState } from "../utils/authState";
import {
  PASSWORD_TOO_LONG_MESSAGE,
  exceedsPasswordMaxLength,
  meetsAllPasswordRules,
} from "../utils/passwordRules";
import "./PasswordForms.css";

const ERROR_ID = "create-password-error";

interface PasswordFeedback {
  message: string;
  password: boolean;
  confirmation: boolean;
}

/** Tela "Criação de Senha" (Figma #3971:1835) e variante de erro (#3977:6244). */
export function CreatePassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as AuthLocationState | null;

  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState<PasswordFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetToken = state?.resetToken;
  if (!resetToken) {
    return (
      <Navigate
        to={AUTH_PATHS.linkExpired}
        replace
        state={{ email: state?.email } satisfies AuthLocationState}
      />
    );
  }

  const clearFeedback = () => {
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (exceedsPasswordMaxLength(password)) {
      setFeedback({ message: PASSWORD_TOO_LONG_MESSAGE, password: true, confirmation: false });
      return;
    }
    if (!meetsAllPasswordRules(password)) {
      setFeedback({
        message: "A nova senha não atende a todas as regras abaixo.",
        password: true,
        confirmation: false,
      });
      return;
    }
    if (password !== confirmation) {
      setFeedback({
        message: "As senhas não coincidem. Verifique e tente novamente.",
        password: false,
        confirmation: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(resetToken, password);
      navigate(AUTH_PATHS.passwordResetSuccess, {
        replace: true,
        state: { email: state?.email } satisfies AuthLocationState,
      });
    } catch (resetError) {
      const kind = classifyAuthError(resetError);
      if (kind === "invalid") {
        navigate(AUTH_PATHS.linkExpired, {
          replace: true,
          state: { email: state?.email } satisfies AuthLocationState,
        });
        return;
      }
      setFeedback({ message: AUTH_ERROR_MESSAGES[kind], password: false, confirmation: false });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard labelledBy="create-password-title" className="password-form password-form--create">
      <AuthHeader
        titleId="create-password-title"
        title="Crie uma nova senha"
        description="Escolha uma senha forte e segura, diferente das utilizadas anteriormente."
        align="center"
        className="password-form__header"
      />

      <form className="password-form__form" onSubmit={handleSubmit} noValidate>
        <div className="password-form__fields">
          <AuthField
            id="create-password"
            type="password"
            size="lg"
            strongLabel
            label="Crie sua senha"
            placeholder="Digite sua senha"
            autoComplete="new-password"
            maxLength={NEW_PASSWORD_INPUT_LIMIT}
            autoFocus
            value={password}
            onValueChange={(value) => {
              setPassword(value);
              clearFeedback();
            }}
            invalid={feedback?.password}
            errorId={ERROR_ID}
            aria-describedby="create-password-rules"
            disabled={isSubmitting}
            required
          />

          <AuthField
            id="create-password-confirmation"
            type="password"
            size="lg"
            strongLabel
            label="Repita sua senha"
            placeholder="Digite sua senha"
            autoComplete="new-password"
            maxLength={NEW_PASSWORD_INPUT_LIMIT}
            value={confirmation}
            onValueChange={(value) => {
              setConfirmation(value);
              clearFeedback();
            }}
            invalid={feedback?.confirmation}
            errorId={ERROR_ID}
            disabled={isSubmitting}
            required
          />

          <AuthErrorMessage id={ERROR_ID} message={feedback?.message ?? null} />
        </div>

        <PasswordRequirements id="create-password-rules" password={password} />

        <AuthButton type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Criar nova senha"}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
