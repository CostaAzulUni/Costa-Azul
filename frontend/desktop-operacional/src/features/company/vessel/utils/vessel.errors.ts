import axios from "axios";

/**
 * Extrai mensagem de erro amigável a partir de falhas HTTP/Axios.
 */
export function parseVesselApiError(
  error: unknown,
  fallbackMessage = "Não foi possível carregar a listagem de embarcações. Verifique sua conexão com o servidor."
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      return "Sua sessão expirou ou você não possui permissão para consultar as embarcações.";
    }
    if (
      typeof error.response?.data === "object" &&
      error.response?.data !== null &&
      "message" in error.response.data &&
      typeof (error.response.data as { message?: unknown }).message === "string"
    ) {
      const backendMessage = (error.response.data as { message: string }).message.trim();
      if (
        backendMessage !== "" &&
        backendMessage !== "Not Found" &&
        backendMessage !== "Internal Server Error" &&
        backendMessage !== "Bad Request" &&
        backendMessage !== "Forbidden"
      ) {
        return backendMessage;
      }
    }
    if (status === 404) {
      return "O recurso de embarcações solicitado não foi encontrado no servidor.";
    }
  }
  if (error instanceof Error && error.message.includes("Formato de resposta")) {
    return error.message;
  }
  return fallbackMessage;
}
