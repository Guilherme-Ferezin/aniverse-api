import { createContext, useCallback, useContext, useRef, useState } from 'react';
import Icone from '../components/Icone';

const ToastContext = createContext(() => {});

const ICONES = { success: 'check', erro: 'alert', info: 'sparkles' };

// avisar('Mensagem', 'success' | 'erro' | 'info')
export function ToastProvider({ children }) {
  const [avisos, setAvisos] = useState([]);
  const proximoId = useRef(0);

  const fechar = useCallback((id) => {
    setAvisos((lista) => lista.map((a) => (a.id === id ? { ...a, saindo: true } : a)));
    setTimeout(() => setAvisos((lista) => lista.filter((a) => a.id !== id)), 200);
  }, []);

  const avisar = useCallback(
    (mensagem, tipo = 'success') => {
      const id = ++proximoId.current;
      setAvisos((lista) => [...lista.slice(-3), { id, mensagem, tipo }]);
      setTimeout(() => fechar(id), tipo === 'erro' ? 6000 : 3800);
    },
    [fechar]
  );

  return (
    <ToastContext.Provider value={avisar}>
      {children}
      <div className="toasts" aria-live="polite">
        {avisos.map((a) => (
          <div key={a.id} className={`toast toast-${a.tipo}${a.saindo ? ' saindo' : ''}`} role={a.tipo === 'erro' ? 'alert' : 'status'}>
            <span className="toast-icon"><Icone nome={ICONES[a.tipo] || 'check'} tamanho={14} strokeWidth={2.6} /></span>
            <span>{a.mensagem}</span>
            <button className="icon-btn" onClick={() => fechar(a.id)} aria-label="Fechar aviso">
              <Icone nome="x" tamanho={15} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
