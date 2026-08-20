import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "./style.css";

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="header">
      <div className="header-logo">
        <h1>Help Desk TI</h1>
      </div>

      {user && (
        <nav className="header-nav">
          <Link to="/">Abrir Chamado</Link>
          <Link to="/chamados">Meus Chamados</Link>
        </nav>
      )}

      {user && (
        <div className="header-user">
          <span>Olá, {user.nome}</span>
          <span className="header-badge">{user.nivel_acesso}</span>
          <button onClick={handleLogout}>Sair</button>
        </div>
      )}
    </header>
  );
}