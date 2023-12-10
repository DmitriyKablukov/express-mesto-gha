const mongoose = require('mongoose');
const Card = require('../models/card');
const STATUS_CODE = require('../utils/constants');

const getCards = (req, res) => {
  Card.find()
    .then((cards) => res.status(STATUS_CODE.OK_CODE).send(cards))
    .catch((err) => res.status(STATUS_CODE.DEFAULT_ERROR_CODE).send({ message: err.message }));
};

const createCard = (req, res) => {
  const cardData = req.body;
  cardData.owner = req.user._id;
  return Card.create(cardData)
    .then((card) => res.status(201).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(STATUS_CODE.BAD_REQUEST_ERROR_CODE).send({
          message: 'Переданы некорректные данные при создании карточки',
        });
      }
      return res
        .status(STATUS_CODE.DEFAULT_ERROR_CODE)
        .send({ message: err.message });
    });
};

const deleteCard = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    return res
      .status(STATUS_CODE.BAD_REQUEST_ERROR_CODE)
      .send({ message: 'Передан некорректный _id карточки' });
  }
  return Card.findByIdAndDelete(req.params.cardId)
    .orFail(new Error('NotValidId'))
    .then(() => {
      res.status(STATUS_CODE.OK_CODE).send({ message: 'Карточка удалена' });
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        return res
          .status(STATUS_CODE.BAD_REQUEST_ERROR_CODE)
          .send({ message: 'Карточка по указанному _id не найдена' });
      }
      return res
        .status(STATUS_CODE.DEFAULT_ERROR_CODE)
        .send({ message: err.message });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(STATUS_CODE.NOT_FOUND_ERROR_CODE).send({
          message: 'Передан несуществующий _id карточки',
        });
      }
      return res.status(STATUS_CODE.OK_CODE).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(STATUS_CODE.BAD_REQUEST_ERROR_CODE).send({
          message: 'Переданы некорректные данные для постановки лайка',
        });
      }
      return res
        .status(STATUS_CODE.DEFAULT_ERROR_CODE)
        .send({ message: err.message });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return res.status(STATUS_CODE.NOT_FOUND_ERROR_CODE).send({
          message: 'Передан несуществующий _id карточки',
        });
      }
      res.status(STATUS_CODE.OK_CODE).send(card);
      return card;
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(STATUS_CODE.BAD_REQUEST_ERROR_CODE).send({
          message: 'Переданы некорректные данные для постановки/снятии лайка',
        });
      }
      return res
        .status(STATUS_CODE.DEFAULT_ERROR_CODE)
        .send({ message: err.message });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
