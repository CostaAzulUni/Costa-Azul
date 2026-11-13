
import { useNavigate } from "react-router-dom";
import { startDevSession, type DevUserKey } from "./devSession";
import "./DevLogin.css";


const DEV_PROFILES: {
  key: DevUserKey;
  title: string;
  description: string;
}[] = [
  {
    key: "superAdmin",
    title: "Super Administrador",
    description: "Perfil SUPER_ADMIN — acesso ao ERP.",
  },
  {
    key: "companyAdmin",
    title: "Administrador da Companhia",
    description: "Perfil ADMIN_COMPANHIA — acesso ao ERP.",
  },
  {
    key: "unauthorized",
    title: "Usuário sem acesso",
    description: "Perfil USER — deve receber acesso negado.",
  },
];

export function DevLogin() {
  const navigate = useNavigate();

  function handleAccess(profile: DevUserKey) {
    startDevSession(profile);
    navigate("/dashboard", { replace: true });
  }

  return (
    <main className="dev-login">
      <header>
        <h1>CostaAzul — Desenvolvimento</h1>
        <p>Selecione um perfil para iniciar uma sessão de teste.</p>
      </header>

      <section className="dev-login__profiles">
        {DEV_PROFILES.map((profile) => (
          <article key={profile.key} className="dev-login__profile">
            <div>
              <h2>{profile.title}</h2>
              <p>{profile.description}</p>
            </div>

            <button
              type="button"
              onClick={() => handleAccess(profile.key)}
            >
              Entrar com este perfil
            </button>
          </article>
        ))}
      </section>
    </main>
  );
}
