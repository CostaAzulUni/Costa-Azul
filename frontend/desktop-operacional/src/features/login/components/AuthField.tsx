import { useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cx } from "../../../components/ui/utils/cx";
import eyeIcon from "../assets/eye-outline.svg";
import eyeErrorIcon from "../assets/eye-outline-error.svg";
import mailIcon from "../assets/mail-outline.svg";
import mailErrorIcon from "../assets/mail-outline-error.svg";
import { EMAIL_MAX_LENGTH } from "../utils/authUtils";
import "./AuthField.css";

export interface AuthFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "onChange" | "value"> {
  id: string;
  label: string;
  type: "email" | "password";
  value: string;
  onValueChange: (value: string) => void;
  /** Estado de erro: borda e placeholder vermelhos + asterisco no rótulo (variantes "error" do Figma). */
  invalid?: boolean;
  /** "lg" = 52 px (Input email - large), "md" = 48 px (Input password - large). */
  size?: "md" | "lg";
  /** Conteúdo alinhado à direita do rótulo (ex.: link "Esqueceu sua senha?"). */
  labelAction?: ReactNode;
  /** Rótulo em semibold (telas de criação de senha). */
  strongLabel?: boolean;
  /** id da mensagem de erro que descreve o campo. */
  errorId?: string;
}

/**
 * Campo de e-mail/senha das telas de autenticação (Figma "Input email/password - large").
 * Usa os ícones Io5 exportados do Figma; a senha tem botão para mostrar/ocultar.
 */
export function AuthField({
  id,
  label,
  type,
  value,
  onValueChange,
  invalid = false,
  size = "md",
  labelAction,
  strongLabel = false,
  errorId,
  disabled,
  className,
  "aria-describedby": ariaDescribedBy,
  ...rest
}: AuthFieldProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === "password";
  const describedBy =
    [invalid ? errorId : undefined, ariaDescribedBy].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx("auth-field", className)}>
      <div className="auth-field__label-row">
        <label
          htmlFor={id}
          className={cx("auth-field__label", strongLabel && "auth-field__label--strong")}
        >
          {label}
          {invalid && (
            <span className="auth-field__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelAction}
      </div>

      <div
        className={cx(
          "auth-field__control",
          `auth-field__control--${size}`,
          invalid && "auth-field__control--invalid",
          disabled && "auth-field__control--disabled"
        )}
      >
        {type === "email" && (
          <img
            className="auth-field__icon"
            src={invalid ? mailErrorIcon : mailIcon}
            alt=""
            width={24}
            height={24}
          />
        )}

        <input
          id={id}
          type={isPassword && isPasswordVisible ? "text" : type}
          className="auth-field__input"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={describedBy}
          {...(type === "email" && {
            maxLength: EMAIL_MAX_LENGTH,
            spellCheck: false,
            autoCapitalize: "none",
            autoCorrect: "off",
          })}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            className="auth-field__toggle"
            onClick={() => setIsPasswordVisible((visible) => !visible)}
            disabled={disabled}
            aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={isPasswordVisible}
            aria-controls={id}
          >
            {isPasswordVisible ? (
              <i
                className={cx(
                  "pi pi-eye-slash",
                  invalid && "auth-field__toggle-icon--invalid"
                )}
                aria-hidden="true"
              />
            ) : (
              <img
                className="auth-field__icon"
                src={invalid ? eyeErrorIcon : eyeIcon}
                alt=""
                width={24}
                height={24}
              />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
