import { useState } from 'react';
import api, { erroMsg } from '../services/api';
import { STATUS } from '../utils/constantes';
import Alerta from './Alerta';

// Janela para alterar status, nota e progresso de um item da coleção
export default function ModalColecao({ item, onFechar, onSalvo }) {
  const [form, setForm] = useState({
    status: item.status,
    nota: item.nota ?? '',
    episodios_assistidos: item.episodios_assistidos,
  });
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  return (
    <div className="modal d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,.6)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content">
          <form onSubmit={salvar}>
            <div className="modal-header">
              <h2 className="modal-title h5">{item.titulo}</h2>
              <button type="button" className="btn-close" aria-label="Fechar" onClick={onFechar} />
            </div>
            <div className="modal-body">
              <Alerta>{erro}</Alerta>

              <div className="mb-3">
                <label className="form-label" htmlFor="status">Status</label>
                <select id="status" name="status" className="form-select" value={form.status} onChange={mudar}>
                  {Object.entries(STATUS).map(([chave, s]) => (
                    <option key={chave} value={chave}>{s.rotulo}</option>
                  ))}
                </select>
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label" htmlFor="eps">Episódios assistidos</label>
                  <input
                    id="eps"
                    name="episodios_assistidos"
                    type="number"
                    min="0"
                    max={item.total_episodios ?? undefined}
                    className="form-control"
                    value={form.episodios_assistidos}
                    onChange={mudar}
                    required
                  />
                  {item.total_episodios !== null && (
                    <div className="form-text">Total: {item.total_episodios}</div>
                  )}
                </div>
                <div className="col-6">
                  <label className="form-label" htmlFor="nota">Nota (0 a 10)</label>
                  <input
                    id="nota"
                    name="nota"
                    type="number"
                    min="0"
                    max="10"
                    className="form-control"
                    value={form.nota}
                    onChange={mudar}
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" onClick={onFechar}>
                Cancelar
              </button>
              <button type="submit" className="btn btn-info" disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
