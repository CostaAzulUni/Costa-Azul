import { cx } from "../../../components/ui/utils/cx";
import { PASSWORD_RULES } from "../utils/passwordRules";
import "../../../components/ui/utils/a11y.css";
import "./PasswordRequirements.css";

export interface PasswordRequirementsProps {
  password: string;
  id?: string;
  className?: string;
}

/**
 * Checklist das regras de senha (Figma "Checkbox Field" em grade 2 × 2).
 * É um indicador somente leitura: cada item fica marcado quando a senha digitada atende à regra.
 */
export function PasswordRequirements({ password, id, className }: PasswordRequirementsProps) {
  return (
    <ul id={id} className={cx("auth-requirements", className)} aria-label="Requisitos da senha">
      {PASSWORD_RULES.map((rule) => {
        const met = rule.test(password);
        return (
          <li
            key={rule.id}
            className={cx("auth-requirements__item", met && "auth-requirements__item--met")}
          >
            <span className="auth-requirements__icon" aria-hidden="true">
              <i className="pi pi-check" />
            </span>
            <span>{rule.label}</span>
            <span className="ui-visually-hidden">{met ? "(atendido)" : "(pendente)"}</span>
          </li>
        );
      })}
    </ul>
  );
}
