const { Router } = require('express');
const {
  body, param, query, validationResult,
} = require('express-validator');
const { verifyAccessToken } = require('../../services/auth/jwt');
const permitRoles = require('../../middlewares/role-check');
const {
  createSchedule, updateSchedule, deleteSchedule, fetchSchedules,
} = require('./schedule.ctrl');

const router = Router();
const defaultRoute = '/v1/schedule';

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  res.status(400).json({ errors: errors.array() });
};

const taskBodySchema = [
  body('userId', 'Please enter a valid user id').escape().isString(),
  body('workDate', 'please enter a valid task data').escape()
    .isDate(),
  body('shiftLength', 'Please enter a valid duration hour').escape().isNumeric(),
];

const taskQuerySchema = [
  query('text', 'Please enter a valid search text').optional().escape().isString(),
  query('skip', 'Please enter a valid skip value').optional().escape().isNumeric(),
  query('limit', 'Please enter a valid limit value').optional().escape().isNumeric(),
  query('sortOn', 'Please enter a valid sort on field').optional().escape().isString(),
  query('startDate', 'Please enter valid startDate').optional().escape(),
  query('endDate', 'Please enter valid endDate').optional().escape(),
  query('sortBy', 'Please enter valid sortBy (asc / desc)').optional().escape().isString()
    .isIn({
      options: ['asc', 'desc'],
      errorMessage: 'sortBy must be oneOf asc/desc',
    }),
];

router.post(
  defaultRoute,
  validate(taskBodySchema),
  verifyAccessToken,
  permitRoles('ADMIN'),
  createSchedule,
);

router.patch(
  `${defaultRoute}/:taskId`,
  validate(taskBodySchema),
  verifyAccessToken,
  permitRoles('ADMIN'),
  updateSchedule,
);


router.get(
  defaultRoute,
  validate(taskQuerySchema),
  verifyAccessToken,
  permitRoles('ADMIN'),
  fetchSchedules,
);

router.delete(
  `${defaultRoute}/:taskId`,
  verifyAccessToken,
  permitRoles('ADMIN'),
  deleteSchedule,
);

module.exports = router;
