const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const {
  textoObrigatorio,
  textoOpcional,
  inteiroOpcional,
  lerId,
} = require('../utils/validacoes');

function lerDados(body) {
  return {
    titulo: textoObrigatorio(body.titulo, 'titulo', 200),
    sinopse: textoOpcional(body.sinopse, 'sinopse', 65000),
    estudio: textoOpcional(body.estudio, 'estudio', 100),
    ano_lancamento: inteiroOpcional(body.ano_lancamento, 'ano_lancamento', 1900, 2100),
    total_episodios: inteiroOpcional(body.total_episodios, 'total_episodios', 0, 10000),
    capa_url: textoOpcional(body.capa_url, 'capa_url', 500),
  };
}

// Retorna undefined quando "generos" não foi enviado (não mexe nos gêneros atuais)
function lerGeneros(body) {
  if (body.generos === undefined) return undefined;
  if (!Array.isArray(body.generos)) {
    throw new HttpError(400, 'O campo "generos" deve ser uma lista de IDs');
  }
  const ids = body.generos.map(Number);
  if (ids.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw new HttpError(400, 'O campo "generos" deve conter apenas IDs válidos');
  }
  return [...new Set(ids)];
}

async function anexarGeneros(animes) {
  if (animes.length === 0) return animes;
  const [linhas] = await pool.query(
    `SELECT ag.anime_id, g.id, g.nome
       FROM anime_generos ag
       JOIN generos g ON g.id = ag.genero_id
      WHERE ag.anime_id IN (?)
      ORDER BY g.nome`,
    [animes.map((a) => a.id)]
  );
  for (const anime of animes) {
    anime.generos = linhas
      .filter((l) => l.anime_id === anime.id)
      .map((l) => ({ id: l.id, nome: l.nome }));
  }
  return animes;
}

async function buscarAnime(id) {
  const [linhas] = await pool.query('SELECT * FROM animes WHERE id = ?', [id]);
  if (linhas.length === 0) throw new HttpError(404, 'Anime não encontrado');
  return linhas[0];
}

// Só quem cadastrou o anime pode alterar ou excluir
function exigirDono(anime, usuarioId) {
  if (anime.criado_por !== usuarioId) {
    throw new HttpError(403, 'Você só pode alterar ou excluir animes cadastrados por você');
  }
}

async function salvarGeneros(conn, animeId, generos) {
  await conn.query('DELETE FROM anime_generos WHERE anime_id = ?', [animeId]);
  if (generos.length > 0) {
    await conn.query('INSERT INTO anime_generos (anime_id, genero_id) VALUES ?', [
      generos.map((generoId) => [animeId, generoId]),
    ]);
  }
}

exports.listar = async (req, res) => {
  const filtros = [];
  const params = [];

  if (req.query.busca) {
    filtros.push('a.titulo LIKE ?');
    params.push(`%${req.query.busca}%`);
  }
  if (req.query.genero) {
    filtros.push(
      'EXISTS (SELECT 1 FROM anime_generos ag WHERE ag.anime_id = a.id AND ag.genero_id = ?)'
    );
    params.push(lerId(req.query.genero));
  }

  const where = filtros.length ? `WHERE ${filtros.join(' AND ')}` : '';
  const [animes] = await pool.query(
    `SELECT a.* FROM animes a ${where} ORDER BY a.titulo`,
    params
  );
  res.json(await anexarGeneros(animes));
};

exports.obter = async (req, res) => {
  const anime = await buscarAnime(lerId(req.params.id));
  await anexarGeneros([anime]);
  res.json(anime);
};

exports.criar = async (req, res) => {
  const dados = lerDados(req.body);
  const generos = lerGeneros(req.body) || [];

  const id = await pool.transacao(async (conn) => {
    const [resultado] = await conn.query('INSERT INTO animes SET ?', [
      { ...dados, criado_por: req.usuario.id },
    ]);
    await salvarGeneros(conn, resultado.insertId, generos);
    return resultado.insertId;
  });

  const anime = await buscarAnime(id);
  await anexarGeneros([anime]);
  res.status(201).json(anime);
};

exports.atualizar = async (req, res) => {
  const id = lerId(req.params.id);
  const anime = await buscarAnime(id);
  exigirDono(anime, req.usuario.id);

  const dados = lerDados(req.body);
  const generos = lerGeneros(req.body);

  await pool.transacao(async (conn) => {
    await conn.query('UPDATE animes SET ? WHERE id = ?', [dados, id]);
    if (generos !== undefined) await salvarGeneros(conn, id, generos);
  });

  const atualizado = await buscarAnime(id);
  await anexarGeneros([atualizado]);
  res.json(atualizado);
};

exports.excluir = async (req, res) => {
  const id = lerId(req.params.id);
  const anime = await buscarAnime(id);
  exigirDono(anime, req.usuario.id);

  await pool.query('DELETE FROM animes WHERE id = ?', [id]);
  res.status(204).send();
};
