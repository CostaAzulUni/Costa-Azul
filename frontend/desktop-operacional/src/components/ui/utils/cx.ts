/**
 * Junta classes CSS ignorando valores "falsy" (false, "", undefined, null).
 * Ex.: cx("ui-badge", isActive && "ui-badge--active") -> "ui-badge ui-badge--active"
 * Mantido em um arquivo .ts separado porque o Fast Refresh do Vite exige que arquivos
 * .tsx de componentes exportem apenas componentes.
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
