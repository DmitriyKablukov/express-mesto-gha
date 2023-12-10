const mongoose = require('mongoose');
const User = require('../models/user');
const STATUS_CODE = require('../utils/constants');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(STATUS_CODE.OK_CODE).send(users))
    .catch((err) => res.status(STATUS_CODE.DEFAULT_ERROR_CODE).send({ message: err.message }));
};

const getUser = (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return res
      .status(STATUS_CODE.BAD_REQUEST_ERROR_CODE)
      .send({ message: 'Передан некорректный _id пользователя' });
  }
  return User.findById(req.params.userId)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(STATUS_CODE.OK_CODE).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        return res
          .status(STATUS_CODE.BAD_REQUEST_ERROR_CODE)
          .send({ message: 'Пользователь по указанному _id не найден' });
      }
      return res
        .status(STATUS_CODE.DEFAULT_ERROR_CODE)
        .send({ message: err.message });
    });
};

const createUser = (req, res) => {
  const userData = req.body;
  User.create(userData)
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(STATUS_CODE.BAD_REQUEST_ERROR_CODE).send({
          message: 'Переданы некорректные данные при создании пользователя',
        });
      }
      return res
        .status(STATUS_CODE.DEFAULT_ERROR_CODE)
        .send({ message: err.message });
    });
};

const updateProfile = (req, res) => {
  const userData = req.body;
  const userId = req.user._id;
  if (userId) {
    return User.findByIdAndUpdate(userId, userData, {
      runValidators: true,
      new: true,
    })
      .orFail(new Error({ message: 'Пользователь с указанным _id не найден' }))
      .then((user) => res.status(STATUS_CODE.OK_CODE).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return res.status(STATUS_CODE.BAD_REQUEST_ERROR_CODE).send({
            message: 'Переданы некорректные данные при обновлении профиля',
          });
        }
        return res
          .status(STATUS_CODE.DEFAULT_ERROR_CODE)
          .send({ message: err.message });
      });
  }
};

const updateAvatar = (req, res) => {
  const userData = req.body;
  const userId = req.user._id;
  const userAvatar = userData.avatar;
  if (userId) {
    return User.findByIdAndUpdate(
      userId,
      { avatar: userAvatar },
      {
        runValidators: true,
        new: true,
      },
    )
      .orFail(new Error({ message: 'Пользователь с указанным _id не найден' }))
      .then((user) => res.status(STATUS_CODE.OK_CODE).send(user))
      .catch((err) => {
        if (err.name === 'ValidationError') {
          return res.status(STATUS_CODE.BAD_REQUEST_ERROR_CODE).send({
            message: 'Переданы некорректные данные при обновлении аватара',
          });
        }
        return res
          .status(STATUS_CODE.DEFAULT_ERROR_CODE)
          .send({ message: err.message });
      });
  }
  return res
    .status(STATUS_CODE.NOT_FOUND_ERROR_CODE)
    .send({ message: 'Пользователь с указанным _id не найден' });
};

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateProfile,
  updateAvatar,
};
