import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { erroMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Alerta from '../components/Alerta';
import Capa from '../components/Capa';
import Carregando from '../components/Carregando';

export default function Animes() {
  const { usuario } = useAuth();
  const [animes, setAnimes] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [rascunho, setRascunho] = useState({ busca: '', genero: '' });
  const [filtros, setFiltros] = useState({ busca: '', genero: '' });
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    api
      .get('/generos')
      .then((r) => setGeneros(r.data))
      .catch((e) => setErro(erroMsg(e)));
  }, []);

  useEffect(() => {
    setCarregando(true);
    const params = Object.fromEntries(Object.entries(filtros).filter(([, v]) => v));
    api
      .get('/animes', { params })
      .then((r) => setAnimes(r.data))
      .catch((e) => setErro(erroMsg(e)))
      .finally(() => setCarregando(false));
  }, [filtros]);

  function filtrar(e) {
    e.preventDefault();
    setFiltros(rascunho);
  }

  function limpar() {
    const vazio = { busca: '', genero: '' };
    setRascunho(vazio);
    setFiltros(vazio);
  }

  async function adicionar(anime) {
    setErro('');
    setAviso('');
    try {
      await api.post('/colecao', { anime_id: anime.id, status: 'quero_assistir' });
      setAviso(`"${anime.titulo}" foi adicionado à sua coleção em "Quero assistir".`);
    } catch (e) {
      setErro(erroMsg(e));
    }
  }

  async function excluir(anime) {
    if (!window.confirm(`Excluir "${anime.titulo}" do catálogo?`)) return;
    setErro('');
    setAviso('');
    try {
      await api.delete(`/animes/${anime.id}`);
      setAnimes(animes.filter((a) => a.id !== anime.id));
    } catch (e) {
      setErro(erroMsg(e));
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Catálogo de animes</h1>
        <Link to="/animes/novo" className="btn btn-info">+ Novo anime</Link>
      </div>

      <form className="row g-2 mb-3" onSubmit={filtrar}>
        <div className="col-12 col-md-6">
          <input
            className="form-control"
            placeholder="Buscar por título"
            value={rascunho.busca}
            onChange={(e) => setRascunho({ ...rascunho, busca: e.target.value })}
          />
        </div>
        <div className="col-6 col-md-3">
          <select
            className="form-select"
            value={rascunho.genero}
            onChange={(e) => setRascunho({ ...rascunho, genero: e.target.value })}
          >
            <option value="">Todos os gêneros</option>
            {generos.map((g) => (
              <option key={g.id} value={g.id}>{g.nome}</option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-3 d-flex gap-2">
          <button className="btn btn-outline-info flex-fill">Filtrar</button>
          <button type="button" className="btn btn-outline-secondary" onClick={limpar}>Limpar</button>
        </div>
      </form>

      <Alerta>{erro}</Alerta>
      <Alerta tipo="success">{aviso}</Alerta>

      {carregando ? (
        <Carregando />
      ) : animes.length === 0 ? (
        <p className="text-secondary">Nenhum anime encontrado.</p>
      ) : (
        <div className="row row-cols-1 row-cols-sm-2 row-cols-lg-3 row-cols-xl-4 g-3">
          {animes.map((anime) => (
            <div className="col" key={anime.id}>
              <div className="card h-100">
                <Capa url={anime.capa_url} titulo={anime.titulo} proporcao="2 / 3" />
                <div className="card-body d-flex flex-column">
                  <h2 className="h6 card-title">{anime.titulo}</h2>
                  <p className="text-secondary small mb-2">
                    {[anime.estudio, anime.ano_lancamento, anime.total_episodios && `${anime.total_episodios} eps`]
                      .filter(Boolean)
                      .join(' · ')}
                  </p>
                  <div className="mb-3">
                    {anime.generos.map((g) => (
                      <span key={g.id} className="badge text-bg-secondary me-1">{g.nome}</span>
                    ))}
                  </div>
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    <button className="btn btn-sm btn-info" onClick={() => adicionar(anime)}>
                      + Minha coleção
                    </button>
                    {anime.criado_por === usuario.id && (
                      <>
                        <Link className="btn btn-sm btn-outline-light" to={`/animes/${anime.id}/editar`}>
                          Editar
                        </Link>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => excluir(anime)}>
                          Excluir
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
