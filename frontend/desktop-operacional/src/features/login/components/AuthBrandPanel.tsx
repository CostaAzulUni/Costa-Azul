import cruisePortImage from "../assets/cruise-port.png";
import logoMark from "../assets/logo-mark.svg";
import shieldCheckIcon from "../assets/shield-check.svg";
import "./AuthBrandPanel.css";

/** Logotipo "CostAzul" (Figma #3724:9686): palavra + marca vetorial na posição do "A". */
export function AuthLogo() {
  return (
    <div className="auth-logo" role="img" aria-label="CostAzul">
      <span className="auth-logo__word auth-logo__word--start" aria-hidden="true">
        Cost
      </span>
      <img
        className="auth-logo__mark"
        src={logoMark}
        alt=""
        width={72}
        height={70}
        aria-hidden="true"
      />
      <span className="auth-logo__word auth-logo__word--end" aria-hidden="true">
        zul
      </span>
    </div>
  );
}

/** Painel institucional "Gestão a bordo e em terra" (Figma #3897:9054), comum a todas as telas de autenticação. */
export function AuthBrandPanel() {
  return (
    <aside className="auth-brand" aria-label="Costa Azul ERP Cruzeiros">
      <img className="auth-brand__photo" src={cruisePortImage} alt="" />
      <div className="auth-brand__overlay" aria-hidden="true" />

      <div className="auth-brand__identity">
        <AuthLogo />
        <div className="auth-brand__category">
          <span className="auth-brand__category-mark" aria-hidden="true" />
          <span>ERP CRUZEIROS</span>
        </div>
      </div>

      <div className="auth-brand__message">
        <div className="auth-brand__proposition">
          <p className="auth-brand__context">GESTÃO A BORDO E EM TERRA</p>
          <p className="auth-brand__title">
            Operações mais fluidas.
            <br />
            Decisões mais seguras.
          </p>
          <p className="auth-brand__description">
            Uma plataforma completa para conectar cada detalhe da sua operação de
            cruzeiros.
          </p>
        </div>

        <div className="auth-brand__divider" aria-hidden="true" />

        <div className="auth-brand__corporate">
          <img src={shieldCheckIcon} alt="" width={20} height={20} />
          <span>Portal corporativo • Uso interno</span>
        </div>
      </div>
    </aside>
  );
}
