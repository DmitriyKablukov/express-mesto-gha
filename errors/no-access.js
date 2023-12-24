const { NO_ACCESS_ERROR_CODE } = require('../utils/constants');

class NoAccessError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = NO_ACCESS_ERROR_CODE;// 403
  }
}

module.exports = NoAccessError;
