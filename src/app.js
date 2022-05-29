require('express-async-errors');
const express = require('express');
const path = require('path');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');

// mongodb
const { mongoDbConnect } = require('./database/db.mongo');

const { initRedis } = require('./database/redis');

// swagger
const swaggerDocument = require('./swagger.json');

// routes
const routerHealth = require('./module/health/health.route');
const authRoutes = require('./module/auth/auth.route');
const userRoutes = require('./module/user/user.route');
const scheduleRoutes = require('./module/schedule/schedule.route');

// middle-wares

const HandleCors = require('./middlewares/handle-cors');
const Morgan = require('./middlewares/morgan-logger');
const StatusMonitor = require('./middlewares/status-monitor');
const ApiRateLimiter = require('./middlewares/api-rate-limit');
const CompressResponseMiddleware = require('./middlewares/compression');
const ExceptionHandlerMiddleware = require('./middlewares/exception-handler');
const RouteNotFoundMiddleware = require('./middlewares/not-found');

const app = express();

// setup database connection
mongoDbConnect();
initRedis();

app
  .disable('x-powered-by')
  .use(helmet()) // helmet for security purpose
  .use(HandleCors)
  .use(Morgan) // for logging
  .use(bodyParser.urlencoded({ extended: true }))
  .use(bodyParser.json({ limit: '5mb' }))
  .use(StatusMonitor)
  .use('/api/', ApiRateLimiter)
  .use(CompressResponseMiddleware)
  .use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument)) // swagger ui
  .use('/api', routerHealth)
  .use('/api', authRoutes)
  .use('/api', userRoutes)
  .use('/api', scheduleRoutes)
  .use(ExceptionHandlerMiddleware)
  .use(RouteNotFoundMiddleware); // 404 route not found lastly

module.exports = app;
