// Popula o catálogo de animes.
//
// Uso (na pasta raiz do projeto):
//   npm run importar -- 50           -> os 50 animes mais populares da Jikan (com capa)
//   npm run importar -- 50 e@x.com   -> define o dono dos animes pelo e-mail
//   npm run seed                     -> só o catálogo local (sem internet, sem capas)
//
// Se a internet ou a Jikan falharem, o script usa o catálogo local automaticamente.
// O dono pode editar e excluir os animes. Sem e-mail, usa o primeiro usuário.
// Animes que já existem (mesmo título) são ignorados, então pode rodar mais de uma vez.

const pool = require('../src/config/db');
const animesLocais = require('./animes-locais');

// Gêneros da Jikan (inglês) -> gêneros do banco (português)
const MAPA_GENEROS = {
  Action: 'Ação',
  Adventure: 'Aventura',
  Comedy: 'Comédia',
  Drama: 'Drama',
  Fantasy: 'Fantasia',
  Romance: 'Romance',
  'Slice of Life': 'Slice of Life',
  Isekai: 'Isekai',
  Horror: 'Terror',
  'Sci-Fi': 'Ficção Científica',
};

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Converte um anime da Jikan para o formato usado no banco
function deJikan(anime) {
  const ano = anime.year || anime.aired?.prop?.from?.year || null;
  const generos = new Set();
  for (const g of [...(anime.genres || []), ...(anime.themes || [])]) {
    if (MAPA_GENEROS[g.name]) generos.add(MAPA_GENEROS[g.name]);
  }
  return {
    titulo: (anime.title_english || anime.title).slice(0, 200),
    sinopse: anime.synopsis || null,
    estudio: anime.studios?.[0]?.name?.slice(0, 100) || null,
    ano_lancamento: ano && ano >= 1900 ? ano : null,
    total_episodios: anime.episodes ?? null,
    capa_url: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || null,
    generos: [...generos],
  };
}

async function buscarDaJikan(quantidade) {
  const paginas = Math.ceil(quantidade / 25);
  const lista = [];
  for (let pagina = 1; pagina <= paginas; pagina++) {
    const resposta = await fetch(`https://api.jikan.moe/v4/top/anime?page=${pagina}&limit=25`);
    if (!resposta.ok) throw new Error(`A Jikan respondeu com erro ${resposta.status}`);
    const json = await resposta.json();
    lista.push(...json.data.map(deJikan));
    if (pagina < paginas) await esperar(1200); // respeita o limite da Jikan
  }
  return lista.slice(0, quantidade);
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

async function inserir(anime, usuarioId, idPorNome) {
  const [existente] = await pool.query('SELECT id FROM animes WHERE titulo = ?', [anime.titulo]);
  if (existente.length > 0) return false;

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
  return true;
}

async function main() {
  const args = process.argv.slice(2);
  const somenteLocal = args.includes('--local');
  const quantidade = Math.min(Number(args.find((a) => /^\d+$/.test(a))) || 25, 100);
  const email = args.find((a) => a.includes('@'));

  const usuarioId = await descobrirDono(email);
  const [generosBanco] = await pool.query('SELECT id, nome FROM generos');
  const idPorNome = Object.fromEntries(generosBanco.map((g) => [g.nome, g.id]));

  let lista;
  if (somenteLocal) {
    lista = animesLocais;
  } else {
    try {
      lista = await buscarDaJikan(quantidade);
      console.log('Dados obtidos da Jikan (com capas).\n');
    } catch (erro) {
      const motivo = erro.cause?.code || erro.message;
      console.log(`Não foi possível acessar a Jikan (${motivo}).`);
      console.log('Usando o catálogo local (sem capas).\n');
      lista = animesLocais;
    }
  }

  let inseridos = 0;
  for (const anime of lista) {
    if (await inserir(anime, usuarioId, idPorNome)) {
      inseridos++;
      console.log(`+ ${anime.titulo}`);
    }
  }

  console.log(`\nPronto: ${inseridos} anime(s) importado(s), ${lista.length - inseridos} já existiam.`);
  await pool.end();
}

main().catch(async (erro) => {
  console.error('Erro na importação:', erro.message);
  await pool.end();
  process.exit(1);
});
