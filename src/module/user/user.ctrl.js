const HttpStatus = require('http-status-codes');
const service = require('../../services/user/user.service');

/**
 *
 * @param request
 * @param response
 * @returns {User}
 */
const createUser = async (request, response, next) => {
  try {
    const body = {
      ...request.body,
      createdBy: request.userId,
    };
    const document = await service.createUser(body);
    return response.status(HttpStatus.CREATED).json(document);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param request
 * @param response
 * @returns {[Users]}
 */
const fetchUsers = async (request, response, next) => {
  try {
    const result = await service.fetchUsers(request.query);
    return response.status(HttpStatus.OK).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param request
 * @param response
 * @returns {User}
 */
const updateUser = async (request, response, next) => {
  try {
    const { userId } = request.params;
    const result = await service.updateUser(userId, request.body);
    return response.status(HttpStatus.OK).json(result);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param request
 * @param response
 * @returns {}
 */
const deleteUser = async (request, response, next) => {
  try {
    const { userId } = request.params;
    await service.deleteUser(userId);
    return response.status(202).json();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createUser,
  fetchUsers,
  updateUser,
  deleteUser,
};
