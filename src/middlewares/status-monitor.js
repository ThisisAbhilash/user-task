const monitor = require('express-status-monitor');
const Config = require('../utilities/config');

const healthEndpoints = [
  '/api/status',
  '/api/ping',
  '/api/health',
];
/**
 * monitor board for server performance
 */
const StatusMonitor = (() => {
  const protocol = Config.get('PROTOCOL', 'http');
  const host = Config.get('HOST', 'localhost');
  const port = Config.get('NODE_PORT', '3130');
  const healthChecks = healthEndpoints.map((k) => ({
    path: k, protocol, host, port,
  }));
  return monitor({ healthChecks });
})();

module.exports = StatusMonitor;
