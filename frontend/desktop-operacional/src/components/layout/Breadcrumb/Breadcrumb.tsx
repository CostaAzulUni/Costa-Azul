import type { HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import { cx } from "../../ui/utils/cx";
import "./Breadcrumb.css";

export interface BreadcrumbItem {
  label: string;
  /** Rota interna do React Router. Sem `to` (e sem onClick), o item é texto. */
  to?: string;
  onClick?: () => void;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  items: BreadcrumbItem[];
}

/**
 * Versão global e tipada do Breadcrumb (Figma: 13px, separador chevron 14px).
 * O último item é sempre a página atual (aria-current="page") e nunca vira link.
 */
export function Breadcrumb({ items, className, ...rest }: BreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação" className={cx("ui-breadcrumb", className)} {...rest}>
      {/* Lista ordenada: semanticamente, o breadcrumb é uma sequência hierárquica */}
      <ol className="ui-breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          let content;
          if (isLast) {
            content = (
              <span className="ui-breadcrumb__current" aria-current="page">
                {item.label}
              </span>
            );
          } else if (item.to) {
            content = (
              <Link to={item.to} className="ui-breadcrumb__link" onClick={item.onClick}>
                {item.label}
              </Link>
            );
          } else if (item.onClick) {
            content = (
              <button type="button" className="ui-breadcrumb__link" onClick={item.onClick}>
                {item.label}
              </button>
            );
          } else {
            content = <span className="ui-breadcrumb__text">{item.label}</span>;
          }

          return (
            // Índice na key: rótulos podem se repetir e a lista é estática por renderização
            <li key={`${index}-${item.label}`} className="ui-breadcrumb__item">
              {content}
              {!isLast && (
                <i className="ui-breadcrumb__separator pi pi-chevron-right" aria-hidden="true" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
