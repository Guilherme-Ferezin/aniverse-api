import { useEffect, useState } from 'react';
import api, { erroMsg } from '../services/api';
import { STATUS } from '../utils/constantes';
import Alerta from './Alerta';
import Icone from './Icone';
import Portal from './Portal';

// Janela para alterar status, nota e progresso de um item da coleção
export default function ModalColecao({ item, onFechar, onSalvo }) {
  const [form, setForm] = useState({
    status: item.status,
    nota: item.nota ?? '',
    episodios_assistidos: item.episodios_assistidos,
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function mudar(e) {
    const { name, value } = e.target;
    const novo = { ...form, [name]: value };
    // Ao marcar como concluído, completa os episódios assistidos
    if (name === 'status' && value === 'concluido' && item.total_episodios) {
      novo.episodios_assistidos = item.total_episodios;
    }
    setForm(novo);
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    try {
      await api.put(`/colecao/${item.id}`, {
        status: form.status,
        nota: form.nota === '' ? null : Number(form.nota),
        episodios_assistidos: Number(form.episodios_assistidos),
      });
      onSalvo();
    } catch (err) {
      setErro(erroMsg(err));
      setSalvando(false);
    }
  }

  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && onFechar();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  return (
    <Portal>
      <div className="modal-bg">
        <form className="modal" role="dialog" aria-modal="true" aria-labelledby="colecao-titulo" onSubmit={salvar}>
          <button type="button" className="icon-btn modal-x" aria-label="Fechar" onClick={onFechar}>
            <Icone nome="x" tamanho={17} />
          </button>
          <h2 id="colecao-titulo">{item.titulo}</h2>
          <p className="modal-text">Atualize seu progresso, status e nota.</p>

          <Alerta>{erro}</Alerta>

          <div className="form-grid">
            <label className="field col-6">
              <span>Status</span>
              <select name="status" value={form.status} onChange={mudar}>
                {Object.entries(STATUS).map(([chave, s]) => (
                  <option key={chave} value={chave}>{s.rotulo}</option>
                ))}
              </select>
            </label>

            <label className="field col-3">
              <span>Episódios assistidos</span>
              <input
                name="episodios_assistidos"
                type="number"
                min="0"
                max={item.total_episodios ?? undefined}
                value={form.episodios_assistidos}
                onChange={mudar}
                required
              />
              {item.total_episodios !== null && <small>Total: {item.total_episodios}</small>}
            </label>

            <label className="field col-3">
              <span>Nota (0 a 10)</span>
              <input name="nota" type="number" min="0" max="10" value={form.nota} onChange={mudar} />
            </label>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-quiet" onClick={onFechar}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
}
