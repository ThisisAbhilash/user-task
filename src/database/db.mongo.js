const mongoose = require('mongoose');
const { MONGO_CONNECTED } = require('../constants/info-constants');
const config = require('../utilities/config');
const LoggerService = require('../utilities/logger');

const logger = new LoggerService('database.db.mongo');

/**
 *
 * @param label
 */
const mongoDbConnect = (label = 'MongoDB') => {
  const mongoDsn = config.get('MONGO_URL', '');

  mongoose.Promise = global.Promise;
  mongoose.set('useCreateIndex', true);
  mongoose.set('useFindAndModify', false);

  mongoose.connect(mongoDsn, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
      logger.error(`${label} connection not available`, { error: err });
    }
  });

  // When successfully connected
  mongoose.connection.on('connected', () => {
    logger.info(`${label} connected @ ${mongoDsn}`);
  });

  // If the connection throws an error
  mongoose.connection.on('error', (err) => {
    logger.error(`${label} connection error @ ${mongoDsn}`, { error: err });
  });

  // When the connection is disconnected
  mongoose.connection.on('disconnected', () => {
    logger.info(`${label} connection disconnected @ ${mongoDsn}`);
  });
};

/**
 *
 * @returns {Promise<string|null>}
 */
const checkHealthMongoDb = async () => {
  if (mongoose && mongoose.connection && mongoose.connection.readyState) {
    return MONGO_CONNECTED;
  }

  // request new connection before leaving so next time health will have a ready connection
  mongoDbConnect();

  // returns null since connection opening might will take time in async mode
  return null;
};

/**
 * Gracefully closes the MongoDB connection
 */
const mongoDbDisconnect = () => {
  mongoose.connection.close(() => {
    logger.info('Mongoose default connection disconnected through app termination');
  });
};

module.exports = {
  mongoDbConnect,
  checkHealthMongoDb,
  mongoDbDisconnect,
};
