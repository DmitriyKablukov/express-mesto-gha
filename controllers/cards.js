/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const Card = require('../models/card');
const STATUS_CODE = require('../utils/constants');
const ValidationError = require('../errors/validation');
const BadRequestError = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found');
const NoAccessError = require('../errors/no-access');
const DefaultError = require('../errors/default');

const getCards = (req, res, next) => {
  Card.find()
    .then((cards) => res.status(STATUS_CODE.OK_CODE).send(cards))
    .catch(next);
};

const createCard = (req, res, next) => {
  const cardData = req.body;
  cardData.owner = req.user._id;
  return Card.create(cardData)
    .then((card) => res.status(STATUS_CODE.CREATE_CODE).send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new ValidationError('Переданы некорректные данные при создании карточки'));
      } else {
        next(err);
      }
    });
};
/*
const deleteCard = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    return res
      .status(STATUS_CODE.BAD_REQUEST_ERROR_CODE)
      .send({ message: 'Передан некорректный _id карточки' });
  }
  Card.findByIdAndDelete(req.params.cardId)
    .then((card) => {
      if (!card) {
        return res.status(STATUS_CODE.NOT_FOUND_ERROR_CODE).send({
          message: 'Передан несуществующий _id карточки',
        });
      }
      if (!card.owner.equals(req.user._id)) {
        throw new Error({ message: 'Вы не можете удалять карточки других пользователей' });
      } else {
        res.status(STATUS_CODE.OK_CODE).send({ message: 'Карточка удалена' });
      }
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        return res
          .status(STATUS_CODE.NOT_FOUND_ERROR_CODE)
          .send({ message: 'Карточка по указанному _id не найдена' });
      }
      return res
        .status(STATUS_CODE.DEFAULT_ERROR_CODE)
        .send({ message: err.message });
    });
};
*/
const deleteCard = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    return next(new BadRequestError('Передан некорректный _id карточки'));
  }
  const removeCard = () => {
    Card.findByIdAndDelete(req.params.cardId)
      .then(() => res.status(STATUS_CODE.OK_CODE).send({ message: 'Карточка удалена' }))
      .catch(next);
  };
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) next(new NotFoundError('Передан несуществующий _id карточки'));
      if (req.user._id === card.owner.toString()) {
        return removeCard();
      }
      return next(new NoAccessError('Вы не можете удалять карточки других пользователей'));
    })
    .catch(next);
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Передан несуществующий _id карточки'));
      }
      return res.status(STATUS_CODE.OK_CODE).send(card);
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id карточки'));
      }
      return next(new DefaultError());
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Передан несуществующий _id карточки'));
      }
      res.status(STATUS_CODE.OK_CODE).send(card);
      return card;
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        return next(new BadRequestError('Передан некорректный _id карточки'));
      }
      return next(new DefaultError());
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
