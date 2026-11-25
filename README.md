# AniVerse — Anime Tracker

Projeto Integrador Full Stack: plataforma para o usuário criar uma conta, cadastrar animes e organizar sua coleção pessoal em **Assistindo**, **Concluído** e **Quero assistir**, com nota e progresso de episódios.

| Camada | Tecnologia |
|---|---|
| Front-end | React 18, Vite, React Router, Axios, Bootstrap 5 |
| Back-end | Node.js, Express 5, JWT, bcrypt |
| Banco de dados | MySQL 8 |

## Estrutura do repositório

```
aniverse-api/
  src/            API REST (controllers, routes, middlewares, config, utils)
  frontend/       Front-end React (tem README próprio)
  scripts/        Importação automática de animes (API Jikan)
  docs/           Testes das rotas (aniverse-api.http) e coleção do Postman
  aniverse.sql    Script de criação do banco (DDL)
```

## Como rodar

### 1. Banco de dados
Execute o `aniverse.sql` no MySQL (Workbench ou terminal). Ele cria o banco `aniverse`, as 5 tabelas e os gêneros iniciais.

### 2. API (porta 3000)
```
npm install
```
Copie `.env.example` para `.env` e preencha `DB_PORT`, `DB_PASSWORD` e `JWT_SECRET`. Depois:
```
npm run dev
```
Ao abrir http://localhost:3000 deve aparecer `{"api":"AniVerse","status":"online"}`.

### 3. Front-end (porta 5173)
Em **outro terminal**, na pasta raiz:
```
npm run frontend:install
npm run frontend
```
Abra http://localhost:5173 (cadastre-se na tela inicial).

### 4. Popular o catálogo de animes
Com pelo menos um usuário cadastrado, na pasta raiz:
```
npm run importar -- 50
```
Importa os 50 animes mais populares do MyAnimeList (API pública Jikan), com capa, sinopse, estúdio e gêneros. **Sem internet ou com a Jikan fora do ar, o script usa automaticamente um catálogo local** de 28 animes (sem capas, que aparecem como cartões coloridos).

Outras opções:
- `npm run seed`: usa só o catálogo local, sem tentar a internet.
- `npm run importar -- 50 email@exemplo.com`: define o dono dos animes (o dono pode editar e excluir). Sem e-mail, vale o primeiro usuário cadastrado.

Pode rodar mais de uma vez: animes com o mesmo título são ignorados.

## Endpoints da API

Todas as rotas, exceto `/auth/*`, exigem o header `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| POST | /auth/register | Cadastra usuário (`nome`, `email`, `senha`) |
| POST | /auth/login | Retorna o token JWT |
| GET / PUT / DELETE | /perfil | Ver, editar e excluir o próprio perfil |
| GET / POST | /generos | Listar e criar gêneros |
| GET / PUT / DELETE | /generos/:id | Buscar, editar e excluir gênero |
| GET / POST | /animes | Listar (`?busca=`, `?genero=`) e cadastrar (aceita `generos: [ids]`) |
| GET / PUT / DELETE | /animes/:id | Buscar, editar e excluir (só quem cadastrou) |
| GET / POST | /colecao | Listar (`?status=`, `?busca=`, `?genero=`) e adicionar à coleção |
| GET / PUT / DELETE | /colecao/:id | Buscar, atualizar (status, nota, progresso) e remover |

Valores de `status`: `assistindo`, `concluido`, `quero_assistir`.

## Testes das rotas

- `docs/aniverse-api.http`: requisições para a extensão **REST Client** do VS Code (o login guarda o token sozinho).
- `docs/AniVerse.postman_collection.json`: coleção para importar no Postman.

## Segurança

- Senhas criptografadas com bcrypt (nunca retornadas pela API).
- Rotas privadas protegidas por JWT.
- Consultas SQL parametrizadas (proteção contra SQL injection).
- Cada usuário acessa somente a própria coleção.
- Segredos em variáveis de ambiente (`.env` fora do Git).
