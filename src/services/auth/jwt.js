const JWT = require('jsonwebtoken');
const createError = require('http-errors');
const Config = require('../../utilities/config');
const { getRedisClient } = require('../../database/redis');
const { getUser } = require('../user/user.service');
const LoggerService = require('../../utilities/logger');

const logger = new LoggerService('services/auth/jwt');

const ACCESS_TOKEN_SECRET = Config.get('ACCESS_TOKEN_SECRET');
const REFRESH_TOKEN_SECRET = Config.get('REFRESH_TOKEN_SECRET');
const ACCESS_TOKEN_VALIDITY = Config.get('ACCESS_TOKEN_VALIDITY');
const REFRESH_TOKEN_VALIDITY = Config.get('REFRESH_TOKEN_VALIDITY');
const TOKEN_ISSUER = Config.get('TOKEN_ISSUER');

module.exports = {
  signAccessToken: (user) => new Promise((resolve, reject) => {
    try {
      const payload = {
        ...user, password: null,
      };
      const options = {
        expiresIn: ACCESS_TOKEN_VALIDITY,
        issuer: TOKEN_ISSUER,
        audience: String(user._id),
      };
      JWT.sign(payload, ACCESS_TOKEN_SECRET, options, (err, token) => {
        if (err) {
          logger.error('jwt >> signAccessToken >> ', err);
          return reject(createError.InternalServerError());
        }
        resolve(token);
      });
    } catch (error) {
      console.error(error);
    }
  }),

  /**
   * Also used as middleware to establish authentication
   */
  verifyAccessToken: (req, res, next) => {
    if (!req.headers.authorization) {
      return next(createError.Unauthorized());
    }
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];
    JWT.verify(token, ACCESS_TOKEN_SECRET, async (err, payload) => {
      if (err) {
        const message = err.name === 'JsonWebTokenError' ? 'Unauthorized' : err.message;
        return next(createError.Unauthorized(message));
      }
      req.userId = payload.aud;
      const user = await getUser(req.userId);
      req.user = user;
      next();
    });
  },

  signRefreshToken: (userId) => new Promise((resolve, reject) => {
    try {
      const payload = {};
      const options = {
        expiresIn: REFRESH_TOKEN_VALIDITY,
        issuer: TOKEN_ISSUER,
        audience: userId,
      };
      JWT.sign(payload, REFRESH_TOKEN_SECRET, options, async (err, token) => {
        if (err) {
          logger.error('jwt >> signRefreshToken >> ', err);
          return reject(createError.InternalServerError());
        }

        await getRedisClient().SET(userId, token, { 'EX': 365 * 24 * 60 * 60 });
        return resolve(token);
      });
    } catch (error) {
      console.error(error)
    }
  }),

  verifyRefreshToken: (refreshToken) => new Promise((resolve, reject) => {
    JWT.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
      (err, payload) => {
        if (err) return reject(createError.Unauthorized());
        const userId = payload.aud;
        getRedisClient().GET(userId, (redisError, result) => {
          if (redisError) {
            logger.error('jwt >> verifyRefreshToken redisError >> ', { redisError });
            return reject(createError.InternalServerError());
          }
          if (refreshToken === result) {
            return resolve(userId);
          }
          return reject(createError.Unauthorized());
        });
      },
    );
  }),
};
