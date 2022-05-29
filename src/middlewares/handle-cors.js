const cors = require('cors');
const { CORS_ERROR } = require('../constants/info-constants');

// make allowed origins dynamic later
const allowedOrigins = [
  'http://localhost:3130', // for swagger api
];

const HandleCors = cors({
  origin(origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      return callback(new Error(CORS_ERROR), false);
    }
    return callback(null, true);
  },
});

module.exports = HandleCors;
