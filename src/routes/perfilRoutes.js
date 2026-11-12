const router = require('express').Router();
const controller = require('../controllers/perfilController');

router.get('/', controller.obter);
router.put('/', controller.atualizar);
router.delete('/', controller.excluir);

module.exports = router;
