import { useState } from 'react';
import Icone from './Icone';

// Alterna entre tema claro e escuro (a escolha fica salva no navegador)
export default function BotaoTema({ className = '' }) {
  const [tema, setTema] = useState(() => document.documentElement.getAttribute('data-tema') || 'light');
  const escuro = tema === 'dark';

  function alternar() {
    const novo = escuro ? 'light' : 'dark';
    document.documentElement.setAttribute('data-tema', novo);
    try { localStorage.setItem('tema', novo); } catch { /* sem armazenamento: só vale nesta sessão */ }
    setTema(novo);
  }

  return (
    <button
      type="button"
      className={`icon-btn tema-btn ${className}`}
      onClick={alternar}
      aria-label={escuro ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      title={escuro ? 'Tema claro' : 'Tema escuro'}
    >
      <Icone nome={escuro ? 'sun' : 'moon'} tamanho={19} />
    </button>
  );
}
