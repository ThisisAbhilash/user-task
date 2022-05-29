const { mongoDbDisconnect } = require('../database/db.mongo');
const LoggerService = require('./logger');

const logger = new LoggerService('utilities.err-handler');

const handleUncaughtErrors = () => {
  process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Rejection', { error: err });
  });

  process.on('uncaughtException', (err) => {
    logger.error('Unhandled Exception', { error: err });
  });
};

const disconnectGracefully = () => {
  mongoDbDisconnect();
  process.exit(0);
};

const handleExit = () => {
  process.on('SIGINT', disconnectGracefully);
  process.on('exit', disconnectGracefully);
};

module.exports = {
  handleUncaughtErrors,
  handleExit,
};
