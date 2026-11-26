import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { erroMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { STATUS } from '../utils/constantes';
import { useToast } from '../context/ToastContext';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import Icone from '../components/Icone';
import CartaoAnime from '../components/CartaoAnime';
import ModalAnime from '../components/ModalAnime';

const POR_PAGINA = 12;

export default function Animes() {
  const { usuario } = useAuth();
  const avisar = useToast();
  const [animes, setAnimes] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [naColecao, setNaColecao] = useState(new Set());
  const [rascunho, setRascunho] = useState({ busca: '', genero: '' });
  const [filtros, setFiltros] = useState({ busca: '', genero: '' });
  const [quantos, setQuantos] = useState(POR_PAGINA);
  const [detalhe, setDetalhe] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Gêneros (para o filtro) e ids dos animes que já estão na coleção
  useEffect(() => {
    Promise.all([api.get('/generos'), api.get('/colecao')])
      .then(([g, c]) => {
        setGeneros(g.data);
        setNaColecao(new Set(c.data.map((item) => item.anime_id)));
      })
      .catch((e) => setErro(erroMsg(e)));
  }, []);

  useEffect(() => {
    setCarregando(true);
    setQuantos(POR_PAGINA);
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

  async function adicionar(anime, status = 'quero_assistir') {
    setErro('');
    try {
      await api.post('/colecao', { anime_id: anime.id, status });
      setNaColecao(new Set([...naColecao, anime.id]));
      avisar(`"${anime.titulo}" foi adicionado em "${STATUS[status].rotulo}".`);
    } catch (e) {
      setErro(erroMsg(e));
    }
    setDetalhe(null);
  }

  async function excluir(anime) {
    if (!window.confirm(`Excluir "${anime.titulo}" do catálogo?`)) return;
    setErro('');
    try {
      await api.delete(`/animes/${anime.id}`);
      setAnimes(animes.filter((a) => a.id !== anime.id));
      avisar(`"${anime.titulo}" foi excluído do catálogo.`);
    } catch (e) {
      setErro(erroMsg(e));
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Catálogo · {animes.length} {animes.length === 1 ? 'anime' : 'animes'}</span>
          <h2>Descubra seu próximo anime.</h2>
          <p>Busque por título ou gênero e adicione à sua coleção com um clique.</p>
        </div>
        <Link to="/animes/novo" className="btn btn-primary">
          <Icone nome="plus" tamanho={15} /> Novo anime
        </Link>
      </div>

      <form className="panel filter-bar" onSubmit={filtrar}>
        <label className="search-field">
          <Icone nome="search" tamanho={15} />
          <span className="sr-only">Buscar por título</span>
          <input
            placeholder="Buscar por título"
            value={rascunho.busca}
            onChange={(e) => setRascunho({ ...rascunho, busca: e.target.value })}
          />
        </label>
        <label className="select-field">
          <span className="sr-only">Gênero</span>
          <select value={rascunho.genero} onChange={(e) => setRascunho({ ...rascunho, genero: e.target.value })}>
            <option value="">Todos os gêneros</option>
            {generos.map((g) => (
              <option key={g.id} value={g.id}>{g.nome}</option>
            ))}
          </select>
          <Icone nome="chevronDown" tamanho={13} />
        </label>
        <button className="btn btn-primary">Filtrar</button>
        <button type="button" className="btn btn-quiet" onClick={limpar}>Limpar</button>
      </form>

      <Alerta>{erro}</Alerta>

      {carregando ? (
        <Carregando />
      ) : animes.length === 0 ? (
        <div className="panel empty-state">
          <span><Icone nome="search" tamanho={19} /></span>
          <b>Nenhum anime encontrado</b>
          <p>Tente outro título ou limpe os filtros.</p>
        </div>
      ) : (
        <>
          <div className="anime-grid">
            {animes.slice(0, quantos).map((anime) => (
              <CartaoAnime
                key={anime.id}
                anime={anime}
                ehDono={anime.criado_por === usuario.id}
                naColecao={naColecao.has(anime.id)}
                onDetalhes={setDetalhe}
                onAdicionar={adicionar}
                onExcluir={excluir}
              />
            ))}
          </div>

          {quantos < animes.length && (
            <div className="more">
              <button className="btn btn-outline" onClick={() => setQuantos(quantos + POR_PAGINA)}>
                Ver mais ({animes.length - quantos} restantes)
              </button>
            </div>
          )}
        </>
      )}

      {detalhe && (
        <ModalAnime
          anime={detalhe}
          naColecao={naColecao.has(detalhe.id)}
          onFechar={() => setDetalhe(null)}
          onAdicionar={adicionar}
        />
      )}
    </>
  );
}
