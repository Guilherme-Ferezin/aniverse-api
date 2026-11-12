const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { textoObrigatorio, lerId } = require('../utils/validacoes');

async function buscarGenero(id) {
  const [linhas] = await pool.query('SELECT id, nome FROM generos WHERE id = ?', [id]);
  if (linhas.length === 0) throw new HttpError(404, 'Gênero não encontrado');
  return linhas[0];
}

exports.listar = async (req, res) => {
  const [linhas] = await pool.query('SELECT id, nome FROM generos ORDER BY nome');
  res.json(linhas);
};

exports.obter = async (req, res) => {
  res.json(await buscarGenero(lerId(req.params.id)));
};

exports.criar = async (req, res) => {
  const nome = textoObrigatorio(req.body.nome, 'nome', 50);
  const [resultado] = await pool.query('INSERT INTO generos (nome) VALUES (?)', [nome]);
  res.status(201).json({ id: resultado.insertId, nome });
};

exports.atualizar = async (req, res) => {
  const id = lerId(req.params.id);
  const nome = textoObrigatorio(req.body.nome, 'nome', 50);
  await buscarGenero(id);
  await pool.query('UPDATE generos SET nome = ? WHERE id = ?', [nome, id]);
  res.json({ id, nome });
};

exports.excluir = async (req, res) => {
  const id = lerId(req.params.id);
  await buscarGenero(id);
  await pool.query('DELETE FROM generos WHERE id = ?', [id]);
  res.status(204).send();
};
