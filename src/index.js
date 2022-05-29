require('express-async-errors');
const http = require('http');
const config = require('./utilities/config');
const { handleExit, handleUncaughtErrors } = require('./utilities/err-handler');
const LoggerService = require('./utilities/logger');

const logger = new LoggerService('src.index');

const app = require('./app');

function start() {
  try {
    handleUncaughtErrors();
    handleExit();

    const APP_PORT = config.get('NODE_PORT', 3010);
    app.server = http.createServer(app);
    app
      .server
      .listen(APP_PORT, () => {
        logger.info(`Staff Schedule System : listening on port:${APP_PORT}`);
      });
  } catch (err) {
    console.error('Staff Schedule System : setup failed', { error: err });
    process.exit(1);
  }
}

start();

module.exports = app;
