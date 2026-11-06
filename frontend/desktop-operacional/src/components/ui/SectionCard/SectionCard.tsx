import { useId, type HTMLAttributes, type ReactNode } from "react";
import { Icon, type IconSource } from "../Icon/Icon";
import { cx } from "../utils/cx";
import "./SectionCard.css";

export type SectionCardHeadingLevel = "h2" | "h3" | "h4";

export interface SectionCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: IconSource;
  /** Slot à direita do cabeçalho (ex.: <Button variant="ghost">Editar seção</Button> ou <Badge>). */
  actions?: ReactNode;
  /** Rodapé opcional (ex.: botões Cancelar/Salvar da seção em modo edição). */
  footer?: ReactNode;
  /** Nível semântico do título; o visual é sempre o "h3" do Design System. */
  headingLevel?: SectionCardHeadingLevel;
  /** Remove o padding do corpo (útil para tabelas que encostam nas bordas). */
  flush?: boolean;
  children?: ReactNode;
}

/**
 * Card de Seção (Figma: "Card · Informações básicas" etc.).
 * Usa composição via "children": o card não sabe o que há dentro dele — pode ser um
 * grid de Inputs, campos de leitura, uma tabela... Isso o torna reutilizável em qualquer tela.
 */
export function SectionCard({
  title,
  subtitle,
  icon,
  actions,
  footer,
  headingLevel = "h3",
  flush = false,
  children,
  className,
  ...rest
}: SectionCardProps) {
  const titleId = useId();
  // Componente dinâmico: uma variável com letra maiúscula pode ser usada como tag JSX
  const Heading = headingLevel;

  return (
    <section
      aria-labelledby={titleId}
      className={cx("ui-section-card", className)}
      {...rest}
    >
      <header className="ui-section-card__header">
        {icon !== undefined && (
          <span className="ui-section-card__icon-box">
            <Icon icon={icon} className="ui-section-card__icon" />
          </span>
        )}
        <div className="ui-section-card__heading">
          <Heading id={titleId} className="ui-section-card__title">
            {title}
          </Heading>
          {subtitle && <p className="ui-section-card__subtitle">{subtitle}</p>}
        </div>
        {actions && <div className="ui-section-card__actions">{actions}</div>}
      </header>

      {children !== undefined && (
        <div className={cx("ui-section-card__body", flush && "ui-section-card__body--flush")}>
          {children}
        </div>
      )}

      {footer && <footer className="ui-section-card__footer">{footer}</footer>}
    </section>
  );
}
