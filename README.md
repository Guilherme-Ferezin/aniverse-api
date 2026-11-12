# AniVerse API

API REST do **AniVerse — Anime Tracker** (Projeto Integrador Full Stack, Sprint 2).

**Stack:** Node.js, Express 5, MySQL 8 (`mysql2`), JWT (`jsonwebtoken`) e bcrypt (`bcryptjs`).

## Como rodar

1. Crie o banco executando o `aniverse.sql` no MySQL Workbench.
2. Instale as dependências:
   ```
   npm install
   ```
3. Copie `.env.example` para `.env` e preencha `DB_PASSWORD` e `JWT_SECRET`.
4. Inicie o servidor:
   ```
   npm run dev
   ```
5. Abra http://localhost:3000. Deve aparecer `{"api":"AniVerse","status":"online"}`.

## Estrutura

```
src/
  config/        conexão com o MySQL
  controllers/   regras de cada recurso
  middlewares/   autenticação JWT e tratamento de erros
  routes/        definição das rotas
  utils/         validações e classe de erro
  app.js         configuração do Express
  server.js      inicialização
docs/            coleção do Postman
```

## Endpoints

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

## Testes

Importe `docs/AniVerse.postman_collection.json` no Postman (ou no Thunder Client) e execute na ordem. O login salva o token automaticamente.

## Segurança

- Senhas criptografadas com bcrypt (nunca retornadas pela API).
- Rotas privadas protegidas por JWT.
- Consultas SQL parametrizadas (proteção contra SQL injection).
- Cada usuário acessa somente a própria coleção.
- Segredos em variáveis de ambiente (`.env` fora do Git).
