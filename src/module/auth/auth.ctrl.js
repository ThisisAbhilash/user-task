const HttpStatus = require('http-status-codes');
const userService = require('../../services/user/user.service');
const authService = require('../../services/auth/auth.service');

/**
 *
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
const createUser = async (request, response, next) => {
  try {
    const document = await userService.createUser(request.body);
    const loggedInUser = await authService.signUpUser(document, request.refreshNeeded);
    return response.status(HttpStatus.CREATED).json(loggedInUser);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
const loginUser = async (request, response, next) => {
  try {
    const document = await authService.loginUser(request.body);
    return response.status(HttpStatus.OK).json(document);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
const loginRefresh = async (request, response, next) => {
  try {
    const document = await authService.loginRefresh(request.headers['x-refresh-token']);
    return response.status(HttpStatus.OK).json(document);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
const logoutUser = async (request, response, next) => {
  try {
    await authService.logoutUser(request.userId);
    return response.status(204);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param request
 * @param response
 * @returns {Promise<void>}
 */
const getUser = async (request, response, next) => {
  try {
    const user = await authService.getUser(request.userId);
    return response.status(HttpStatus.OK).json(user);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createUser, loginUser, loginRefresh, logoutUser, getUser,
};
