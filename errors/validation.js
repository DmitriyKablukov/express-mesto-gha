const { BAD_REQUEST_ERROR_CODE } = require('../utils/constants');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = BAD_REQUEST_ERROR_CODE;// 400
  }
}

module.exports = ValidationError;
