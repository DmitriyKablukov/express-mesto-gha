/* eslint-disable consistent-return */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const STATUS_CODE = require('../utils/constants');
const BadRequestError = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found');
const ConflictError = require('../errors/conflict');
const ValidationError = require('../errors/validation');
const IncorrectEmailPasswordError = require('../errors/incorrect');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.status(STATUS_CODE.OK_CODE).send(users))
    .catch(next);
};

const getUser = (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return next(new BadRequestError('Передан некорректный _id пользователя'));
  }
  return User.findById(req.params.userId)
    .orFail(new Error('NotValidId'))
    .then((user) => {
      res.status(STATUS_CODE.OK_CODE).send(user);
    })
    .catch((err) => {
      if (err.message === 'NotValidId') {
        return next(new NotFoundError('Пользователь по указанному _id не найден'));
      }
      return next();
    });
};

const createUser = async (req, res, next) => {
  try {
    const {
      name, about, avatar, email, password,
    } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name, about, avatar, email, password: hash,
    });
    return res.status(STATUS_CODE.CREATE_CODE).send({
      email: newUser.email,
      name: newUser.name,
      about: newUser.about,
      avatar: newUser.avatar,
      _id: newUser._id,
    });
  } catch (err) {
    if (err.code === STATUS_CODE.MONGO_DUPLICATE_ERROR_CODE) {
      next(new ConflictError('Такой пользователь уже существует'));
    } else if (err.name === 'ValidationError') {
      next(new ValidationError('Переданы некорректные данные при создании пользователя'));
    } else {
      next();
    }
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const userAuth = await User.findOne({ email })
      .select('+password')
      .orFail(new Error('NotAuthenticate'));
    const matched = await bcrypt.compare(password, userAuth.password);
    if (!matched) {
      throw new Error('NotAuthenticate');
    }
    const token = jwt.sign({ _id: userAuth._id }, 'dev_secret', { expiresIn: '7d' });
    return res.status(STATUS_CODE.OK_CODE)
      .send({ data: { email: userAuth.email, id: userAuth._id }, token });
  } catch (err) {
    if (err.message === 'NotAuthenticate') {
      return next(new IncorrectEmailPasswordError('Неправильный email или пароль'));
    }
    return next();
  }
};

const updateProfile = (req, res, next) => {
  const userData = req.body;
  const userId = req.user._id;
  if (userId) {
    return User.findByIdAndUpdate(userId, userData, {
      runValidators: true,
      new: true,
    })
      .orFail(new Error('NotFound'))
      .then((user) => res.status(STATUS_CODE.OK_CODE).send(user))
      .catch((err) => {
        if (err.message === 'NotFound') {
          return next(new NotFoundError('Пользователь c указанным _id не найден'));
        }
        if (err.name === 'ValidationError') {
          return next(new ValidationError('Переданы некорректные данные при обновлении профиля'));
        }
        return next();
      });
  }
};

const updateAvatar = (req, res, next) => {
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
      .orFail(new Error('NotFound'))
      .then((user) => res.status(STATUS_CODE.OK_CODE).send(user))
      .catch((err) => {
        if (err.message === 'NotFound') {
          return next(new NotFoundError('Пользователь c указанным _id не найден'));
        }
        if (err.name === 'ValidationError') {
          return next(new ValidationError('Переданы некорректные данные при обновлении профиля'));
        }
        return next();
      });
  }
};

const getMe = (req, res, next) => {
  const { _id } = req.user;
  return User
    .findById(_id)
    .then((user) => {
      if (!user) {
        next(new NotFoundError('Пользователь не найден'));
      } else {
        return res.status(STATUS_CODE.OK_CODE).send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return next(new ValidationError('Переданы некорректные данные при обновлении профиля'));
      }
      return next();
    });
};

module.exports = {
  getUsers,
  login,
  getUser,
  getMe,
  createUser,
  updateProfile,
  updateAvatar,
};
