import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Icone from './Icone';
import BotaoTema from './BotaoTema';
import { useToast } from '../context/ToastContext';

const NAV = [
  { to: '/colecao', label: 'Minha coleção', mobile: 'Coleção', icone: 'bookmark' },
  { to: '/animes', label: 'Catálogo', mobile: 'Animes', icone: 'film' },
  { to: '/generos', label: 'Gêneros', mobile: 'Gêneros', icone: 'tag' },
  { to: '/perfil', label: 'Meu perfil', mobile: 'Perfil', icone: 'user' },
];

function tituloDaRota(caminho) {
  if (caminho === '/animes/novo') return 'Novo anime';
  if (caminho.endsWith('/editar')) return 'Editar anime';
  return NAV.find((n) => caminho.startsWith(n.to))?.label ?? 'AniVerse';
}

const iniciais = (nome = '') =>
  nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'AV';

export default function Layout() {
  const { usuario, logout } = useAuth();
  const avisar = useToast();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuAberto, setMenuAberto] = useState(false);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [sairAberto, setSairAberto] = useState(false);

  // Ao trocar de tela: fecha menus e volta ao topo
  useEffect(() => {
    setMenuAberto(false);
    setPerfilAberto(false);
    window.scrollTo({ top: 0 });
  }, [pathname]);

  // Esc fecha o que estiver aberto
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key !== 'Escape') return;
      setMenuAberto(false);
      setPerfilAberto(false);
      setSairAberto(false);
    }
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, []);

  function sair() {
    logout();
    navigate('/login');
    avisar('Você saiu da sua conta.', 'info');
  }

  const classeLink = ({ isActive }) => `nav-link${isActive ? ' nav-current' : ''}`;
  const classeMovel = ({ isActive }) => (isActive ? 'mobile-current' : undefined);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#conteudo">Pular para o conteúdo principal</a>
      <button
        className={`scrim${menuAberto ? ' scrim-on' : ''}`}
        onClick={() => setMenuAberto(false)}
        aria-label="Fechar menu"
        tabIndex={menuAberto ? 0 : -1}
      />

      <aside className={`sidebar${menuAberto ? ' sidebar-open' : ''}`} aria-label="Menu principal">
        <div className="brand-row">
          <Link className="brand" to="/colecao">
            <span className="brand-mark"><Icone nome="play" tamanho={18} fill="currentColor" /></span>
            <span><b>AniVerse</b><small>ANIME TRACKER</small></span>
          </Link>
          <button className="icon-btn side-close" onClick={() => setMenuAberto(false)} aria-label="Fechar menu">
            <Icone nome="x" tamanho={19} />
          </button>
        </div>

        <Link className="side-cta" to="/animes/novo">
          <Icone nome="plus" tamanho={16} /> Novo anime
        </Link>

        <p className="nav-heading">MENU PRINCIPAL</p>
        <nav className="side-nav" aria-label="Navegação principal">
          {NAV.map(({ to, label, icone }) => (
            <NavLink key={to} to={to} className={classeLink}>
              <Icone nome={icone} tamanho={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="side-user">
            <span className="avatar avatar-accent">{iniciais(usuario?.nome)}</span>
            <span><b>{usuario?.nome}</b><small>{usuario?.email}</small></span>
            <button
              className="icon-btn logout-btn"
              onClick={() => setSairAberto(true)}
              aria-label="Sair do sistema"
              title="Sair do sistema"
            >
              <Icone nome="logout" tamanho={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-btn mobile-menu"
              onClick={() => setMenuAberto(true)}
              aria-label="Abrir menu"
              aria-expanded={menuAberto}
            >
              <Icone nome="menu" tamanho={21} />
            </button>
            <div>
              <span className="eyebrow">Seu tracker de animes</span>
              <h1>{tituloDaRota(pathname)}</h1>
            </div>
          </div>
          <div className="top-actions">
            <BotaoTema />
            <div className="popover-wrap">
              <button
                className="user-trigger"
                onClick={() => setPerfilAberto(!perfilAberto)}
                aria-expanded={perfilAberto}
                aria-label="Abrir menu do perfil"
              >
                <span className="avatar">{iniciais(usuario?.nome)}</span>
                <span><b>{usuario?.nome}</b><small>Otaku</small></span>
                <Icone nome="chevronDown" tamanho={14} />
              </button>
              {perfilAberto && (
                <div className="user-pop">
                  <Link to="/perfil"><Icone nome="user" tamanho={16} /> Meu perfil</Link>
                  <button onClick={() => { setPerfilAberto(false); setSairAberto(true); }}>
                    <Icone nome="logout" tamanho={16} /> Sair do sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content" id="conteudo" tabIndex={-1}>
          <div className="page-in" key={pathname}>
            <Outlet />
          </div>
          <footer className="footer">
            <span>AniVerse <i>·</i> Anime tracker</span>
            <span>Feito para acompanhar cada episódio.</span>
          </footer>
        </main>
      </div>

      <nav className="mobile-nav" aria-label="Navegação móvel">
        {NAV.map(({ to, mobile, icone }) => (
          <NavLink key={to} to={to} className={classeMovel}>
            <Icone nome={icone} tamanho={19} />
            <span>{mobile}</span>
          </NavLink>
        ))}
      </nav>

      {sairAberto && (
        <div className="modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) setSairAberto(false); }}>
          <section className="modal" role="dialog" aria-modal="true" aria-labelledby="sair-titulo">
            <span className="modal-icon"><Icone nome="logout" tamanho={19} /></span>
            <button className="icon-btn modal-x" onClick={() => setSairAberto(false)} aria-label="Fechar">
              <Icone nome="x" tamanho={17} />
            </button>
            <h2 id="sair-titulo">Deseja sair do sistema?</h2>
            <p className="modal-text">Você poderá entrar novamente quando quiser. Sua coleção continua salva.</p>
            <div className="modal-actions">
              <button className="btn btn-quiet" onClick={() => setSairAberto(false)}>Continuar conectado</button>
              <button className="btn btn-danger" onClick={sair}>
                <Icone nome="logout" tamanho={15} /> Sair do sistema
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
