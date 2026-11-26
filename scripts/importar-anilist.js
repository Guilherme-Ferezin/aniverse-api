// Importa os animes mais populares da AniList para o catálogo, com capa, sinopse, estúdio,
// ano, episódios e gêneros. Não precisa de cadastro nem de chave.
//
// Uso (na pasta raiz do projeto, com internet):
//   npm run catalogo -- 150               -> importa os 150 mais populares (máx. 500)
//   npm run catalogo -- 150 email@x.com   -> define o dono dos animes pelo e-mail
//
// Pode rodar mais de uma vez: animes que já existem são ignorados, então rodar de novo
// com um número maior só acrescenta os que faltam.
// As sinopses vêm em inglês (é o idioma da AniList).

const pool = require('../src/config/db');
const MAL_IDS = require('./mal-ids');
const { GENEROS, paraBanco } = require('./anilist-util');

const POR_PAGINA = 50;

const CONSULTA = `query ($page: Int, $perPage: Int) {
  Page(page: $page, perPage: $perPage) {
    media(type: ANIME, sort: POPULARITY_DESC, format_in: [TV, MOVIE], isAdult: false) {
      idMal
      title { romaji english }
      description(asHtml: false)
      seasonYear
      startDate { year }
      episodes
      genres
      tags { name rank }
      studios(isMain: true) { nodes { name } }
      coverImage { extraLarge large }
    }
  }
}`;

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function buscarPagina(pagina, tentativa = 1) {
  const resposta = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ query: CONSULTA, variables: { page: pagina, perPage: POR_PAGINA } }),
    signal: AbortSignal.timeout(15000),
  });

  if (resposta.status === 429 && tentativa < 4) {
    await esperar(3000 * tentativa); // muitas consultas: espera e tenta de novo
    return buscarPagina(pagina, tentativa + 1);
  }
  if (!resposta.ok) throw new Error(`a AniList respondeu com erro ${resposta.status}`);

  const json = await resposta.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.Page.media;
}

async function descobrirDono(email) {
  const [usuarios] = email
    ? await pool.query('SELECT id FROM usuarios WHERE email = ?', [email.toLowerCase()])
    : await pool.query('SELECT id FROM usuarios ORDER BY id LIMIT 1');

  if (usuarios.length === 0) {
    console.log('Aviso: nenhum usuário encontrado. Os animes ficarão sem dono (não poderão ser editados).\n');
    return null;
  }
  return usuarios[0].id;
}

async function main() {
  const args = process.argv.slice(2);
  const quantidade = Math.min(Number(args.find((a) => /^\d+$/.test(a))) || 100, 500);
  const email = args.find((a) => a.includes('@'));

  const usuarioId = await descobrirDono(email);

  // Garante que todos os gêneros usados existam no banco
  for (const nome of [...Object.values(GENEROS), 'Isekai']) {
    await pool.query('INSERT IGNORE INTO generos (nome) VALUES (?)', [nome]);
  }
  const [generosBanco] = await pool.query('SELECT id, nome FROM generos');
  const idPorNome = Object.fromEntries(generosBanco.map((g) => [g.nome, g.id]));

  const [existentes] = await pool.query('SELECT titulo FROM animes');
  const titulosExistentes = new Set(existentes.map((a) => a.titulo.toLowerCase()));
  const idsMalLocais = new Set(Object.values(MAL_IDS)); // animes do catálogo local (evita duplicar)

  console.log(`Importando até ${quantidade} animes da AniList...\n`);
  let processados = 0;
  let inseridos = 0;

  for (let pagina = 1; processados < quantidade; pagina++) {
    let lista;
    try {
      lista = await buscarPagina(pagina);
    } catch (erro) {
      const motivo = erro.cause?.code || erro.name || erro.message;
      if (processados === 0) {
        console.log(`Não foi possível acessar a AniList (${motivo}). Confira a internet ou use outra rede (hotspot).`);
      } else {
        console.log(`\nParando na página ${pagina} (${motivo}). Seguindo com o que já foi importado.`);
      }
      break;
    }
    if (lista.length === 0) break;

    for (const item of lista) {
      if (processados >= quantidade) break;
      processados++;

      const anime = paraBanco(item);
      const repetido =
        !anime.titulo ||
        (item.idMal && idsMalLocais.has(item.idMal)) ||
        titulosExistentes.has(anime.titulo.toLowerCase());
      if (repetido) continue;

      const { generos, ...dados } = anime;
      const [resultado] = await pool.query('INSERT INTO animes SET ?', [
        { ...dados, criado_por: usuarioId },
      ]);
      const ids = generos.map((nome) => idPorNome[nome]).filter(Boolean);
      if (ids.length > 0) {
        await pool.query('INSERT INTO anime_generos (anime_id, genero_id) VALUES ?', [
          ids.map((generoId) => [resultado.insertId, generoId]),
        ]);
      }

      titulosExistentes.add(anime.titulo.toLowerCase());
      inseridos++;
      console.log(`+ ${anime.titulo}`);
    }

    await esperar(1000); // respeita o limite de consultas da AniList
  }

  console.log(`\nPronto: ${inseridos} anime(s) novo(s), ${processados - inseridos} já existiam ou foram ignorados.`);
  await pool.end();
}

main().catch(async (erro) => {
  console.error('Erro na importação:', erro.message);
  await pool.end();
  process.exit(1);
});
