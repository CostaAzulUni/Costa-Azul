import axios from "axios";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** users.account.email é VARCHAR(150) (V1__users_and_rbac.sql / Account.java). */
export const EMAIL_MAX_LENGTH = 150;

/**
 * Senha de login/senha atual: o BCrypt do backend rejeita mais de 72 bytes
 * ("password cannot be more than 72 bytes"), então nenhuma senha válida passa disso.
 */
export { PASSWORD_MAX_BYTES as CURRENT_PASSWORD_MAX_LENGTH } from "./passwordRules";

/**
 * Teto de digitação para campos de NOVA senha. É maior que o limite real de propósito:
 * quem passar de 72 bytes vê a mensagem de validação em vez de ter a senha cortada em silêncio.
 */
export const NEW_PASSWORD_INPUT_LIMIT = 128;

/** Tempo de validade do código de verificação exibido no Figma ("O código expira em 30:00 minutos"). */
export const RESET_CODE_TTL_SECONDS = 30 * 60;
export const RESET_CODE_LENGTH = 6;

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}

/** "eliza.costa2@costazul.com" → "e*******2@costazul.com" (mesmo padrão do Figma). */
export function maskEmail(email: string): string {
  const [localPart, domain] = email.trim().split("@");
  if (!localPart || !domain) return email;
  if (localPart.length <= 2) return `${localPart[0]}*******@${domain}`;
  return `${localPart[0]}*******${localPart[localPart.length - 1]}@${domain}`;
}

/** 1800 → "30:00" */
export function formatCountdown(totalSeconds: number): string {
  const safe = Math.max(0, totalSeconds);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export type AuthErrorKind = "invalid" | "network" | "server" | "unknown";

/**
 * Classifica falhas das chamadas de autenticação.
 * O backend atual responde 403 sem corpo para credenciais inválidas (sem @ControllerAdvice),
 * por isso 400/401/403/404/422 são tratados como "dados recusados".
 */
export function classifyAuthError(error: unknown): AuthErrorKind {
  if (!axios.isAxiosError(error)) return "unknown";
  if (!error.response) return "network";

  const status = error.response.status;
  if ([400, 401, 403, 404, 422].includes(status)) return "invalid";
  if (status >= 500) return "server";
  return "unknown";
}

export const AUTH_ERROR_MESSAGES: Record<Exclude<AuthErrorKind, "invalid">, string> = {
  network:
    "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.",
  server: "Erro no servidor. Tente novamente mais tarde.",
  unknown: "Ocorreu um erro inesperado. Tente novamente.",
};
