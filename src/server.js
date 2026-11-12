require('dotenv').config();
const app = require('./app');
const pool = require('./config/db');

if (!process.env.JWT_SECRET) {
  console.error('ERRO: defina JWT_SECRET no arquivo .env');
  process.exit(1);
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, async () => {
  console.log(`API AniVerse rodando em http://localhost:${PORT}`);
  try {
    await pool.query('SELECT 1');
    console.log('Conectado ao MySQL com sucesso');
  } catch (erro) {
    console.error('Não foi possível conectar ao MySQL:', erro.message);
  }
});
