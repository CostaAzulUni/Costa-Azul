import {
  useRef,
  type ChangeEvent,
  type ClipboardEvent,
  type KeyboardEvent,
} from "react";
import { cx } from "../../../components/ui/utils/cx";
import "./VerificationCodeInput.css";

export interface VerificationCodeInputProps {
  id: string;
  label: string;
  /** Um dígito por posição ("" quando vazia). */
  digits: string[];
  onDigitsChange: (digits: string[]) => void;
  invalid?: boolean;
  disabled?: boolean;
  errorId?: string;
  autoFocus?: boolean;
}

/**
 * Código de verificação de N dígitos (Figma "Código de verificação" #3971:1802).
 * Avança automaticamente, volta com Backspace, navega com as setas e aceita colar o código inteiro.
 */
export function VerificationCodeInput({
  id,
  label,
  digits,
  onDigitsChange,
  invalid = false,
  disabled = false,
  errorId,
  autoFocus = false,
}: VerificationCodeInputProps) {
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const length = digits.length;

  const focusBox = (index: number) => {
    const target = inputRefs.current[Math.max(0, Math.min(length - 1, index))];
    target?.focus();
    target?.select();
  };

  const fillFrom = (startIndex: number, rawValue: string) => {
    const incoming = rawValue.replace(/\D/g, "").split("");
    if (incoming.length === 0) return;

    const next = [...digits];
    incoming.slice(0, length - startIndex).forEach((digit, offset) => {
      next[startIndex + offset] = digit;
    });
    onDigitsChange(next);
    focusBox(Math.min(length - 1, startIndex + incoming.length));
  };

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    const rawValue = event.target.value;
    const value = rawValue.replace(/\D/g, "");

    // Caractere não numérico digitado: ignora e mantém o dígito atual
    if (value === "" && rawValue !== "") return;

    if (value === "") {
      const next = [...digits];
      next[index] = "";
      onDigitsChange(next);
      return;
    }

    fillFrom(index, value);
  };

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && digits[index] === "" && index > 0) {
      event.preventDefault();
      const next = [...digits];
      next[index - 1] = "";
      onDigitsChange(next);
      focusBox(index - 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const handlePaste = (index: number) => (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    fillFrom(index, event.clipboardData.getData("text"));
  };

  return (
    <div
      className={cx("auth-code", invalid && "auth-code--invalid")}
      role="group"
      aria-labelledby={`${id}-label`}
      aria-describedby={invalid ? errorId : undefined}
    >
      <span id={`${id}-label`} className="auth-code__label">
        {label}
        {invalid && (
          <span className="auth-code__required" aria-hidden="true">
            *
          </span>
        )}
      </span>

      <div className="auth-code__boxes">
        {digits.map((digit, index) => (
          <input
            key={index}
            id={index === 0 ? id : undefined}
            ref={(element) => {
              inputRefs.current[index] = element;
            }}
            className="auth-code__box"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoComplete={index === 0 ? "one-time-code" : "off"}
            placeholder="0"
            value={digit}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            aria-label={`Dígito ${index + 1} de ${length}`}
            aria-invalid={invalid || undefined}
            onChange={handleChange(index)}
            onKeyDown={handleKeyDown(index)}
            onPaste={handlePaste(index)}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>
    </div>
  );
}
