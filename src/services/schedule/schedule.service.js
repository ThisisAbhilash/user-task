const { get, pickBy, identity } = require('lodash');
const createError = require('http-errors');
const mongoose = require('mongoose');
const Schedule = require('../../models/schedule-model');
const { fetchTaskPipeline } = require('./schedule.util');
const Repository = require('../../models/data-access/repository');
const LoggerService = require('../../utilities/logger');

const logger = new LoggerService('services/task/task-service');
const ObjectID = mongoose.Types.ObjectId;

/**
 * creates a schedule entry to collection
 * @param data
 * @returns {Promise<document>}
 */
const createSchedule = async (data) => {
  logger.info('createSchedule << data ', { data });
  const repository = new Repository(Schedule);
  return repository.createOne(data);
};

/**
 * update schedule
 * @param params
 * @returns {Promise<document>}
 */
const updateSchedule = async (scheduleId, payload) => {
  logger.info('updateSchedule << taskId, payload ', { taskId, payload });

  const repository = new Repository(Schedule);
  const dataToUpdate = pickBy(payload, identity);
  logger.info('updateSchedule << dataToUpdate ', { dataToUpdate });
  await repository.updateOne(
    { _id: ObjectID(scheduleId) },
    { $set: dataToUpdate },
  );
  return repository.findOne({ _id: ObjectID(scheduleId) });
};

/**
 * fetch task of logged in user
 * @param params
 * @returns {Array<User>}
 */
const fetchSchedules = async (params) => {
  logger.info('fetchSchedules << params ', { params });
  const { countPipeline, dataPipeline } = fetchTaskPipeline(params);
  logger.info('fetchSchedules << countPipeline, dataPipeline ', { countPipeline, dataPipeline });

  const repository = new Repository(Schedule);
  const [count, tasks] = await Promise.all([
    repository.aggregate(countPipeline),
    repository.aggregate(dataPipeline),
  ]);
  return {
    query: params,
    skip: params.skip || 0,
    limit: params.limit || 5,
    total: get(count, '0.finalCount', 0),
    tasks,
  };
};

/**
 * delete schedule
 * @param params
 * @returns {Schedule}
 */
const deleteSchedule = async (scheduleId) => {
  logger.info('deleteSchedule << scheduleId ', { scheduleId });

  const repository = new Repository(Schedule);
  return repository.updateOne(
    { _id: ObjectID(scheduleId) },
    { $set: { isDeleted: true } },
  );
};

module.exports = {
  createSchedule, updateSchedule, fetchSchedules, deleteSchedule,
};
