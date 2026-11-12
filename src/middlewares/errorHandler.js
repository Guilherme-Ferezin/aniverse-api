const HttpError = require('../utils/HttpError');

// Middleware final: converte erros em respostas JSON
module.exports = (err, req, res, next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ erro: err.message });
  }
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ erro: 'JSON inválido no corpo da requisição' });
  }
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ erro: 'Já existe um registro com esses dados' });
  }
  if (err.code === 'ER_NO_REFERENCED_ROW_2') {
    return res.status(400).json({ erro: 'Referência inválida: verifique os IDs informados' });
  }
  if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
    return res.status(400).json({ erro: 'Algum valor informado viola as regras do banco' });
  }

  console.error(err);
  return res.status(500).json({ erro: 'Erro interno do servidor' });
};
