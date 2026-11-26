// Salva em um arquivo JSON as sinopses que estão em inglês, para serem traduzidas.
//
// Uso (na pasta raiz do projeto):
//   node scripts/exportar-sinopses.js
// Gera o arquivo sinopses-en.json na pasta raiz.

const fs = require('fs');
const pool = require('../src/config/db');

const INGLES = [' the ', ' of ', ' and ', ' to ', ' his ', ' her ', ' with ', ' is ', ' who ', ' that '];
const PORTUGUES = [' de ', ' que ', ' uma ', ' um ', ' para ', ' com ', ' os ', ' das ', ' dos ', ' não '];

function conta(texto, palavras) {
  const t = ` ${texto.toLowerCase()} `;
  return palavras.reduce((soma, p) => soma + t.split(p).length - 1, 0);
}

const pareceIngles = (texto) => conta(texto, INGLES) > conta(texto, PORTUGUES);

async function main() {
  const [animes] = await pool.query("SELECT id, titulo, sinopse FROM animes WHERE sinopse IS NOT NULL AND sinopse <> '' ORDER BY id");
  const emIngles = animes.filter((a) => pareceIngles(a.sinopse));

  fs.writeFileSync('sinopses-en.json', JSON.stringify(emIngles, null, 2), 'utf8');
  console.log(`${animes.length} animes com sinopse; ${emIngles.length} parecem estar em inglês.`);
  console.log('Arquivo gerado: sinopses-en.json (na pasta raiz do projeto)');
  await pool.end();
}

main().catch(async (erro) => {
  console.error('Erro:', erro.message);
  await pool.end();
  process.exit(1);
});
