const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.body = req.body || {};
  next();
});

app.get('/', (req, res) => res.json({ api: 'AniVerse', status: 'online' }));
app.use(routes);
app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada' }));
app.use(errorHandler);

module.exports = app;
