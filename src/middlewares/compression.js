const compression = require('compression');

/**
 * Called to check if response should be compressed or not
 * handler was found.
 */
const CompressResponseMiddleware = (() => compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
    // don't compress responses with this request header
      return false;
    }

    // fallback to standard filter function
    return compression.filter(req, res);
  },
}))();

module.exports = CompressResponseMiddleware;
