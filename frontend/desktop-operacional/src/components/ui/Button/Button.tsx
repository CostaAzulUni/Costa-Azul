import type { ButtonHTMLAttributes, ReactNode } from "react";
import "./Button.css";

/**
 * Union Types (Tipos de União): restringem os valores permitidos em tempo de compilação,
 * garantindo que apenas variantes e tamanhos previstos no Figma sejam aceitos.
 */
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonIconPosition = "left" | "right";

/**
 * ButtonHTMLAttributes<HTMLButtonElement> permite que o nosso Button aceite todas as
 * propriedades nativas de uma tag <button> do HTML (como onClick, id, aria-label, title),
 * além das nossas propriedades customizadas do Design System.
 */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
  icon?: string | ReactNode;
  iconPosition?: ButtonIconPosition;
  fullWidth?: boolean;
  children?: ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  disabled = false,
  type = "button", // Evita que o botão submeta formulários acidentalmente (no HTML o padrão seria "submit")
  icon,
  iconPosition = "left",
  fullWidth = false,
  children,
  className = "",
  ...rest // Rest Operator: captura atributos extras (ex: onClick, data-testid) e repassa ao <button>
}: ButtonProps) {
  // Monta a lista de classes CSS dinamicamente (padrão BEM) e remove valores vazios com filter(Boolean)
  const classes = [
    "ui-button",
    `ui-button--${variant}`,
    `ui-button--${size}`,
    fullWidth ? "ui-button--full-width" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const renderIcon = () => {
    if (!icon) return null;

    // Aceita tanto o nome do ícone do PrimeIcons em string ("pi-plus") quanto um elemento React customizado
    if (typeof icon === "string") {
      const iconClass = icon.startsWith("pi ") ? icon : `pi ${icon}`;
      return <i className={`ui-button__icon ${iconClass}`} aria-hidden="true" />;
    }

    return (
      <span className="ui-button__icon" aria-hidden="true">
        {icon}
      </span>
    );
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={classes}
      {...rest}
    >
      {iconPosition === "left" && renderIcon()}
      {children && <span className="ui-button__label">{children}</span>}
      {iconPosition === "right" && renderIcon()}
    </button>
  );
}
