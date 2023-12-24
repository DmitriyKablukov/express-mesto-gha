const { INCORRECT_EMAIL_PASSWORD_ERROR_CODE } = require('../utils/constants');

class IncorrectEmailPasswordError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = INCORRECT_EMAIL_PASSWORD_ERROR_CODE;// 401
  }
}

module.exports = IncorrectEmailPasswordError;
