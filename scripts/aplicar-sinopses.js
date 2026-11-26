// Grava sinopses no banco a partir de um arquivo JSON.
//
// Uso (na pasta raiz do projeto):
//   node scripts/aplicar-sinopses.js scripts/sinopses-locais.json
//   node scripts/aplicar-sinopses.js sinopses-pt.json
//
// O arquivo pode ser:
//   - uma lista:  [{ "id": 12, "titulo": "...", "sinopse": "..." }, ...]  (usa o id; se faltar, o título)
//   - um mapa:    { "Título do anime": "Sinopse...", ... }               (usa o título)

const fs = require('fs');
const pool = require('../src/config/db');

async function main() {
  const arquivo = process.argv[2];
  if (!arquivo) {
    console.log('Uso: node scripts/aplicar-sinopses.js <arquivo.json>');
    process.exit(1);
  }

  const bruto = JSON.parse(fs.readFileSync(arquivo, 'utf8'));
  const itens = Array.isArray(bruto)
    ? bruto
    : Object.entries(bruto).map(([titulo, sinopse]) => ({ titulo, sinopse }));

  let atualizados = 0;
  const naoEncontrados = [];

  for (const item of itens) {
    const sinopse = (item.sinopse || '').trim();
    if (!sinopse) continue;

    const [r] = item.id
      ? await pool.query('UPDATE animes SET sinopse = ? WHERE id = ?', [sinopse, item.id])
      : await pool.query('UPDATE animes SET sinopse = ? WHERE titulo = ?', [sinopse, item.titulo]);

    if (r.affectedRows > 0) atualizados++;
    else naoEncontrados.push(item.titulo || item.id);
  }

  console.log(`Pronto: ${atualizados} sinopse(s) atualizada(s).`);
  if (naoEncontrados.length > 0) {
    console.log(`Não encontrados no banco (${naoEncontrados.length}): ${naoEncontrados.slice(0, 10).join(', ')}${naoEncontrados.length > 10 ? '...' : ''}`);
  }
  await pool.end();
}

main().catch(async (erro) => {
  console.error('Erro:', erro.message);
  await pool.end();
  process.exit(1);
});
