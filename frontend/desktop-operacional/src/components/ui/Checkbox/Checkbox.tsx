import {
  useEffect,
  useId,
  useRef,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import "./Checkbox.css";

export interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: ReactNode;
  description?: ReactNode;
  errorMessage?: string;
  /** Estado "parcialmente marcado" (ex.: "selecionar todos" quando só algumas linhas estão marcadas). */
  indeterminate?: boolean;
  /** Atalho que entrega diretamente o booleano, sem precisar ler event.target.checked. */
  onCheckedChange?: (checked: boolean) => void;
}

export function Checkbox({
  id,
  label,
  description,
  errorMessage,
  indeterminate = false,
  onCheckedChange,
  onChange,
  disabled = false,
  className,
  ...rest
}: CheckboxProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;

  /**
   * "indeterminate" não existe como atributo HTML — só como propriedade do elemento DOM.
   * Por isso usamos useRef para acessar o <input> real e useEffect para sincronizar
   * essa propriedade sempre que a prop mudar.
   */
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (inputRef.current) inputRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  };

  const hasError = Boolean(errorMessage);
  const describedBy = description || hasError ? descriptionId : undefined;

  return (
    <div
      className={cx(
        "ui-checkbox",
        disabled && "ui-checkbox--disabled",
        hasError && "ui-checkbox--error",
        className
      )}
    >
      <span className="ui-checkbox__control">
        {/* O input nativo fica invisível, mas continua recebendo foco, clique e teclado */}
        <input
          ref={inputRef}
          id={inputId}
          type="checkbox"
          className="ui-checkbox__input"
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy}
          onChange={handleChange}
          {...rest}
        />
        <span className="ui-checkbox__box" aria-hidden="true">
          <i className="ui-checkbox__check pi pi-check" />
          <span className="ui-checkbox__dash" />
        </span>
      </span>

      {(label || description || hasError) && (
        <span className="ui-checkbox__text">
          {label && (
            <label htmlFor={inputId} className="ui-checkbox__label">
              {label}
            </label>
          )}
          {hasError ? (
            <span id={descriptionId} className="ui-checkbox__error">
              {errorMessage}
            </span>
          ) : (
            description && (
              <span id={descriptionId} className="ui-checkbox__description">
                {description}
              </span>
            )
          )}
        </span>
      )}
    </div>
  );
}
