const _ = require('lodash');
const jwt = require('./jwt');
const userService = require('../user/user.service');
const { getRedisClient } = require('../../database/redis');
const LoggerService = require('../../utilities/logger');

const logger = new LoggerService('services/auth/auth.service.js');

const signUpUser = async (document, refreshNeeded = false) => {
  const user = _.pick(document, ['_id', 'firstName', 'lastName', 'email', 'role', 'preferredWorkingHourPerDay']);
  const accessTokenPromise = jwt.signAccessToken(user);
  const refreshTokenPromise = refreshNeeded
    ? jwt.signRefreshToken(String(user._id)) : Promise.resolve(null);

  const [token, refreshToken] = await Promise.all([accessTokenPromise, refreshTokenPromise]);
  return {
    ...user,
    token,
    ...(refreshToken && { refreshToken }),
  };
};

const loginUser = async ({ email, password }) => {
  const user = await userService.validatePassword(email, password);
  const token = await jwt.signAccessToken(user);
  const refreshToken = await jwt.signRefreshToken(String(user._id));
  return {
    token,
    refreshToken,
  };
};

const loginRefresh = async (refToken) => {
  const user = await jwt.verifyRefreshToken(refToken);

  const [token, refreshToken] = await Promise.all(
    [jwt.signAccessToken(user), jwt.signRefreshToken(String(user._id))],
  );

  return {
    user,
    token,
    ...(refreshToken && { refreshToken }),
  };
};

const logoutUser = async (userId) => new Promise((resolve, reject) => {
  logger.info('logoutUser >> userId >> ', userId);
  getRedisClient().DEL(userId, (err) => {
    if (err) {
      return reject(err);
    }
    return resolve({ message: 'logged out' });
  });
});

const getUser = async (userId) => userService.getUser(userId);

module.exports = {
  signUpUser, loginUser, loginRefresh, logoutUser, getUser,
};
