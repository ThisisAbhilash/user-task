const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { verifyAccessToken } = require('../../services/auth/jwt');
const {
  createUser, loginUser, loginRefresh, logoutUser, getUser,
} = require('./auth.ctrl');

const router = Router();

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((validation) => validation.run(req)));

  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  res.status(400).json({ errors: errors.array() });
};

router.post(
  '/v1/signup',
  [
    body('firstName', 'Please Enter a Valid Username')
      .escape()
      .not()
      .isEmpty(),
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Please enter password of minimum 8 characters').escape().isLength({
      min: 8,
    }),
  ],
  createUser,
);

router.post(
  '/v1/login',
  validate([
    body('email', 'Please enter a valid email').isEmail(),
    body('password', 'Please enter password of minimum 8 characters').escape().isLength({
      min: 8,
    }),
  ]),
  loginUser,
);

router.post(
  '/v1/login-refresh',
  loginRefresh,
);

router.post(
  '/v1/logout',
  verifyAccessToken,
  logoutUser,
);

router.get(
  '/v1/me',
  verifyAccessToken,
  getUser,
);

module.exports = router;
