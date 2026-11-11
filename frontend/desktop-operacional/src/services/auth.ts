import api from "./api";

export {
  ERP_ROLES,
  ROLE_KEY,
  TOKEN_KEY,
  endSession as logout,
  getRoles,
  getToken,
  hasErpAccess,
  hasSession,
  isAuthenticated,
  isTokenExpired,
  startSession,
} from "./session";

export interface LoginRequestDTO {
  email: string;
  senha: string;
}

/** Resposta de POST /api/auth/login (TokenResponse.java): apenas o JWT. Os perfis vêm na claim `roles`. */
export interface LoginResponseDTO {
  token: string;
}

export async function loginUser(
  email: string,
  senha: string
): Promise<LoginResponseDTO> {
  const payload: LoginRequestDTO = { email, senha };
  const response = await api.post<LoginResponseDTO>("/api/auth/login", payload);
  return response.data;
}
