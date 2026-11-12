require('dotenv').config();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'aniverse',
  charset: 'utf8mb4',
  timezone: 'Z',
  waitForConnections: true,
  connectionLimit: 10,
});

// Executa várias queries na mesma transação (commit ou rollback automático)
pool.transacao = async (fn) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const resultado = await fn(conn);
    await conn.commit();
    return resultado;
  } catch (erro) {
    await conn.rollback();
    throw erro;
  } finally {
    conn.release();
  }
};

module.exports = pool;
