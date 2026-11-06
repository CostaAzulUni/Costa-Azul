import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { Avatar } from "../../ui/Avatar/Avatar";
import { IconButton } from "../../ui/IconButton/IconButton";
import { Input } from "../../ui/Input/Input";
import { cx } from "../../ui/utils/cx";
import "./Topbar.css";

export interface TopbarSearch {
  value: string;
  onChange: (value: string) => void;
  /** Disparado ao pressionar Enter no campo. */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  /** Texto do atalho exibido à direita (ex.: "Ctrl K"). */
  shortcutLabel?: string;
}

export interface TopbarUser {
  name: string;
  avatarUrl?: string;
}

export interface TopbarProps {
  /** Conteúdo à esquerda: título da página, seletor de empresa etc. */
  title?: ReactNode;
  search?: TopbarSearch;
  /** Slot para ações extras antes dos ícones padrão (ex.: seletor de idioma/bandeira). */
  actions?: ReactNode;
  onSettingsClick?: () => void;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  user?: TopbarUser;
  onUserClick?: () => void;
  className?: string;
}

/**
 * Topbar global, apenas apresentacional: não busca dados nem navega sozinha.
 * Tudo que é dinâmico (busca, contadores, usuário) chega por props e callbacks.
 */
export function Topbar({
  title,
  search,
  actions,
  onSettingsClick,
  notificationCount,
  onNotificationsClick,
  user,
  onUserClick,
  className,
}: TopbarProps) {
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Evita o recarregamento da página (comportamento padrão de <form>)
    search?.onSubmit?.(search.value);
  };

  return (
    <header className={cx("ui-topbar", className)}>
      {title && <div className="ui-topbar__title">{title}</div>}

      {search && (
        // role="search" ajuda leitores de tela a encontrarem a busca global rapidamente
        <form role="search" className="ui-topbar__search" onSubmit={handleSubmit}>
          {/* Composição: reutilizamos o Input da Fase 01 em vez de criar outro campo */}
          <Input
            type="search"
            size="md"
            aria-label={search.placeholder ?? "Buscar"}
            placeholder={search.placeholder ?? "Buscar..."}
            value={search.value}
            onChange={(event: ChangeEvent<HTMLInputElement>) => search.onChange(event.target.value)}
            rightIcon={
              search.shortcutLabel ? (
                <kbd className="ui-topbar__shortcut">{search.shortcutLabel}</kbd>
              ) : undefined
            }
          />
        </form>
      )}

      <div className="ui-topbar__actions">
        {actions}

        {onSettingsClick && (
          <IconButton icon="pi-cog" aria-label="Configurações" onClick={onSettingsClick} />
        )}

        {onNotificationsClick && (
          <IconButton
            icon="pi-bell"
            aria-label={
              notificationCount
                ? `Notificações (${notificationCount} não lidas)`
                : "Notificações"
            }
            badgeCount={notificationCount}
            onClick={onNotificationsClick}
          />
        )}

        {user &&
          (onUserClick ? (
            <button
              type="button"
              className="ui-topbar__user"
              onClick={onUserClick}
              aria-label={`Perfil de ${user.name}`}
            >
              <Avatar name={user.name} src={user.avatarUrl} bordered />
            </button>
          ) : (
            <Avatar name={user.name} src={user.avatarUrl} bordered />
          ))}
      </div>
    </header>
  );
}
