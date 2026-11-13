import { Navigate, Outlet, useLocation } from "react-router-dom";
import type { AuthLocationState } from "../features/login/utils/authState";
import { getToken, hasErpAccess, isTokenExpired } from "../services/session";
import { AUTH_PATHS } from "./paths";

/**
 * Protege as rotas da área logada:
 * - sem token            → login (guardando a rota de origem)
 * - token vencido        → sessão expirada
 * - sem perfil do ERP    → acesso não autorizado (espelha a regra de /api/erp/** no backend)
 */
export function RequireAuth() {
  const location = useLocation();

 

  const from = `${location.pathname}${location.search}`;
  const token = getToken();

  if (!token) {
    return (
      <Navigate to={AUTH_PATHS.login} replace state={{ from } satisfies AuthLocationState} />
    );
  }

  if (isTokenExpired(token)) {
    return (
      <Navigate
        to={AUTH_PATHS.sessionExpired}
        replace
        state={{ from } satisfies AuthLocationState}
      />
    );
  }

  if (!hasErpAccess()) {
    return <Navigate to={AUTH_PATHS.accessDenied} replace />;
  }

  return <Outlet />;
}
