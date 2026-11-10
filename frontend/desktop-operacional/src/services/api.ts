import axios from "axios";
import { AUTH_PATHS } from "../routes/paths";
import { endSession, getToken, isTokenExpired } from "./session";

const api = axios.create({
    baseURL: "http://localhost:8080"
});

api.interceptors.request.use((config) => {
    const token = getToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

/**
 * Sessão expirada: o backend responde 401 ou, na configuração atual do Spring Security,
 * 403 sem corpo quando o JWT vence. Só tratamos o 403 como expiração se o próprio token
 * estiver vencido — um 403 com token válido é falta de permissão e fica com a tela.
 */
api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            const isAuthRequest = (error.config?.url ?? "").startsWith("/api/auth/");
            const token = getToken();

            const sessionExpired =
                !isAuthRequest &&
                token !== null &&
                (status === 401 || (status === 403 && isTokenExpired(token)));

            if (sessionExpired && window.location.pathname !== AUTH_PATHS.sessionExpired) {
                endSession();
                window.location.assign(AUTH_PATHS.sessionExpired);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
