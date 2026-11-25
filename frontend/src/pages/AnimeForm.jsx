import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { erroMsg } from '../services/api';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';

const VAZIO = {
  titulo: '',
  sinopse: '',
  estudio: '',
  ano_lancamento: '',
  total_episodios: '',
  capa_url: '',
};

// Usado para cadastrar (/animes/novo) e editar (/animes/:id/editar)
export default function AnimeForm() {
  const { id } = useParams();
  const editando = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(VAZIO);
  const [generos, setGeneros] = useState([]);
  const [selecionados, setSelecionados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregar() {
      try {
        const resposta = await api.get('/generos');
        setGeneros(resposta.data);

        if (editando) {
          const { data } = await api.get(`/animes/${id}`);
          setForm({
            titulo: data.titulo,
            sinopse: data.sinopse ?? '',
            estudio: data.estudio ?? '',
            ano_lancamento: data.ano_lancamento ?? '',
            total_episodios: data.total_episodios ?? '',
            capa_url: data.capa_url ?? '',
          });
          setSelecionados(data.generos.map((g) => g.id));
        }
      } catch (e) {
        setErro(erroMsg(e));
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, [id, editando]);

  const mudar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function alternarGenero(generoId) {
    setSelecionados((atual) =>
      atual.includes(generoId) ? atual.filter((x) => x !== generoId) : [...atual, generoId]
    );
  }

  async function salvar(e) {
    e.preventDefault();
    setErro('');
    setSalvando(true);
    const corpo = { ...form, generos: selecionados };
    try {
      if (editando) await api.put(`/animes/${id}`, corpo);
      else await api.post('/animes', corpo);
      navigate('/animes');
    } catch (err) {
      setErro(erroMsg(err));
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <h1 className="h3 mb-3">{editando ? 'Editar anime' : 'Novo anime'}</h1>
        <Alerta>{erro}</Alerta>

        <form onSubmit={salvar} className="card card-body">
          <div className="mb-3">
            <label className="form-label" htmlFor="titulo">Título *</label>
            <input id="titulo" name="titulo" className="form-control" value={form.titulo} onChange={mudar} required />
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="sinopse">Sinopse</label>
            <textarea id="sinopse" name="sinopse" rows="4" className="form-control" value={form.sinopse} onChange={mudar} />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-4">
              <label className="form-label" htmlFor="estudio">Estúdio</label>
              <input id="estudio" name="estudio" className="form-control" value={form.estudio} onChange={mudar} />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label" htmlFor="ano">Ano de lançamento</label>
              <input id="ano" name="ano_lancamento" type="number" min="1900" max="2100" className="form-control" value={form.ano_lancamento} onChange={mudar} />
            </div>
            <div className="col-6 col-md-4">
              <label className="form-label" htmlFor="eps">Nº de episódios</label>
              <input id="eps" name="total_episodios" type="number" min="0" className="form-control" value={form.total_episodios} onChange={mudar} />
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label" htmlFor="capa">URL da capa</label>
            <input id="capa" name="capa_url" type="url" placeholder="https://..." className="form-control" value={form.capa_url} onChange={mudar} />
          </div>

          <div className="mb-4">
            <span className="form-label d-block">Gêneros</span>
            {generos.map((g) => (
              <div className="form-check form-check-inline" key={g.id}>
                <input
                  className="form-check-input"
                  type="checkbox"
                  id={`genero-${g.id}`}
                  checked={selecionados.includes(g.id)}
                  onChange={() => alternarGenero(g.id)}
                />
                <label className="form-check-label" htmlFor={`genero-${g.id}`}>{g.nome}</label>
              </div>
            ))}
          </div>

          <div className="d-flex gap-2">
            <button type="submit" className="btn btn-info" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </button>
            <Link to="/animes" className="btn btn-outline-secondary">Cancelar</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
