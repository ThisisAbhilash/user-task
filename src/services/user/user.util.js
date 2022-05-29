const fetchUserPipeline = (params) => {
  const {
    text, skip = 0, limit = 20, sortOn = 'createdAt', sortBy = 'asc', roles = [], isDeleted,
  } = params;
  let _roles = roles;
  if (typeof (roles) === 'string') {
    _roles = roles.split(',');
  }

  const pipeline = [];
  if (isDeleted !== undefined && isDeleted !== null) {
    pipeline.push([
      { $match: { isDeleted } },
    ]);
  }
  if (text) {
    pipeline.push({
      $match: {
        $or: [
          { firstName: { $regex: text, $options: 'i' } },
          { lastName: { $regex: text, $options: 'i' } },
          { email: { $regex: text, $options: 'i' } },
        ],
      },
    });
  }
  if (roles.length > 0) {
    pipeline.push({ $match: { role: { $in: _roles } } });
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
        userId: 1,
        isDeleted: 1,
        role: 1,
        preferredWorkingHourPerDay: 1,
        email: 1,
        firstName: 1,
        lastName: 1,
        createdAt: 1,
        updatedAt: 1,
        createdByUser: {
          userId: '$createdByUser.userId',
          email: '$createdByUser.email',
        },
      },
    },
  ];
  return { countPipeline, dataPipeline };
};

const hidePasswordField = (user) => {
  const _user = user.toObject();
  delete _user.password;
  return _user;
};

module.exports = { fetchUserPipeline, hidePasswordField };
