const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const HttpError = require('../utils/HttpError');
const { textoObrigatorio, emailValido, senhaValida } = require('../utils/validacoes');

exports.registrar = async (req, res) => {
  const nome = textoObrigatorio(req.body.nome, 'nome', 100);
  const email = emailValido(req.body.email);
  const senha = senhaValida(req.body.senha);

  const [existente] = await pool.query('SELECT id FROM usuarios WHERE email = ?', [email]);
  if (existente.length > 0) throw new HttpError(409, 'E-mail já cadastrado');

  const senhaHash = await bcrypt.hash(senha, 10);
  const [resultado] = await pool.query(
    'INSERT INTO usuarios (nome, email, senha_hash) VALUES (?, ?, ?)',
    [nome, email, senhaHash]
  );

  res.status(201).json({
    mensagem: 'Usuário cadastrado com sucesso',
    usuario: { id: resultado.insertId, nome, email },
  });
};

exports.login = async (req, res) => {
  const email = emailValido(req.body.email);
  const senha = req.body.senha;
  if (typeof senha !== 'string' || !senha) {
    throw new HttpError(400, 'O campo "senha" é obrigatório');
  }

  const [linhas] = await pool.query(
    'SELECT id, nome, email, senha_hash FROM usuarios WHERE email = ?',
    [email]
  );
  const usuario = linhas[0];

  // Mesma mensagem para e-mail ou senha errados (não revela qual deles falhou)
  if (!usuario || !(await bcrypt.compare(senha, usuario.senha_hash))) {
    throw new HttpError(401, 'E-mail ou senha inválidos');
  }

  const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

  res.json({
    token,
    usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email },
  });
};
