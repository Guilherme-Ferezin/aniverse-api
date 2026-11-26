// Converte um anime da AniList para o formato do banco do AniVerse.

// Gêneros da AniList (inglês) -> gêneros do banco (português)
const GENEROS = {
  Action: 'Ação',
  Adventure: 'Aventura',
  Comedy: 'Comédia',
  Drama: 'Drama',
  Fantasy: 'Fantasia',
  Horror: 'Terror',
  'Mahou Shoujo': 'Garotas Mágicas',
  Mecha: 'Mecha',
  Music: 'Música',
  Mystery: 'Mistério',
  Psychological: 'Psicológico',
  Romance: 'Romance',
  'Sci-Fi': 'Ficção Científica',
  'Slice of Life': 'Slice of Life',
  Sports: 'Esporte',
  Supernatural: 'Sobrenatural',
  Thriller: 'Suspense',
};

// Remove HTML, "(Source: ...)" e corta em até `max` caracteres, de preferência no fim de uma frase
function limparDescricao(texto, max = 700) {
  if (!texto) return null;
  let t = texto
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&rsquo;|&lsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\(Source:[^)]*\)/gi, '')
    .replace(/\[Written by[^\]]*\]/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!t) return null;

  if (t.length > max) {
    const corte = t.slice(0, max);
    const fim = Math.max(corte.lastIndexOf('. '), corte.lastIndexOf('! '), corte.lastIndexOf('? '));
    t = fim > max * 0.5 ? corte.slice(0, fim + 1) : `${corte.trimEnd()}…`;
  }
  return t;
}

function generosDoAnime(anime) {
  const nomes = new Set();
  for (const g of anime.genres || []) {
    if (GENEROS[g]) nomes.add(GENEROS[g]);
  }
  // Isekai na AniList é uma tag, não um gênero
  if ((anime.tags || []).some((t) => t.name === 'Isekai' && t.rank >= 40)) nomes.add('Isekai');
  return [...nomes];
}

function paraBanco(anime) {
  const ano = anime.seasonYear || anime.startDate?.year || null;
  return {
    titulo: (anime.title?.english || anime.title?.romaji || '').slice(0, 200),
    sinopse: limparDescricao(anime.description),
    estudio: anime.studios?.nodes?.[0]?.name?.slice(0, 100) || null,
    ano_lancamento: ano && ano >= 1900 ? ano : null,
    total_episodios: anime.episodes ?? null,
    capa_url: anime.coverImage?.extraLarge || anime.coverImage?.large || null,
    generos: generosDoAnime(anime),
  };
}

module.exports = { GENEROS, limparDescricao, generosDoAnime, paraBanco };
