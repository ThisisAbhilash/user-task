const rateLimit = require('express-rate-limit');

/**
 * to config rate limit depending upon server capacity, helps to mitigate DDos
 */
const ApiRateLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 1000,
});

module.exports = ApiRateLimiter;
