import type { HTMLAttributes } from "react";
import { cx } from "../../ui/utils/cx";
import "../../ui/utils/a11y.css";
import "./WizardStepper.css";

/** Estados do componente "Passo do cadastro" no Figma. */
export type WizardStepState = "completed" | "current" | "upcoming" | "error";

export interface WizardStep {
  id: string;
  title: string;
  subtitle?: string;
  /** Define se a etapa está concluída com base na validação dos dados. */
  completed?: boolean;
  /** Marca o passo com erro de validação (tem prioridade sobre os demais estados). */
  error?: boolean;
}

export interface WizardStepperProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  steps: WizardStep[];
  /** Índice (base 0) do passo atual. */
  currentIndex: number;
  /**
   * Quando informado, passos concluídos/com erro ficam clicáveis.
   * Passos futuros só são clicáveis se allowFutureNavigation=true.
   */
  onStepClick?: (index: number) => void;
  allowFutureNavigation?: boolean;
}

const STATE_LABEL: Record<WizardStepState, string> = {
  completed: "Concluído",
  current: "Em andamento",
  upcoming: "Pendente",
  error: "Campos pendentes",
};

/** Determina o estado visual de cada etapa priorizando a etapa atual e a validação dos dados. */
function getStepState(step: WizardStep, index: number, currentIndex: number): WizardStepState {
  if (index === currentIndex) return "current";
  if (step.error) return "error";
  if (typeof step.completed === "boolean") {
    return step.completed ? "completed" : "upcoming";
  }
  if (index < currentIndex) return "completed";
  return "upcoming";
}

export function WizardStepper({
  steps,
  currentIndex,
  onStepClick,
  allowFutureNavigation = false,
  className,
  ...rest
}: WizardStepperProps) {
  return (
    <nav aria-label="Etapas do cadastro" className={cx("ui-wizard", className)} {...rest}>
      <ol className="ui-wizard__list">
        {steps.map((step, index) => {
          const state = getStepState(step, index, currentIndex);
          const clickable =
            Boolean(onStepClick) &&
            index !== currentIndex &&
            (state !== "upcoming" || allowFutureNavigation);

          const indicator =
            state === "completed" ? (
              <i className="pi pi-check" aria-hidden="true" />
            ) : state === "error" ? (
              <i className="pi pi-exclamation-circle" aria-hidden="true" />
            ) : (
              <span aria-hidden="true">{index + 1}</span>
            );

          const body = (
            <>
              <span className="ui-wizard__indicator">{indicator}</span>
              <span className="ui-wizard__text">
                <span className="ui-wizard__title">{step.title}</span>
                <span className="ui-wizard__subtitle">
                  {state === "error" ? STATE_LABEL.error : step.subtitle ?? STATE_LABEL[state]}
                </span>
              </span>
              {/* Texto só para leitores de tela, informando o estado do passo */}
              <span className="ui-visually-hidden">({STATE_LABEL[state]})</span>
            </>
          );

          return (
            <li
              key={step.id}
              className={cx("ui-wizard__step", `ui-wizard__step--${state}`)}
              aria-current={index === currentIndex ? "step" : undefined}
            >
              {clickable ? (
                <button
                  type="button"
                  className="ui-wizard__content ui-wizard__content--clickable"
                  onClick={() => onStepClick?.(index)}
                >
                  {body}
                </button>
              ) : (
                <div className="ui-wizard__content">{body}</div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
