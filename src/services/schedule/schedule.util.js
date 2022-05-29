const mongoose = require('mongoose');

const ObjectID = mongoose.Types.ObjectId;

const fetchTaskPipeline = (params) => {
  const {
    userId, text, skip = 0, limit = 20, sortOn = 'createdAt', sortBy = 'asc', startDate, endDate, isDeleted,
  } = params;

  const pipeline = [];

  if (userId || startDate || endDate || isDeleted !== null) {
    pipeline.push({
      $match: {
        ...(userId && { userId: ObjectID(userId) }),
        ...(isDeleted !== 'true' && { isDeleted: false }),
        ...((startDate || endDate) && {
          taskDate: {
            ...(startDate && { $gte: new Date(startDate) }),
            ...(endDate && { $lte: new Date(endDate) }),
          },
        }),
      },
    });
  }

  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      as: 'user',
    },
  });
  pipeline.push({
    $unwind: {
      path: '$user',
      preserveNullAndEmptyArrays: true,
    },
  });

  if (text) {
    pipeline.push({
      $match: {
        $or: [
          { description: { $regex: text, $options: 'i' } },
          { 'user.firstName': { $regex: text, $options: 'i' } },
          { 'user.email': { $regex: text, $options: 'i' } },
        ],
      },
    });
  }

  const countPipeline = [
    ...pipeline,
    { $count: 'finalCount' },
  ];

  pipeline.push({ $sort: { [sortOn]: sortBy === 'asc' ? 1 : -1 } });
  const dataPipeline = [
    ...pipeline,
    { $skip: Number(skip) },
    { $limit: Number(limit) },
    {
      $lookup: {
        from: 'users',
        localField: 'createdBy',
        foreignField: '_id',
        as: 'createdByUser',
      },
    },
    {
      $unwind: {
        path: '$createdByUser',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        taskId: 1,
        taskDate: 1,
        startTime: 1,
        endTime: 1,
        durationHour: 1,
        durationMinutes: 1,
        description: 1,
        isDeleted: 1,
        createdBy: 1,
        updatedAt: 1,
        userName: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
        userPreferredWorkingHours: '$user.preferredWorkingHourPerDay',
        createdByUser: {
          userId: '$createdByUser.userId',
          email: '$createdByUser.email',
        },
      },
    },
  ];
  return { countPipeline, dataPipeline };
};

module.exports = { fetchTaskPipeline };
