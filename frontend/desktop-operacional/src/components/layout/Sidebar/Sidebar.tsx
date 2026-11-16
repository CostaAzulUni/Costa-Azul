import { useEffect, useMemo, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Avatar } from "../../ui/Avatar/Avatar";
import { Icon, type IconSource } from "../../ui/Icon/Icon";
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
  /** Faixa abaixo do logo (ex.: "COMPANY ADMINISTRATION"). */
  headerLabel?: string;
  user?: SidebarUser;
  onLogout?: () => void;
  /** Controle opcional do drawer mobile (< 1200px). */
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
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

/** Encontra o ID do módulo pai que contém o `activeId`. */
function findActiveParentId(groups: SidebarNavGroup[], activeId?: string): string | null {
  if (!activeId) return null;
  for (const group of groups) {
    for (const item of group.items) {
      if (item.children?.length && containsActive(item, activeId)) {
        return item.id;
      }
    }
  }
  return null;
}

/** Monograma padrão do modo recolhido conforme Figma (#3826:5888). */
function DefaultCollapsedMonogram() {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ui-sidebar__monogram-svg"
      aria-label="Costa Azul"
      role="img"
    >
      <defs>
        <linearGradient id="ui-sidebar-monogram-bg" x1="24" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0.21" stopColor="#000C1D" />
          <stop offset="0.62" stopColor="#001534" />
          <stop offset="0.85" stopColor="#00183B" />
        </linearGradient>
      </defs>
      <rect width="48" height="48" rx="24" fill="url(#ui-sidebar-monogram-bg)" />
      <text
        x="7"
        y="32"
        fill="#FFFFFF"
        fontFamily="Inter, sans-serif"
        fontWeight="600"
        fontSize="24"
      >
        C
      </text>
      <path
        d="M41.4 24.3L36.5 31.2H29.6C29.6 31.2 26.2 24.2 26.3 23.3C26.3 23.3 33.7 15.6 34.2 16.1C34.7 16.6 34.2 23.3 34.2 23.3"
        stroke="#0B63E5"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Ícone de menu com quatro quadrados (grid 2x2) para o botão de recolher/expandir. */
function FourSquaresMenuIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="ui-sidebar__collapse-icon"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10.5" y="2" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
      <rect x="10.5" y="10.5" width="5.5" height="5.5" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

const SKELETON_COUNT = 9;

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
  onLogout,
  mobileOpen: controlledMobileOpen,
  onMobileOpenChange,
  loading = false,
  "aria-label": ariaLabel = "Navegação principal",
  className,
}: SidebarProps) {
  const sidebarRef = useRef<HTMLElement | null>(null);
  const navScrollRef = useRef<HTMLElement | null>(null);

  const activeParentId = useMemo(
    () => findActiveParentId(groups, activeId),
    [groups, activeId]
  );

  // Estado accordion: apenas um módulo aberto por vez no modo expandido (Figma #4384:10107).
  // Vinculado ao `activeId` atual para abrir automaticamente o módulo pai ao navegar sem useEffect.
  const [accordionState, setAccordionState] = useState<{
    forActiveId: string | undefined;
    openId: string | null;
  }>(() => ({
    forActiveId: activeId,
    openId: activeParentId,
  }));

  const openModuleId =
    accordionState.forActiveId === activeId ? accordionState.openId : activeParentId;

  // Estado do flyout no modo recolhido (Figma #4384:10231 / #4384:11371)
  const [flyoutModuleId, setFlyoutModuleId] = useState<string | null>(null);

  // Estado do tooltip no modo recolhido (Figma #4384:10081 / #4384:11343)
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null);

  // Estado do overlay responsivo (< 1200px)
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const isMobileOpen = controlledMobileOpen ?? internalMobileOpen;

  const setMobileOpen = (next: boolean) => {
    setInternalMobileOpen(next);
    setFlyoutModuleId(null);
    setHoveredModuleId(null);
    onMobileOpenChange?.(next);
  };

  // Fades de rolagem superior/inferior na lista de módulos
  const [scrollFade, setScrollFade] = useState({ top: false, bottom: false });

  // No overlay mobile (< 1200px), o painel é exibido sempre aberto (300px)
  const isCollapsedView = collapsed && !isMobileOpen;
  const activeFlyoutModuleId = isCollapsedView ? flyoutModuleId : null;
  const activeHoveredModuleId = isCollapsedView ? hoveredModuleId : null;

  // Atalhos de teclado `[` (recolher) e `]` (expandir) + `Escape` para fechar flyout/overlay
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (activeFlyoutModuleId) {
          setFlyoutModuleId(null);
        }
        if (isMobileOpen) {
          setMobileOpen(false);
        }
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (!onToggleCollapse || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      if (event.key === "[" && !collapsed) {
        event.preventDefault();
        setFlyoutModuleId(null);
        setHoveredModuleId(null);
        onToggleCollapse();
      } else if (event.key === "]" && collapsed) {
        event.preventDefault();
        setFlyoutModuleId(null);
        setHoveredModuleId(null);
        onToggleCollapse();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  // Fecha o flyout ao clicar fora da sidebar
  useEffect(() => {
    if (!activeFlyoutModuleId) return;

    const handlePointerDown = (event: globalThis.MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setFlyoutModuleId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [activeFlyoutModuleId]);

  // Atualiza os indicadores de fade na área rolável
  useEffect(() => {
    const element = navScrollRef.current;
    if (!element) return;

    const updateScrollFades = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const canScroll = scrollHeight - clientHeight > 2;
      setScrollFade({
        top: canScroll && scrollTop > 4,
        bottom: canScroll && scrollTop + clientHeight < scrollHeight - 4,
      });
    };

    updateScrollFades();
    element.addEventListener("scroll", updateScrollFades, { passive: true });
    window.addEventListener("resize", updateScrollFades);

    return () => {
      element.removeEventListener("scroll", updateScrollFades);
      window.removeEventListener("resize", updateScrollFades);
    };
  }, [groups, openModuleId, isCollapsedView, loading]);

  // Focus trap quando o overlay mobile (< 1200px) está aberto
  const handleSidebarKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (!isMobileOpen || event.key !== "Tab" || !sidebarRef.current) return;

    const focusable = sidebarRef.current.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const toggleAccordion = (id: string) => {
    setAccordionState({
      forActiveId: activeId,
      openId: openModuleId === id ? null : id,
    });
  };

  const handleItemActivation = (event: MouseEvent | undefined, item: SidebarNavItem) => {
    if (item.disabled) {
      event?.preventDefault();
      return;
    }
    onNavigate?.(item);
    setFlyoutModuleId(null);
    if (isMobileOpen) {
      setMobileOpen(false);
    }
  };

  const renderBadge = (badge: SidebarNavItem["badge"], asDot = false) => {
    if (badge === undefined || badge === "") return null;
    if (asDot) {
      return (
        <span
          className="ui-sidebar__badge-dot"
          aria-label={`${badge} pendências`}
        />
      );
    }
    return <span className="ui-sidebar__badge">{badge}</span>;
  };

  const renderTooltip = (itemId: string, label: string) => {
    if (
      !isCollapsedView ||
      activeHoveredModuleId !== itemId ||
      activeFlyoutModuleId === itemId
    ) {
      return null;
    }
    return (
      <span className="ui-sidebar__tooltip" role="tooltip">
        <span className="ui-sidebar__tooltip-arrow" aria-hidden="true" />
        <span className="ui-sidebar__tooltip-body">{label}</span>
      </span>
    );
  };

  /** Item navegável: vira <Link> se tiver rota, senão <button>. */
  const renderNavigable = (item: SidebarNavItem, isSubitem: boolean, inFlyout = false) => {
    const isActive = item.id === activeId;
    const classes = cx(
      isSubitem ? "ui-sidebar__subitem" : "ui-sidebar__item",
      inFlyout && "ui-sidebar__subitem--flyout",
      isActive && (isSubitem ? "ui-sidebar__subitem--active" : "ui-sidebar__item--active"),
      item.disabled && (isSubitem ? "ui-sidebar__subitem--disabled" : "ui-sidebar__item--disabled")
    );

    const showCollapsedDotBadge = !isSubitem && isCollapsedView;

    const content = (
      <>
        {!isSubitem && <Icon icon={item.icon} className="ui-sidebar__icon" />}
        <span className="ui-sidebar__label">{item.label}</span>
        {renderBadge(item.badge, showCollapsedDotBadge)}
        {isActive && (!isCollapsedView || isSubitem) && (
          <span className="ui-sidebar__active-dot" aria-hidden="true" />
        )}
      </>
    );

    const hoverHandlers =
      !isSubitem && isCollapsedView
        ? {
            onMouseEnter: () => setHoveredModuleId(item.id),
            onMouseLeave: () =>
              setHoveredModuleId((current) => (current === item.id ? null : current)),
            onFocus: () => setHoveredModuleId(item.id),
            onBlur: () =>
              setHoveredModuleId((current) => (current === item.id ? null : current)),
          }
        : undefined;

    if (item.to && !item.disabled) {
      return (
        <div className="ui-sidebar__item-wrapper" {...hoverHandlers}>
          <Link
            to={item.to}
            className={classes}
            aria-current={isActive ? "page" : undefined}
            aria-label={!isSubitem && isCollapsedView ? item.label : undefined}
            onClick={(event) => handleItemActivation(event, item)}
          >
            {content}
          </Link>
          {!isSubitem && renderTooltip(item.id, item.label)}
        </div>
      );
    }

    return (
      <div className="ui-sidebar__item-wrapper" {...hoverHandlers}>
        <button
          type="button"
          className={classes}
          aria-current={isActive ? "page" : undefined}
          aria-label={!isSubitem && isCollapsedView ? item.label : undefined}
          title={item.disabled ? "Sem permissão" : undefined}
          disabled={item.disabled}
          onClick={(event) => handleItemActivation(event, item)}
        >
          {content}
        </button>
        {!isSubitem && renderTooltip(item.id, item.disabled ? `${item.label} (Sem permissão)` : item.label)}
      </div>
    );
  };

  const renderExpandable = (item: SidebarNavItem) => {
    const isOpen = !isCollapsedView && openModuleId === item.id;
    const isFlyoutOpen = isCollapsedView && activeFlyoutModuleId === item.id;
    const isParentActive = containsActive(item, activeId);
    const submenuId = `ui-sidebar-submenu-${item.id}`;
    const flyoutId = `ui-sidebar-flyout-${item.id}`;

    return (
      <div
        className="ui-sidebar__module"
        onMouseEnter={() => {
          if (isCollapsedView) setHoveredModuleId(item.id);
        }}
        onMouseLeave={() => {
          if (isCollapsedView) {
            setHoveredModuleId((current) => (current === item.id ? null : current));
          }
        }}
      >
        <button
          type="button"
          className={cx(
            "ui-sidebar__item",
            isParentActive && "ui-sidebar__item--parent-active",
            isFlyoutOpen && "ui-sidebar__item--flyout-open",
            item.disabled && "ui-sidebar__item--disabled"
          )}
          aria-expanded={isCollapsedView ? isFlyoutOpen : isOpen}
          aria-controls={isCollapsedView ? flyoutId : submenuId}
          aria-haspopup={isCollapsedView ? "menu" : undefined}
          aria-label={isCollapsedView ? item.label : undefined}
          title={item.disabled ? "Sem permissão" : undefined}
          disabled={item.disabled}
          onFocus={() => {
            if (isCollapsedView) setHoveredModuleId(item.id);
          }}
          onBlur={() => {
            if (isCollapsedView) {
              setHoveredModuleId((current) => (current === item.id ? null : current));
            }
          }}
          onClick={() => {
            if (isCollapsedView) {
              setFlyoutModuleId((current) => (current === item.id ? null : item.id));
              setHoveredModuleId(null);
              return;
            }
            toggleAccordion(item.id);
          }}
        >
          <Icon icon={item.icon} className="ui-sidebar__icon" />
          <span className="ui-sidebar__label">{item.label}</span>
          {renderBadge(item.badge, isCollapsedView)}
          <i
            className={cx(
              "ui-sidebar__chevron pi pi-chevron-right",
              isOpen && "ui-sidebar__chevron--open"
            )}
            aria-hidden="true"
          />
          {isCollapsedView && isParentActive && (
            <span className="ui-sidebar__collapsed-parent-dot" aria-hidden="true" />
          )}
        </button>

        {renderTooltip(item.id, item.label)}

        {/* Submódulos no modo expandido (dropdown accordion) */}
        <ul id={submenuId} className="ui-sidebar__submenu" hidden={!isOpen}>
          {item.children?.map((child) => (
            <li key={child.id}>{renderNavigable(child, true, false)}</li>
          ))}
        </ul>

        {/* Flyout flutuante no modo recolhido (Figma #4384:10231) */}
        {isFlyoutOpen && (
          <div
            id={flyoutId}
            className="ui-sidebar__flyout"
            role="menu"
            aria-label={item.label}
          >
            <div className="ui-sidebar__flyout-header">{item.label.toUpperCase()}</div>
            <ul className="ui-sidebar__flyout-list">
              {item.children?.map((child) => (
                <li key={child.id} role="none">
                  {renderNavigable(child, true, true)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const showFooter = Boolean(user || onLogout);

  return (
    <>
      {/* Botão hambúrguer para abrir o sidebar em telas < 1200px */}
      <button
        type="button"
        className="ui-sidebar__mobile-trigger"
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu de navegação"
        aria-expanded={isMobileOpen}
      >
        <i className="pi pi-bars" aria-hidden="true" />
      </button>

      {/* Scrim do modo overlay (< 1200px) */}
      {isMobileOpen && (
        <div
          className="ui-sidebar__scrim"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        ref={sidebarRef}
        className={cx(
          "ui-sidebar",
          isCollapsedView && "ui-sidebar--collapsed",
          isMobileOpen && "ui-sidebar--mobile-open",
          className
        )}
        aria-label={ariaLabel}
        onKeyDown={handleSidebarKeyDown}
      >
        {/* Botão circular de fechar no overlay (< 1200px) — Figma #4384:11423 */}
        {isMobileOpen && (
          <button
            type="button"
            className="ui-sidebar__mobile-close"
            onClick={() => setMobileOpen(false)}
            aria-label="Fechar menu (Esc)"
            title="Fechar (Esc)"
          >
            <i className="pi pi-times" aria-hidden="true" />
          </button>
        )}

        {/* Topo: Logo completo (aberto) ou Monograma (recolhido) + botão recolher/expandir integrado */}
        <div className="ui-sidebar__header">
          <div className="ui-sidebar__logo">
            {isCollapsedView ? (collapsedLogo ?? <DefaultCollapsedMonogram />) : logo}
          </div>

          {onToggleCollapse && (
            <button
              type="button"
              className="ui-sidebar__collapse"
              onClick={() => {
                setFlyoutModuleId(null);
                setHoveredModuleId(null);
                onToggleCollapse();
              }}
              aria-label={isCollapsedView ? "Expandir menu (])" : "Recolher menu ([)"}
              title={isCollapsedView ? "Expandir sidebar (])" : "Recolher sidebar ([)"}
              aria-expanded={!isCollapsedView}
            >
              <FourSquaresMenuIcon />
            </button>
          )}
        </div>

        {/* Faixa de contexto do perfil (ex.: COMPANY ADMINISTRATION) */}
        {headerLabel && !isCollapsedView && (
          <div className="ui-sidebar__banner">
            <span>{headerLabel}</span>
          </div>
        )}

        {/* Área rolável de navegação com fades de topo/base */}
        <div className="ui-sidebar__scroll-area">
          {scrollFade.top && !isCollapsedView && (
            <div className="ui-sidebar__scroll-fade ui-sidebar__scroll-fade--top" aria-hidden="true" />
          )}

          <nav
            ref={navScrollRef}
            className="ui-sidebar__content"
            aria-busy={loading || undefined}
          >
            {loading ? (
              <div className="ui-sidebar__skeleton-list" aria-hidden="true">
                {Array.from({ length: SKELETON_COUNT }, (_, index) => (
                  <div key={index} className="ui-sidebar__skeleton-row">
                    <span className="ui-sidebar__skeleton-icon" />
                    {!isCollapsedView && <span className="ui-sidebar__skeleton-bar" />}
                  </div>
                ))}
              </div>
            ) : (
              groups.map((group) => (
                <div key={group.id} className="ui-sidebar__group">
                  {group.title &&
                    (isCollapsedView ? (
                      <div className="ui-sidebar__section-divider" aria-hidden="true">
                        <span className="ui-sidebar__section-divider-line" />
                      </div>
                    ) : (
                      <span className="ui-sidebar__section-title">{group.title}</span>
                    ))}

                  <ul className="ui-sidebar__list">
                    {group.items.map((item) => (
                      <li key={item.id} className="ui-sidebar__list-item">
                        {item.children?.length
                          ? renderExpandable(item)
                          : renderNavigable(item, false, false)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))
            )}
          </nav>

          {scrollFade.bottom && !isCollapsedView && (
            <div
              className="ui-sidebar__scroll-fade ui-sidebar__scroll-fade--bottom"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Rodapé fixo: Perfil do usuário e botão Sair */}
        {showFooter && (
          <div className="ui-sidebar__footer">
            {user && (
              <div
                className={cx(
                  "ui-sidebar__user",
                  isCollapsedView && "ui-sidebar__user--collapsed"
                )}
                title={isCollapsedView ? user.name : undefined}
              >
                <Avatar
                  name={user.name}
                  src={user.avatarUrl}
                  bordered
                  className="ui-sidebar__user-avatar"
                />
                {!isCollapsedView && (
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
                className={cx(
                  "ui-sidebar__logout",
                  isCollapsedView && "ui-sidebar__logout--collapsed"
                )}
                onClick={onLogout}
                aria-label={isCollapsedView ? "Sair" : undefined}
                title={isCollapsedView ? "Sair" : undefined}
              >
                <i className="pi pi-sign-out" aria-hidden="true" />
                {!isCollapsedView && <span>Sair</span>}
              </button>
            )}
          </div>
        )}
      </aside>
    </>
  );
}


