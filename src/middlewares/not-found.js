const HttpStatus = require('http-status-codes');

/**
 * Called for any requests for which no
 * handler was found.
 * @param req
 * @param res
 */
const RouteNotFoundMiddleware = (req, res) => {
  res.status(HttpStatus.NOT_FOUND).json({ message: 'Route not found' });
};

module.exports = RouteNotFoundMiddleware;
