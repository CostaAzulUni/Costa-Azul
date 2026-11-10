/**
 * Sessão do usuário (token JWT + perfis) persistida no localStorage.
 * Este módulo não importa a instância `api` para evitar dependência circular
 * com o interceptor de src/services/api.ts.
 */

export const TOKEN_KEY = "@costaazul-token";
export const ROLE_KEY = "@costaazul-role";

/**
 * Perfis com acesso ao ERP operacional.
 * Espelha a regra do backend (SecurityConfig): /api/erp/** exige ROLE_SUPER_ADMIN ou ROLE_ADMIN_COMPANHIA.
 */
export const ERP_ROLES: readonly string[] = ["SUPER_ADMIN", "ADMIN_COMPANHIA"];

/** Claims emitidas por JwtService.generateToken no backend. */
export interface SessionTokenPayload {
  sub?: string;
  idUser?: string;
  roles?: string[];
  exp?: number;
  iat?: number;
}

function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** Decodifica o payload do JWT (sem validar assinatura — isso é papel do backend). */
export function decodeToken(token: string): SessionTokenPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const binary = atob(padded);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return JSON.parse(new TextDecoder().decode(bytes)) as SessionTokenPayload;
  } catch {
    return null;
  }
}

export function getToken(): string | null {
  return readStorage(TOKEN_KEY);
}

export function isTokenExpired(token: string): boolean {
  const exp = decodeToken(token)?.exp;
  if (typeof exp !== "number") return false;
  return exp * 1000 <= Date.now();
}

/** Inicia a sessão a partir do token devolvido por POST /api/auth/login. */
export function startSession(token: string): void {
  const roles = decodeToken(token)?.roles ?? [];
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, JSON.stringify(roles));
}

export function getRoles(): string[] {
  const raw = readStorage(ROLE_KEY);
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((role): role is string => typeof role === "string")
      : [];
  } catch {
    return [];
  }
}

export function hasErpAccess(roles: string[] = getRoles()): boolean {
  return roles.some((role) => ERP_ROLES.includes(role));
}

export function hasSession(): boolean {
  return getToken() !== null;
}

export function isAuthenticated(): boolean {
  const token = getToken();
  return token !== null && !isTokenExpired(token);
}

export function endSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
  } catch {
    // Armazenamento indisponível (ex.: modo privado restrito): não há sessão a limpar.
  }
}
