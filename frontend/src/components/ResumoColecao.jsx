import Icone from './Icone';

// Destaque + números da coleção do usuário
export default function ResumoColecao({ itens, nome }) {
  const notas = itens.filter((i) => i.nota !== null).map((i) => i.nota);
  const mediaNum = notas.length ? notas.reduce((soma, n) => soma + n, 0) / notas.length : null;
  const media = mediaNum === null ? '—' : mediaNum.toFixed(1).replace('.', ',');
  const episodios = itens.reduce((soma, i) => soma + i.episodios_assistidos, 0);
  const concluidos = itens.filter((i) => i.status === 'concluido').length;
  const assistindo = itens.filter((i) => i.status === 'assistindo').length;
  const querAssistir = itens.filter((i) => i.status === 'quero_assistir').length;

  const dados = [
    { rotulo: 'Na coleção', valor: itens.length, icone: 'bookmark', cor: '' },
    { rotulo: 'Assistindo', valor: assistindo, icone: 'play', cor: 'cyan' },
    { rotulo: 'Concluídos', valor: concluidos, icone: 'check', cor: 'green' },
    { rotulo: 'Episódios vistos', valor: episodios, icone: 'clock', cor: 'amber' },
  ];

  return (
    <>
      <section className="hero" aria-label="Resumo da coleção">
        <div className="hero-copy">
          <span className="hero-label"><Icone nome="sparkles" tamanho={14} /> SEU RESUMO OTAKU</span>
          <h3>
            Um episódio de cada vez.<br />
            <span>{nome ? `Boa maratona, ${nome.split(' ')[0]}!` : 'Boa maratona!'}</span>
          </h3>
          <p>
            {itens.length === 0
              ? 'Sua coleção ainda está vazia. Explore o catálogo e adicione o primeiro anime.'
              : `Você tem ${assistindo} em andamento e ${querAssistir} na fila para assistir.`}
          </p>
        </div>
        <div className="hero-score">
          <div><span>NOTA MÉDIA</span></div>
          <strong>{media}<small>/10</small></strong>
          <p>{notas.length ? `Baseada em ${notas.length} ${notas.length === 1 ? 'nota' : 'notas'}` : 'Dê notas para ver sua média'}</p>
          <div className="score-track"><i style={{ width: `${mediaNum === null ? 0 : mediaNum * 10}%` }} /></div>
        </div>
        <span className="hero-watermark" aria-hidden="true">A</span>
      </section>

      <div className="stats-grid">
        {dados.map((d) => (
          <div className="panel stat" key={d.rotulo}>
            <span className={`stat-icon ${d.cor}`}><Icone nome={d.icone} tamanho={17} /></span>
            <p>{d.rotulo}</p>
            <strong>{d.valor}</strong>
          </div>
        ))}
      </div>
    </>
  );
}
