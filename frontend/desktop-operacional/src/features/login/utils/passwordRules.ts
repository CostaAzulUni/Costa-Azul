/**
 * Regras de senha exibidas nas telas "Crie uma nova senha" e "Atualize sua senha" (Figma #3976:2053).
 * A ordem segue a grade 2 × 2 do design (leitura por linha).
 */
export interface PasswordRule {
  id: string;
  label: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  {
    id: "min-length",
    label: "mínimo 8 caracteres",
    test: (password) => password.length >= 8,
  },
  {
    id: "uppercase",
    label: "mínimo 1 letra maiúscula",
    test: (password) => /\p{Lu}/u.test(password),
  },
  {
    id: "number",
    label: "mínimo 1 número",
    test: (password) => /\d/.test(password),
  },
  {
    id: "special",
    label: "mínimo 1 caractere especial",
    test: (password) => /[^\p{L}\d\s]/u.test(password),
  },
];

export function meetsAllPasswordRules(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/** Limite do BCrypt no backend: 72 bytes em UTF-8 (letras acentuadas ocupam 2 bytes). */
export const PASSWORD_MAX_BYTES = 72;

export const PASSWORD_TOO_LONG_MESSAGE =
  "A senha é muito longa. Use no máximo 72 caracteres (letras acentuadas contam em dobro).";

export function exceedsPasswordMaxLength(password: string): boolean {
  return new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES;
}
