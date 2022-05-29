const { Router } = require('express');
const { body, query, validationResult } = require('express-validator');
const { verifyAccessToken } = require('../../services/auth/jwt');
const permitRoles = require('../../middlewares/role-check');
const {
  createUser, fetchUsers, updateUser, deleteUser,
} = require('./user.ctrl');

const router = Router();
const defaultRoute = '/v1/user';

const roleConfig = {
  options: ['ADMIN', 'STAFF_USER'],
  errorMessage: 'role must be oneOf ADMIN or STAFF_USER',
};

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  res.status(400).json({ errors: errors.array() });
};

router.get(
  defaultRoute,
  validate([
    query('skip', 'Please enter a valid skip value').optional().escape().isNumeric(),
    query('limit', 'Please enter a valid limit value').optional().escape().isNumeric(),
    query('text', 'Please enter a valid search text').optional().escape().isString(),
    query('sortOn', 'Please enter a valid sort on field').optional().escape().isString(),
    query('roles', 'Please enter valid roles').optional().escape().isUppercase()
      .isArray(),
    query('sortBy', 'Please enter valid sortBy (asc / desc)').optional().escape().isString()
      .isIn({
        options: ['asc', 'desc'],
        errorMessage: 'sortBy must be oneOf asc/desc',
      }),
  ]),
  verifyAccessToken,
  permitRoles('ADMIN'),
  fetchUsers,
);

router.post(
  defaultRoute,
  validate([
    body('userName', 'Please Enter a Valid Username')
      .escape()
      .not()
      .isEmpty(),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Please enter password of minimum 8 characters').escape().isLength({
      min: 8,
    }),
    body('role', 'Please enter valid role').escape().isUppercase().isString()
      .isIn(['ADMIN', 'STAFF_USER']),
  ]),
  // verifyAccessToken,
  // permitRoles('ADMIN'),
  createUser,
);

router.patch(
  `${defaultRoute}/:userId`,
  validate([
    body('userName', 'Please Enter a Valid userName')
      .escape()
      .not()
      .isEmpty(),
    body('role', 'Please enter valid roles').escape().isUppercase().isString()
      .isIn(['ADMIN', 'STAFF_USER']),
  ]),
  verifyAccessToken,
  permitRoles('ADMIN'),
  updateUser,
);

router.delete(
  `${defaultRoute}/:userId`,
  verifyAccessToken,
  permitRoles('ADMIN'),
  deleteUser,
);

module.exports = router;
