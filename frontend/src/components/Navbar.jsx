import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const [aberto, setAberto] = useState(false);
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const fechar = () => setAberto(false);
  const classe = ({ isActive }) => `nav-link${isActive ? ' active fw-semibold' : ''}`;

  function sair() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-md bg-body-tertiary border-bottom mb-4">
      <div className="container">
        <Link className="navbar-brand fw-bold text-info" to="/" onClick={fechar}>
          AniVerse
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir menu"
          onClick={() => setAberto(!aberto)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse${aberto ? ' show' : ''}`}>
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <NavLink className={classe} to="/colecao" onClick={fechar}>
                Minha coleção
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={classe} to="/animes" onClick={fechar}>
                Animes
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={classe} to="/generos" onClick={fechar}>
                Gêneros
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={classe} to="/perfil" onClick={fechar}>
                Perfil
              </NavLink>
            </li>
          </ul>
          <div className="d-flex align-items-center gap-2">
            <span className="text-secondary small">Olá, {usuario?.nome}</span>
            <button className="btn btn-outline-light btn-sm" onClick={sair}>
              Sair
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
