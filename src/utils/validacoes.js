const HttpError = require('./HttpError');

const STATUS_VALIDOS = ['assistindo', 'concluido', 'quero_assistir'];

const vazio = (v) => v === undefined || v === null || v === '';

function textoObrigatorio(valor, campo, max) {
  if (typeof valor !== 'string' || !valor.trim()) {
    throw new HttpError(400, `O campo "${campo}" é obrigatório`);
  }
  const texto = valor.trim();
  if (texto.length > max) {
    throw new HttpError(400, `O campo "${campo}" deve ter no máximo ${max} caracteres`);
  }
  return texto;
}

function textoOpcional(valor, campo, max) {
  if (vazio(valor)) return null;
  if (typeof valor !== 'string') {
    throw new HttpError(400, `O campo "${campo}" deve ser um texto`);
  }
  const texto = valor.trim();
  if (texto.length > max) {
    throw new HttpError(400, `O campo "${campo}" deve ter no máximo ${max} caracteres`);
  }
  return texto || null;
}

function inteiroOpcional(valor, campo, min, max = Infinity) {
  if (vazio(valor)) return null;
  const n = Number(valor);
  if (!Number.isInteger(n) || n < min || n > max) {
    const faixa = max === Infinity ? `maior ou igual a ${min}` : `entre ${min} e ${max}`;
    throw new HttpError(400, `O campo "${campo}" deve ser um número inteiro ${faixa}`);
  }
  return n;
}

function emailValido(email) {
  const texto = textoObrigatorio(email, 'email', 150).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto)) {
    throw new HttpError(400, 'E-mail inválido');
  }
  return texto;
}

function senhaValida(senha) {
  if (typeof senha !== 'string' || senha.length < 6) {
    throw new HttpError(400, 'A senha deve ter pelo menos 6 caracteres');
  }
  if (senha.length > 72) {
    throw new HttpError(400, 'A senha deve ter no máximo 72 caracteres');
  }
  return senha;
}

function lerId(valor) {
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'ID inválido');
  return n;
}

function lerStatus(valor) {
  if (!STATUS_VALIDOS.includes(valor)) {
    throw new HttpError(400, `O campo "status" deve ser um de: ${STATUS_VALIDOS.join(', ')}`);
  }
  return valor;
}

module.exports = {
  STATUS_VALIDOS,
  textoObrigatorio,
  textoOpcional,
  inteiroOpcional,
  emailValido,
  senhaValida,
  lerId,
  lerStatus,
};
