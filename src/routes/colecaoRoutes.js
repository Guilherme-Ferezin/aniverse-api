const router = require('express').Router();
const controller = require('../controllers/colecaoController');

router.get('/', controller.listar);
router.get('/:id', controller.obter);
router.post('/', controller.adicionar);
router.put('/:id', controller.atualizar);
router.delete('/:id', controller.excluir);

module.exports = router;
