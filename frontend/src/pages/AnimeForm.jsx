import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { erroMsg } from '../services/api';
import { useToast } from '../context/ToastContext';
import Alerta from '../components/Alerta';
import Carregando from '../components/Carregando';
import Icone from '../components/Icone';

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
  const avisar = useToast();

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
      avisar(editando ? `"${form.titulo}" foi atualizado.` : `"${form.titulo}" foi cadastrado no catálogo.`);
      navigate('/animes');
    } catch (err) {
      setErro(erroMsg(err));
      setSalvando(false);
    }
  }

  if (carregando) return <Carregando />;

  return (
    <div className="form-narrow">
      <div className="page-heading">
        <div>
          <span className="eyebrow">Catálogo</span>
          <h2>{editando ? 'Editar anime' : 'Novo anime'}</h2>
          <p>{editando ? 'Atualize as informações do título.' : 'Cadastre um título no catálogo do AniVerse.'}</p>
        </div>
      </div>
      <Alerta>{erro}</Alerta>

      <form onSubmit={salvar} className="panel form-panel">
        <div className="form-heading">
          <span className="stat-icon"><Icone nome="film" tamanho={17} /></span>
          <span><b>Dados do anime</b><small>Campos com * são obrigatórios</small></span>
        </div>

        <div className="form-grid">
          <label className="field col-6">
            <span>Título <i>*</i></span>
            <input name="titulo" value={form.titulo} onChange={mudar} required />
          </label>

          <label className="field col-6">
            <span>Sinopse</span>
            <textarea name="sinopse" rows="4" value={form.sinopse} onChange={mudar} />
          </label>

          <label className="field col-2">
            <span>Estúdio</span>
            <input name="estudio" value={form.estudio} onChange={mudar} />
          </label>
          <label className="field col-2">
            <span>Ano de lançamento</span>
            <input name="ano_lancamento" type="number" min="1900" max="2100" value={form.ano_lancamento} onChange={mudar} />
          </label>
          <label className="field col-2">
            <span>Nº de episódios</span>
            <input name="total_episodios" type="number" min="0" value={form.total_episodios} onChange={mudar} />
          </label>

          <label className="field col-6">
            <span>URL da capa</span>
            <input name="capa_url" type="url" placeholder="https://..." value={form.capa_url} onChange={mudar} />
          </label>

          <fieldset className="field col-6" style={{ border: 0, padding: 0, margin: 0 }}>
            <span>Gêneros</span>
            <div className="check-chips">
              {generos.map((g) => (
                <label className="check-chip" key={g.id}>
                  <input type="checkbox" checked={selecionados.includes(g.id)} onChange={() => alternarGenero(g.id)} />
                  <span>{g.nome}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="form-actions">
          <Link to="/animes" className="btn btn-quiet">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
