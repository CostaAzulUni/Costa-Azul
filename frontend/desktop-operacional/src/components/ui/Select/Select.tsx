import {
  useId,
  useState,
  type ChangeEvent,
  type SelectHTMLAttributes,
} from "react";
import "./Select.css";

export type SelectSize = "sm" | "md" | "lg";

/**
 * Interface que representa cada item da lista de opções do Select.
 * Separar SelectOption em uma interface própria facilita a reutilização em telas e serviços.
 */
export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

/**
 * Omit<SelectHTMLAttributes<HTMLSelectElement>, "size">:
 * O <select> nativo do HTML possui um atributo "size" numérico (número de linhas visíveis).
 * Removemos esse atributo com Omit para usar nossa escala padronizada ("sm" | "md" | "lg").
 */
export interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: SelectOption[];
  size?: SelectSize;
  label?: string;
  required?: boolean;
  placeholder?: string;
  prefixLabel?: string;
  helperText?: string;
  errorMessage?: string;
  fullWidth?: boolean;
}

export function Select({
  id,
  options,
  size = "md",
  label,
  required = false,
  placeholder,
  prefixLabel,
  helperText,
  errorMessage,
  fullWidth = true,
  disabled = false,
  value,
  defaultValue,
  onChange,
  className = "",
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const feedbackId = `${selectId}-feedback`;

  /**
   * Componente controlado x não controlado:
   * - Controlado: quem usa passa `value` + `onChange` e o React manda no valor.
   * - Não controlado: o próprio <select> do navegador guarda o valor (`defaultValue`).
   * No modo não controlado com placeholder, iniciamos em "" para que o navegador não
   * selecione automaticamente a primeira opção real, e acompanhamos o valor
   * em um estado local apenas para saber se o placeholder ainda está ativo (texto cinza).
   */
  const isControlled = value !== undefined;
  const resolvedDefaultValue =
    !isControlled && defaultValue === undefined && placeholder ? "" : defaultValue;
  const [uncontrolledValue, setUncontrolledValue] = useState(
    resolvedDefaultValue === undefined ? "" : String(resolvedDefaultValue)
  );

  const currentValue = isControlled ? value : uncontrolledValue;
  const isPlaceholderSelected = currentValue === "" || currentValue === null;

  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (!isControlled) setUncontrolledValue(event.target.value);
    onChange?.(event);
  };

  const hasError = Boolean(errorMessage);

  const containerClasses = [
    "ui-select-field",
    fullWidth ? "ui-select-field--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const controlClasses = [
    "ui-select__control",
    `ui-select__control--${size}`,
    hasError ? "ui-select__control--error" : "",
    disabled ? "ui-select__control--disabled" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const elementClasses = [
    "ui-select__element",
    prefixLabel ? "ui-select__element--with-prefix" : "",
    placeholder && isPlaceholderSelected ? "ui-select__element--placeholder" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      {label && (
        <label htmlFor={selectId} className="ui-select__label">
          <span>{label}</span>
          {required && (
            <span className="ui-select__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className={controlClasses}>
        {prefixLabel && (
          <span className="ui-select__prefix">{prefixLabel}</span>
        )}

        <select
          id={selectId}
          disabled={disabled}
          required={required}
          {...(isControlled ? { value } : { defaultValue: resolvedDefaultValue })}
          onChange={handleChange}
          aria-invalid={hasError}
          aria-describedby={hasError || helperText ? feedbackId : undefined}
          className={elementClasses}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}

          {options.map((option) => (
            <option
              key={String(option.value)}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>

        <i
          className="ui-select__chevron pi pi-chevron-down"
          aria-hidden="true"
        />
      </div>

      {hasError ? (
        <p id={feedbackId} className="ui-select__error" role="alert">
          <i className="pi pi-exclamation-circle" aria-hidden="true" />
          <span>{errorMessage}</span>
        </p>
      ) : (
        helperText && (
          <p id={feedbackId} className="ui-select__helper">
            {helperText}
          </p>
        )
      )}
    </div>
  );
}
