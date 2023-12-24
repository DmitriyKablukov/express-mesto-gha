const { DEFAULT_ERROR_CODE } = require('../utils/constants');

const DefaultError = (err, req, res, next) => {
  const statusCode = err.statusCode || DEFAULT_ERROR_CODE;// 500
  const message = statusCode === DEFAULT_ERROR_CODE ? 'На сервере произошла ошибка' : err.message;
  res.status(statusCode).send({ message });
  next();
};

module.exports = DefaultError;
