import type { HTMLAttributes } from "react";
import { cx } from "../utils/cx";
import "./Pagination.css";

export interface PaginationProps
  extends Omit<HTMLAttributes<HTMLElement>, "onChange"> {
  /** Página atual (base 1). */
  page: number;
  /** Total de páginas disponíveis. */
  totalPages: number;
  /** Disparado ao selecionar outra página. */
  onPageChange: (page: number) => void;
  /** Total de registros (opcional; exibe "Mostrando X–Y de Z registros"). */
  totalItems?: number;
  /** Quantidade de itens por página (usado junto com totalItems para calcular o intervalo). */
  pageSize?: number;
  /** Rótulo de itens no contador (padrão: "registros"). */
  itemLabel?: string;
  disabled?: boolean;
}

/**
 * Gera a sequência de páginas visíveis com reticências ("ellipsis") quando há muitas páginas.
 * Exemplo para page=5, totalPages=10: [1, "ellipsis", 4, 5, 6, "ellipsis", 10]
 */
function buildPageRange(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p += 1) {
    pages.push(p);
  }
  if (end < total - 1) pages.push("ellipsis");

  pages.push(total);
  return pages;
}

/**
 * Paginação ("Paginação" #4422:16687 no Figma).
 * Botões 32x32px com estados Default, Selected e Disabled + contador de registros.
 */
export function Pagination({
  page,
  totalPages,
  onPageChange,
  totalItems,
  pageSize = 10,
  itemLabel = "registros",
  disabled = false,
  className,
  ...rest
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const safePage = Math.min(safeTotalPages, Math.max(1, page));
  const pages = buildPageRange(safePage, safeTotalPages);

  const canGoPrev = !disabled && safePage > 1;
  const canGoNext = !disabled && safePage < safeTotalPages;

  const hasSummary = typeof totalItems === "number" && totalItems >= 0;
  const rangeStart =
    hasSummary && totalItems > 0 ? (safePage - 1) * pageSize + 1 : 0;
  const rangeEnd = hasSummary
    ? Math.min(totalItems, safePage * pageSize)
    : 0;

  return (
    <nav
      aria-label="Paginação de resultados"
      className={cx("ui-pagination", className)}
      {...rest}
    >
      {hasSummary ? (
        <span className="ui-pagination__summary">
          Mostrando{" "}
          <strong>
            {rangeStart}–{rangeEnd}
          </strong>{" "}
          de <strong>{totalItems}</strong> {itemLabel}
        </span>
      ) : (
        <span />
      )}

      <div className="ui-pagination__controls">
        <button
          type="button"
          className="ui-pagination__btn"
          disabled={!canGoPrev}
          onClick={() => onPageChange(safePage - 1)}
          aria-label="Página anterior"
        >
          <i className="pi pi-chevron-left" aria-hidden="true" />
        </button>

        {pages.map((item, index) =>
          item === "ellipsis" ? (
            <span
              key={`ellipsis-${index}`}
              className="ui-pagination__ellipsis"
              aria-hidden="true"
            >
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              disabled={disabled}
              aria-current={item === safePage ? "page" : undefined}
              aria-label={`Página ${item}`}
              className={cx(
                "ui-pagination__btn",
                item === safePage && "ui-pagination__btn--selected"
              )}
              onClick={() => onPageChange(item)}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className="ui-pagination__btn"
          disabled={!canGoNext}
          onClick={() => onPageChange(safePage + 1)}
          aria-label="Próxima página"
        >
          <i className="pi pi-chevron-right" aria-hidden="true" />
        </button>
      </div>
    </nav>
  );
}
