const HttpStatus = require('http-status-codes');
const LoggerService = require('../../utilities/logger');
const { checkHealthMongoDb } = require('../../database/db.mongo');

const logger = new LoggerService('health.ctrl');

/**
 *
 * @param req
 * @param res
 */
const ping = (req, res) => {
  res.json({
    ok: 'ok',
  });
};

/**
 *
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
const checkHealth = async (req, res) => {
  let mongoHealth = null;
  let errorMessage = '';

  try {
    mongoHealth = await checkHealthMongoDb();
  } catch (error) {
    errorMessage = error.message;
    logger.error('Error Health api: MongoError', { error });
  }

  if (mongoHealth != null) {
    res.json({
      status: HttpStatus.OK,
      mongo: mongoHealth,
    });
  } else {
    logger.error('Error in health api', { mongoHealth });
    res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: errorMessage,
    });
  }
};

module.exports = {
  ping,
  checkHealth,
};
