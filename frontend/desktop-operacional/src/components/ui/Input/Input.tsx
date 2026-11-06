import {
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import "./Input.css";

export type InputType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "search"
  | "date";
export type InputSize = "sm" | "md" | "lg";

/**
 * Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type">:
 * O elemento <input> nativo do HTML já possui um atributo "size" (que é um number para
 * largura em caracteres). Usamos o utilitário Omit do TypeScript para remover esse "size"
 * original e substituí-lo pelo nosso InputSize ("sm" | "md" | "lg") sem conflito de tipos.
 */
export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "type"> {
  type?: InputType;
  size?: InputSize;
  label?: string;
  required?: boolean;
  isAutomatic?: boolean;
  helperText?: string;
  errorMessage?: string;
  unitSuffix?: string;
  leftIcon?: string | ReactNode;
  rightIcon?: string | ReactNode;
  fullWidth?: boolean;
}

export function Input({
  id,
  type = "text",
  size = "md",
  label,
  required = false,
  isAutomatic = false,
  helperText,
  errorMessage,
  unitSuffix,
  leftIcon,
  rightIcon,
  fullWidth = true,
  disabled = false,
  readOnly = false,
  className = "",
  ...rest
}: InputProps) {
  /**
   * useId() gera um ID único e estável por instância do componente.
   * Isso garante que <label htmlFor={inputId}> esteja sempre conectado ao <input id={inputId}>,
   * mesmo quando quem usa o componente não passa a prop "id" manualmente.
   */
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const feedbackId = `${inputId}-feedback`;

  // Estado local para alternar entre exibir ou ocultar a senha quando type === "password"
  const [showPassword, setShowPassword] = useState(false);

  const hasError = Boolean(errorMessage);
  const isReadOnlyField = readOnly || isAutomatic;

  // Quando type="password" e o usuário clica no olho, mudamos o type real do HTML para "text"
  const resolvedInputType =
    type === "password" ? (showPassword ? "text" : "password") : type;

  // Define ícones automáticos à esquerda conforme a variante do Figma (email = envelope, search = lupa)
  const resolvedLeftIcon =
    leftIcon ??
    (type === "email"
      ? "pi-envelope"
      : type === "search"
        ? "pi-search"
        : undefined);

  const renderIconNode = (
    iconProp: string | ReactNode | undefined,
    extraClass = ""
  ) => {
    if (!iconProp) return null;

    if (typeof iconProp === "string") {
      const iconClass = iconProp.startsWith("pi ") ? iconProp : `pi ${iconProp}`;
      return (
        <i
          className={`ui-input__icon ${iconClass} ${extraClass}`.trim()}
          aria-hidden="true"
        />
      );
    }

    return (
      <span className={`ui-input__icon ${extraClass}`.trim()} aria-hidden="true">
        {iconProp}
      </span>
    );
  };

  const containerClasses = [
    "ui-input-field",
    fullWidth ? "ui-input-field--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const controlClasses = [
    "ui-input__control",
    `ui-input__control--${size}`,
    hasError ? "ui-input__control--error" : "",
    isReadOnlyField ? "ui-input__control--readonly" : "",
    disabled ? "ui-input__control--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const elementClasses = [
    "ui-input__element",
    type === "number" || type === "date" ? "ui-input__element--tabular" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {(label || isAutomatic) && (
        <div className="ui-input__label-row">
          {label && (
            <label htmlFor={inputId} className="ui-input__label">
              <span>{label}</span>
              {required && (
                <span className="ui-input__required" aria-hidden="true">
                  *
                </span>
              )}
            </label>
          )}
          {isAutomatic && (
            <span className="ui-input__auto-badge">Automático</span>
          )}
        </div>
      )}

      <div className={controlClasses}>
        {renderIconNode(resolvedLeftIcon)}

        <input
          id={inputId}
          type={resolvedInputType}
          disabled={disabled}
          readOnly={isReadOnlyField}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            hasError || helperText ? feedbackId : undefined
          }
          className={elementClasses}
          {...rest}
        />

        {unitSuffix && <span className="ui-input__unit">{unitSuffix}</span>}

        {type === "password" && (
          <button
            type="button"
            className="ui-input__password-toggle"
            onClick={() => setShowPassword((prev) => !prev)}
            disabled={disabled}
            aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
            aria-pressed={showPassword}
          >
            <i
              className={`pi ${showPassword ? "pi-eye-slash" : "pi-eye"}`}
              aria-hidden="true"
            />
          </button>
        )}

        {isReadOnlyField && type !== "password" && (
          <i
            className="ui-input__icon pi pi-lock"
            title="Campo somente leitura"
            aria-hidden="true"
          />
        )}

        {hasError && type !== "password" && !isReadOnlyField && (
          <i
            className="ui-input__icon ui-input__icon--error pi pi-exclamation-circle"
            aria-hidden="true"
          />
        )}

        {!hasError && !isReadOnlyField && type !== "password" && renderIconNode(rightIcon)}
      </div>

      {hasError ? (
        <p id={feedbackId} className="ui-input__error" role="alert">
          <i className="pi pi-exclamation-circle" aria-hidden="true" />
          <span>{errorMessage}</span>
        </p>
      ) : (
        helperText && (
          <p id={feedbackId} className="ui-input__helper">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}
