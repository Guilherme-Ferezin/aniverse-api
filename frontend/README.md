# AniVerse Web

Front-end do **AniVerse — Anime Tracker** (Projeto Integrador Full Stack, Sprint 3).

**Stack:** React 18, Vite, React Router, Axios e Bootstrap 5.

Consome a API que está na raiz deste mesmo repositório (Node.js + Express + MySQL).

## Como rodar

1. Deixe a API rodando (`npm run dev` na pasta raiz do repositório) com o MySQL ligado.
2. Nesta pasta (`frontend`):
   ```
   npm install
   npm run dev
   ```
3. Abra http://localhost:5173

Se a API não estiver em `http://localhost:3000`, copie `.env.example` para `.env` e ajuste `VITE_API_URL`.

## Telas

| Rota | Tela |
|---|---|
| /login | Login |
| /cadastro | Cadastro de usuário |
| /colecao | Minha coleção (abas por status, progresso, nota, editar e remover) |
| /animes | Catálogo (busca, filtro por gênero, adicionar à coleção, excluir) |
| /animes/novo e /animes/:id/editar | Formulário de inserção e edição de anime |
| /generos | CRUD de gêneros |
| /perfil | Edição de perfil e exclusão de conta |

Todas, exceto login e cadastro, são rotas protegidas (exigem login).

## Estrutura

```
src/
  components/   Navbar, Layout, ProtectedRoute, Capa, Alerta, ModalColecao...
  context/      AuthContext (login, logout e usuário logado)
  pages/        uma tela por arquivo
  services/     api.js (Axios com o token JWT)
  utils/        constantes
```

## Deploy (Render)

Static Site: build command `npm install && npm run build`, publish directory `dist`.
Variável `VITE_API_URL` apontando para a API publicada e uma regra de rewrite `/*` → `/index.html`.
