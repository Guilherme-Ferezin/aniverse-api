const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { inteiroOpcional, lerId, lerStatus } = require('../utils/validacoes');

const SELECT_BASE = `
  SELECT c.id, c.anime_id, c.status, c.nota, c.episodios_assistidos, c.atualizado_em,
         a.titulo, a.capa_url, a.estudio, a.ano_lancamento, a.total_episodios
    FROM colecao c
    JOIN animes a ON a.id = c.anime_id`;

async function buscarItem(id, usuarioId) {
  const [linhas] = await pool.query(`${SELECT_BASE} WHERE c.id = ? AND c.usuario_id = ?`, [
    id,
    usuarioId,
  ]);
  if (linhas.length === 0) throw new HttpError(404, 'Item não encontrado na sua coleção');
  return linhas[0];
}

function validarProgresso(episodios, totalEpisodios) {
  if (totalEpisodios !== null && episodios > totalEpisodios) {
    throw new HttpError(
      400,
      `episodios_assistidos não pode ser maior que o total de episódios (${totalEpisodios})`
    );
  }
}

exports.listar = async (req, res) => {
  const filtros = ['c.usuario_id = ?'];
  const params = [req.usuario.id];

  if (req.query.status) {
    filtros.push('c.status = ?');
    params.push(lerStatus(req.query.status));
  }
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

  const [linhas] = await pool.query(
    `${SELECT_BASE} WHERE ${filtros.join(' AND ')} ORDER BY c.atualizado_em DESC`,
    params
  );
  res.json(linhas);
};

exports.obter = async (req, res) => {
  res.json(await buscarItem(lerId(req.params.id), req.usuario.id));
};

exports.adicionar = async (req, res) => {
  const animeId = lerId(req.body.anime_id);
  const status = req.body.status === undefined ? 'quero_assistir' : lerStatus(req.body.status);
  const nota = inteiroOpcional(req.body.nota, 'nota', 0, 10);
  const episodios = inteiroOpcional(req.body.episodios_assistidos, 'episodios_assistidos', 0) ?? 0;

  const [animes] = await pool.query('SELECT id, total_episodios FROM animes WHERE id = ?', [
    animeId,
  ]);
  if (animes.length === 0) throw new HttpError(404, 'Anime não encontrado');
  validarProgresso(episodios, animes[0].total_episodios);

  let resultado;
  try {
    [resultado] = await pool.query(
      `INSERT INTO colecao (usuario_id, anime_id, status, nota, episodios_assistidos)
       VALUES (?, ?, ?, ?, ?)`,
      [req.usuario.id, animeId, status, nota, episodios]
    );
  } catch (erro) {
    if (erro.code === 'ER_DUP_ENTRY') {
      throw new HttpError(409, 'Este anime já está na sua coleção');
    }
    throw erro;
  }

  res.status(201).json(await buscarItem(resultado.insertId, req.usuario.id));
};

// Atualização parcial: só altera os campos enviados
exports.atualizar = async (req, res) => {
  const id = lerId(req.params.id);
  const item = await buscarItem(id, req.usuario.id);

  const status = req.body.status === undefined ? item.status : lerStatus(req.body.status);
  const nota =
    req.body.nota === undefined ? item.nota : inteiroOpcional(req.body.nota, 'nota', 0, 10);
  const episodios =
    req.body.episodios_assistidos === undefined
      ? item.episodios_assistidos
      : inteiroOpcional(req.body.episodios_assistidos, 'episodios_assistidos', 0) ?? 0;

  validarProgresso(episodios, item.total_episodios);

  await pool.query(
    `UPDATE colecao SET status = ?, nota = ?, episodios_assistidos = ?
      WHERE id = ? AND usuario_id = ?`,
    [status, nota, episodios, id, req.usuario.id]
  );

  res.json(await buscarItem(id, req.usuario.id));
};

exports.excluir = async (req, res) => {
  const id = lerId(req.params.id);
  await buscarItem(id, req.usuario.id);
  await pool.query('DELETE FROM colecao WHERE id = ? AND usuario_id = ?', [id, req.usuario.id]);
  res.status(204).send();
};
