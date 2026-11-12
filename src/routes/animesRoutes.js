const router = require('express').Router();
const controller = require('../controllers/animesController');

router.get('/', controller.listar);
router.get('/:id', controller.obter);
router.post('/', controller.criar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

module.exports = router;
