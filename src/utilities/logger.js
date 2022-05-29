const winston = require('winston');

class LoggerService {
  constructor(path) {
    const logger = winston.createLogger({
      transports: [
        new winston.transports.Console(),
      ],
      format: winston.format.combine(
        winston.format.printf((info) => {
          let message = `[${new Date().toISOString()}] | ${info.level.toUpperCase()} | ${path} | ${info.message} | `;
          message = info.obj ? `${message}data:${JSON.stringify(info.obj)}` : message;
          return message;
        }),
      ),
    });
    this.logger = logger;
  }

  async info(message, obj) {
    this.logger.log('info', message, {
      obj,
    });
  }

  async debug(message, obj) {
    this.logger.log('debug', message, {
      obj,
    });
  }

  async error(message, obj) {
    // eslint-disable-next-line no-console
    console.error(`[${new Date().toISOString()}] - ${message}`, obj ? obj.error : '');
    this.logger.log('error', message, {
      obj,
    });
  }
}

module.exports = LoggerService;
