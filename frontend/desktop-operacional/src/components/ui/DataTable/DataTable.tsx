import type { KeyboardEvent, ReactNode } from "react";
import { EmptyState, type EmptyStateProps } from "../EmptyState/EmptyState";
import { Pagination, type PaginationProps } from "../Pagination/Pagination";
import { cx } from "../utils/cx";
import "../utils/a11y.css";
import "./DataTable.css";

export type DataTableAlign = "left" | "center" | "right";

/**
 * Definição de coluna genérica para o tipo de linha T.
 * Permite ler uma propriedade direta via `accessor` (keyof T) ou renderizar JSX customizado
 * (ex.: um <Badge> de status ou um <IconButton> de ações) via `render`.
 */
export interface DataTableColumn<T> {
  key: string;
  header: ReactNode;
  accessor?: keyof T;
  render?: (row: T, rowIndex: number) => ReactNode;
  align?: DataTableAlign;
  /** Ativa números tabulares (tabular-nums) para colunas de horários, códigos IMO, quantidades e valores. */
  tabular?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  /** Função que extrai uma key única por linha (ex.: (vessel) => vessel.id). */
  rowKey: (row: T, index: number) => string | number;
  /** Torna as linhas clicáveis (ex.: abrir ficha da embarcação ao clicar na linha). */
  onRowClick?: (row: T, index: number) => void;
  /** Exibe linhas de esqueleto (skeleton) durante o carregamento da API. */
  loading?: boolean;
  skeletonRows?: number;
  /** Configuração do EmptyState exibido quando `data` está vazio. */
  emptyState?: EmptyStateProps;
  /** Quando informado, renderiza o componente <Pagination> no rodapé da tabela. */
  pagination?: PaginationProps;
  caption?: string;
  className?: string;
}

/**
 * Tabela de Dados Reutilizável (Fase 05).
 * Usa Generics do TypeScript (<T>) para garantir tipagem forte nas colunas e linhas sem usar `any`.
 * Compõe automaticamente <EmptyState> quando não há registros e <Pagination> no rodapé.
 */
export function DataTable<T>({
  columns,
  data,
  rowKey,
  onRowClick,
  loading = false,
  skeletonRows = 5,
  emptyState,
  pagination,
  caption,
  className,
}: DataTableProps<T>) {
  const isInteractiveRow = Boolean(onRowClick);

  const handleRowKeyDown = (
    event: KeyboardEvent<HTMLTableRowElement>,
    row: T,
    index: number
  ) => {
    if (!onRowClick) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowClick(row, index);
    }
  };

  const renderCellContent = (
    column: DataTableColumn<T>,
    row: T,
    rowIndex: number
  ): ReactNode => {
    if (column.render) {
      return column.render(row, rowIndex);
    }
    if (column.accessor !== undefined) {
      const rawValue = row[column.accessor];
      if (rawValue === null || rawValue === undefined || rawValue === "") {
        return "—";
      }
      return String(rawValue);
    }
    return "—";
  };

  return (
    <div className={cx("ui-data-table", className)}>
      <div className="ui-data-table__scroll">
        <table className="ui-data-table__table" aria-busy={loading || undefined}>
          {caption && (
            <caption className="ui-visually-hidden">{caption}</caption>
          )}

          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  scope="col"
                  style={column.width ? { width: column.width } : undefined}
                  className={cx(
                    "ui-data-table__th",
                    column.align && `ui-data-table__cell--${column.align}`
                  )}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: skeletonRows }, (_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="ui-data-table__tr">
                  {columns.map((column) => (
                    <td key={column.key} className="ui-data-table__td">
                      <span className="ui-data-table__skeleton" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="ui-data-table__empty-cell"
                >
                  <EmptyState
                    compact
                    title={emptyState?.title ?? "Nenhum registro encontrado"}
                    description={
                      emptyState?.description ??
                      "Ajuste os filtros aplicados ou cadastre um novo item."
                    }
                    {...emptyState}
                  />
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={rowKey(row, rowIndex)}
                  className={cx(
                    "ui-data-table__tr",
                    isInteractiveRow && "ui-data-table__tr--interactive"
                  )}
                  onClick={
                    onRowClick ? () => onRowClick(row, rowIndex) : undefined
                  }
                  onKeyDown={
                    isInteractiveRow
                      ? (event) => handleRowKeyDown(event, row, rowIndex)
                      : undefined
                  }
                  tabIndex={isInteractiveRow ? 0 : undefined}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={cx(
                        "ui-data-table__td",
                        column.align && `ui-data-table__cell--${column.align}`,
                        column.tabular && "ui-data-table__td--tabular"
                      )}
                    >
                      {renderCellContent(column, row, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination && !loading && data.length > 0 && (
        <div className="ui-data-table__footer">
          <Pagination {...pagination} />
        </div>
      )}
    </div>
  );
}
