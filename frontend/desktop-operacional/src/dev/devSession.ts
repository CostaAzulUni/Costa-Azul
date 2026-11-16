import { startSession, type SessionTokenPayload } from "../services/session";

const DEV_USERS = {
  superAdmin: {
    username: "dev-admin",
    roles: ["SUPER_ADMIN"],
  },
  companyAdmin: {
    username: "dev-company",
    roles: ["ADMIN_COMPANHIA"],
  },
  unauthorized: {
    username: "dev-user",
    roles: ["USER"],
  },
} as const;

export type DevUserKey = keyof typeof DEV_USERS;

export function startDevSession(userKey: DevUserKey): void {
  if (!import.meta.env.DEV) {
    throw new Error(
      "Sessões de desenvolvimento não estão disponíveis em produção.",
    );
  }

  const user = DEV_USERS[userKey];

  const payload: SessionTokenPayload = {
    sub: user.username,
    roles: [...user.roles],
    iat: Math.floor(Date.now() / 1000),
    exp: 4070908800,
  };

  const encodedPayload = btoa(JSON.stringify(payload))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const fakeToken = `dev.${encodedPayload}.mock`;

  startSession(fakeToken);
}
