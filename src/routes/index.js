const router = require('express').Router();
const auth = require('../middlewares/auth');

// Pública
router.use('/auth', require('./authRoutes'));

// Privadas (exigem JWT)
router.use('/perfil', auth, require('./perfilRoutes'));
router.use('/generos', auth, require('./generosRoutes'));
router.use('/animes', auth, require('./animesRoutes'));
router.use('/colecao', auth, require('./colecaoRoutes'));

module.exports = router;
