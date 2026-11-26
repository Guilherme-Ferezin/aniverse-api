import Icone from './Icone';
import BotaoTema from './BotaoTema';

// Moldura compartilhada das telas de login e cadastro
export default function AuthLayout({ titulo, subtitulo, children }) {
  return (
    <div className="auth-shell">
      <aside className="auth-side">
        <div className="brand">
          <span className="brand-mark"><Icone nome="play" tamanho={18} fill="currentColor" /></span>
          <span><b>AniVerse</b><small>ANIME TRACKER</small></span>
        </div>
        <div>
          <h2>Seu universo de animes, <span>um episódio por vez.</span></h2>
          <p>Monte sua coleção, acompanhe o progresso de cada série e dê nota para o que você já assistiu.</p>
        </div>
        <small>AniVerse · Feito para acompanhar cada episódio.</small>
      </aside>

      <main className="auth-main">
        <BotaoTema className="auth-tema" />
        <div className="auth-card">
          <div className="auth-brand-mobile">
            <span className="brand-mark"><Icone nome="play" tamanho={18} fill="currentColor" /></span>
            <b>AniVerse</b>
          </div>
          <h1>{titulo}</h1>
          <p>{subtitulo}</p>
          {children}
        </div>
      </main>
    </div>
  );
}
