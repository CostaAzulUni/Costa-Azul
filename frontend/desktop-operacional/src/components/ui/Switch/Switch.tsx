import {
  useId,
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";
import "./Switch.css";

export type SwitchLabelPosition = "left" | "right";

export interface SwitchProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size" | "role"> {
  label?: ReactNode;
  description?: ReactNode;
  labelPosition?: SwitchLabelPosition;
  /** Superfície escura (ex.: rodapé da Sidebar) — ajusta as cores do texto. */
  inverse?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Usamos um <input type="checkbox"> com role="switch": o navegador cuida do teclado
 * (Espaço alterna) e leitores de tela anunciam "ligado/desligado".
 */
export function Switch({
  id,
  label,
  description,
  labelPosition = "right",
  inverse = false,
  onCheckedChange,
  onChange,
  disabled = false,
  className,
  ...rest
}: SwitchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const descriptionId = `${inputId}-description`;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event);
    onCheckedChange?.(event.target.checked);
  };

  const text = (label || description) && (
    <span className="ui-switch__text">
      {label && (
        <label htmlFor={inputId} className="ui-switch__label">
          {label}
        </label>
      )}
      {description && (
        <span id={descriptionId} className="ui-switch__description">
          {description}
        </span>
      )}
    </span>
  );

  return (
    <div
      className={cx(
        "ui-switch",
        `ui-switch--label-${labelPosition}`,
        inverse && "ui-switch--inverse",
        disabled && "ui-switch--disabled",
        className
      )}
    >
      {labelPosition === "left" && text}

      <span className="ui-switch__control">
        <input
          id={inputId}
          type="checkbox"
          role="switch"
          className="ui-switch__input"
          disabled={disabled}
          aria-describedby={description ? descriptionId : undefined}
          onChange={handleChange}
          {...rest}
        />
        <span className="ui-switch__track" aria-hidden="true">
          <span className="ui-switch__thumb" />
        </span>
      </span>

      {labelPosition === "right" && text}
    </div>
  );
}
