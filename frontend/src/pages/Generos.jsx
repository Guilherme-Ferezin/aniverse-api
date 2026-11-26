import { useEffect, useState } from 'react';
import api, { erroMsg } from '../services/api';
import { useToast } from '../context/ToastContext';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import Icone from '../components/Icone';

export default function Generos() {
  const avisar = useToast();
  const [generos, setGeneros] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editandoNome, setEditandoNome] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  async function carregar() {
    try {
      const { data } = await api.get('/generos');
      setGeneros(data);
    } catch (e) {
      setErro(erroMsg(e));
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criar(e) {
    e.preventDefault();
    setErro('');
    try {
      await api.post('/generos', { nome: novoNome });
      avisar(`Gênero "${novoNome}" adicionado.`);
      setNovoNome('');
      carregar();
    } catch (err) {
      setErro(erroMsg(err));
    }
  }

  async function salvarEdicao(id) {
    setErro('');
    try {
      await api.put(`/generos/${id}`, { nome: editandoNome });
      avisar(`Gênero renomeado para "${editandoNome}".`);
      setEditandoId(null);
      carregar();
    } catch (err) {
      setErro(erroMsg(err));
    }
  }

  async function excluir(genero) {
    if (!window.confirm(`Excluir o gênero "${genero.nome}"?`)) return;
    setErro('');
    try {
      await api.delete(`/generos/${genero.id}`);
      avisar(`Gênero "${genero.nome}" excluído.`);
      carregar();
    } catch (err) {
      setErro(erroMsg(err));
    }
  }

  return (
    <div className="form-narrow">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Organização · {generos.length} {generos.length === 1 ? 'gênero' : 'gêneros'}</span>
          <h2>Gêneros</h2>
          <p>Crie e organize as categorias usadas no catálogo.</p>
        </div>
      </div>

      <Alerta>{erro}</Alerta>

      <section className="panel form-panel">
        <div className="form-heading">
          <span className="stat-icon"><Icone nome="tag" tamanho={17} /></span>
          <span><b>Novo gênero</b><small>Ex.: Isekai, Slice of life</small></span>
        </div>

        <form className="add-row" onSubmit={criar}>
          <label className="search-field">
            <Icone nome="tag" tamanho={15} />
            <span className="sr-only">Novo gênero</span>
            <input placeholder="Novo gênero" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} required />
          </label>
          <button className="btn btn-primary"><Icone nome="plus" tamanho={15} /> Adicionar</button>
        </form>

        {carregando ? (
          <Carregando />
        ) : (
          <ul style={{ listStyle: 'none', margin: '10px 0 0', padding: 0 }}>
            {generos.map((g) => (
              <li className="list-row" key={g.id}>
                {editandoId === g.id ? (
                  <>
                    <label className="search-field">
                      <span className="sr-only">Nome do gênero</span>
                      <input value={editandoNome} onChange={(e) => setEditandoNome(e.target.value)} autoFocus />
                    </label>
                    <button className="btn btn-primary btn-sm" onClick={() => salvarEdicao(g.id)}>Salvar</button>
                    <button className="btn btn-quiet btn-sm" onClick={() => setEditandoId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="stat-icon"><Icone nome="tag" tamanho={15} /></span>
                    <b>{g.nome}</b>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => {
                        setEditandoId(g.id);
                        setEditandoNome(g.nome);
                      }}
                    >
                      <Icone nome="pencil" tamanho={14} /> Editar
                    </button>
                    <button className="btn btn-danger-outline btn-sm" onClick={() => excluir(g)} aria-label={`Excluir ${g.nome}`}>
                      <Icone nome="trash" tamanho={14} />
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
