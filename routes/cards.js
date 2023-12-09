const router = require('express').Router();
const cardController = require('../controllers/cards');

router.get('/', cardController.getCards);
router.post('/', cardController.createCard);
router.delete('/:cardId', cardController.deleteCard);
router.put('/:cardId/likes', cardController.likeCard);
router.delete('/:cardId/likes', cardController.dislikeCard);

module.exports = router;
