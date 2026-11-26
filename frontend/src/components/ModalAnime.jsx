import { useEffect, useState } from 'react';
import { STATUS } from '../utils/constantes';
import Capa from './Capa';
import Icone from './Icone';
import Portal from './Portal';

// Detalhes de um anime, com opção de adicionar à coleção escolhendo o status
export default function ModalAnime({ anime, naColecao, onFechar, onAdicionar }) {
  const [status, setStatus] = useState('quero_assistir');
  const meta = [anime.estudio, anime.ano_lancamento, anime.total_episodios && `${anime.total_episodios} episódios`]
    .filter(Boolean)
    .join(' · ');

  useEffect(() => {
    const aoTeclar = (e) => e.key === 'Escape' && onFechar();
    document.addEventListener('keydown', aoTeclar);
    return () => document.removeEventListener('keydown', aoTeclar);
  }, [onFechar]);

  return (
    <Portal>
      <div className="modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onFechar(); }}>
        <section className="modal modal-lg" role="dialog" aria-modal="true" aria-labelledby="anime-titulo">
          <button type="button" className="icon-btn modal-x" aria-label="Fechar" onClick={onFechar}>
            <Icone nome="x" tamanho={17} />
          </button>
          <h2 id="anime-titulo">{anime.titulo}</h2>

          <div className="detail-grid">
            <div className="cover">
              <Capa url={anime.capa_url} titulo={anime.titulo} proporcao="2 / 3" />
            </div>
            <div>
              <p className="anime-meta">{meta}</p>
              <div className="chips">
                {anime.generos.map((g) => (
                  <span key={g.id} className="chip">{g.nome}</span>
                ))}
              </div>
              <p>{anime.sinopse || 'Sem sinopse cadastrada.'}</p>
            </div>
          </div>

          <div className="modal-actions">
            {naColecao ? (
              <span className="note"><Icone nome="check" tamanho={14} /> Este anime já está na sua coleção</span>
            ) : (
              <>
                <label className="select-field">
                  <span className="sr-only">Status</span>
                  <select value={status} onChange={(e) => setStatus(e.target.value)}>
                    {Object.entries(STATUS).map(([chave, s]) => (
                      <option key={chave} value={chave}>{s.rotulo}</option>
                    ))}
                  </select>
                  <Icone nome="chevronDown" tamanho={13} />
                </label>
                <button className="btn btn-primary" onClick={() => onAdicionar(anime, status)}>
                  <Icone nome="plus" tamanho={15} /> Adicionar à coleção
                </button>
              </>
            )}
            <button type="button" className="btn btn-quiet" onClick={onFechar}>Fechar</button>
          </div>
        </section>
      </div>
    </Portal>
  );
}
