CREATE DATABASE aniverse CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aniverse;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha_hash VARCHAR(255) NOT NULL,
    criado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE animes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    sinopse TEXT,
    estudio VARCHAR(100),
    ano_lancamento INT CHECK (ano_lancamento >= 1900),
    total_episodios INT CHECK (total_episodios >= 0),
    capa_url VARCHAR(500),
    criado_por INT NULL,
    FOREIGN KEY (criado_por) REFERENCES usuarios(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE generos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE anime_generos (
    anime_id INT NOT NULL,
    genero_id INT NOT NULL,
    PRIMARY KEY (anime_id, genero_id),
    FOREIGN KEY (anime_id) REFERENCES animes(id) ON DELETE CASCADE,
    FOREIGN KEY (genero_id) REFERENCES generos(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE colecao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    anime_id INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'quero_assistir'
        CHECK (status IN ('assistindo', 'concluido', 'quero_assistir')),
    nota TINYINT CHECK (nota BETWEEN 0 AND 10),
    episodios_assistidos INT NOT NULL DEFAULT 0 CHECK (episodios_assistidos >= 0),
    atualizado_em TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (usuario_id, anime_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (anime_id) REFERENCES animes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO generos (nome) VALUES
    ('Ação'), ('Aventura'), ('Comédia'), ('Drama'), ('Fantasia'),
    ('Romance'), ('Slice of Life'), ('Isekai'), ('Terror'), ('Ficção Científica');