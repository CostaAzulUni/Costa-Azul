import { Outlet } from "react-router-dom";
import globeIcon from "./assets/globe.svg";
import { AuthBrandPanel } from "./components/AuthBrandPanel";
import "./AuthLayout.css";

const CURRENT_YEAR = new Date().getFullYear();

/**
 * Layout das telas de autenticação (Figma "Telas Autenticação" #3926:4779).
 * O painel institucional e o rodapé permanecem montados enquanto o <Outlet />
 * troca entre login, recuperação de acesso e telas de status.
 */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      <AuthBrandPanel />

      <div className="auth-layout__main">
        <main className="auth-layout__content">
          <Outlet />
        </main>

        <footer className="auth-layout__footer">
          <p>© {CURRENT_YEAR} CostAzul. Todos os direitos reservados.</p>
          <span className="auth-layout__language">
            <img src={globeIcon} alt="" width={14} height={14} />
            Português (BR)
          </span>
        </footer>
      </div>
    </div>
  );
}
