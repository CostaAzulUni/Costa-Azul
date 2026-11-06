import {
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { Icon, type IconSource } from "../Icon/Icon";
import { cx } from "../utils/cx";
import "./Tabs.css";

export type TabCountTone = "neutral" | "warning";

export interface TabItem {
  id: string;
  label: string;
  icon?: IconSource;
  count?: number | string;
  countTone?: TabCountTone;
  disabled?: boolean;
}

export interface TabsProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onChange" | "role"> {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  /** Rótulo acessível do grupo de abas (ex.: "Seções da embarcação"). */
  "aria-label": string;
  /**
   * Prefixo de IDs compartilhado com <TabPanel>. Quando informado, cada aba aponta
   * (aria-controls) para o painel correspondente.
   */
  idPrefix?: string;
}

/** Monta os IDs de aba/painel de forma idêntica em Tabs e TabPanel. */
const tabDomId = (prefix: string, id: string) => `${prefix}-tab-${id}`;
const panelDomId = (prefix: string, id: string) => `${prefix}-panel-${id}`;

export function Tabs({
  items,
  activeId,
  onChange,
  idPrefix,
  className,
  ...rest
}: TabsProps) {
  const fallbackPrefix = useId();
  const prefix = idPrefix ?? fallbackPrefix;

  // Guardamos referências para os botões para mover o foco com as setas do teclado
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  /**
   * Padrão WAI-ARIA de abas: apenas a aba ativa entra na ordem do Tab (tabIndex=0);
   * as demais são alcançadas pelas setas ←/→, Home e End ("roving tabindex").
   */
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const enabled = items
      .map((item, i) => ({ item, i }))
      .filter(({ item }) => !item.disabled);
    const position = enabled.findIndex(({ i }) => i === index);
    if (position === -1) return;

    let next: number | undefined;
    if (event.key === "ArrowRight") next = enabled[(position + 1) % enabled.length].i;
    if (event.key === "ArrowLeft")
      next = enabled[(position - 1 + enabled.length) % enabled.length].i;
    if (event.key === "Home") next = enabled[0].i;
    if (event.key === "End") next = enabled[enabled.length - 1].i;

    if (next !== undefined) {
      event.preventDefault();
      tabRefs.current[next]?.focus();
      onChange(items[next].id);
    }
  };

  return (
    <div role="tablist" className={cx("ui-tabs", className)} {...rest}>
      {items.map((item, index) => {
        const selected = item.id === activeId;
        const hasCount = item.count !== undefined && item.count !== "";

        return (
          <button
            key={item.id}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            type="button"
            role="tab"
            id={tabDomId(prefix, item.id)}
            aria-selected={selected}
            aria-controls={idPrefix ? panelDomId(prefix, item.id) : undefined}
            tabIndex={selected ? 0 : -1}
            disabled={item.disabled}
            className={cx("ui-tabs__tab", selected && "ui-tabs__tab--selected")}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            {item.icon !== undefined && (
              <Icon icon={item.icon} className="ui-tabs__icon" />
            )}
            <span>{item.label}</span>
            {hasCount && (
              <span
                className={cx(
                  "ui-tabs__count",
                  `ui-tabs__count--${item.countTone ?? "neutral"}`
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  /** Mesmo idPrefix passado para <Tabs>. */
  idPrefix: string;
  /** ID da aba (TabItem.id) que este painel representa. */
  tabId: string;
  children: ReactNode;
}

export function TabPanel({ idPrefix, tabId, children, className, ...rest }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      id={panelDomId(idPrefix, tabId)}
      aria-labelledby={tabDomId(idPrefix, tabId)}
      tabIndex={0}
      className={cx("ui-tabs__panel", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
