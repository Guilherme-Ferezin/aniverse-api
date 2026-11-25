import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { erroMsg } from '../services/api';
import { STATUS } from '../utils/constantes';
import Alerta from '../components/Alerta';
import Capa from '../components/Capa';
import Carregando from '../components/Carregando';
import ModalColecao from '../components/ModalColecao';

const ABAS = [
  { chave: '', rotulo: 'Todos' },
  ...Object.entries(STATUS).map(([chave, s]) => ({ chave, rotulo: s.rotulo })),
];

export default function Colecao() {
  const [status, setStatus] = useState('');
  const [busca, setBusca] = useState('');
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState(null);
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    setCarregando(true);
    api
      .get('/colecao', { params: status ? { status } : {} })
      .then((r) => setItens(r.data))
      .catch((e) => setErro(erroMsg(e)))
      .finally(() => setCarregando(false));
  }, [status, versao]);

  async function remover(item) {
    if (!window.confirm(`Remover "${item.titulo}" da sua coleção?`)) return;
    setErro('');
    try {
      await api.delete(`/colecao/${item.id}`);
      setItens(itens.filter((i) => i.id !== item.id));
    } catch (e) {
      setErro(erroMsg(e));
    }
  }

  function aoSalvar() {
    setEditando(null);
    setVersao((v) => v + 1);
  }

  const visiveis = itens.filter((i) => i.titulo.toLowerCase().includes(busca.toLowerCase()));

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Minha coleção</h1>
        <Link to="/animes" className="btn btn-info">+ Adicionar animes</Link>
      </div>

      <ul className="nav nav-pills mb-3 flex-wrap gap-1">
        {ABAS.map((aba) => (
          <li className="nav-item" key={aba.chave}>
            <button
              className={`nav-link${status === aba.chave ? ' active' : ''}`}
              onClick={() => setStatus(aba.chave)}
            >
              {aba.rotulo}
            </button>
          </li>
        ))}
      </ul>

      <input
        className="form-control mb-3"
        placeholder="Buscar na minha coleção"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
      />

      <Alerta>{erro}</Alerta>

      {carregando ? (
        <Carregando />
      ) : visiveis.length === 0 ? (
        <p className="text-secondary">
          Nada por aqui ainda. Vá em <Link to="/animes">Animes</Link> e adicione algum à sua coleção.
        </p>
      ) : (
        <div className="row row-cols-1 row-cols-lg-2 g-3">
          {visiveis.map((item) => {
            const total = item.total_episodios;
            const pct = total ? Math.min(100, Math.round((item.episodios_assistidos / total) * 100)) : 0;
            const s = STATUS[item.status];
            return (
              <div className="col" key={item.id}>
                <div className="card h-100 overflow-hidden">
                  <div className="row g-0 h-100">
                    <div className="col-4">
                      <Capa url={item.capa_url} titulo={item.titulo} proporcao="2 / 3" />
                    </div>
                    <div className="col-8">
                      <div className="card-body d-flex flex-column h-100">
                        <h2 className="h6 card-title">{item.titulo}</h2>
                        <div className="mb-2">
                          <span className={`badge text-bg-${s.cor}`}>{s.rotulo}</span>
                          <span className="ms-2 small">
                            {item.nota !== null ? `★ ${item.nota}/10` : 'Sem nota'}
                          </span>
                        </div>
                        <div className="progress mb-1" style={{ height: 6 }}>
                          <div className="progress-bar bg-info" style={{ width: `${pct}%` }} />
                        </div>
                        <p className="small text-secondary">
                          {item.episodios_assistidos}/{total ?? '?'} episódios
                        </p>
                        <div className="mt-auto d-flex gap-2">
                          <button className="btn btn-sm btn-outline-light" onClick={() => setEditando(item)}>
                            Editar
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => remover(item)}>
                            Remover
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editando && (
        <ModalColecao item={editando} onFechar={() => setEditando(null)} onSalvo={aoSalvar} />
      )}
    </>
  );
}
