import { Button, type ButtonProps } from "../../../components";
import "./AuthButton.css";

export type AuthButtonTone = "primary" | "outline";

export interface AuthButtonProps
  extends Omit<ButtonProps, "variant" | "size" | "fullWidth"> {
  /** primary = "Button large"; outline = "Button large - Especial" (Figma). */
  tone?: AuthButtonTone;
}

/** Botão de largura total das telas de autenticação, composto sobre o Button do Design System. */
export function AuthButton({ tone = "primary", className, ...rest }: AuthButtonProps) {
  return (
    <Button
      variant={tone === "primary" ? "primary" : "secondary"}
      size="lg"
      fullWidth
      className={["auth-button", `auth-button--${tone}`, className]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    />
  );
}
