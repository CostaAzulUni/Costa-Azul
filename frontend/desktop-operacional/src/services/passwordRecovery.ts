import api from "./api";

/**
 * Recuperação e troca de senha.
 *
 * ATENÇÃO: o backend ainda expõe apenas POST /api/auth/login (AuthController).
 * Os endpoints abaixo são o CONTRATO PROPOSTO para o fluxo desenhado no Figma.
 * Enquanto não existirem, em ambiente de desenvolvimento as chamadas são simuladas
 * (desative com VITE_AUTH_RECOVERY_MOCK=false para testar contra a API real).
 */

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface VerifyResetCodeRequestDTO {
  email: string;
  code: string;
}

export interface VerifyResetCodeResponseDTO {
  resetToken: string;
}

export interface ResetPasswordRequestDTO {
  resetToken: string;
  newPassword: string;
}

export interface ChangePasswordRequestDTO {
  currentPassword: string;
  newPassword: string;
}

const USE_MOCK =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_RECOVERY_MOCK !== "false";

function simulate<T>(data: T, delayMs = 700): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(data), delayMs);
  });
}

export async function requestPasswordReset(email: string): Promise<void> {
  if (USE_MOCK) return simulate(undefined);

  const payload: ForgotPasswordRequestDTO = { email };
  await api.post("/api/auth/forgot-password", payload);
}

export async function verifyResetCode(
  email: string,
  code: string
): Promise<VerifyResetCodeResponseDTO> {
  if (USE_MOCK) return simulate({ resetToken: `mock-reset-token-${code}` });

  const payload: VerifyResetCodeRequestDTO = { email, code };
  const response = await api.post<VerifyResetCodeResponseDTO>(
    "/api/auth/verify-reset-code",
    payload
  );
  return response.data;
}

export async function resetPassword(
  resetToken: string,
  newPassword: string
): Promise<void> {
  if (USE_MOCK) return simulate(undefined);

  const payload: ResetPasswordRequestDTO = { resetToken, newPassword };
  await api.post("/api/auth/reset-password", payload);
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  if (USE_MOCK) return simulate(undefined);

  const payload: ChangePasswordRequestDTO = { currentPassword, newPassword };
  await api.post("/api/auth/change-password", payload);
}
