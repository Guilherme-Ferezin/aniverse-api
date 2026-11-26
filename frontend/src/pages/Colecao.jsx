import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { erroMsg } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { STATUS } from '../utils/constantes';
import { useToast } from '../context/ToastContext';
import Alerta from '../components/Alerta';
import Capa from '../components/Capa';
import Carregando from '../components/Carregando';
import Icone from '../components/Icone';
import ModalColecao from '../components/ModalColecao';
import ResumoColecao from '../components/ResumoColecao';

const ABAS = [
  { chave: '', rotulo: 'Todos' },
  ...Object.entries(STATUS).map(([chave, s]) => ({ chave, rotulo: s.rotulo })),
];

function dataDeHoje() {
  const texto = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function Colecao() {
  const { usuario } = useAuth();
  const avisar = useToast();
  const [aba, setAba] = useState('');
  const [busca, setBusca] = useState('');
  const [genero, setGenero] = useState('');
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [editando, setEditando] = useState(null);
  const [versao, setVersao] = useState(0);

  // Busca a coleção inteira uma vez; abas e busca filtram na própria tela
  useEffect(() => {
    api
      .get('/colecao')
      .then((r) => setItens(r.data))
      .catch((e) => setErro(erroMsg(e)))
      .finally(() => setCarregando(false));
  }, [versao]);

  async function remover(item) {
    if (!window.confirm(`Remover "${item.titulo}" da sua coleção?`)) return;
    setErro('');
    try {
      await api.delete(`/colecao/${item.id}`);
      setItens(itens.filter((i) => i.id !== item.id));
      avisar(`"${item.titulo}" foi removido da sua coleção.`);
    } catch (e) {
      setErro(erroMsg(e));
    }
  }

  function aoSalvar() {
    avisar(`Alterações em "${editando.titulo}" salvas.`);
    setEditando(null);
    setVersao((v) => v + 1);
  }

  const contar = (chave) => (chave ? itens.filter((i) => i.status === chave).length : itens.length);

  // Gêneros que existem na coleção (para o filtro)
  const generosDaColecao = [...new Map(itens.flatMap((i) => i.generos || []).map((g) => [g.id, g])).values()].sort(
    (a, b) => a.nome.localeCompare(b.nome, 'pt-BR')
  );
  // Se o gênero escolhido deixou de existir (ex.: anime removido), volta para "todos"
  const generoAtivo = generosDaColecao.some((g) => String(g.id) === genero) ? genero : '';

  const visiveis = itens.filter(
    (i) =>
      (!aba || i.status === aba) &&
      i.titulo.toLowerCase().includes(busca.toLowerCase()) &&
      (!generoAtivo || (i.generos || []).some((g) => String(g.id) === generoAtivo))
  );

  function limparFiltros() {
    setAba('');
    setBusca('');
    setGenero('');
  }

  return (
    <>
      <div className="welcome">
        <div>
          <div className="date-label"><i /> {dataDeHoje()}</div>
          <h2>Olá, {usuario?.nome?.split(' ')[0]} <span>✦</span></h2>
          <p>Veja como está o seu universo de animes.</p>
        </div>
        <Link to="/animes" className="btn btn-primary">
          <Icone nome="plus" tamanho={15} /> Adicionar animes
        </Link>
      </div>

      <Alerta>{erro}</Alerta>

      {carregando ? (
        <Carregando />
      ) : (
        <>
          <ResumoColecao itens={itens} nome={usuario?.nome} />

          <section className="panel library" aria-label="Minha coleção">
            <div className="section-head">
              <div>
                <span className="section-overline">Biblioteca</span>
                <h3>Seus animes</h3>
                <p>{itens.length} {itens.length === 1 ? 'título salvo' : 'títulos salvos'} na coleção.</p>
              </div>
            </div>

            <div className="toolbar">
              <div className="tabs" role="group" aria-label="Filtrar por status">
                {ABAS.map((a) => (
                  <button
                    key={a.chave}
                    className={`tab${aba === a.chave ? ' tab-on' : ''}`}
                    aria-pressed={aba === a.chave}
                    onClick={() => setAba(a.chave)}
                  >
                    {a.rotulo} <small>{contar(a.chave)}</small>
                  </button>
                ))}
              </div>
              <div className="toolbar-filtros">
                <label className="select-field">
                  <span className="sr-only">Gênero</span>
                  <select value={generoAtivo} onChange={(e) => setGenero(e.target.value)}>
                    <option value="">Todos os gêneros</option>
                    {generosDaColecao.map((g) => (
                      <option key={g.id} value={g.id}>{g.nome}</option>
                    ))}
                  </select>
                  <Icone nome="chevronDown" tamanho={13} />
                </label>
                <label className="search-field">
                  <Icone nome="search" tamanho={15} />
                  <span className="sr-only">Buscar na minha coleção</span>
                  <input
                    placeholder="Buscar na minha coleção"
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                </label>
              </div>
            </div>

            {visiveis.length === 0 ? (
              <div className="empty-state">
                <span><Icone nome="film" tamanho={19} /></span>
                {itens.length === 0 ? (
                  <>
                    <b>Nada por aqui ainda</b>
                    <p>Vá ao catálogo e adicione algum anime à sua coleção.</p>
                    <Link to="/animes" className="btn btn-primary btn-sm">Explorar catálogo</Link>
                  </>
                ) : (
                  <>
                    <b>Nenhum anime encontrado</b>
                    <p>Nenhum título da sua coleção combina com esses filtros.</p>
                    <button type="button" className="btn btn-outline btn-sm" onClick={limparFiltros}>Limpar filtros</button>
                  </>
                )}
              </div>
            ) : (
              <div className="anime-grid">
                {visiveis.map((item) => {
                  const total = item.total_episodios;
                  const pct = total ? Math.min(100, Math.round((item.episodios_assistidos / total) * 100)) : 0;
                  const s = STATUS[item.status];
                  return (
                    <article className="anime-card" key={item.id}>
                      <button
                        type="button"
                        className="anime-cover"
                        onClick={() => setEditando(item)}
                        aria-label={`Editar ${item.titulo}`}
                      >
                        <Capa url={item.capa_url} titulo={item.titulo} proporcao="2 / 3" />
                        <span className={`tag tag-${s.cor} cover-tag`}>{s.rotulo}</span>
                        {item.nota !== null && (
                          <span className="tag tag-dark cover-nota">
                            <Icone nome="star" tamanho={11} fill="currentColor" /> {item.nota}
                          </span>
                        )}
                      </button>
                      <div className="anime-body">
                        <h3>{item.titulo}</h3>
                        <div className="anime-progress">
                          <div>
                            <span>{item.episodios_assistidos}/{total ?? '?'} episódios</span>
                            <b>{total ? `${pct}%` : ''}</b>
                          </div>
                          <div className="progress-track"><i style={{ width: `${pct}%` }} /></div>
                        </div>
                        <div className="anime-actions">
                          <button className="btn btn-outline btn-sm" onClick={() => setEditando(item)}>
                            <Icone nome="pencil" tamanho={14} /> Editar
                          </button>
                          <button
                            className="btn btn-danger-outline btn-sm"
                            onClick={() => remover(item)}
                            aria-label={`Remover ${item.titulo}`}
                          >
                            <Icone nome="trash" tamanho={14} />
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </>
      )}

      {editando && (
        <ModalColecao item={editando} onFechar={() => setEditando(null)} onSalvo={aoSalvar} />
      )}
    </>
  );
}
