import { useState } from 'react';

const CORES = [
  ['#6f42c1', '#0dcaf0'],
  ['#d63384', '#fd7e14'],
  ['#198754', '#0dcaf0'],
  ['#0d6efd', '#6f42c1'],
  ['#dc3545', '#6f42c1'],
  ['#fd7e14', '#6f42c1'],
];

// Mesma cor para o mesmo título, sempre
function coresDoTitulo(titulo = '') {
  let hash = 0;
  for (const letra of titulo) hash = (hash * 31 + letra.charCodeAt(0)) >>> 0;
  return CORES[hash % CORES.length];
}

// proporcao: formato do pôster (ex.: '2 / 3'). Sem ela, usa a altura fixa.
export default function Capa({ url, titulo, altura = 240, proporcao }) {
  const [falhou, setFalhou] = useState(false);
  const tamanho = proporcao ? { aspectRatio: proporcao, width: '100%' } : { height: altura, width: '100%' };

  if (!url || falhou) {
    const [de, para] = coresDoTitulo(titulo);
    return (
      <div
        className="capa-vazia"
        style={{ ...tamanho, background: `linear-gradient(135deg, ${de}, ${para})` }}
      >
        {titulo}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={titulo}
      style={{ ...tamanho, objectFit: 'cover', display: 'block' }}
      onError={() => setFalhou(true)}
    />
  );
}
