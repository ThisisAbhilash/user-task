const morgan = require('morgan');
const cmn = require('../utilities/common');

const Morgan = morgan((tokens, req, res) => [
  `[${new Date().toISOString()}]`,
  tokens.method(req, res),
  tokens.url(req, res),
  `${!cmn.isEmpty(req.params) ? `params: ${JSON.stringify(req.params)}` : ''}`,
  `${!cmn.isEmpty(req.query) ? `query: ${JSON.stringify(req.query)}` : ''}`,
  `${!cmn.isEmpty(req.body) ? `body: ${JSON.stringify(req.body)}` : ''}`,
  tokens.status(req, res),
  tokens.res(req, res, 'content-length'), '-',
  tokens['response-time'](req, res), 'ms',
].join(' '));

module.exports = Morgan;
