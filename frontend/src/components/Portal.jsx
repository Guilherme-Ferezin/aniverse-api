import { useEffect } from 'react';
import { createPortal } from 'react-dom';

// Desenha o conteúdo direto no <body>, para a janela ficar sempre no centro da tela
// (e não presa a algum bloco da página). Também trava a rolagem do fundo enquanto aberta.
export default function Portal({ children }) {
  useEffect(() => {
    const anterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = anterior;
    };
  }, []);

  return createPortal(children, document.body);
}
