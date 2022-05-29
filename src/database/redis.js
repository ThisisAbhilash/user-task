const redis = require('redis');
const { REDIS_CONNECTED } = require('../constants/info-constants');
const Config = require('../utilities/config');
const LoggerService = require('../utilities/logger');

const REDIS_HOST = Config.get('REDIS_HOST');
const REDIS_PORT = Config.get('REDIS_PORT');
const REDIS_PASSWORD = Config.get('REDIS_PASSWORD', 'FA0X0rtMx9EHBFJNkXYmE3uZrNUd63n6');

const logger = new LoggerService(`database/redis - [${REDIS_HOST}:${REDIS_PORT}]`);

let redisConnected = false;
let client;

const initRedis = async () => {
  const redisUrl = `redis://default:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}`;
  logger.info(`initiating redis connection to redisUrl = ${redisUrl}`);
  client = redis.createClient({
    url: redisUrl
  });

  client.on('connect', () => {
    logger.info('Client connected to redis...');
  });

  client.on('ready', () => {
    redisConnected = true;
    logger.info('Client connected to redis and ready to use...');
  });

  client.on('error', (err) => {
    console.error(err)
    redisConnected = false;
    logger.error(err.message);
  });

  client.on('end', () => {
    redisConnected = false;
    logger.error('Client disconnected from redis');
  });

  await client.connect();
};

/**
 *
 * @returns {Promise<string|null>}
 */
const checkHealthRedis = async () => {
  if (client && redisConnected) {
    return REDIS_CONNECTED;
  }

  // request new connection before leaving so next time health will have a ready connection
  initRedis();

  // returns null since connection opening might will take time in async mode
  return null;
};

/**
 * Gracefully closes the redis client connection
 */
const redisDisconnect = () => {
  client.quit();
  logger.info('Redis Client connection disconnected gracefully through app termination');
};

module.exports = {
  initRedis,
  getRedisClient: () => client,
  checkHealthRedis,
  redisDisconnect,
};
