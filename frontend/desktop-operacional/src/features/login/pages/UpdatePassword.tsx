import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_PATHS } from "../../../routes/paths";
import { changePassword } from "../../../services/passwordRecovery";
import checkmarkIcon from "../assets/checkmark-circle-outline.svg";
import { AuthButton } from "../components/AuthButton";
import { AuthCard, AuthHeader } from "../components/AuthCard";
import { AuthErrorMessage } from "../components/AuthErrorMessage";
import { AuthField } from "../components/AuthField";
import { PasswordRequirements } from "../components/PasswordRequirements";
import {
  AUTH_ERROR_MESSAGES,
  CURRENT_PASSWORD_MAX_LENGTH,
  NEW_PASSWORD_INPUT_LIMIT,
  classifyAuthError,
} from "../utils/authUtils";
import {
  PASSWORD_TOO_LONG_MESSAGE,
  exceedsPasswordMaxLength,
  meetsAllPasswordRules,
} from "../utils/passwordRules";
import "./PasswordForms.css";

const ERROR_ID = "update-password-error";

interface UpdateFeedback {
  message: string;
  current: boolean;
  next: boolean;
  confirmation: boolean;
}

/** Tela "Atualização de Senha" — troca da senha temporária (Figma #3967:414 e erro #3977:6344). */
export function UpdatePassword() {
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [feedback, setFeedback] = useState<UpdateFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    if (feedback) setFeedback(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    if (!currentPassword) {
      setFeedback({
        message: "Informe sua senha atual.",
        current: true,
        next: false,
        confirmation: false,
      });
      return;
    }
    if (exceedsPasswordMaxLength(newPassword)) {
      setFeedback({
        message: PASSWORD_TOO_LONG_MESSAGE,
        current: false,
        next: true,
        confirmation: false,
      });
      return;
    }
    if (!meetsAllPasswordRules(newPassword)) {
      setFeedback({
        message: "A nova senha não atende a todas as regras abaixo.",
        current: false,
        next: true,
        confirmation: false,
      });
      return;
    }
    if (newPassword === currentPassword) {
      setFeedback({
        message: "A nova senha deve ser diferente da senha atual.",
        current: false,
        next: true,
        confirmation: false,
      });
      return;
    }
    if (newPassword !== confirmation) {
      setFeedback({
        message: "As senhas não coincidem. Verifique e tente novamente.",
        current: false,
        next: false,
        confirmation: true,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      navigate(AUTH_PATHS.passwordResetSuccess, { replace: true });
    } catch (changeError) {
      const kind = classifyAuthError(changeError);
      setFeedback(
        kind === "invalid"
          ? {
              message:
                "Senhas incorretas, verifique as regras abaixo e se a senha atual está correta.",
              current: true,
              next: true,
              confirmation: false,
            }
          : { message: AUTH_ERROR_MESSAGES[kind], current: false, next: false, confirmation: false }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthCard labelledBy="update-password-title" className="password-form password-form--update">
      <AuthHeader
        titleId="update-password-title"
        title="Atualize sua senha"
        description="Por ser seu primeiro acesso ou após um longo período, é necessário substituir a senha temporária para maior segurança."
        note="Sua senha temporária atual expirará após a atualização."
      />

      <form className="password-form__form" onSubmit={handleSubmit} noValidate>
        <AuthField
          id="update-current-password"
          type="password"
          size="lg"
          label="Insira sua senha atual"
          placeholder="Digite sua senha"
          autoComplete="current-password"
          maxLength={CURRENT_PASSWORD_MAX_LENGTH}
          autoFocus
          value={currentPassword}
          onValueChange={updateField(setCurrentPassword)}
          invalid={feedback?.current}
          errorId={ERROR_ID}
          disabled={isSubmitting}
          required
        />

        <AuthField
          id="update-new-password"
          type="password"
          label="Insira sua nova senha"
          placeholder="Digite sua senha"
          autoComplete="new-password"
          maxLength={NEW_PASSWORD_INPUT_LIMIT}
          value={newPassword}
          onValueChange={updateField(setNewPassword)}
          invalid={feedback?.next}
          errorId={ERROR_ID}
          aria-describedby="update-password-rules"
          disabled={isSubmitting}
          required
          labelAction={
            <Link to={AUTH_PATHS.recoverAccess} className="auth-link">
              Esqueceu sua senha?
            </Link>
          }
        />

        <AuthErrorMessage id={ERROR_ID} message={feedback?.message ?? null} />

        <PasswordRequirements id="update-password-rules" password={newPassword} />

        <AuthField
          id="update-password-confirmation"
          type="password"
          label="Confirmar nova senha"
          placeholder="Digite sua senha"
          autoComplete="new-password"
          maxLength={NEW_PASSWORD_INPUT_LIMIT}
          value={confirmation}
          onValueChange={updateField(setConfirmation)}
          invalid={feedback?.confirmation}
          errorId={ERROR_ID}
          disabled={isSubmitting}
          required
        />

        <AuthButton
          type="submit"
          disabled={isSubmitting}
          icon={<img src={checkmarkIcon} alt="" width={24} height={24} />}
          iconPosition="right"
        >
          {isSubmitting ? "Atualizando..." : "Atualizar senha"}
        </AuthButton>
      </form>
    </AuthCard>
  );
}
