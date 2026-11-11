
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
 * Trata sessões expiradas.
 * Um 403 com token válido continua sendo erro de permissão.
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

            if (
                sessionExpired &&
                window.location.pathname !== AUTH_PATHS.sessionExpired
            ) {
                endSession();
                window.location.assign(AUTH_PATHS.sessionExpired);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
