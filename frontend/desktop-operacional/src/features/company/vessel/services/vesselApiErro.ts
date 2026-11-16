
import axios from "axios";

export interface ApiErrorFeedback {
  title: string;
  description: string;
}

export function getVesselApiError(error: unknown): ApiErrorFeedback {
  const title = "Não foi possível concluir o cadastro";

  let description =
    "Ocorreu uma falha inesperada ao processar o envio. Seus dados foram preservados para nova tentativa.";

  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    const isTimeout =
      error.code === "ECONNABORTED" ||
      /timeout/i.test(error.message || "");

    const responseData = error.response?.data as
      | { message?: string; error?: string; detail?: string }
      | string
      | undefined;

    const rawBackendMessage =
      typeof responseData === "string"
        ? responseData
        : responseData?.message ||
          responseData?.detail ||
          responseData?.error;

    const safeBackendMessage =
      rawBackendMessage &&
      rawBackendMessage.trim() !== "" &&
      rawBackendMessage !== "Internal Server Error" &&
      rawBackendMessage !== "Bad Request" &&
      rawBackendMessage !== "Forbidden" &&
      rawBackendMessage !== "Not Found"
        ? rawBackendMessage
        : undefined;

    if (isTimeout) {
      description =
        "O servidor demorou muito para responder e não foi possível confirmar o resultado da operação. Verifique a listagem de embarcações antes de tentar reenviar. Seus dados continuam preservados nesta tela.";
    } else if (!error.response) {
      description =
        "Não foi possível conectar ao servidor (http://localhost:8080). Verifique sua conexão ou se o backend está em execução. Todos os dados preenchidos foram preservados para tentar novamente.";
    } else if (status === 400 || status === 409 || status === 422) {
      description =
        safeBackendMessage ||
        "Os dados enviados foram recusados pela validação do servidor. Verifique se o número IMO ou Registro Nacional já existem.";
    } else if (status === 401) {
      description =
        "Sua sessão expirou ou você não está autenticado (HTTP 401). Faça login novamente para concluir o cadastro.";
    } else if (status === 403) {
      description =
        "Seu perfil não possui permissão para cadastrar embarcações (HTTP 403). É necessário acesso de Administrador da Companhia ou Super Admin.";
    } else if (status === 404) {
      description =
        safeBackendMessage ||
        "O endpoint de cadastro (/api/erp/vessels) não foi encontrado no servidor (HTTP 404).";
    } else if (status && status >= 500) {
      description =
        safeBackendMessage ||
        "Ocorreu um erro interno no servidor (HTTP 500) ao gravar a embarcação. Verifique se o IMO ou Registro Nacional já estão em uso e tente novamente.";
    }
  }

  return { title, description };
}
