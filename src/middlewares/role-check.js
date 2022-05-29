const createError = require('http-errors');

const permitRoles = (...allowedRoles) => {
  const isAllowed = (role) => allowedRoles.indexOf(role) > -1;

  // return a middleware
  return (request, response, next) => {
    if (request.user && isAllowed(request.user.role)) {
      next(); // role is allowed, so continue on the next middleware
    } else {
      throw createError.Forbidden('user not allowed to perform this activity');
    }
  };
};

module.exports = permitRoles;
