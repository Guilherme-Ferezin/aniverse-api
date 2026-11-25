import { useEffect, useState } from 'react';
import api, { erroMsg } from '../services/api';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';

export default function Generos() {
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
      carregar();
    } catch (err) {
      setErro(erroMsg(err));
    }
  }

  return (
    <div className="row justify-content-center">
      <div className="col-lg-6">
        <h1 className="h3 mb-3">Gêneros</h1>

        <form className="input-group mb-3" onSubmit={criar}>
          <input
            className="form-control"
            placeholder="Novo gênero"
            value={novoNome}
            onChange={(e) => setNovoNome(e.target.value)}
            required
          />
          <button className="btn btn-info">Adicionar</button>
        </form>

        <Alerta>{erro}</Alerta>

        {carregando ? (
          <Carregando />
        ) : (
          <ul className="list-group">
            {generos.map((g) => (
              <li className="list-group-item d-flex align-items-center gap-2" key={g.id}>
                {editandoId === g.id ? (
                  <>
                    <input
                      className="form-control form-control-sm"
                      value={editandoNome}
                      onChange={(e) => setEditandoNome(e.target.value)}
                      autoFocus
                    />
                    <button className="btn btn-sm btn-info" onClick={() => salvarEdicao(g.id)}>Salvar</button>
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditandoId(null)}>Cancelar</button>
                  </>
                ) : (
                  <>
                    <span className="me-auto">{g.nome}</span>
                    <button
                      className="btn btn-sm btn-outline-light"
                      onClick={() => {
                        setEditandoId(g.id);
                        setEditandoNome(g.nome);
                      }}
                    >
                      Editar
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(g)}>Excluir</button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
