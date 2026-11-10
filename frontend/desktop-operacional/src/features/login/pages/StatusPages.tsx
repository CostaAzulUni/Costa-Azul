import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AUTH_PATHS, HOME_PATH } from "../../../routes/paths";
import { hasErpAccess, isAuthenticated, logout } from "../../../services/auth";
import { requestPasswordReset } from "../../../services/passwordRecovery";
import accountDisabledImage from "../assets/account-disabled.png";
import homeDarkIcon from "../assets/home-outline-dark.svg";
import homeLightIcon from "../assets/home-outline-light.svg";
import linkExpiredImage from "../assets/link-expired.svg";
import successImage from "../assets/password-reset-success.svg";
import prohibitionImage from "../assets/prohibition.png";
import sessionExpiredImage from "../assets/session-expired.png";
import { AuthButton } from "../components/AuthButton";
import { AuthErrorMessage } from "../components/AuthErrorMessage";
import { AuthStatus } from "../components/AuthStatus";
import { AUTH_ERROR_MESSAGES, classifyAuthError } from "../utils/authUtils";
import type { AuthLocationState } from "../utils/authState";
import "./StatusPages.css";

function HomeIcon({ tone }: { tone: "dark" | "light" }) {
  return (
    <img src={tone === "dark" ? homeDarkIcon : homeLightIcon} alt="" width={24} height={24} />
  );
}

function useAuthState(): AuthLocationState | null {
  return (useLocation().state ?? null) as AuthLocationState | null;
}

/** "Conta temporariamente bloqueada" (Figma #3964:358). */
export function AccountBlocked() {
  const navigate = useNavigate();
  const state = useAuthState();

  return (
    <AuthStatus
      variant="alert"
      className="status-blocked"
      titleId="blocked-title"
      illustration={<img src={prohibitionImage} alt="" width={96} height={85} />}
      title="Conta temporariamente bloqueada"
      description="Identificamos várias tentativas de acesso sem sucesso."
      message="Tente novamente após 15 minutos ou redefina a sua senha para recuperar seu acesso agora."
      messageAlign="left"
      actions={
        <>
          <AuthButton
            onClick={() =>
              navigate(AUTH_PATHS.recoverAccess, {
                state: { email: state?.email } satisfies AuthLocationState,
              })
            }
          >
            Redefinir senha
          </AuthButton>
          <AuthButton
            tone="outline"
            icon={<HomeIcon tone="dark" />}
            onClick={() => navigate(AUTH_PATHS.login)}
          >
            Voltar para o início
          </AuthButton>
        </>
      }
    />
  );
}

/** "Acesso não autorizado" (Figma #3932:4783): usuário autenticado sem perfil do ERP. */
export function AccessDenied() {
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    logout();
    navigate(AUTH_PATHS.login, { replace: true });
  };

  const handleGoHome = () => {
    if (isAuthenticated() && hasErpAccess()) {
      navigate(HOME_PATH, { replace: true });
      return;
    }
    handleSwitchAccount();
  };

  return (
    <AuthStatus
      variant="alert"
      className="status-denied"
      titleId="denied-title"
      illustration={<img src={prohibitionImage} alt="" width={96} height={85} />}
      title="Acesso não autorizado!"
      description="Você não tem permissão para acessar esta área."
      message="Caso precise deste acesso, faça a solicitação necessária ao administrador da sua companhia."
      messageAlign="left"
      actions={
        <>
          <AuthButton tone="outline" className="status-denied__switch" onClick={handleSwitchAccount}>
            Trocar de conta
          </AuthButton>
          <AuthButton icon={<HomeIcon tone="light" />} onClick={handleGoHome}>
            Voltar para o início
          </AuthButton>
        </>
      }
    />
  );
}

/** "Esta conta está desativada" (Figma #3967:354). */
export function AccountDisabled() {
  const navigate = useNavigate();

  return (
    <AuthStatus
      variant="illustrated"
      titleId="disabled-title"
      illustration={<img src={accountDisabledImage} alt="" width={200} height={300} />}
      title="Esta conta está desativada"
      description="Seu acesso ao ERP Costa Azul foi desativado pela organização."
      message="Entre em contato com o administrador da sua empresa para solicitar a reativação."
      actions={
        <AuthButton icon={<HomeIcon tone="light" />} onClick={() => navigate(AUTH_PATHS.login)}>
          Voltar para o início
        </AuthButton>
      }
    />
  );
}

/** "Sessão expirada" (Figma #3977:6065). Encerra a sessão local ao abrir. */
export function SessionExpired() {
  const navigate = useNavigate();
  const state = useAuthState();

  useEffect(() => {
    logout();
  }, []);

  return (
    <AuthStatus
      variant="illustrated"
      className="status-session"
      titleId="session-title"
      illustration={<img src={sessionExpiredImage} alt="" width={200} height={300} />}
      title="Sessão expirada!"
      description="Por segurança, encerramos sua sessão após um período de inatividade."
      message="Entre novamente para continuar de onde parou."
      actions={
        <AuthButton
          autoFocus
          onClick={() =>
            navigate(AUTH_PATHS.login, {
              replace: true,
              state: { from: state?.from } satisfies AuthLocationState,
            })
          }
        >
          Entrar novamente
        </AuthButton>
      }
    />
  );
}

/** "Este link não é mais válido" (Figma #3967:5736): código/link de recuperação expirado. */
export function LinkExpired() {
  const navigate = useNavigate();
  const state = useAuthState();
  const email = state?.email;

  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    if (!email) {
      navigate(AUTH_PATHS.recoverAccess);
      return;
    }

    setIsSending(true);
    setError(null);
    try {
      await requestPasswordReset(email);
      navigate(AUTH_PATHS.verifyEmail, {
        replace: true,
        state: { email } satisfies AuthLocationState,
      });
    } catch (resendError) {
      const kind = classifyAuthError(resendError);
      setError(kind === "invalid" ? AUTH_ERROR_MESSAGES.unknown : AUTH_ERROR_MESSAGES[kind]);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AuthStatus
      variant="success"
      className="status-link"
      titleId="link-title"
      illustration={<img src={linkExpiredImage} alt="" width={200} height={250} />}
      title="Este link não é mais válido"
      description="O link expirou ou já foi utilizado anteriormente."
      note="Solicite um novo código para continuar com segurança e redefinir sua senha."
      actions={
        <>
          <AuthErrorMessage id="link-error" message={error} />
          <AuthButton onClick={handleResend} disabled={isSending}>
            {isSending ? "Enviando..." : "Enviar código"}
          </AuthButton>
          <AuthButton
            tone="outline"
            icon={<HomeIcon tone="dark" />}
            onClick={() => navigate(AUTH_PATHS.login)}
          >
            Voltar para o início
          </AuthButton>
        </>
      }
      footnote="Caso não receba o código, verifique se esse e-mail está correto."
    />
  );
}

/** "Senha redefinida com sucesso!" (Figma #4016:12077). */
export function PasswordResetSuccess() {
  const navigate = useNavigate();
  const state = useAuthState();

  return (
    <AuthStatus
      variant="success"
      titleId="success-title"
      illustration={<img src={successImage} alt="" width={300} height={300} />}
      title="Senha redefinida com sucesso!"
      message="Faça o login para entrar com sua nova senha."
      actions={
        <AuthButton
          autoFocus
          onClick={() =>
            navigate(AUTH_PATHS.login, {
              replace: true,
              state: { email: state?.email } satisfies AuthLocationState,
            })
          }
        >
          Fazer login
        </AuthButton>
      }
    />
  );
}
