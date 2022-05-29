const { get, pickBy, identity } = require('lodash');
const createError = require('http-errors');
const mongoose = require('mongoose');
const User = require('../../models/user-model');
const { fetchUserPipeline, hidePasswordField } = require('./user.util');
const Repository = require('../../models/data-access/repository');
const LoggerService = require('../../utilities/logger');

const logger = new LoggerService('services/user/user-service');
const ObjectID = mongoose.Types.ObjectId;

/**
 * creates a user entry to collection
 * @param data
 * @returns {Promise<document>}
 */
const createUser = async (data) => {
  logger.info('createUser << data ', { data });
  const repository = new Repository(User);
  return hidePasswordField(await repository.createOne(data));
};

/**
 * validates password for a given user
 * @param data
 * @returns {user}
 */
const validatePassword = async (email, password) => {
  logger.info('validatePassword << email, password ', { email, password });
  const repository = new Repository(User);
  const user = await repository.findOne({ email });
  if (!user) {
    throw createError.BadRequest('email not found');
  }
  if (user.isDeleted) {
    throw createError.BadRequest('user account deleted');
  }
  const passwordMatch = await user.isValidPassword(password);
  if (!passwordMatch) {
    throw createError.BadRequest('password does not match');
  }
  return hidePasswordField(user);
};

/**
 * fetch users
 * @param params
 * @returns {Array<User>}
 */
const fetchUsers = async (params) => {
  logger.info('fetchUsers << params ', { params });
  const { countPipeline, dataPipeline } = fetchUserPipeline(params);
  logger.info('fetchUsers << countPipeline, dataPipeline ', { countPipeline, dataPipeline });

  const repository = new Repository(User);
  const [count, users] = await Promise.all([
    repository.aggregate(countPipeline),
    repository.aggregate(dataPipeline),
  ]);
  return {
    skip: params.skip || 0,
    limit: params.limit || 5,
    total: get(count, '0.finalCount', 0),
    users,
  };
};

/**
 * update user
 * @param params
 * @returns {User}
 */
const updateUser = async (userId, payload) => {
  logger.info('updateUser << userId, payload ', { userId, payload });
  const dataToUpdate = pickBy(payload, identity);

  logger.info('updateUser << dataToUpdate ', { dataToUpdate });
  const repository = new Repository(User);
  return repository.updateOne(
    { _id: ObjectID(userId) },
    { $set: dataToUpdate },
  );
};

/**
 * delete user
 * @param params
 * @returns {User}
 */
const deleteUser = async (userId) => {
  logger.info('deleteUser << userId ', { userId });

  const repository = new Repository(User);
  return repository.updateOne(
    { _id: ObjectID(userId) },
    { $set: { isDeleted: true } },
  );
};

/**
 * delete user
 * @param params
 * @returns {User}
 */
const getUser = async (userId) => {
  logger.info('getUser << userId ', { userId });

  const repository = new Repository(User);
  return hidePasswordField(await repository.findOne({ _id: ObjectID(userId) }));
};

module.exports = {
  createUser, validatePassword, fetchUsers, updateUser, deleteUser, getUser,
};
