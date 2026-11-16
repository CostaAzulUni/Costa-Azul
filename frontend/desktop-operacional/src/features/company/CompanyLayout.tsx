
import { useMemo, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import {
  Sidebar,
  type SidebarNavGroup,
} from "../../components/layout/Sidebar/Sidebar";
import { Topbar } from "../../components/layout/Topbar/Topbar";
import { AUTH_PATHS } from "../../routes/paths";
import { getRoles, logout } from "../../services/auth";

import "./CompanyLayout.css";

/** Ícone de embarcação (IoBoatOutline) alinhado ao Figma  */
function BoatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M434.05 278.4L271.36 221.46C261.42 217.98 250.58 217.98 240.64 221.46L77.95 278.4C67.7 281.99 61.96 292.88 64.79 303.36L96 416C144 432 200 448 256 448C312 448 368 432 416 416L447.21 303.36C450.04 292.88 444.3 281.99 434.05 278.4Z"
        stroke="currentColor"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M128 260V160C128 142.33 142.33 128 160 128H352C369.67 128 384 142.33 384 160V260"
        stroke="currentColor"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M216 128V80C216 71.16 223.16 64 232 64H280C288.84 64 296 71.16 296 80V128"
        stroke="currentColor"
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function resolveActiveSidebarId(pathname: string, hash: string): string | undefined {
  if (pathname.startsWith("/dashboard")) {
    return "dashboard";
  }

  if (pathname.startsWith("/vessel")) {
    if (hash === "#conveses") return "fleet-decks";
    if (hash === "#cabines") return "fleet-cabins";
    if (hash === "#areas") return "fleet-areas";
    return "fleet-vessels";
  }

  if (pathname.startsWith("/trips")) {
    if (hash === "#rotas") return "fleet-routes";
    return "fleet-trips";
  }

  if (pathname.startsWith("/crew")) {
    return "people-crew";
  }

  if (pathname.startsWith("/finance")) {
    if (hash === "#transacoes") return "financial-transactions";
    if (hash === "#receitas") return "financial-revenues";
    if (hash === "#despesas") return "financial-expenses";
    return "financial-overview";
  }

  if (pathname.startsWith("/relatorios")) {
    return "financial-reports";
  }

  if (pathname.startsWith("/settings")) {
    if (hash === "#notificacoes") return "settings-notifications";
    if (hash === "#seguranca") return "settings-security";
    if (hash === "#parametros") return "settings-parameters";
    return "settings-general";
  }

  return undefined;
}

export function CompanyLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const roles = getRoles();
  const isSuperAdmin =
    roles.includes("SUPER_ADMIN") || roles.includes("ROLE_SUPER_ADMIN");

  const groups: SidebarNavGroup[] = useMemo(
    () => [
      {
        id: "main",
        items: [
          {
            id: "dashboard",
            label: "Dashboard",
            icon: "pi-th-large",
            to: "/dashboard",
          },
        ],
      },
      {
        id: "operation",
        title: "OPERAÇÃO",
        items: [
          {
            id: "fleet",
            label: "Frota e Viagens",
            icon: <BoatIcon />,
            children: [
              { id: "fleet-vessels", label: "Navios", to: "/vessel" },
              { id: "fleet-decks", label: "Conveses", to: "/vessel#conveses" },
              { id: "fleet-cabins", label: "Cabines", to: "/vessel#cabines" },
              { id: "fleet-areas", label: "Áreas", to: "/vessel#areas" },
              { id: "fleet-trips", label: "Viagens", to: "/trips" },
              { id: "fleet-routes", label: "Rotas", to: "/trips#rotas" },
            ],
          },
          {
            id: "operations",
            label: "Operações",
            icon: "pi-compass",
            children: [
              { id: "operations-map", label: "Mapa em tempo real" },
              { id: "operations-stock", label: "Estoque" },
              { id: "operations-balances", label: "Saldos" },
              { id: "operations-movements", label: "Movimentações" },
            ],
          },
          {
            id: "commercial",
            label: "Comercial",
            icon: "pi-briefcase",
            children: [
              { id: "commercial-products", label: "Produtos" },
              { id: "commercial-services", label: "Serviços" },
              { id: "commercial-bookings", label: "Reservas" },
              { id: "commercial-sales", label: "Vendas" },
            ],
          },
          {
            id: "people",
            label: "Pessoas",
            icon: "pi-users",
            children: [
              { id: "people-passengers", label: "Passageiros" },
              { id: "people-crew", label: "Tripulação", to: "/crew" },
              { id: "people-employees", label: "Funcionários" },
            ],
          },
          {
            id: "financial",
            label: "Financeiro",
            icon: "pi-credit-card",
            children: [
              { id: "financial-overview", label: "Visão geral", to: "/finance" },
              { id: "financial-transactions", label: "Transações", to: "/finance#transacoes" },
              { id: "financial-revenues", label: "Receitas", to: "/finance#receitas" },
              { id: "financial-expenses", label: "Despesas", to: "/finance#despesas" },
              { id: "financial-reports", label: "Relatórios", to: "/relatorios" },
              { id: "financial-access", label: "Acessos" },
            ],
          },
        ],
      },
      {
        id: "administration",
        title: "ADMINISTRAÇÃO",
        items: [
          {
            id: "access",
            label: "Acesso",
            icon: "pi-key",
            children: [
              { id: "access-profiles", label: "Perfis e permissões" },
              { id: "access-sessions", label: "Sessões" },
            ],
          },
          {
            id: "settings",
            label: "Configurações",
            icon: "pi-cog",
            children: [
              { id: "settings-general", label: "Geral", to: "/settings" },
              { id: "settings-notifications", label: "Notificações", to: "/settings#notificacoes" },
              { id: "settings-security", label: "Políticas de segurança", to: "/settings#seguranca" },
              { id: "settings-parameters", label: "Parâmetros", to: "/settings#parametros" },
            ],
          },
        ],
      },
    ],
    []
  );

  const activeId = resolveActiveSidebarId(location.pathname, location.hash);

  const handleLogout = () => {
    logout();
    navigate(AUTH_PATHS.login, { replace: true });
  };

  return (
    <div className="company-layout">
      <Sidebar
        groups={groups}
        activeId={activeId}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((previous) => !previous)}
        logo={<img src="/logo-costa-azul.svg" alt="Costa Azul" />}
        headerLabel="COMPANY ADMINISTRATION"
        user={{
          name: "Eliza",
          role: isSuperAdmin ? "Super Admin" : "Company Admin",
        }}
        onLogout={handleLogout}
      />

      <div className="company-layout__main">
        <Topbar
          title="Página Inicial"
          search={{
            value: search,
            onChange: setSearch,
            placeholder: "Buscar...",
            shortcutLabel: "Ctrl K",
          }}
          user={{ name: "Eliza" }}
        />

        <main className="company-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

