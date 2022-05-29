const get = require('lodash/get');
const loadedConfig = require('../../config.json');

class config {
  static get(targetConfig, defaultValue) {
    const envVariable = get(process.env, targetConfig);
    if (envVariable !== undefined) {
      return envVariable;
    }

    return loadedConfig[targetConfig] || defaultValue;
  }
}

module.exports = config;
