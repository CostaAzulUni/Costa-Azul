import { useState, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../ui/Avatar/Avatar";
import { Icon, type IconSource } from "../../ui/Icon/Icon";
import { Switch } from "../../ui/Switch/Switch";
import { cx } from "../../ui/utils/cx";
import "./Sidebar.css";

/**
 * Item de navegação. Um item com `children` vira um "módulo expansível" (accordion);
 * os filhos são os "subitens" do Figma (Sidebar / Subitem).
 */
export interface SidebarNavItem {
  id: string;
  label: string;
  icon?: IconSource;
  /** Rota do React Router. Itens expansíveis normalmente não têm rota própria. */
  to?: string;
  /** Contador exibido à direita (Sidebar / Badge). */
  badge?: number | string;
  disabled?: boolean;
  children?: SidebarNavItem[];
}

export interface SidebarNavGroup {
  id: string;
  /** Título da seção (ex.: "OPERAÇÃO"). Opcional para o grupo principal. */
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarUser {
  name: string;
  role?: string;
  avatarUrl?: string;
}

export interface SidebarProps {
  groups: SidebarNavGroup[];
  /** ID do item ativo — a tela/layout decide qual é (ex.: a partir da rota atual). */
  activeId?: string;
  /** Chamado ao clicar em um item navegável (com ou sem `to`). */
  onNavigate?: (item: SidebarNavItem) => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  /** Logo exibido no topo (aberto) e versão compacta (recolhido). */
  logo?: ReactNode;
  collapsedLogo?: ReactNode;
  /** Faixa abaixo do logo (ex.: "GLOBAL ADMINISTRATION"). */
  headerLabel?: string;
  user?: SidebarUser;
  darkMode?: { checked: boolean; onChange: (checked: boolean) => void };
  onLogout?: () => void;
  /** Exibe esqueletos no lugar dos itens (estado "Aberto · Carregando"). */
  loading?: boolean;
  "aria-label"?: string;
  className?: string;
}

/** Verifica se o item (ou algum descendente) é o ativo — usado no estado "Pai ativo". */
function containsActive(item: SidebarNavItem, activeId?: string): boolean {
  if (!activeId) return false;
  if (item.id === activeId) return true;
  return item.children?.some((child) => containsActive(child, activeId)) ?? false;
}

export function Sidebar({
  groups,
  activeId,
  onNavigate,
  collapsed = false,
  onToggleCollapse,
  logo,
  collapsedLogo,
  headerLabel,
  user,
  darkMode,
  onLogout,
  loading = false,
  "aria-label": ariaLabel = "Navegação principal",
  className,
}: SidebarProps) {
  /**
   * Estado local: quais módulos expansíveis estão abertos.
   * A função passada ao useState roda só na primeira renderização ("lazy initializer"):
   * começamos com o módulo que contém o item ativo já aberto.
   */
  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    groups.forEach((group) =>
      group.items.forEach((item) => {
        if (item.children?.length && containsActive(item, activeId)) initial.add(item.id);
      })
    );
    return initial;
  });

  const toggleOpen = (id: string) => {
    // Nunca mutamos o estado diretamente: criamos um novo Set para o React detectar a mudança
    setOpenIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLinkClick = (event: MouseEvent, item: SidebarNavItem) => {
    if (item.disabled) {
      event.preventDefault();
      return;
    }
    onNavigate?.(item);
  };

  const renderBadge = (badge: SidebarNavItem["badge"]) =>
    badge !== undefined && badge !== "" && <span className="ui-sidebar__badge">{badge}</span>;

  /** Item navegável: vira <Link> se tiver rota, senão <button>. */
  const renderNavigable = (item: SidebarNavItem, isSubitem: boolean) => {
    const isActive = item.id === activeId;
    const classes = cx(
      isSubitem ? "ui-sidebar__subitem" : "ui-sidebar__item",
      isActive && (isSubitem ? "ui-sidebar__subitem--active" : "ui-sidebar__item--active"),
      item.disabled && "ui-sidebar__item--disabled"
    );
    const content = (
      <>
        {!isSubitem && <Icon icon={item.icon} className="ui-sidebar__icon" />}
        <span className="ui-sidebar__label">{item.label}</span>
        {renderBadge(item.badge)}
        {!isSubitem && isActive && <span className="ui-sidebar__active-dot" aria-hidden="true" />}
      </>
    );

    if (item.to && !item.disabled) {
      return (
        <Link
          to={item.to}
          className={classes}
          aria-current={isActive ? "page" : undefined}
          title={collapsed ? item.label : undefined}
          onClick={(event) => handleLinkClick(event, item)}
        >
          {content}
        </Link>
      );
    }

    return (
      <button
        type="button"
        className={classes}
        aria-current={isActive ? "page" : undefined}
        title={collapsed ? item.label : undefined}
        disabled={item.disabled}
        onClick={() => onNavigate?.(item)}
      >
        {content}
      </button>
    );
  };

  const renderExpandable = (item: SidebarNavItem) => {
    const isOpen = openIds.has(item.id) && !collapsed;
    const isParentActive = containsActive(item, activeId);
    const submenuId = `ui-sidebar-submenu-${item.id}`;

    return (
      <>
        <button
          type="button"
          className={cx(
            "ui-sidebar__item",
            isParentActive && "ui-sidebar__item--parent-active",
            item.disabled && "ui-sidebar__item--disabled"
          )}
          aria-expanded={isOpen}
          aria-controls={submenuId}
          title={collapsed ? item.label : undefined}
          disabled={item.disabled}
          onClick={() => {
            // Recolhido não há espaço para subitens: expandimos a sidebar e abrimos o módulo
            if (collapsed) {
              onToggleCollapse?.();
              if (!openIds.has(item.id)) toggleOpen(item.id);
              return;
            }
            toggleOpen(item.id);
          }}
        >
          <Icon icon={item.icon} className="ui-sidebar__icon" />
          <span className="ui-sidebar__label">{item.label}</span>
          {renderBadge(item.badge)}
          <i
            className={cx("ui-sidebar__chevron pi pi-chevron-down", isOpen && "ui-sidebar__chevron--open")}
            aria-hidden="true"
          />
        </button>

        <ul id={submenuId} className="ui-sidebar__submenu" hidden={!isOpen}>
          {item.children?.map((child) => (
            <li key={child.id}>{renderNavigable(child, true)}</li>
          ))}
        </ul>
      </>
    );
  };

  return (
    <aside
      className={cx("ui-sidebar", collapsed && "ui-sidebar--collapsed", className)}
      aria-label={ariaLabel}
    >
      <div className="ui-sidebar__header">
        <div className="ui-sidebar__logo">{collapsed ? collapsedLogo ?? logo : logo}</div>
        {onToggleCollapse && (
          <button
            type="button"
            className="ui-sidebar__collapse"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expandir menu" : "Recolher menu"}
            aria-expanded={!collapsed}
          >
            <i
              className={cx("pi", collapsed ? "pi-angle-double-right" : "pi-angle-double-left")}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      {headerLabel && !collapsed && (
        <div className="ui-sidebar__banner">
          <span>{headerLabel}</span>
        </div>
      )}

      <nav className="ui-sidebar__content" aria-busy={loading || undefined}>
        {loading
          ? Array.from({ length: 6 }, (_, index) => (
              <span key={index} className="ui-sidebar__skeleton" aria-hidden="true" />
            ))
          : groups.map((group) => (
              <div key={group.id} className="ui-sidebar__group">
                {group.title && !collapsed && (
                  <span className="ui-sidebar__section-title">{group.title}</span>
                )}
                <ul className="ui-sidebar__list">
                  {group.items.map((item) => (
                    <li key={item.id}>
                      {item.children?.length ? renderExpandable(item) : renderNavigable(item, false)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
      </nav>

      {(darkMode || user || onLogout) && (
        <div className="ui-sidebar__footer">
          {darkMode && !collapsed && (
            <Switch
              inverse
              labelPosition="left"
              className="ui-sidebar__dark-mode"
              label={
                <span className="ui-sidebar__dark-mode-label">
                  <i className="pi pi-moon" aria-hidden="true" />
                  Modo escuro
                </span>
              }
              checked={darkMode.checked}
              onCheckedChange={darkMode.onChange}
            />
          )}

          {user && (
            <div className="ui-sidebar__user" title={collapsed ? user.name : undefined}>
              <Avatar name={user.name} src={user.avatarUrl} bordered />
              {!collapsed && (
                <div className="ui-sidebar__user-info">
                  <strong>{user.name}</strong>
                  {user.role && <small>{user.role}</small>}
                </div>
              )}
            </div>
          )}

          {onLogout && (
            <button
              type="button"
              className="ui-sidebar__logout"
              onClick={onLogout}
              aria-label={collapsed ? "Sair" : undefined}
              title={collapsed ? "Sair" : undefined}
            >
              <i className="pi pi-sign-out" aria-hidden="true" />
              {!collapsed && <span>Sair</span>}
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
