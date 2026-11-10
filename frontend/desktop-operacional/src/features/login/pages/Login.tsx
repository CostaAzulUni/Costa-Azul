import { useCallback, useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Toast } from "../../../components";
import { AUTH_PATHS, HOME_PATH } from "../../../routes/paths";
import {
  getRoles,
  hasErpAccess,
  isAuthenticated,
  loginUser,
  startSession,
} from "../../../services/auth";
import outlookIcon from "../assets/outlook.svg";
import { AuthButton } from "../components/AuthButton";
import { AuthCard, AuthHeader } from "../components/AuthCard";
import { AuthErrorMessage } from "../components/AuthErrorMessage";
import { AuthField } from "../components/AuthField";
import {
  AUTH_ERROR_MESSAGES,
  CURRENT_PASSWORD_MAX_LENGTH,
  classifyAuthError,
  isValidEmail,
} from "../utils/authUtils";
import type { AuthLocationState } from "../utils/authState";
import "./Login.css";

const ERROR_ID = "login-error";

interface LoginFeedback {
  message: string;
  email: boolean;
  password: boolean;
}

/** Tela "Login" (Figma #3926:330) e variante de erro (#3967:5914). */
export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? null) as AuthLocationState | null;

  const [email, setEmail] = useState(state?.email ?? "");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<LoginFeedback | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOutlookNotice, setShowOutlookNotice] = useState(false);

  const closeOutlookNotice = useCallback(() => setShowOutlookNotice(false), []);

  // Também cobre o re-render logo após o login: a sessão já existe e o destino é a página de origem
  if (isAuthenticated() && hasErpAccess()) {
    return <Navigate to={state?.from ?? HOME_PATH} replace />;
  }

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (feedback) setFeedback(null);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (feedback) setFeedback(null);
  };

  const validate = (): LoginFeedback | null => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail && !password) {
      return { message: "Preencha o e-mail e a senha.", email: true, password: true };
    }
    if (!trimmedEmail) {
      return { message: "Informe seu e-mail.", email: true, password: false };
    }
    if (!isValidEmail(trimmedEmail)) {
      return { message: "Informe um e-mail válido.", email: true, password: false };
    }
    if (!password) {
      return { message: "Informe sua senha.", email: false, password: true };
    }
    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationError = validate();
    if (validationError) {
      setFeedback(validationError);
      return;
    }

    setIsSubmitting(true);
    setFeedback(null);

    try {
      const { token } = await loginUser(email.trim(), password);
      startSession(token);

      if (!hasErpAccess(getRoles())) {
        navigate(AUTH_PATHS.accessDenied, { replace: true });
        return;
      }

      navigate(state?.from ?? HOME_PATH, { replace: true });
    } catch (error) {
      const kind = classifyAuthError(error);
      setFeedback(
        kind === "invalid"
          ? {
              message: "Usuário ou senha incorretos, por favor tente novamente!",
              email: true,
              password: true,
            }
          : { message: AUTH_ERROR_MESSAGES[kind], email: false, password: false }
      );
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AuthCard labelledBy="login-title">
        <AuthHeader
          titleId="login-title"
          title="Bem-vindo de volta!"
          description="Acesse a operação da sua companhia, cruzeiro ou viagem com segurança."
        />

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <AuthField
            id="login-email"
            type="email"
            size="lg"
            label="Insira seu email"
            placeholder="Digite aqui"
            autoComplete="username"
            autoFocus
            value={email}
            onValueChange={handleEmailChange}
            invalid={feedback?.email}
            errorId={ERROR_ID}
            disabled={isSubmitting}
            required
          />

          <AuthField
            id="login-password"
            type="password"
            label="Insira sua senha"
            placeholder="Digite sua senha"
            autoComplete="current-password"
            maxLength={CURRENT_PASSWORD_MAX_LENGTH}
            value={password}
            onValueChange={handlePasswordChange}
            invalid={feedback?.password}
            errorId={ERROR_ID}
            disabled={isSubmitting}
            required
            labelAction={
              <Link
                to={AUTH_PATHS.recoverAccess}
                state={{ email: email.trim() } satisfies AuthLocationState}
                className="auth-link"
              >
                Esqueceu sua senha?
              </Link>
            }
          />

          <AuthErrorMessage id={ERROR_ID} message={feedback?.message ?? null} />

          <AuthButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Entrando..." : "Entrar"}
          </AuthButton>
        </form>

        <div className="login-separator">
          <span className="login-separator__line" aria-hidden="true" />
          <span>Ou entre utilizando</span>
          <span className="login-separator__line" aria-hidden="true" />
        </div>

        <button
          type="button"
          className="login-provider"
          onClick={() => setShowOutlookNotice(true)}
          disabled={isSubmitting}
        >
          <img src={outlookIcon} alt="" width={17} height={16} />
          <span>Outlook</span>
        </button>

        <p className="login-terms">
          Ao entrar, você concorda com os <span>termos de uso</span> e a{" "}
          <span>política de privacidade</span>.
        </p>
      </AuthCard>

      <Toast
        open={showOutlookNotice}
        variant="info"
        message="Acesso com Outlook em breve"
        description="Por enquanto, entre com seu e-mail corporativo e senha."
        durationMs={5000}
        onClose={closeOutlookNotice}
      />
    </>
  );
}
