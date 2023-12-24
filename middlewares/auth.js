/* eslint-disable consistent-return */
const jwt = require('jsonwebtoken');
const IncorrectEmailPasswordError = require('../errors/incorrect');
const DefaultError = require('../errors/default');

module.exports = (req, res, next) => {
  let payload;
  try {
    const token = req.headers.authorization;
    console.log(token);
    if (!token) {
      throw new Error('NotAuthenticate');
    }
    const validToken = token.replace('Bearer ', '');
    payload = jwt.verify(validToken, 'dev_secret');
  } catch (err) {
    if (err.message === 'NotAuthenticate') {
      return next(new IncorrectEmailPasswordError('Неправильный email или пароль'));
    }
    if (err.name === 'JsonWebTokenError') {
      return next(new IncorrectEmailPasswordError('С токеном что-то не так'));
    }
    return next(new DefaultError());
  }
  req.user = payload;
  next();
};
