import { Link } from 'react-router-dom';
import Capa from './Capa';
import Icone from './Icone';

export default function CartaoAnime({ anime, ehDono, naColecao, onDetalhes, onAdicionar, onExcluir }) {
  const info = [anime.estudio, anime.ano_lancamento, anime.total_episodios && `${anime.total_episodios} eps`]
    .filter(Boolean)
    .join(' · ');

  return (
    <article className="anime-card">
      <button
        type="button"
        className="anime-cover"
        onClick={() => onDetalhes(anime)}
        aria-label={`Ver detalhes de ${anime.titulo}`}
      >
        <Capa url={anime.capa_url} titulo={anime.titulo} proporcao="2 / 3" />
        {naColecao && (
          <span className="tag tag-success cover-tag"><Icone nome="check" tamanho={12} /> Na coleção</span>
        )}
      </button>
      <div className="anime-body">
        <h3>{anime.titulo}</h3>
        <p className="anime-meta">{info}</p>
        <div className="chips">
          {anime.generos.map((g) => (
            <span key={g.id} className="chip">{g.nome}</span>
          ))}
        </div>
        <div className="anime-actions">
          <button className="btn btn-primary btn-sm" onClick={() => onAdicionar(anime)} disabled={naColecao}>
            {naColecao ? (<><Icone nome="check" tamanho={14} /> Adicionado</>) : (<><Icone nome="plus" tamanho={14} /> Coleção</>)}
          </button>
          {ehDono && (
            <>
              <Link className="btn btn-outline btn-sm" to={`/animes/${anime.id}/editar`}>Editar</Link>
              <button className="btn btn-danger-outline btn-sm" onClick={() => onExcluir(anime)} aria-label={`Excluir ${anime.titulo}`}>
                <Icone nome="trash" tamanho={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
