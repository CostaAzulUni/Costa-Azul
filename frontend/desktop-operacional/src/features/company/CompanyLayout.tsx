
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";

import { Sidebar } from "../../components/layout/Sidebar/Sidebar";
import { Topbar } from "../../components/layout/Topbar/Topbar";

import "./CompanyLayout.css";

export function CompanyLayout() {
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(false);

  const groups = [
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
          icon: "pi-sitemap",
          to: "/vessel/create",
        },
        {
          id: "operations",
          label: "Operações",
          icon: "pi-compass",
          disabled: true,
        },
        {
          id: "commercial",
          label: "Comercial",
          icon: "pi-briefcase",
          disabled: true,
        },
        {
          id: "people",
          label: "Pessoas",
          icon: "pi-users",
          disabled: true,
        },
        {
          id: "financial",
          label: "Financeiro",
          icon: "pi-credit-card",
          disabled: true,
        },
      ],
    },
    {
      id: "administration",
      title: "ADMINISTRAÇÃO",
      items: [
        {
          id: "audit",
          label: "Auditoria",
          icon: "pi-shield",
          disabled: true,
        },
        {
          id: "access",
          label: "Acessos",
          icon: "pi-key",
          disabled: true,
        },
        {
          id: "settings",
          label: "Configurações",
          icon: "pi-cog",
          disabled: true,
        },
      ],
    },
  ];

  const activeId = location.pathname.startsWith("/dashboard")
    ? "dashboard"
    : location.pathname.startsWith("/vessel")
      ? "fleet"
      : undefined;

  return (
    <div className="company-layout">
      <Sidebar
        groups={groups}
        activeId={activeId}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((previous) => !previous)}
        logo={<img src="/logo-costa-azul.svg" alt="Costa Azul" />}
        headerLabel="GLOBAL ADMINISTRATION"
        user={{ name: "Eliza", role: "Company Admin" }}
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
