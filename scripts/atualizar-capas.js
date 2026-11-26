// Busca as capas dos animes e grava no banco.
//
// Os animes do catálogo local são buscados pelo ID do MyAnimeList (o número que aparece
// em myanimelist.net/anime/ID), o que evita pegar o anime errado. Os cadastrados à mão
// (que não estão na lista abaixo) são buscados pelo título.
//
// Uso (na pasta raiz do projeto, com internet):
//   node scripts/atualizar-capas.js           -> só animes sem capa
//   node scripts/atualizar-capas.js --todos   -> refaz a capa de todos (corrige capas erradas)
//
// As imagens vêm da AniList, que aceita consulta pelo ID do MyAnimeList.

const pool = require('../src/config/db');

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const TEMPO_LIMITE = 10000;

// Título no banco -> ID no MyAnimeList
const MAL_IDS = require('./mal-ids');

async function consultar(consulta, variaveis, tentativa = 1) {
  const resposta = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: consulta, variables: variaveis }),
    signal: AbortSignal.timeout(TEMPO_LIMITE),
  });

  if (resposta.status === 429 && tentativa < 3) {
    await esperar(3000);
    return consultar(consulta, variaveis, tentativa + 1);
  }
  if (resposta.status === 404) return null; // anime não encontrado
  if (!resposta.ok) throw new Error(`erro ${resposta.status}`);
  return (await resposta.json()).data;
}

const melhorImagem = (media) => media?.coverImage?.extraLarge || media?.coverImage?.large || null;

async function capaPorIdMal(idMal) {
  const dados = await consultar(
    `query ($id: Int) { Media(idMal: $id, type: ANIME) { coverImage { extraLarge large } } }`,
    { id: idMal }
  );
  return melhorImagem(dados?.Media);
}

async function capaPorTitulo(titulo) {
  const dados = await consultar(
    `query ($busca: String) {
      Page(perPage: 5) {
        media(search: $busca, type: ANIME, format_in: [TV, MOVIE], sort: SEARCH_MATCH) {
          title { romaji english }
          coverImage { extraLarge large }
        }
      }
    }`,
    { busca: titulo }
  );
  const lista = dados?.Page?.media || [];
  const alvo = titulo.toLowerCase();
  const igual = lista.find((m) =>
    [m.title.romaji, m.title.english].filter(Boolean).some((n) => n.toLowerCase() === alvo)
  );
  return melhorImagem(igual || lista[0]);
}

async function main() {
  const todos = process.argv.includes('--todos');
  const [animes] = await pool.query(
    todos
      ? 'SELECT id, titulo FROM animes ORDER BY titulo'
      : "SELECT id, titulo FROM animes WHERE capa_url IS NULL OR capa_url = '' ORDER BY titulo"
  );

  if (animes.length === 0) {
    console.log('Todos os animes já têm capa. Use --todos para refazer todas.');
    await pool.end();
    return;
  }

  console.log(`Buscando capa de ${animes.length} anime(s)...\n`);
  let atualizados = 0;

  for (const anime of animes) {
    try {
      const idMal = MAL_IDS[anime.titulo];
      const capa = idMal ? await capaPorIdMal(idMal) : await capaPorTitulo(anime.titulo);

      if (capa) {
        await pool.query('UPDATE animes SET capa_url = ? WHERE id = ?', [capa, anime.id]);
        atualizados++;
        console.log(`OK    ${anime.titulo}${idMal ? '' : '  (busca por título: confira)'}`);
      } else {
        console.log(`----  ${anime.titulo} (nada encontrado)`);
      }
    } catch (erro) {
      const motivo = erro.cause?.code || erro.name || erro.message;
      console.log(`\nNão foi possível acessar a AniList (${motivo}). Confira a internet ou use outra rede (hotspot).`);
      break;
    }
    await esperar(800);
  }

  console.log(`\nPronto: ${atualizados} capa(s) atualizada(s).`);
  await pool.end();
}

main().catch(async (erro) => {
  console.error('Erro:', erro.message);
  await pool.end();
  process.exit(1);
});
