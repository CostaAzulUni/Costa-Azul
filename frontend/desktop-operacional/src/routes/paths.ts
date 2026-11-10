/**
 * Caminhos das rotas de autenticação.
 * Centralizados aqui para que telas, guardas de rota e o interceptor HTTP
 * (src/services/api.ts) apontem sempre para os mesmos endereços.
 */
export const AUTH_PATHS = {
  login: "/login",
  recoverAccess: "/login/recuperar-acesso",
  verifyEmail: "/login/verificar-email",
  createPassword: "/login/nova-senha",
  passwordResetSuccess: "/login/senha-redefinida",
  updatePassword: "/login/atualizar-senha",
  linkExpired: "/login/link-expirado",
  accountBlocked: "/login/conta-bloqueada",
  accountDisabled: "/login/conta-desativada",
  accessDenied: "/login/acesso-negado",
  sessionExpired: "/login/sessao-expirada",
} as const;

/** Rota inicial da área logada. */
export const HOME_PATH = "/dashboard";
