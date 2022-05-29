const HttpStatus = require('http-status-codes');
const service = require('../../services/schedule/schedule.service');

/**
 *
 * @param request
 * @param response
 * @returns {Schedule}
 */
const createSchedule = async (request, response, next) => {
  try {
    const body = {
      ...request.body,
      createdBy: request.userId,
    };
    const document = await service.createSchedule(body);
    return response.status(HttpStatus.CREATED).json(document);
  } catch (error) {
    return next(error);
  }
};


/**
 *
 * @param request
 * @param response
 * @returns {Schedule}
 */
const updateSchedule = async (request, response, next) => {
  try {
    const { scheduleId } = request.params;
    const document = await service.updateSchedule(scheduleId, request.userId, request.body);
    return response.status(HttpStatus.CREATED).json(document);
  } catch (error) {
    return next(error);
  }
};

/**
 *
 * @param request
 * @param response
 * @returns {[Schedule]}
 */
const fetchSchedules = async (request, response, next) => {
  try {
    const result = await service.fetchSchedules(request.query);
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
const deleteSchedule = async (request, response, next) => {
  try {
    const { scheduleId } = request.params;
    await service.deleteSchedule(scheduleId);
    return response.status(202).json();
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createSchedule, updateSchedule, deleteSchedule, fetchSchedules
};
