const bcrypt = require('bcryptjs');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { textoObrigatorio, emailValido, senhaValida } = require('../utils/validacoes');

async function buscarPerfil(id) {
  const [linhas] = await pool.query(
    'SELECT id, nome, email, criado_em FROM usuarios WHERE id = ?',
    [id]
  );
  if (linhas.length === 0) throw new HttpError(404, 'Usuário não encontrado');
  return linhas[0];
}

exports.obter = async (req, res) => {
  res.json(await buscarPerfil(req.usuario.id));
};

exports.atualizar = async (req, res) => {
  const nome = textoObrigatorio(req.body.nome, 'nome', 100);
  const email = emailValido(req.body.email);

  const [emUso] = await pool.query(
    'SELECT id FROM usuarios WHERE email = ? AND id <> ?',
    [email, req.usuario.id]
  );
  if (emUso.length > 0) throw new HttpError(409, 'E-mail já cadastrado');

  // A senha é opcional: só troca se for enviada
  if (req.body.senha !== undefined && req.body.senha !== '') {
    const senhaHash = await bcrypt.hash(senhaValida(req.body.senha), 10);
    await pool.query(
      'UPDATE usuarios SET nome = ?, email = ?, senha_hash = ? WHERE id = ?',
      [nome, email, senhaHash, req.usuario.id]
    );
  } else {
    await pool.query('UPDATE usuarios SET nome = ?, email = ? WHERE id = ?', [
      nome,
      email,
      req.usuario.id,
    ]);
  }

  res.json(await buscarPerfil(req.usuario.id));
};

exports.excluir = async (req, res) => {
  await pool.query('DELETE FROM usuarios WHERE id = ?', [req.usuario.id]);
  res.status(204).send();
};
