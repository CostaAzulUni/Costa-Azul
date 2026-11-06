import type { ButtonHTMLAttributes } from "react";
import type { BadgeTone } from "../../../ui/Badge/Badge";
import { cx } from "../../../ui/utils/cx";
import "./DeckItem.css";

export type DeckStatusTone = Exclude<BadgeTone, "automatic">;

export interface DeckItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Número ou código do convés (ex.: 7 ou "07"). */
  deckNumber: number | string;
  /** Nome do convés (ex.: "Solarium", "Panorama"). */
  name: string;
  /** Quantidade de cabines no convés. */
  cabinsCount?: number;
  /** Quantidade de áreas públicas/operacionais no convés. */
  areasCount?: number;
  /** Texto secundário livre caso não use cabinsCount/areasCount. */
  subtitle?: string;
  /** Estado selecionado na lista lateral de conveses. */
  selected?: boolean;
  /** Cor semântica do indicador circular de status operacional. */
  statusTone?: DeckStatusTone;
}

/**
 * Item de Convés ("Item de convés" #4422:16665 no Figma).
 * Utilizado na lista lateral da tela "4 · Conveses & cabines" e na aba "Conveses & áreas".
 */
export function DeckItem({
  deckNumber,
  name,
  cabinsCount,
  areasCount,
  subtitle,
  selected = false,
  statusTone = "success",
  type = "button",
  className,
  ...rest
}: DeckItemProps) {
  const summaryParts: string[] = [];
  if (typeof cabinsCount === "number") {
    summaryParts.push(
      `${cabinsCount} ${cabinsCount === 1 ? "cabine" : "cabines"}`
    );
  }
  if (typeof areasCount === "number") {
    summaryParts.push(`${areasCount} ${areasCount === 1 ? "área" : "áreas"}`);
  }
  const resolvedSubtitle = subtitle ?? summaryParts.join(" · ");

  return (
    <button
      type={type}
      aria-pressed={selected}
      className={cx(
        "deck-item",
        selected && "deck-item--selected",
        className
      )}
      {...rest}
    >
      <span
        className={cx("deck-item__dot", `deck-item__dot--${statusTone}`)}
        aria-hidden="true"
      />

      <span className="deck-item__content">
        <span className="deck-item__title">
          Convés {deckNumber} · {name}
        </span>
        {resolvedSubtitle && (
          <span className="deck-item__subtitle">{resolvedSubtitle}</span>
        )}
      </span>

      <i
        className="deck-item__chevron pi pi-chevron-right"
        aria-hidden="true"
      />
    </button>
  );
}
