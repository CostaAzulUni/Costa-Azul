import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toast } from "../../../components";
import { AUTH_PATHS } from "../../../routes/paths";
import { requestPasswordReset, verifyResetCode } from "../../../services/passwordRecovery";
import { AuthButton } from "../components/AuthButton";
import { AuthCard } from "../components/AuthCard";
import { AuthErrorMessage } from "../components/AuthErrorMessage";
import { VerificationCodeInput } from "../components/VerificationCodeInput";
import {
  AUTH_ERROR_MESSAGES,
  RESET_CODE_LENGTH,
  RESET_CODE_TTL_SECONDS,
  classifyAuthError,
  formatCountdown,
  maskEmail,
} from "../utils/authUtils";
import type { AuthLocationState } from "../utils/authState";
import "./VerifyEmail.css";

const ERROR_ID = "verify-error";
const emptyCode = () => Array.from({ length: RESET_CODE_LENGTH }, () => "");

/** Tela "Verificação de E-mail" (Figma #3971:1526) e variante de erro (#3977:6162). */
export function VerifyEmail() {
  const location = useLocation();
  const state = (location.state ?? null) as AuthLocationState | null;
  const email = state?.email;

  if (!email) {
    return <Navigate to={AUTH_PATHS.recoverAccess} replace />;
  }

  // `key` reinicia o estado (código e contagem) se o fluxo for refeito para outro e-mail
  return <VerifyEmailForm key={email} email={email} />;
}

interface VerifyEmailFormProps {
  email: string;
}

function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const navigate = useNavigate();

  const [digits, setDigits] = useState<string[]>(emptyCode);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESET_CODE_TTL_SECONDS);
  const [resentNotice, setResentNotice] = useState(false);

  const closeResentNotice = useCallback(() => setResentNotice(false), []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(0, current - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (secondsLeft === 0) {
      navigate(AUTH_PATHS.linkExpired, {
        replace: true,
        state: { email } satisfies AuthLocationState,
      });
    }
  }, [secondsLeft, email, navigate]);

  const handleDigitsChange = (next: string[]) => {
    setDigits(next);
    if (error) setError(null);
  };

  const handleResend = async () => {
    if (isResending) return;
    setIsResending(true);
    setError(null);

    try {
      await requestPasswordReset(email);
      setDigits(emptyCode());
      setSecondsLeft(RESET_CODE_TTL_SECONDS);
      setResentNotice(true);
    } catch (resendError) {
      const kind = classifyAuthError(resendError);
      setError(kind === "invalid" ? AUTH_ERROR_MESSAGES.unknown : AUTH_ERROR_MESSAGES[kind]);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const code = digits.join("");
    if (code.length < RESET_CODE_LENGTH) {
      setError(`Digite os ${RESET_CODE_LENGTH} números do código.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const { resetToken } = await verifyResetCode(email, code);
      navigate(AUTH_PATHS.createPassword, {
        replace: true,
        state: { email, resetToken } satisfies AuthLocationState,
      });
    } catch (verifyError) {
      const kind = classifyAuthError(verifyError);
      setError(
        kind === "invalid"
          ? "Código incorreto, por favor tente novamente!"
          : AUTH_ERROR_MESSAGES[kind]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthCard labelledBy="verify-title" className="verify-email">
        <form className="verify-email__form" onSubmit={handleSubmit} noValidate>
          <div className="verify-email__intro">
            <header className="auth-header auth-header--center">
              <h1 id="verify-title" className="auth-header__title">
                Verifique seu E-mail
              </h1>
              <p className="auth-header__description">
                Se houver uma conta para <strong>{maskEmail(email)}</strong>, você receberá as
                informações em instantes.
              </p>
            </header>

            <div className="verify-email__confirm">
              <h2 className="verify-email__subtitle">Confirme que é você</h2>
              <p className="auth-header__description">
                Digite o código de {RESET_CODE_LENGTH} números enviado para seu e-mail cadastrado.
              </p>
            </div>
          </div>

          <div className="verify-email__code">
            <VerificationCodeInput
              id="verify-code"
              label="Código de verificação"
              digits={digits}
              onDigitsChange={handleDigitsChange}
              invalid={error !== null}
              errorId={ERROR_ID}
              disabled={isSubmitting}
              autoFocus
            />

            <AuthErrorMessage id={ERROR_ID} message={error} />

            <button
              type="button"
              className="auth-link verify-email__resend"
              onClick={handleResend}
              disabled={isResending || isSubmitting}
            >
              {isResending ? "Reenviando..." : "Reenviar código"}
            </button>
          </div>

          <div className="verify-email__submit">
            <p className="verify-email__timer" aria-live="off">
              O código expira em{" "}
              <strong>
                <time dateTime={`PT${secondsLeft}S`}>{formatCountdown(secondsLeft)}</time>
              </strong>{" "}
              minutos
            </p>

            <AuthButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Verificando..." : "Enviar"}
            </AuthButton>
          </div>
        </form>
      </AuthCard>

      <Toast
        open={resentNotice}
        variant="success"
        message="Novo código enviado"
        description={`Confira a caixa de entrada de ${maskEmail(email)}.`}
        durationMs={5000}
        onClose={closeResentNotice}
      />
    </>
  );
}
